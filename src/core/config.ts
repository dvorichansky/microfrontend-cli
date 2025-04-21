import fs from 'fs';
import path from 'path';

const DEFAULT_CONFIG = {
    appsDir: 'apps',
    defaultShell: 'shell',
    sharedApp: {
        name: 'shared',
    },
};

export function getConfig(): typeof DEFAULT_CONFIG & Record<string, any> {
    const configPath = path.resolve(process.cwd(), 'mf-cli.config.json');

    if (fs.existsSync(configPath)) {
        try {
            const content = fs.readFileSync(configPath, 'utf-8');

            return Object.assign(DEFAULT_CONFIG, JSON.parse(content));
        } catch (e) {
            console.warn('Invalid mf-cli.config.json. Using defaults.');
        }
    }

    return DEFAULT_CONFIG;
}
