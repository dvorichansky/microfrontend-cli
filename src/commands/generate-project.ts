import fs from 'fs-extra';
import path from 'path';
import ejs from 'ejs';

import { ProjectOptions } from '../types';

export async function generateProject(options: ProjectOptions) {
    const templatePath = path.resolve(__dirname, '..', 'templates', options.framework);
    const targetDir = options.standalone
        ? path.resolve(process.cwd(), options.name)
        : path.resolve(process.cwd(), 'apps', options.name);

    const remoteKey = options.name.toUpperCase().replace(/-/g, '_') + '_REMOTE_URL';
    const sharedName = 'shared';
    const sharedKey = sharedName.toUpperCase().replace(/-/g, '_') + '_REMOTE_URL';

    const context = {
        ...options,
        remoteKey,
        sharedKey,
        exposesPath: './src/App',
    };

    const tpl = (...segments: string[]) => path.join(templatePath, ...segments);
    const out = (...segments: string[]) => path.join(targetDir, ...segments);

    await fs.copy(templatePath, targetDir, {
        filter: (src) => !src.endsWith('.ejs'),
    });

    const render = async (src: string, dest: string) => {
        const content = await ejs.renderFile(tpl(...src.split('/')), context);
        await fs.outputFile(out(...dest.split('/')), content);
    };

    await Promise.all([
        render('webpack.config.ejs', 'webpack.config.js'),
        render('package.json.ejs', 'package.json'),
        render('index.html', 'index.html'),
        render('src/index.tsx', 'src/index.tsx'),
        render('src/App.tsx', 'src/App.tsx'),
        render(
            `src/${options.useSass ? 'index.scss.ejs' : 'index.css.ejs'}`,
            `src/${options.useSass ? 'index.scss' : 'index.css'}`,
        ),
        options.type === 'microfrontend'
            ? render('remotes.config.ejs', 'remotes.config.js')
            : fs.outputFile(out('remotes.config.js'), 'module.exports = {};\n'),
        options.type === 'microfrontend' ? render('.env.development.ejs', '.env.development') : Promise.resolve(),
    ]);

    return targetDir;
}
