import { PROJECT_TYPES, PROJECT_FRAMEWORKS, PROJECT_STYLE_FRAMEWORKS, PROJECT_STRUCTURES } from '../constants/project';

export type ProjectType = keyof typeof PROJECT_TYPES;
export type ProjectFramework = keyof typeof PROJECT_FRAMEWORKS;
export type ProjectStyleFramework = keyof typeof PROJECT_STYLE_FRAMEWORKS;
export type ProjectStructure = keyof typeof PROJECT_STRUCTURES;

export type ProjectUseSass = boolean;
export type ProjectIncludeESLint = boolean;
export type ProjectName = string;
export type ProjectPort = string;
export type ProjectConsumers = string[];

export interface ProjectOptions {
    name: ProjectName;
    framework: ProjectFramework;
    styleFramework: ProjectStyleFramework;
    useSass: ProjectUseSass;
    structure: ProjectStructure;
    includeESLint: ProjectIncludeESLint;
    type: ProjectType;
    port: ProjectPort;
    consumers: ProjectConsumers;
}

export interface ProjectCommandOptions {
    structure?: ProjectStructure;
    type?: ProjectType;
    name?: ProjectName;
    framework?: ProjectFramework;
    styleFramework?: ProjectStyleFramework;
    useSass?: ProjectUseSass;
    port?: ProjectPort;
    noEslint?: ProjectIncludeESLint;
    help?: boolean;
}

export interface ProjectConfig {
    appsDir: string;
    eslintTemplatePath?: string;
    eslintExtendPath?: string;
    defaultStructure?: ProjectStructure;
    defaultType?: ProjectType;
    defaultFramework?: ProjectFramework;
    defaultStyleFramework?: ProjectStyleFramework;
    middleware?: {
        beforeGenerate?: string[];
        afterGenerate?: string[];
    };
}
