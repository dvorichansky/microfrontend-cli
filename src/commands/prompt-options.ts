import { text, select, confirm, isCancel, cancel } from '@clack/prompts';
import fs from 'fs';
import path from 'path';

import { getConfig } from '../core/config';
import {
    PROJECT_FRAMEWORKS,
    PROJECT_STRUCTURES,
    PROJECT_STYLE_FRAMEWORK_KEYS,
    PROJECT_STYLE_FRAMEWORKS,
    PROJECT_TYPE_KEYS,
    PROJECT_TYPES,
} from '../constants/project';

import type {
    ProjectAddSharedRemote,
    ProjectFramework,
    ProjectName,
    ProjectOptions,
    ProjectStructure,
    ProjectStyleFramework,
    ProjectType,
    ProjectUseSass,
} from '../types/project';

function checkCancel(value: unknown) {
    if (isCancel(value)) {
        cancel('Operation cancelled.');
        process.exit(0);
    }
}

export async function promptForProjectOptions(): Promise<ProjectOptions> {
    const config = getConfig();

    const type = (await select({
        message: 'What do you want to create?',
        options: Object.entries(PROJECT_TYPES).map(([value, label]) => ({
            value,
            label,
        })),
    })) as ProjectType;

    const name = (await text({
        message: type === PROJECT_TYPE_KEYS.shell ? 'Shell name:' : 'Microfrontend name:',
        placeholder: type === PROJECT_TYPE_KEYS.shell ? 'shell' : 'product-list',
    })) as ProjectName;
    checkCancel(name);

    const framework = (await select({
        message: 'Framework:',
        options: Object.entries(PROJECT_FRAMEWORKS).map(([value, label]) => ({
            value,
            label,
        })),
    })) as ProjectFramework;
    checkCancel(framework);

    const styleFramework = (await select({
        message: 'CSS framework:',
        options: Object.entries(PROJECT_STYLE_FRAMEWORKS).map(([value, label]) => ({
            value,
            label,
        })),
    })) as ProjectStyleFramework;
    checkCancel(styleFramework);

    let useSass: ProjectUseSass = false;
    if (styleFramework !== PROJECT_STYLE_FRAMEWORK_KEYS.tailwind) {
        useSass = (await confirm({ message: 'Include Sass/SCSS?' })) as ProjectUseSass;
        checkCancel(useSass);
    }

    const structure = (await select({
        message: 'Project structure:',
        options: Object.entries(PROJECT_STRUCTURES).map(([value, label]) => ({
            value,
            label: label.replace('apps/', `${config.appsDir || 'apps'}/`),
        })),
    })) as ProjectStructure;
    checkCancel(structure);

    let addSharedRemote: ProjectAddSharedRemote = false;
    if (type === PROJECT_TYPE_KEYS.microfrontend) {
        const sharedName = config.sharedApp?.name || 'shared';
        const exists = fs.existsSync(path.join(config.appsDir, sharedName));

        if (exists) {
            addSharedRemote = (await confirm({
                message: `Add shared remote '${sharedName}'?`,
            })) as ProjectAddSharedRemote;
            checkCancel(addSharedRemote);
        }
    }

    return {
        name,
        framework,
        styleFramework,
        useSass,
        structure,
        addSharedRemote,
        type,
    };
}
