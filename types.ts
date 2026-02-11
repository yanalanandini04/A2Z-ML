
export enum LearningMode {
    TEXT = "Text explanation",
    CODE = "Code with explanation",
    AUDIO = "Audio Script",
    IMAGE = "Image Explanation",
}

export enum DetailLevel {
    BRIEF = "Brief",
    DETAILED = "Detailed",
    COMPREHENSIVE = "Comprehensive",
}

export interface YouTubeVideo {
    title: string;
    url: string;
}

export interface TextGenerationResult {
    explanation: string;
    example: string;
    youtubeLinks: YouTubeVideo[];
}

export interface CodeGenerationResult {
    explanation: string;
    code: string;
    dependencies: string[];
    example: string;
    youtubeLinks: YouTubeVideo[];
}

export interface MCQ {
    question: string;
    options: string[];
    answer: string;
    explanation: string;
}

export interface PracticeContent {
    learningContent: string;
    assessment: MCQ[];
    cheatsheet: string;
}

export interface PathwayStep {
    title: string;
    description: string;
}
