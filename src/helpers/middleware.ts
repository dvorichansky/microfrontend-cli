import { join } from 'path';
import { existsSync } from 'fs';

import { getConfig } from './config';

import type { MiddlewareStage } from '../types/middleware';
import type { ProjectCommandOptions, ProjectConfig, ProjectOptions } from '../types/project';

interface MiddlewareFunctionProps {
    options: ProjectOptions;
    config: ProjectConfig;
}

interface MiddlewareFunction {
    (props: MiddlewareFunctionProps): Promise<ProjectOptions> | ProjectOptions;
}

type RunMiddleware<S = MiddlewareStage> = (
    stage: S,
    props: { options: ProjectOptions; commandOptions?: ProjectCommandOptions },
) => Promise<ProjectOptions>;

export const runMiddleware: RunMiddleware = async (stage, props) => {
    const config = getConfig();
    const middlewarePaths = config.middleware?.[stage] || [];
    const resultOptions: ProjectOptions = props?.options || {};

    for (const middlewarePath of middlewarePaths) {
        const fullPath = join(process.cwd(), middlewarePath);

        if (existsSync(fullPath)) {
            try {
                const middlewareModule = await import(fullPath);
                const middlewareFn: MiddlewareFunction = middlewareModule.default ?? middlewareModule;

                if (typeof middlewareFn === 'function') {
                    const modifiedOptions = await middlewareFn({
                        options: resultOptions,
                        config,
                    });

                    if (typeof modifiedOptions === 'object') {
                        Object.assign(resultOptions, modifiedOptions);
                    }
                }
            } catch (error) {
                console.error(`Error executing middleware at ${middlewarePath}:`, error);
            }
        } else {
            console.warn(`Middleware path not found: ${middlewarePath}`);
        }
    }

    return resultOptions;
};
