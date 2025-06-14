import fs from 'fs-extra';
import path from 'path';
import ejs from 'ejs';
import { outro } from '@clack/prompts';

import {
    PROJECT_FRAMEWORK_KEYS,
    PROJECT_STRUCTURE_KEYS,
    PROJECT_STYLE_FRAMEWORK_KEYS,
    PROJECT_TYPE_KEYS,
} from '../constants/project';
import { MIDDLEWARE_STAGE } from '../constants/middleware';
import { getConfig } from '../helpers/config';
import { updateRemotesConfig } from '../helpers/projects';
import { runMiddleware } from '../helpers/middleware';

import type { ProjectOptions } from '../types/project';

export async function generateProject(options: ProjectOptions) {
    const config = getConfig();

    const templatePath = path.resolve(__dirname, '..', '..', '..', 'templates', options.framework);
    const rootDir =
        options.structure === PROJECT_STRUCTURE_KEYS.standalone
            ? path.resolve(process.cwd())
            : path.resolve(process.cwd(), config.appsDir);
    const targetDir =
        options.structure === PROJECT_STRUCTURE_KEYS.standalone
            ? path.resolve(process.cwd(), options.name)
            : path.resolve(process.cwd(), config.appsDir, options.name);

    const eslintRelativeExtendPath = config.eslintExtendPath
        ? path.relative(targetDir, path.resolve(process.cwd(), config.eslintExtendPath)).replace(/\\/g, '/')
        : null;

    const context = {
        ...options,
        eslintRelativeExtendPath,
    };

    const tpl = (...segments: string[]) => path.join(templatePath, ...segments);
    const out = (...segments: string[]) => path.join(targetDir, ...segments);

    await fs.copy(templatePath, targetDir, {
        filter: (src) =>
            !src.endsWith('.ejs') &&
            !src.endsWith('gitignore') &&
            !src.endsWith('postcss.config.js') &&
            !src.endsWith('tailwind.config.js'),
    });

    const render = async (src: string, dest: string) => {
        const content = await ejs.renderFile(tpl(...src.split('/')), context);
        await fs.outputFile(out(...dest.split('/')), content);
    };

    await Promise.all([
        render('webpack.config.ejs', 'webpack.config.js'),
        render('modulefederation.config.ejs', 'modulefederation.config.js'),
        render('package.json.ejs', 'package.json'),
        render('index.html.ejs', 'index.html'),
        render(
            `src/${options.useSass ? 'index.scss.ejs' : 'index.css.ejs'}`,
            `src/${options.useSass ? 'index.scss' : 'index.css'}`,
        ),
        render('.env.development.ejs', '.env.development'),
    ]);

    if (options.framework === PROJECT_FRAMEWORK_KEYS.react) {
        await render('src/bootstrap.tsx.ejs', 'src/bootstrap.tsx');
    } else if (
        options.framework === PROJECT_FRAMEWORK_KEYS.vue ||
        options.framework === PROJECT_FRAMEWORK_KEYS.vanilla
    ) {
        await render('src/bootstrap.ts.ejs', 'src/bootstrap.ts');
    }

    if (options.type === PROJECT_TYPE_KEYS.microfrontend || options.type === PROJECT_TYPE_KEYS.shell) {
        const remotesPath = tpl('remotes.config.js');
        if (await fs.pathExists(remotesPath)) {
            await fs.copy(remotesPath, out('remotes.config.js'));
        }
    }

    if (options.framework === PROJECT_FRAMEWORK_KEYS.react) {
        if (options.type === PROJECT_TYPE_KEYS.shared) {
            await render('src/Button.tsx.ejs', 'src/Button.tsx');
        } else {
            await render('src/App.tsx.ejs', 'src/App.tsx');
        }
    } else if (options.framework === PROJECT_FRAMEWORK_KEYS.vue) {
        if (options.type === PROJECT_TYPE_KEYS.shared) {
            await render('src/Button.vue.ejs', 'src/Button.vue');
            await render('src/Button.ejs', 'src/Button.ts');
        } else {
            await render('src/App.vue.ejs', 'src/App.vue');
            await render('src/App.ejs', 'src/App.ts');
        }
    } else if (options.framework === PROJECT_FRAMEWORK_KEYS.vanilla) {
        await render('src/elements.ejs', 'src/elements.ts');
    }

    const gitignorePath = tpl('gitignore');
    if (await fs.pathExists(gitignorePath)) {
        await fs.copy(gitignorePath, out('.gitignore'));
    }

    if (options.styleFramework === PROJECT_STYLE_FRAMEWORK_KEYS.tailwind) {
        const postcssPath = tpl('postcss.config.js');
        if (await fs.pathExists(postcssPath)) {
            await fs.copy(postcssPath, out('postcss.config.js'));
        }

        const tailwindPath = tpl('tailwind.config.js');
        if (await fs.pathExists(tailwindPath)) {
            await fs.copy(tailwindPath, out('tailwind.config.js'));
        }
    }

    if (options.includeESLint) {
        if (config.eslintTemplatePath) {
            const sourcePath = path.resolve(process.cwd(), config.eslintTemplatePath);

            await fs.copy(sourcePath, path.join(targetDir, '.eslintrc.js'));
        } else {
            await render('.eslintrc.ejs', '.eslintrc.js');
        }
    }

    if (options.consumers?.length) {
        for (const consumer of options.consumers) {
            await updateRemotesConfig(path.resolve(rootDir, consumer), options.name, Number(options.port));
        }
    }

    const middlewareOptions = await runMiddleware(MIDDLEWARE_STAGE.afterGenerate, { options });

    Object.assign(options, middlewareOptions);

    outro(`✔️ Your '${options.name}' project is ready to go.

Next steps:
  cd ${path.relative(process.cwd(), targetDir)}
  npm install
  npm run dev
`);

    return targetDir;
}
