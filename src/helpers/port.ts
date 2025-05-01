import fs from 'fs-extra';
import path from 'path';

async function getUsedPortsFromEnvFiles(rootDir: string): Promise<Set<number>> {
    const usedPorts = new Set<number>();
    const entries = await fs.readdir(rootDir);

    for (const entry of entries) {
        const envPath = path.join(rootDir, entry, '.env.development');

        if (await fs.pathExists(envPath)) {
            const envContent = await fs.readFile(envPath, 'utf-8');
            const match = envContent.match(/^PORT=(\d+)/m);

            if (match) {
                usedPorts.add(Number(match[1]));
            }
        }
    }

    return usedPorts;
}

export async function getNextAvailablePort(rootDir: string, portRange = [3000, 4000]): Promise<number> {
    const usedPorts = await getUsedPortsFromEnvFiles(rootDir);

    for (let port = portRange[0]; port <= portRange[1]; port++) {
        if (!usedPorts.has(port)) {
            return port;
        }
    }

    throw new Error('No available ports in specified range');
}

export async function isPortAlreadyUsedInProject(rootDir: string, portToCheck: number): Promise<boolean> {
    const usedPorts = await getUsedPortsFromEnvFiles(rootDir);

    return usedPorts.has(portToCheck);
}
