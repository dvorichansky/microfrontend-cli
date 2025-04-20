import fs from 'fs-extra';
import path from 'path';
import { spinner, outro } from '@clack/prompts';
import { MfAnswers } from './create-mf';
import { getConfig } from '../core/config';
import ejs from 'ejs';

export async function generateMicrofrontend(answers: MfAnswers) {
    const config = getConfig();

    // Визначаємо шлях генерації (standalone або монорепо)
    const targetDir = answers.standalone
        ? path.resolve(process.cwd(), answers.name)
        : path.resolve(process.cwd(), config.appsDir || 'apps', answers.name);

    if (fs.existsSync(targetDir)) {
        throw new Error(`Directory '${targetDir}' already exists.`);
    }

    const templatePath = path.resolve(__dirname, '..', 'templates', answers.framework);
    if (!fs.existsSync(templatePath)) {
        throw new Error(`Template for framework '${answers.framework}' not found.`);
    }

    const s = spinner();
    s.start('Copying template...');
    await fs.copy(templatePath, targetDir);

    const remoteKey = answers.name.toUpperCase().replace(/-/g, '_') + '_REMOTE_URL';
    const sharedName = config.sharedApp?.name || 'shared';
    const sharedKey = sharedName.toUpperCase().replace(/-/g, '_') + '_REMOTE_URL';

    const context = {
        name: answers.name,
        remoteKey,
        sharedName,
        sharedKey,
        exposesPath: './src/App',
        addSharedRemote: answers.addSharedRemote,
    };

    // Шлях до шаблонів загальних файлів
    const commonTemplateDir = path.resolve(__dirname, '..', 'templates', '_common');

    // Генеруємо remotes.config.js
    const remotesTemplate = path.join(commonTemplateDir, 'remotes.config.ejs');
    const remotesOut = path.join(targetDir, 'remotes.config.js');
    const remotesContent = await ejs.renderFile(remotesTemplate, context, {});
    await fs.writeFile(remotesOut, remotesContent);

    // Генеруємо .env.development
    const envTemplate = path.join(commonTemplateDir, 'env.development.ejs');
    const envOut = path.join(targetDir, '.env.development');
    const envContent = await ejs.renderFile(envTemplate, context, {});
    await fs.writeFile(envOut, envContent);

    // Генеруємо webpack.config.js
    const webpackTemplate = path.join(commonTemplateDir, 'webpack.config.ejs');
    const webpackOut = path.join(targetDir, 'webpack.config.js');
    const webpackContent = await ejs.renderFile(webpackTemplate, context, {});
    await fs.writeFile(webpackOut, webpackContent);

    s.stop('Template and config files generated using EJS.');

    outro(
        `✔️ Microfrontend '${answers.name}' created at '${targetDir}'\n  cd ${path.relative(
            process.cwd(),
            targetDir,
        )}\n  npm install\n  npm run dev`,
    );
}
