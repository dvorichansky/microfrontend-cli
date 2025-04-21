import fs from 'fs-extra';
import path from 'path';
import ejs from 'ejs';

import { PROJECT_STRUCTURE_KEYS, PROJECT_STYLE_FRAMEWORK_KEYS, PROJECT_TYPE_KEYS } from '../constants/project';
import { getConfig } from '../core/config';

import type { ProjectOptions } from '../types/project';

export async function generateProject(options: ProjectOptions) {
    const config = getConfig();

    const templatePath = path.resolve(__dirname, '..', '..', '..', 'templates', options.framework);
    const targetDir =
        options.structure === PROJECT_STRUCTURE_KEYS.standalone
            ? path.resolve(process.cwd(), options.name)
            : path.resolve(process.cwd(), 'apps', options.name);

    const remoteKey = options.name.toUpperCase().replace(/-/g, '_') + '_REMOTE_URL';
    const sharedKey = config.sharedApp.name.toUpperCase().replace(/-/g, '_') + '_REMOTE_URL';

    const context = {
        ...options,
        remoteKey,
        sharedKey,
        exposesPath: './src/App',
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
        render('package.json.ejs', 'package.json'),
        render('index.html.ejs', 'index.html'),
        render('src/index.tsx.ejs', 'src/index.tsx'),
        render('src/App.tsx.ejs', 'src/App.tsx'),
        render(
            `src/${options.useSass ? 'index.scss.ejs' : 'index.css.ejs'}`,
            `src/${options.useSass ? 'index.scss' : 'index.css'}`,
        ),
        options.type === PROJECT_TYPE_KEYS.microfrontend
            ? render('remotes.config.ejs', 'remotes.config.js')
            : fs.outputFile(out('remotes.config.js'), 'module.exports = {};\n'),
        options.type === PROJECT_TYPE_KEYS.microfrontend
            ? render('.env.development.ejs', '.env.development')
            : Promise.resolve(),
    ]);

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

    if (options.createShared) {
        const sharedPath = path.resolve(process.cwd(), config.sharedApp.name);

        await fs.copy(path.resolve(__dirname, '..', '..', '..', 'templates', 'shared'), sharedPath);
    }

    return targetDir;
}
