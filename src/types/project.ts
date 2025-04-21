import { PROJECT_TYPES, PROJECT_FRAMEWORKS, PROJECT_STYLE_FRAMEWORKS, PROJECT_STRUCTURES } from '../constants/project';

export type ProjectType = keyof typeof PROJECT_TYPES;
export type ProjectFramework = keyof typeof PROJECT_FRAMEWORKS;
export type ProjectStyleFramework = keyof typeof PROJECT_STYLE_FRAMEWORKS;
export type ProjectStructure = keyof typeof PROJECT_STRUCTURES;

export type ProjectUseSass = boolean;
export type ProjectAddSharedRemote = boolean;
export type ProjectName = string;

export interface ProjectOptions {
    name: ProjectName;
    framework: ProjectFramework;
    styleFramework: ProjectStyleFramework;
    useSass: ProjectUseSass;
    structure: ProjectStructure;
    addSharedRemote: ProjectAddSharedRemote;
    type: ProjectType;
}
