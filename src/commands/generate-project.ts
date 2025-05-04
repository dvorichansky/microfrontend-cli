import fs from 'fs-extra';
import path from 'path';
import ejs from 'ejs';
import { outro } from '@clack/prompts';

import { PROJECT_STRUCTURE_KEYS, PROJECT_STYLE_FRAMEWORK_KEYS, PROJECT_TYPE_KEYS } from '../constants/project';
import { getConfig } from '../helpers/config';
import { updateRemotesConfig } from '../helpers/projects';

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

    // const remoteEntryKey = `${options.name.toUpperCase().replace(/-/g, '_')}_REMOTE_URL`;
    const sharedName = config.sharedApp.name;
    const sharedRemoteEntryKey = `${sharedName.toUpperCase().replace(/-/g, '_')}_REMOTE_URL`;

    const eslintRelativeExtendPath = config.eslintExtendPath
        ? path.relative(targetDir, path.resolve(process.cwd(), config.eslintExtendPath)).replace(/\\/g, '/')
        : null;

    const context = {
        ...options,
        // remoteEntryKey,
        sharedRemoteEntryKey,
        sharedName,
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
        render('src/bootstrap.tsx.ejs', 'src/bootstrap.tsx'),

        render(
            `src/${options.useSass ? 'index.scss.ejs' : 'index.css.ejs'}`,
            `src/${options.useSass ? 'index.scss' : 'index.css'}`,
        ),
        render('.env.development.ejs', '.env.development'),
    ]);

    if (options.type === PROJECT_TYPE_KEYS.microfrontend || options.type === PROJECT_TYPE_KEYS.shell) {
        const remotesPath = tpl('remotes.config.js');
        if (await fs.pathExists(remotesPath)) {
            await fs.copy(remotesPath, out('remotes.config.js'));
        }
    }

    if (options.type === PROJECT_TYPE_KEYS.shared) {
        await render('src/Button.tsx.ejs', 'src/Button.tsx');
    } else {
        await render('src/App.tsx.ejs', 'src/App.tsx');
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

    // if (options.createShared) {
    //     const sharedPath = path.resolve(process.cwd(), config.sharedApp.name);

    //     await fs.copy(path.resolve(__dirname, '..', '..', '..', 'templates', 'shared'), sharedPath);
    // }

    outro(`✔️ Your '${options.name}' project is ready to go.

Next steps:
  cd ${path.relative(process.cwd(), targetDir)}
  npm install
  npm run dev
`);

    return targetDir;
}
