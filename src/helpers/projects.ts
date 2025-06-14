import fs from 'fs-extra';
import path from 'path';

export async function getProjectsWithRemotes(rootDir: string): Promise<string[]> {
    const entries = await fs.readdir(rootDir);

    const projects: string[] = [];

    for (const entry of entries) {
        const fullPath = path.join(rootDir, entry);
        const stat = await fs.stat(fullPath);

        if (stat.isDirectory()) {
            const remotesConfigPath = path.join(fullPath, 'remotes.config.js');

            if (await fs.pathExists(remotesConfigPath)) {
                projects.push(entry);
            }
        }
    }

    return projects;
}

export async function updateRemotesConfig(consumerPath: string, remoteKey: string, port: number) {
    const configPath = path.join(consumerPath, 'remotes.config.js');
    const envPath = path.join(consumerPath, '.env.development');

    const exists = await fs.pathExists(configPath);

    if (!exists) {
        return;
    }

    const content = await fs.readFile(configPath, 'utf-8');
    const lowerRemoteKey = remoteKey.toLowerCase();
    const envVar = `${lowerRemoteKey.toUpperCase()}_URL`;
    const newLine = `    '${lowerRemoteKey}': process.env.${envVar},`;

    if (!content.includes(`process.env.${envVar}`)) {
        const updated = content.replace(/module\.exports\s*=\s*{/, `module.exports = {\n${newLine}`);

        await fs.writeFile(configPath, updated);
    }

    const envLine = `${envVar}=${lowerRemoteKey}@http://localhost:${port}/remoteEntry.js`;
    let envContent = '';

    if (await fs.pathExists(envPath)) {
        envContent = await fs.readFile(envPath, 'utf-8');

        const regex = new RegExp(`^${envVar}=.*$`, 'm');

        if (regex.test(envContent)) {
            envContent = envContent.replace(regex, envLine);
        } else {
            envContent += `\n${envLine}`;
        }
    } else {
        envContent = envLine;
    }

    await fs.writeFile(envPath, envContent.trim() + '\n');
}
