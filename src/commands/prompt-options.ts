import { text, select, confirm, isCancel, cancel, multiselect } from '@clack/prompts';
import fs from 'fs';
import path from 'path';

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
import { MIDDLEWARE_STAGE } from '../constants/middleware';
import { getConfig } from '../helpers/config';
import { getNextAvailablePort, isPortAlreadyUsedInProject } from '../helpers/port';
import { getProjectsWithRemotes } from '../helpers/projects';
import { runMiddleware } from '../helpers/middleware';

import type {
    ProjectCommandOptions,
    ProjectConsumers,
    ProjectFramework,
    ProjectIncludeESLint,
    ProjectName,
    ProjectOptions,
    ProjectPort,
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

export async function promptForProjectOptions(commandOptions: ProjectCommandOptions = {}): Promise<ProjectOptions> {
    const config = getConfig();
    const options = {} as ProjectOptions;

    if (commandOptions.structure) {
        if (!PROJECT_STRUCTURE_KEYS[commandOptions.structure]) {
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
            initialValue:
                config.defaultStructure && PROJECT_STRUCTURE_KEYS[config.defaultStructure]
                    ? config.defaultStructure
                    : undefined,
        })) as ProjectStructure;
        checkCancel(options.structure);
    }

    if (commandOptions.type) {
        if (!PROJECT_TYPE_KEYS[commandOptions.type]) {
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
            initialValue: config.defaultType && PROJECT_TYPE_KEYS[config.defaultType] ? config.defaultType : undefined,
        })) as ProjectType;
        checkCancel(options.type);
    }

    while (!options.name) {
        if (commandOptions.name) {
            options.name = commandOptions.name;
        } else {
            const namePrompts = {
                [PROJECT_TYPE_KEYS.shell]: {
                    message: 'Shell name:',
                    placeholder: 'shell',
                },
                [PROJECT_TYPE_KEYS.microfrontend]: {
                    message: 'Microfrontend name:',
                    placeholder: 'my-microfrontend',
                },
                [PROJECT_TYPE_KEYS.shared]: {
                    message: 'Shared remote name:',
                    placeholder: 'shared',
                },
            };
            const namePrompt = namePrompts[options.type];

            options.name = (await text({
                message: namePrompt.message,
                placeholder: namePrompt.placeholder,
            })) as ProjectName;
            checkCancel(options.name);
        }

        const targetDir =
            options.structure === PROJECT_STRUCTURE_KEYS.standalone
                ? path.resolve(process.cwd(), options.name)
                : path.resolve(process.cwd(), config.appsDir, options.name);

        if (!fs.existsSync(targetDir)) {
            break;
        }

        console.log('❌ A project with name' + options.name + ' already exists. ' + 'Please choose a different name.');
        options.name = '';
        commandOptions.name = '';
    }

    const rootDir =
        options.structure === PROJECT_STRUCTURE_KEYS.standalone
            ? path.resolve(process.cwd())
            : path.resolve(process.cwd(), config.appsDir);

    if (options.type !== PROJECT_TYPE_KEYS.shell) {
        const projectsWithRemotes = await getProjectsWithRemotes(rootDir);

        if (projectsWithRemotes.length) {
            options.consumers = (await multiselect({
                message: 'Connect this remote to which apps?',
                options: projectsWithRemotes.map((name) => ({
                    value: name,
                    label: name,
                })),
                required: false,
            })) as ProjectConsumers;
            checkCancel(options.consumers);
        }
    }

    if (commandOptions.framework) {
        if (!PROJECT_FRAMEWORK_KEYS[commandOptions.framework]) {
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
            initialValue:
                config.defaultFramework && PROJECT_FRAMEWORKS[config.defaultFramework]
                    ? config.defaultFramework
                    : undefined,
        })) as ProjectFramework;
        checkCancel(options.framework);
    }

    if (commandOptions.styleFramework) {
        if (!PROJECT_STYLE_FRAMEWORK_KEYS[commandOptions.styleFramework]) {
            console.error('Invalid style framework:' + commandOptions.styleFramework);
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
            initialValue:
                config.defaultStyleFramework && PROJECT_STYLE_FRAMEWORKS[config.defaultStyleFramework]
                    ? config.defaultStyleFramework
                    : undefined,
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

    while (!options.port) {
        if (commandOptions.port) {
            options.port = commandOptions.port;
        } else {
            const availablePort = (await getNextAvailablePort(rootDir)).toString();

            options.port = (await text({
                message: 'Port number:',
                initialValue: availablePort,
            })) as ProjectPort;
            checkCancel(options.port);
        }

        if (!(await isPortAlreadyUsedInProject(rootDir, parseInt(options.port, 10)))) {
            break;
        }

        console.log('❌ Port ${options.port} is already in use. ' + 'Please choose a different port.');
        options.port = '';
        commandOptions.port = '';
    }

    if (commandOptions.noEslint) {
        options.includeESLint = false;
    } else {
        options.includeESLint = (await confirm({
            message: 'Include ESLint configuration?',
            initialValue: true,
        })) as ProjectIncludeESLint;
        checkCancel(options.includeESLint);
    }

    const middlewareOptions = await runMiddleware(MIDDLEWARE_STAGE.beforeGenerate, { options, commandOptions });

    Object.assign(options, middlewareOptions);

    return options;
}
