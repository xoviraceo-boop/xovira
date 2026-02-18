import type { Tool } from '../types/types';

type ToolDefinition = Omit<Tool, 'id'>;

// === CONTENT CREATION TOOLS ===
export const CONTENT_CREATION_TOOLS: ToolDefinition[] = [
    {
        name: 'generateBlogPost',
        description: 'Generate a comprehensive blog post on a specific topic',
        category: 'CONTENT_CREATION',
        isDefault: false,
        functionSchema: {
            name: 'generateBlogPost',
            description: 'Generate a blog post',
            parameters: {
                type: 'object',
                properties: {
                    topic: { type: 'string', description: 'Main topic or title of the blog post' },
                    keywords: { type: 'array', items: { type: 'string' }, description: 'Keywords to include' },
                    tone: { type: 'string', description: 'Tone of the post (e.g., professional, casual, informative)' },
                    targetAudience: { type: 'string', description: 'Target audience for the post' },
                    wordCount: { type: 'number', description: 'Approximate word count' },
                },
                required: ['topic'],
            },
        },
        deterministic: false,
        requiresAuth: false,
        timeout: 60,
        examples: [
            {
                input: { topic: 'The Future of AI', tone: 'Inspirational' },
                output: { title: 'The Future of AI', content: '...' },
                description: 'Generate a blog post about AI',
            },
        ],
    },
    {
        name: 'writeScript',
        description: 'Write a script for a video, podcast, or presentation',
        category: 'CONTENT_CREATION',
        isDefault: false,
        functionSchema: {
            name: 'writeScript',
            description: 'Write a script',
            parameters: {
                type: 'object',
                properties: {
                    topic: { type: 'string', description: 'Topic or title of the script' },
                    format: { type: 'string', enum: ['VIDEO', 'PODCAST', 'PRESENTATION'], description: 'Format of the script' },
                    duration: { type: 'string', description: 'Target duration (e.g., "5 minutes")' },
                    keyPoints: { type: 'array', items: { type: 'string' }, description: 'Key points to cover' },
                },
                required: ['topic', 'format'],
            },
        },
        deterministic: false,
        requiresAuth: false,
        timeout: 60,
        examples: [],
    },
    {
        name: 'createDocumentation',
        description: 'Create technical documentation, user guides, or API references',
        category: 'CONTENT_CREATION',
        isDefault: false,
        functionSchema: {
            name: 'createDocumentation',
            description: 'Create documentation',
            parameters: {
                type: 'object',
                properties: {
                    subject: { type: 'string', description: 'Subject of the documentation' },
                    type: { type: 'string', enum: ['USER_GUIDE', 'API_REFERENCE', 'TECHNICAL_SPEC', 'README'], description: 'Type of documentation' },
                    details: { type: 'string', description: 'Detailed information or code to document' },
                },
                required: ['subject', 'type', 'details'],
            },
        },
        deterministic: false,
        requiresAuth: false,
        timeout: 60,
        examples: [],
    },
];

// === CODE OPERATION TOOLS ===
export const CODE_OPERATION_TOOLS: ToolDefinition[] = [
    {
        name: 'writeCode',
        description: 'Generate or modify code based on requirements',
        category: 'CODE_OPERATIONS',
        isDefault: false,
        functionSchema: {
            name: 'writeCode',
            description: 'Write code',
            parameters: {
                type: 'object',
                properties: {
                    language: { type: 'string', description: 'Programming language' },
                    description: { type: 'string', description: 'Description of what the code should do' },
                    existingCode: { type: 'string', description: 'Existing code to modify (optional)' },
                    filePath: { type: 'string', description: 'Target file path (optional)' },
                },
                required: ['language', 'description'],
            },
        },
        deterministic: false,
        requiresAuth: false,
        timeout: 60,
        examples: [],
    },
    {
        name: 'reviewCode',
        description: 'Review code for best practices, bugs, and security issues',
        category: 'CODE_OPERATIONS',
        isDefault: false,
        functionSchema: {
            name: 'reviewCode',
            description: 'Review code',
            parameters: {
                type: 'object',
                properties: {
                    code: { type: 'string', description: 'Code to review' },
                    language: { type: 'string', description: 'Programming language' },
                    context: { type: 'string', description: 'Additional context about the code' },
                },
                required: ['code'],
            },
        },
        deterministic: false,
        requiresAuth: false,
        timeout: 60,
        examples: [],
    },
    {
        name: 'refactorCode',
        description: 'Refactor code to improve structure, readability, or performance',
        category: 'CODE_OPERATIONS',
        isDefault: false,
        functionSchema: {
            name: 'refactorCode',
            description: 'Refactor code',
            parameters: {
                type: 'object',
                properties: {
                    code: { type: 'string', description: 'Code to refactor' },
                    language: { type: 'string', description: 'Programming language' },
                    goal: { type: 'string', description: 'Goal of the refactoring (e.g., "improve performance", "clean up")' },
                },
                required: ['code', 'goal'],
            },
        },
        deterministic: false,
        requiresAuth: false,
        timeout: 60,
        examples: [],
    },
    {
        name: 'debugCode',
        description: 'Analyze code and error logs to identify and fix bugs',
        category: 'CODE_OPERATIONS',
        isDefault: false,
        functionSchema: {
            name: 'debugCode',
            description: 'Debug code',
            parameters: {
                type: 'object',
                properties: {
                    code: { type: 'string', description: 'Code with issues' },
                    error: { type: 'string', description: 'Error message or log' },
                    language: { type: 'string', description: 'Programming language' },
                },
                required: ['code', 'error'],
            },
        },
        deterministic: false,
        requiresAuth: false,
        timeout: 60,
        examples: [],
    },
];

