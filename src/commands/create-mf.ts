import { text, select, confirm, spinner, isCancel, cancel, outro } from '@clack/prompts';
import fs from 'node:fs';
import path from 'node:path';
import { getConfig } from '../core/config';

// Тип відповідей користувача
export type MfAnswers = {
    name: string;
    framework: 'react' | 'vue' | 'vanilla';
    styleFramework: 'tailwind' | 'bootstrap' | 'none';
    useSass: boolean;
    standalone: boolean;
    addSharedRemote: boolean;
};

function checkCancel(value: unknown) {
    if (isCancel(value)) {
        cancel('Operation cancelled.');
        process.exit(0);
    }
}

export async function createMicrofrontend() {
    const config = getConfig();

    const answers: MfAnswers = {
        name: '',
        framework: 'react',
        styleFramework: 'tailwind',
        useSass: false,
        standalone: false,
        addSharedRemote: false,
    };

    // Назва мікрофронтенду
    const name = await text({
        message: 'Microfrontend name:',
        placeholder: 'product-list',
    });
    checkCancel(name);
    answers.name = name as string;

    // Фреймворк
    const framework = await select({
        message: 'Framework:',
        options: [
            { value: 'react', label: 'React' },
            { value: 'vue', label: 'Vue 3' },
            { value: 'vanilla', label: 'Vanilla JS/TS' },
        ],
    });
    checkCancel(framework);
    answers.framework = framework as MfAnswers['framework'];

    // CSS фреймворк
    const style = await select({
        message: 'CSS framework:',
        options: [
            { value: 'tailwind', label: 'Tailwind CSS' },
            { value: 'bootstrap', label: 'Bootstrap' },
            { value: 'none', label: 'None' },
        ],
    });
    checkCancel(style);
    answers.styleFramework = style as MfAnswers['styleFramework'];

    // SCSS
    const useSass = await confirm({ message: 'Include Sass/SCSS?' });
    checkCancel(useSass);
    answers.useSass = useSass as boolean;

    // Створення як standalone
    const standalone = await confirm({ message: 'Generate as standalone project?' });
    checkCancel(standalone);
    answers.standalone = standalone as boolean;

    // Чи є sharedApp і чи пропонувати його підключити
    const sharedName = config.sharedApp?.name || 'shared';
    const sharedExists = fs.existsSync(path.join(config.appsDir, sharedName));

    if (sharedExists) {
        const addShared = await confirm({
            message: `Add remote '${sharedName}' to this microfrontend?`,
        });
        checkCancel(addShared);
        answers.addSharedRemote = addShared as boolean;
    }

    // Показуємо результат і запускаємо генерацію (TODO)
    const s = spinner();
    s.start('Generating microfrontend...');

    // TODO: створення структури, копіювання шаблонів, оновлення remotes
    await new Promise((res) => setTimeout(res, 1000)); // тимчасово симуляція

    s.stop('Microfrontend created.');

    outro(`✔️ '${answers.name}' is ready! Next steps:\n  cd ${answers.name}\n  npm install\n  npm run dev`);
}
