#!/usr/bin/env node

import { Command } from 'commander';
import { intro, outro, text, isCancel, cancel, select, spinner } from '@clack/prompts';
import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';

import packageJson from '../package.json' assert { type: 'json' };
import { createMicrofrontend } from '../src/commands/create-mf';
import { createProject } from '../src/commands/create-project';
import { getConfig } from '../src/core/config';

type ProjectType = 'shell' | 'microfrontend';

const program = new Command();

function checkCancel(value: unknown) {
    if (isCancel(value)) {
        cancel('Operation cancelled.');
        process.exit(0);
    }
}

program.name('mf-cli').description('CLI for scalable microfrontend architecture').version(packageJson.version);

program
    .command('create')
    .description('Create a shell or microfrontend')
    .action(async () => {
        intro(chalk.cyan('MF Project Generator'));

        // 👉 Тип проєкту
        const projectType = (await select({
            message: 'What do you want to create?',
            options: [
                { value: 'shell', label: 'Shell (host application)' },
                { value: 'microfrontend', label: 'Microfrontend (remote)' },
            ],
        })) as ProjectType;

        checkCancel(projectType);

        if (projectType === 'shell') {
            const config = getConfig(); // завантажує mf-cli.config.json або дефолти
            const appsDir = path.resolve(process.cwd(), config.appsDir ?? 'apps');
            const shellPath = path.join(appsDir, config.defaultShell ?? 'shell');

            // 🔒 Перевірка: shell вже існує
            if (fs.existsSync(shellPath)) {
                cancel(`Shell '${config.defaultShell}' already exists in '${appsDir}'. Only one shell is allowed.`);
                process.exit(1);
            }

            const name = (await text({
                message: 'Shell name:',
                placeholder: config.defaultShell ?? 'shell',
            })) as string;
            checkCancel(name);

            const s = spinner();
            s.start('Creating shell application...');
            await createProject(name as string);
            s.stop('Shell created.');

            outro(`✔️ Shell '${name}' created in '${config.appsDir}/${name}'`);
        }

        if (projectType === 'microfrontend') {
            // Делегуємо на create-mf з інтерактивною логікою
            await createMicrofrontend(); // Вся логіка опитувань та генерації там
        }
    });

program.parse();