// === BROWSER AUTOMATION TOOLS ===
export const BROWSER_AUTOMATION_TOOLS: ToolDefinition[] = [
    {
        name: 'navigateToUrl',
        description: 'Navigate to a specific URL in a browser environment',
        category: 'BROWSER_AUTOMATION',
        isDefault: false,
        functionSchema: {
            name: 'navigateToUrl',
            description: 'Navigate to URL',
            parameters: {
                type: 'object',
                properties: {
                    url: { type: 'string', description: 'URL to navigate to' },
                    waitFor: { type: 'string', description: 'Selector to wait for (optional)' },
                },
                required: ['url'],
            },
        },
        deterministic: true,
        requiresAuth: false,
        timeout: 30,
        examples: [],
    },
    {
        name: 'clickElement',
        description: 'Click an element on the current page',
        category: 'BROWSER_AUTOMATION',
        isDefault: false,
        functionSchema: {
            name: 'clickElement',
            description: 'Click element',
            parameters: {
                type: 'object',
                properties: {
                    selector: { type: 'string', description: 'CSS selector of the element to click' },
                    waitForNavigation: { type: 'boolean', description: 'Whether to wait for navigation after click' },
                },
                required: ['selector'],
            },
        },
        deterministic: true,
        requiresAuth: false,
        timeout: 15,
        examples: [],
    },
    {
        name: 'scrapeData',
        description: 'Extract data from the current page',
        category: 'BROWSER_AUTOMATION',
        isDefault: false,
        functionSchema: {
            name: 'scrapeData',
            description: 'Scrape data',
            parameters: {
                type: 'object',
                properties: {
                    selector: { type: 'string', description: 'CSS selector of elements to scrape' },
                    attributes: { type: 'array', items: { type: 'string' }, description: 'Attributes to extract (e.g., "href", "src", "innerText")' },
                },
                required: ['selector'],
            },
        },
        deterministic: true,
        requiresAuth: false,
        timeout: 30,
        examples: [],
    },
];

// === MEDIA GENERATION TOOLS ===
export const MEDIA_GENERATION_TOOLS: ToolDefinition[] = [
    {
        name: 'generateImage',
        description: 'Generate an image based on a text prompt',
        category: 'MEDIA_GENERATION',
        isDefault: false,
        functionSchema: {
            name: 'generateImage',
            description: 'Generate image',
            parameters: {
                type: 'object',
                properties: {
                    prompt: { type: 'string', description: 'Text description of the image' },
                    size: { type: 'string', enum: ['256x256', '512x512', '1024x1024'], description: 'Size of the image' },
                    style: { type: 'string', description: 'Style of the image (e.g., "photorealistic", "cartoon")' },
                },
                required: ['prompt'],
            },
        },
        deterministic: false,
        requiresAuth: false,
        timeout: 60,
        examples: [],
    },
    {
        name: 'generateVideo',
        description: 'Generate a short video based on a text prompt',
        category: 'MEDIA_GENERATION',
        isDefault: false,
        functionSchema: {
            name: 'generateVideo',
            description: 'Generate video',
            parameters: {
                type: 'object',
                properties: {
                    prompt: { type: 'string', description: 'Text description of the video' },
                    duration: { type: 'number', description: 'Duration in seconds' },
                },
                required: ['prompt'],
            },
        },
        deterministic: false,
        requiresAuth: false,
        timeout: 120,
        examples: [],
    },
];

// === FILE OPERATION TOOLS ===
export const FILE_OPERATION_TOOLS: ToolDefinition[] = [
    {
        name: 'readFile',
        description: 'Read the contents of a file',
        category: 'FILE_OPERATIONS',
        isDefault: false,
        functionSchema: {
            name: 'readFile',
            description: 'Read file',
            parameters: {
                type: 'object',
                properties: {
                    path: { type: 'string', description: 'Path to the file' },
                    encoding: { type: 'string', description: 'File encoding (default: utf-8)' },
                },
                required: ['path'],
            },
        },
        deterministic: true,
        requiresAuth: true,
        timeout: 10,
        examples: [],
    },
    {
        name: 'writeFile',
        description: 'Write content to a file',
        category: 'FILE_OPERATIONS',
        isDefault: false,
        functionSchema: {
            name: 'writeFile',
            description: 'Write file',
            parameters: {
                type: 'object',
                properties: {
                    path: { type: 'string', description: 'Path to the file' },
                    content: { type: 'string', description: 'Content to write' },
                    overwrite: { type: 'boolean', description: 'Whether to overwrite existing file' },
                },
                required: ['path', 'content'],
            },
        },
        deterministic: true,
        requiresAuth: true,
        timeout: 10,
        examples: [],
    },
    {
        name: 'listFiles',
        description: 'List files in a directory',
        category: 'FILE_OPERATIONS',
        isDefault: false,
        functionSchema: {
            name: 'listFiles',
            description: 'List files',
            parameters: {
                type: 'object',
                properties: {
                    path: { type: 'string', description: 'Directory path' },
                    recursive: { type: 'boolean', description: 'Whether to list recursively' },
                },
                required: ['path'],
            },
        },
        deterministic: true,
        requiresAuth: true,
        timeout: 15,
        examples: [],
    },
];
