import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';
import {
    CONTENT_CREATION_TOOLS,
    CODE_OPERATION_TOOLS,
    BROWSER_AUTOMATION_TOOLS,
    MEDIA_GENERATION_TOOLS,
    FILE_OPERATION_TOOLS
} from './skillTools';

export interface SkillDefinition {
    name: string;
    displayName: string;
    description: string;
    category: 'creative' | 'technical' | 'automation' | 'business';
    icon?: string;
    isBuiltIn: boolean;
}

/**
 * Built-in skills that group related tools for agent capabilities
 */
export const BUILT_IN_SKILLS: SkillDefinition[] = [
    // === CREATIVE SKILLS ===
    {
        name: 'content_creation',
        displayName: 'Content Creation',
        description: 'Create blog posts, articles, scripts, and documentation',
        category: 'creative',
        icon: '✍️',
        isBuiltIn: true,
    },
    {
        name: 'media_generation',
        displayName: 'Media Generation',
        description: 'Generate images, videos, audio, and presentations',
        category: 'creative',
        icon: '🎨',
        isBuiltIn: true,
    },

    // === TECHNICAL SKILLS ===
    {
        name: 'code_operations',
        displayName: 'Code Operations',
        description: 'Write, review, refactor, and debug code',
        category: 'technical',
        icon: '💻',
        isBuiltIn: true,
    },
    {
        name: 'file_operations',
        displayName: 'File Operations',
        description: 'Read, write, and manage files and directories',
        category: 'technical',
        icon: '📁',
        isBuiltIn: true,
    },

    // === AUTOMATION SKILLS ===
    {
        name: 'browser_automation',
        displayName: 'Browser Automation',
        description: 'Navigate websites, interact with elements, extract data',
        category: 'automation',
        icon: '🌐',
        isBuiltIn: true,
    },
    {
        name: 'api_integration',
        displayName: 'API Integration',
        description: 'Call external APIs and integrate with third-party services',
        category: 'automation',
        icon: '🔌',
        isBuiltIn: true,
    },

    // === BUSINESS SKILLS ===
    {
        name: 'task_management',
        displayName: 'Task Management',
        description: 'Create, update, and manage tasks and projects',
        category: 'business',
        icon: '✅',
        isBuiltIn: true,
    },
];

/**
 * Get skill by name
 */
export function getSkillByName(name: string): SkillDefinition | undefined {
    return BUILT_IN_SKILLS.find(skill => skill.name === name);
}

/**
 * Get skills by category
 */
export function getSkillsByCategory(category: SkillDefinition['category']): SkillDefinition[] {
    return BUILT_IN_SKILLS.filter(skill => skill.category === category);
}

/**
 * Get all skill names
 */

export function getAllSkillNames(): string[] {
    return BUILT_IN_SKILLS.map(skill => skill.name);
}

/**
 * Sync all built-in skills to the database
 */
export async function syncSkillsToDatabase(): Promise<void> {
    console.log('[SkillRegistry] Syncing built-in skills to database...');

    for (const skillDef of BUILT_IN_SKILLS) {
        const skill = await prisma.agentSkill.upsert({
            where: { name: skillDef.name },
            update: {
                displayName: skillDef.displayName,
                description: skillDef.description,
                category: skillDef.category,
                icon: skillDef.icon,
                isBuiltIn: true,
                isActive: true,
            },
            create: {
                id: randomUUID(),
                name: skillDef.name,
                displayName: skillDef.displayName,
                description: skillDef.description,
                category: skillDef.category,
                icon: skillDef.icon,
                isBuiltIn: true,
                isActive: true,
            },
        });

        // Associate tools with this skill
        let toolsToSync: any[] = [];
        if (skillDef.name === 'content_creation') toolsToSync = CONTENT_CREATION_TOOLS;
        else if (skillDef.name === 'code_operations') toolsToSync = CODE_OPERATION_TOOLS;
        else if (skillDef.name === 'browser_automation') toolsToSync = BROWSER_AUTOMATION_TOOLS;
        else if (skillDef.name === 'media_generation') toolsToSync = MEDIA_GENERATION_TOOLS;
        else if (skillDef.name === 'file_operations') toolsToSync = FILE_OPERATION_TOOLS;

        if (toolsToSync.length > 0) {
            for (const toolDef of toolsToSync) {
                // Find the tool in the database
                const dbTool = await prisma.systemTool.findUnique({
                    where: { name: toolDef.name },
                });

                if (dbTool) {
                    await prisma.skillToTool.upsert({
                        where: {
                            skillId_toolId: {
                                skillId: skill.id,
                                toolId: dbTool.id,
                            },
                        },
                        update: {},
                        create: {
                            id: randomUUID(),
                            skillId: skill.id,
                            toolId: dbTool.id,
                            isDefault: true,
                        },
                    });
                }
            }
        }
    }

    console.log('[SkillRegistry] Built-in skills synced successfully');
}
