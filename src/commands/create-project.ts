import fs from 'node:fs';
import path from 'node:path';
import { spinner, outro } from '@clack/prompts';
import { getConfig } from '../core/config';

export async function createProject(name: string) {
    const config = getConfig();
    const appsDir = config.appsDir || 'apps';
    const shellName = name || config.defaultShell || 'shell';

    const projectRoot = path.resolve(process.cwd(), appsDir, shellName);

    if (fs.existsSync(projectRoot)) {
        throw new Error(`Project directory '${projectRoot}' already exists.`);
    }

    // Створення директорій
    fs.mkdirSync(projectRoot, { recursive: true });
    fs.mkdirSync(path.join(projectRoot, 'src'));

    // Базовий package.json
    const packageJson = {
        name: shellName,
        version: '0.1.0',
        private: true,
        scripts: {
            dev: 'webpack serve',
            build: 'webpack',
        },
        dependencies: {},
        devDependencies: {},
    };
    fs.writeFileSync(path.join(projectRoot, 'package.json'), JSON.stringify(packageJson, null, 2));

    // Створення remotes.config.js
    fs.writeFileSync(path.join(projectRoot, 'remotes.config.js'), `module.exports = {};\n`);

    // TODO: додати Webpack конфіг, HTML, базовий index.tsx, стилі тощо
    // Можливо копіювати шаблон із templates/shell

    const s = spinner();
    s.start('Scaffolding shell application...');
    await new Promise((res) => setTimeout(res, 1000)); // симуляція затримки
    s.stop('Shell scaffolded.');

    outro(
        `✔️ Shell '${shellName}' created at '${appsDir}/${shellName}'\n  cd ${appsDir}/${shellName}\n  npm install\n  npm run dev`,
    );
}
