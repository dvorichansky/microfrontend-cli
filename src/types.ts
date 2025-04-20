export interface ProjectOptions {
    name: ProjectName;
    framework: ProjectFramework;
    styleFramework: ProjectStyleFramework;
    useSass: ProjectUseSass;
    standalone: ProjectStandalone;
    addSharedRemote: ProjectAddSharedRemote;
    type: ProjectType;
}

export type ProjectType = 'shell' | 'microfrontend';
export type ProjectFramework = 'react' | 'vue' | 'vanilla';
export type ProjectStyleFramework = 'tailwind' | 'bootstrap' | 'none';
export type ProjectUseSass = boolean;
export type ProjectStandalone = boolean;
export type ProjectAddSharedRemote = boolean;
export type ProjectName = string;
