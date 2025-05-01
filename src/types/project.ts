import { PROJECT_TYPES, PROJECT_FRAMEWORKS, PROJECT_STYLE_FRAMEWORKS, PROJECT_STRUCTURES } from '../constants/project';

export type ProjectType = keyof typeof PROJECT_TYPES;
export type ProjectFramework = keyof typeof PROJECT_FRAMEWORKS;
export type ProjectStyleFramework = keyof typeof PROJECT_STYLE_FRAMEWORKS;
export type ProjectStructure = keyof typeof PROJECT_STRUCTURES;

export type ProjectUseSass = boolean;
// export type ProjectCreateShared = boolean;
// export type ProjectAddSharedRemote = boolean;
export type ProjectIncludeESLint = boolean;
export type ProjectName = string;
export type ProjectPort = string;

export interface ProjectOptions {
    name: ProjectName;
    framework: ProjectFramework;
    styleFramework: ProjectStyleFramework;
    useSass: ProjectUseSass;
    structure: ProjectStructure;
    // createShared: ProjectCreateShared;
    // addSharedRemote: ProjectAddSharedRemote;
    includeESLint: ProjectIncludeESLint;
    type: ProjectType;
    port: ProjectPort;
}

export interface ProjectCommandOptions {
    structure?: ProjectStructure;
    type?: ProjectType;
    name?: ProjectName;
    framework?: ProjectFramework;
    styleFramework?: ProjectStyleFramework;
    useSass?: ProjectUseSass;
    // createShared?: ProjectCreateShared;
    // addSharedRemote?: ProjectAddSharedRemote;
    port?: ProjectPort;
    noEslint?: ProjectIncludeESLint;
    help?: boolean;
}

export interface ProjectConfig {
    appsDir: string;
    sharedApp: {
        name: string;
    };
    eslintTemplatePath?: string;
    eslintExtendPath?: string;
    defaultStructure?: ProjectStructure;
    defaultType?: ProjectType;
    defaultFramework?: ProjectFramework;
    defaultStyleFramework?: ProjectStyleFramework;
}
