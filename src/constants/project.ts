export const PROJECT_TYPE_KEYS = {
    shell: 'shell',
    microfrontend: 'microfrontend',
} as const;

export const PROJECT_FRAMEWORK_KEYS = {
    react: 'react',
    vue: 'vue',
    vanilla: 'vanilla',
} as const;

export const PROJECT_STYLE_FRAMEWORK_KEYS = {
    tailwind: 'tailwind',
    bootstrap: 'bootstrap',
    none: 'none',
} as const;

export const PROJECT_STRUCTURE_KEYS = {
    standalone: 'standalone',
    monorepo: 'monorepo',
} as const;

export const PROJECT_TYPES = {
    [PROJECT_TYPE_KEYS.shell]: 'Shell (host application)',
    [PROJECT_TYPE_KEYS.microfrontend]: 'Microfrontend (remote)',
} as const;

export const PROJECT_FRAMEWORKS = {
    [PROJECT_FRAMEWORK_KEYS.react]: 'React',
    [PROJECT_FRAMEWORK_KEYS.vue]: 'Vue 3',
    [PROJECT_FRAMEWORK_KEYS.vanilla]: 'Vanilla JS/TS',
} as const;

export const PROJECT_STYLE_FRAMEWORKS = {
    [PROJECT_STYLE_FRAMEWORK_KEYS.tailwind]: 'Tailwind CSS',
    [PROJECT_STYLE_FRAMEWORK_KEYS.bootstrap]: 'Bootstrap',
    [PROJECT_STYLE_FRAMEWORK_KEYS.none]: 'None',
} as const;

export const PROJECT_STRUCTURES = {
    [PROJECT_STRUCTURE_KEYS.standalone]: 'Standalone (outside monorepo)',
    [PROJECT_STRUCTURE_KEYS.monorepo]: 'Monorepo (inside apps/)',
} as const;
