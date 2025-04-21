import { text, select, confirm, isCancel, cancel } from '@clack/prompts';
import fs from 'fs';
import path from 'path';

import type { OptionValues } from 'commander';

import { getConfig } from '../core/config';
import {
    PROJECT_FRAMEWORK_KEYS,
    PROJECT_FRAMEWORKS,
    PROJECT_STRUCTURE_KEYS,
    PROJECT_STRUCTURES,
    PROJECT_STYLE_FRAMEWORK_KEYS,
    PROJECT_STYLE_FRAMEWORKS,
    PROJECT_TYPE_KEYS,
    PROJECT_TYPES,
} from '../constants/project';

import type {
    ProjectAddSharedRemote,
    ProjectCreateShared,
    ProjectFramework,
    ProjectName,
    ProjectOptions,
    ProjectStructure,
    ProjectStyleFramework,
    ProjectType,
    ProjectUseSass,
} from '../types/project';

function checkCancel(value: unknown) {
    if (isCancel(value)) {
        cancel('Operation cancelled.');
        process.exit(0);
    }
}

export async function promptForProjectOptions(commandOptions: OptionValues = {}): Promise<ProjectOptions> {
    const config = getConfig();
    const options = {} as ProjectOptions;

    if (commandOptions.structure) {
        if (!PROJECT_STRUCTURE_KEYS[commandOptions.structure as ProjectStructure]) {
            console.error(`Invalid structure: ${commandOptions.structure}`);
            process.exit(1);
        }

        options.structure = commandOptions.structure;
    } else {
        options.structure = (await select({
            message: 'Project structure:',
            options: Object.entries(PROJECT_STRUCTURES).map(([value, label]) => ({
                value,
                label: label.replace('apps/', `${config.appsDir}/`),
            })),
        })) as ProjectStructure;
        checkCancel(options.structure);
    }

    // const shellPath =
    //     structure === PROJECT_STRUCTURE_KEYS.monorepo
    //         ? path.join(process.cwd(), config.appsDir, config.defaultShell)
    //         : path.join(process.cwd(), config.defaultShell);
    // const shellExists = fs.existsSync(shellPath);

    // let type: ProjectType = PROJECT_TYPE_KEYS.microfrontend;
    // if (!shellExists || commandOptions?.allowMultipleShells) {
    //     type = (await select({
    //         message: 'What do you want to create?' + ' ' + shellPath,
    //         options: Object.entries(PROJECT_TYPES).map(([value, label]) => ({
    //             value,
    //             label,
    //         })),
    //     })) as ProjectType;
    // }
    if (commandOptions.type) {
        if (!PROJECT_TYPE_KEYS[commandOptions.type as ProjectType]) {
            console.error(`Invalid type: ${commandOptions.type}`);
            process.exit(1);
        }

        options.type = commandOptions.type;
    } else {
        options.type = (await select({
            message: 'What do you want to create?',
            options: Object.entries(PROJECT_TYPES).map(([value, label]) => ({
                value,
                label,
            })),
        })) as ProjectType;
        checkCancel(options.type);
    }

    if (commandOptions.name) {
        options.name = commandOptions.name;
    } else {
        options.name = (await text({
            message: options.type === PROJECT_TYPE_KEYS.shell ? 'Shell name:' : 'Microfrontend name:',
            placeholder: options.type === PROJECT_TYPE_KEYS.shell ? 'shell' : 'product-list',
        })) as ProjectName;
        checkCancel(options.name);
    }

    if (commandOptions.framework) {
        if (!PROJECT_FRAMEWORK_KEYS[commandOptions.framework as ProjectFramework]) {
            console.error(`Invalid framework: ${commandOptions.framework}`);
            process.exit(1);
        }

        options.framework = commandOptions.framework;
    } else {
        options.framework = (await select({
            message: 'Framework:',
            options: Object.entries(PROJECT_FRAMEWORKS).map(([value, label]) => ({
                value,
                label,
            })),
        })) as ProjectFramework;
        checkCancel(options.framework);
    }

    if (commandOptions.styleFramework) {
        if (!PROJECT_STYLE_FRAMEWORK_KEYS[commandOptions.styleFramework as ProjectStyleFramework]) {
            console.error(`Invalid style framework: ${commandOptions.styleFramework}`);
            process.exit(1);
        }

        options.styleFramework = commandOptions.styleFramework;
    } else {
        options.styleFramework = (await select({
            message: 'CSS framework:',
            options: Object.entries(PROJECT_STYLE_FRAMEWORKS).map(([value, label]) => ({
                value,
                label,
            })),
        })) as ProjectStyleFramework;
        checkCancel(options.styleFramework);
    }

    if (options.styleFramework !== PROJECT_STYLE_FRAMEWORK_KEYS.tailwind) {
        if (commandOptions.useSass) {
            options.useSass = commandOptions.useSass;
        } else {
            options.useSass = (await confirm({ message: 'Include Sass/SCSS?' })) as ProjectUseSass;
            checkCancel(options.useSass);
        }
    } else {
        options.useSass = false;
    }

    const sharedExists = fs.existsSync(path.join(process.cwd(), config.sharedApp.name));
    if (!sharedExists) {
        if (commandOptions.createShared) {
            options.createShared = commandOptions.createShared;
        } else {
            options.createShared = (await confirm({
                message: `Create shared app '${config.sharedApp.name}'?`,
            })) as ProjectCreateShared;
            checkCancel(options.createShared);
        }
    } else {
        options.createShared = false;
    }

    if (options.type === PROJECT_TYPE_KEYS.microfrontend && sharedExists) {
        if (commandOptions.addSharedRemote) {
            options.addSharedRemote = commandOptions.addSharedRemote;
        } else {
            options.addSharedRemote = (await confirm({
                message: `Add shared remote '${config.sharedApp.name}'?`,
            })) as ProjectAddSharedRemote;
            checkCancel(options.addSharedRemote);
        }
    } else {
        options.addSharedRemote = false;
    }

    return options;
}
