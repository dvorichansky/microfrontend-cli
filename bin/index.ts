#!/usr/bin/env node

import { Command } from 'commander';

import { promptForProjectOptions } from '../src/commands/prompt-options';
import { generateProject } from '../src/commands/generate-project';

const program = new Command();

program.name('mf-cli').description('CLI for scalable microfrontend architecture');

program
    // .command('create')
    // .description('Create a shell or microfrontend')
    .option('-s, --structure <structure>', 'Project structure')
    .option('-t, --type <type>', 'Project type')
    .option('-n, --name <name>', 'Project name')
    .option('-f, --framework <framework>', 'Framework to use')
    .option('-style, --style-framework <styleFramework>', 'Style framework to use')
    .option('-sass, --use-sass', 'Use SASS')
    .option('-shared, --create-shared', 'Create a shared app')
    .option('-add-shared-remote, --add-shared-remote', 'Add a remote for the shared app')
    .option('-h, --help', 'Display help for command')
    .action(async () => {
        const commandOptions = program.opts();

        console.log(commandOptions);

        if (commandOptions.help) {
            program.outputHelp();
            process.exit(0);
        }

        const options = await promptForProjectOptions(commandOptions);

        await generateProject(options);
    });

program.parse();
