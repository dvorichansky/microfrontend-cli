#!/usr/bin/env node

import { Command } from 'commander';

import { promptForProjectOptions } from '../src/commands/prompt-options';
import { generateProject } from '../src/commands/generate-project';

const program = new Command();

program.name('mf-cli').description('CLI for scalable microfrontend architecture').version('0.1.0');

program
    .command('create')
    .description('Create a shell or microfrontend')
    .action(async () => {
        const options = await promptForProjectOptions();

        await generateProject(options);
    });

program.parse();
