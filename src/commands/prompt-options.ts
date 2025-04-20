import { text, select, confirm, isCancel, cancel } from '@clack/prompts';
import fs from 'fs';
import path from 'path';

import { getConfig } from '../core/config';

import type {
    ProjectAddSharedRemote,
    ProjectFramework,
    ProjectName,
    ProjectOptions,
    ProjectStandalone,
    ProjectStyleFramework,
    ProjectType,
    ProjectUseSass,
} from '../types';

function checkCancel(value: unknown) {
    if (isCancel(value)) {
        cancel('Operation cancelled.');
        process.exit(0);
    }
}

export async function promptForProjectOptions(): Promise<ProjectOptions> {
    const config = getConfig();

    const type = (await select({
        message: 'What do you want to create?',
        options: [
            { value: 'shell', label: 'Shell (host application)' },
            { value: 'microfrontend', label: 'Microfrontend (remote)' },
        ],
    })) as ProjectType;

    const name = (await text({
        message: type === 'shell' ? 'Shell name:' : 'Microfrontend name:',
        placeholder: type === 'shell' ? 'shell' : 'product-list',
    })) as ProjectName;
    checkCancel(name);

    const framework = (await select({
        message: 'Framework:',
        options: [
            { value: 'react', label: 'React' },
            { value: 'vue', label: 'Vue' },
            { value: 'vanilla', label: 'Vanilla JS/TS' },
        ],
    })) as ProjectFramework;
    checkCancel(framework);

    const styleFramework = (await select({
        message: 'CSS framework:',
        options: [
            { value: 'tailwind', label: 'Tailwind CSS' },
            { value: 'bootstrap', label: 'Bootstrap' },
            { value: 'none', label: 'None' },
        ],
    })) as ProjectStyleFramework;
    checkCancel(styleFramework);

    let useSass: ProjectUseSass = false;
    if (styleFramework !== 'tailwind') {
        useSass = (await confirm({ message: 'Include Sass/SCSS?' })) as ProjectUseSass;
        checkCancel(useSass);
    }

    const standalone = (await confirm({ message: 'Generate as standalone project?' })) as ProjectStandalone;
    checkCancel(standalone);

    let addSharedRemote: ProjectAddSharedRemote = false;
    if (type === 'microfrontend') {
        const sharedName = config.sharedApp?.name || 'shared';
        const exists = fs.existsSync(path.join(config.appsDir, sharedName));

        if (exists) {
            addSharedRemote = (await confirm({
                message: `Add shared remote '${sharedName}'?`,
            })) as ProjectAddSharedRemote;
            checkCancel(addSharedRemote);
        }
    }

    return {
        name,
        framework,
        styleFramework,
        useSass,
        standalone,
        addSharedRemote,
        type,
    };
}
