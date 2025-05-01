#!/usr/bin/env node

import { Command } from 'commander';

import { promptForProjectOptions } from '../src/commands/prompt-options';
import { generateProject } from '../src/commands/generate-project';
import {
    PROJECT_FRAMEWORK_KEYS,
    PROJECT_STRUCTURE_KEYS,
    PROJECT_STYLE_FRAMEWORK_KEYS,
    PROJECT_TYPE_KEYS,
} from '../src/constants/project';

import type { ProjectCommandOptions } from '../src/types/project';

const program = new Command();

program.name('mf-cli').description('CLI for scalable microfrontend architecture');

program
    // .command('create')
    // .description('Create a shell or microfrontend')
    .option('-s, --structure <structure>', `Project structure (${Object.values(PROJECT_STRUCTURE_KEYS).join(', ')})`)
    .option('-t, --type <type>', `Project type (${Object.values(PROJECT_TYPE_KEYS).join(', ')})`)
    .option('-n, --name <name>', 'Project name')
    .option('-f, --framework <framework>', `Framework to use (${Object.values(PROJECT_FRAMEWORK_KEYS).join(', ')})`)
    .option(
        '-style, --style-framework <styleFramework>',
        `Style framework to use (${Object.values(PROJECT_STYLE_FRAMEWORK_KEYS).join(', ')})`,
    )
    .option('-sass, --use-sass', 'Use SASS')
    // .option('-shared, --create-shared', 'Create a shared app')
    // .option('-add-shared-remote, --add-shared-remote', 'Add a remote for the shared app')
    .option('-no-eslint, --no-eslint', 'Without ESLint')
    .option('-h, --help', 'Display help for command')
    .action(async () => {
        const commandOptions = program.opts() as ProjectCommandOptions;

        if (commandOptions.help) {
            program.outputHelp();
            process.exit(0);
        }

        const options = await promptForProjectOptions(commandOptions);

        await generateProject(options);
    });

program.parse();
