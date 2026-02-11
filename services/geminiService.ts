
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { LearningMode, DetailLevel, CodeGenerationResult, TextGenerationResult, PracticeContent, PathwayStep } from '../types';

// Define the models to be used
const textModel = 'gemini-3-flash-preview';
const imageModel = 'gemini-2.5-flash-image';
const ttsModel = 'gemini-2.5-flash-preview-tts';

// Add export keyword to make getAiClient accessible from other files.
export const getAiClient = (): GoogleGenAI => {
    const userApiKey = localStorage.getItem('user_api_key');
    const apiKey = userApiKey || process.env.API_KEY;

    if (!apiKey) {
        throw new Error("MissingApiKey: API Key not found. Please add your own API Key in the Settings (cog icon in the top right) to use the app.");
    }
    return new GoogleGenAI({ apiKey });
}

const basePrompt = `You are an expert Machine Learning tutor named GyanGuru. Your goal is to provide educational content ONLY for topics related to Artificial Intelligence (AI), Machine Learning (ML), and Deep Learning.

IMPORTANT RESTRICTIONS:
- You MUST ONLY respond to topics related to AI, ML, or Deep Learning.
- If the topic is NOT related to AI/ML/DL, respond with a JSON object: {"error": "I apologize, but I can only provide information about AI, Machine Learning, and Deep Learning."}
- Do NOT provide information about topics outside of the AI/ML/DL domain.
- Format output as clean, well-structured markdown. Use headings, bullet points, and code blocks where appropriate.
`;

const getModelResponse = async (prompt: string, maxRetries: number = 3): Promise<GenerateContentResponse> => {
    let lastError: any = null;
    let delay = 1000; // Initial delay of 1 second

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const ai = getAiClient();
            const response = await ai.models.generateContent({
                model: textModel,
                contents: prompt,
            });
            return response;
        } catch (error: any) {
            lastError = error;
            const errorMessage = error.toString().toLowerCase();
            const isRateLimitError = errorMessage.includes('429') || errorMessage.includes('resource_exhausted');
            const isServerError = errorMessage.includes('500') || errorMessage.includes('rpc failed');

            if (isRateLimitError || isServerError) {
                if (attempt === maxRetries - 1) {
                    // On the last attempt for a retryable error, we won't log the specific error here.
                    // The subsequent block will handle throwing a user-friendly error and a specific console log.
                    break; 
                }
                console.warn(`API call failed (Attempt ${attempt + 1}/${maxRetries}). Retrying in ${delay / 1000}s...`, error.message);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
            } else {
                console.error("A non-retryable error occurred:", error);
                throw new Error("Failed to get response from AI model due to a non-retryable client error.");
            }
        }
    }
    
    // This part is reached ONLY if all retries failed due to a retryable error.
    const finalErrorMessage = lastError ? (typeof lastError.toString === 'function' ? lastError.toString().toLowerCase() : JSON.stringify(lastError).toLowerCase()) : "";
    
    if (finalErrorMessage.includes('429') || finalErrorMessage.includes('resource_exhausted')) {
        // Removed console.error here as the UI will now handle displaying the error and opening the modal.
        throw new Error("QuotaExceeded: You've exceeded the API quota. This can happen with heavy usage on the free tier. Please try again later, or add your own Google AI API key in the Settings (cog icon) to use your personal quota.");
    } else {
        console.error("All retries failed due to an unknown or persistent error. Last error:", lastError);
        throw new Error(`Failed to get response from AI model after ${maxRetries} attempts. The server might be temporarily unavailable. Please try again in a few moments.`);
    }
};

const parseJsonResponse = (responseText: string) => {
    const cleanedText = responseText.replace(/^```json\n?/, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(cleanedText);
    if (parsed.error) {
        throw new Error(parsed.error);
    }
    return parsed;
}

export const generateLearningPathway = async (goal: string): Promise<PathwayStep[]> => {
    const prompt = `
        ${basePrompt}
        Learning Goal: "${goal}"
        Required format: JSON

        Generate a structured learning pathway as a JSON object. The root should be a key "pathway" which is an array of objects.
        Each object in the "pathway" array represents a logical step and must have two keys:
        - "title": A concise name for the learning topic (e.g., "Introduction to Python").
        - "description": A brief, one-sentence explanation of what this step covers.

        Generate a comprehensive list of about 10-15 logical, sequential steps to achieve the user's learning goal.
    `;
    const response = await getModelResponse(prompt);
    const parsed = parseJsonResponse(response.text);
    return parsed.pathway;
}

export const generateExplanation = async (topic: string, length: DetailLevel): Promise<TextGenerationResult> => {
    const prompt = `
        ${basePrompt}
        Topic: "${topic}"
        Explanation depth: ${length}
        Required format: JSON

        Generate a JSON object with three keys: "explanation", "example", and "youtubeLinks".
        - "explanation": A clear, structured, and easy-to-understand explanation for the given topic in markdown format.
        - "example": A concise, real-world example of the topic in action, in markdown format.
        - "youtubeLinks": An array of 3 objects, each with "title" and "url" properties, for the best YouTube videos explaining this topic.
    `;
    const response = await getModelResponse(prompt);
    return parseJsonResponse(response.text);
};

export const generateCode = async (topic: string, complexity: DetailLevel): Promise<CodeGenerationResult> => {
    const prompt = `
        ${basePrompt}
        Topic: "${topic}"
        Code complexity: ${complexity}
        Required format: JSON

        Generate a JSON object with five keys: "explanation", "code", "dependencies", "example", and "youtubeLinks".
        - "explanation": A detailed but beginner-friendly explanation in markdown format.
        - "code": The complete Python code as a string. Include helpful comments.
        - "dependencies": A string array of required Python packages (e.g., ["numpy", "scikit-learn"]).
        - "example": A concise, real-world application of the code/topic in markdown format.
        - "youtubeLinks": An array of 3 objects, each with "title" and "url" properties, for the best YouTube videos on this topic.
    `;
    const response = await getModelResponse(prompt);
    return parseJsonResponse(response.text);
};

export const generateAudioScript = async (topic: string, length: DetailLevel): Promise<string> => {
    const prompt = `
        ${basePrompt}
        Topic: "${topic}"
        Script length: ${length}
        Required format: ${LearningMode.AUDIO}

        Generate a conversational, educational narration script suitable for Text-to-Speech (TTS). The script should be engaging and easy to listen to. Use pauses and clear language.
    `;
    const response = await getModelResponse(prompt);
    const responseText = response.text.trim();
    try {
        const parsed = JSON.parse(responseText);
        if (parsed.error) {
            throw new Error(parsed.error);
        }
    } catch (e) {}
    return responseText;
};

export const generateAudioFromScript = async (script: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: ttsModel,
            contents: [{ parts: [{ text: script }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data returned from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error generating audio content:", error);
        throw new Error("Failed to generate audio from script.");
    }
};


export const generateImagePrompts = async (topic: string, detailLevel: DetailLevel): Promise<string[]> => {
    const prompt = `
        ${basePrompt}
        Topic: "${topic}"
        Detail Level: ${detailLevel}

        You are an expert in creating educational visuals. Your task is to generate exactly 3 distinct, highly detailed, and effective prompts for an AI image generation model to create diagrams that visually explain the given topic.

        IMPORTANT RULES:
        - Generate exactly 3 prompts.
        - Each prompt MUST begin with the prefix "PROMPT:" on a new line.
        - The prompts should be descriptive and focus on creating clear, educational diagrams, flowcharts, or infographics, not just artistic photos.
        - For a flowchart topic, describe the shapes, text inside shapes, and connections with arrows.
        
        Example for the topic "Neural Network Architecture":
        PROMPT: A clean, modern diagram of a simple feedforward neural network with 3 layers. An input layer with 4 circular neurons, a hidden layer with 5 circular neurons, and an output layer with 2 circular neurons. Show connections as thin grey lines between neurons, with small arrows indicating the flow of information from left (input) to right (output). Label each layer clearly as "Input Layer", "Hidden Layer", and "Output Layer" with sans-serif font, on a clean white background.
        PROMPT: An infographic showing a single neuron (perceptron) in a flat design style. It should show multiple inputs labeled x1, x2, x3 with corresponding weights w1, w2, w3. The inputs feed into a central circular node labeled 'Sum & Activation'. A single line exits this node to an output labeled 'y'. Use a color palette of blues and purples on a light grey background.
        PROMPT: A visual comparison of different activation functions (Sigmoid, ReLU, Tanh) plotted on a single 2D graph. Each function's curve should have a distinct color (e.g., Sigmoid in blue, ReLU in green, Tanh in orange) and be clearly labeled. The style should be that of a clear, minimalist technical textbook illustration against a white background.
    `;

    const response = await getModelResponse(prompt);
    const responseText = response.text.trim();
    try {
        const parsed = JSON.parse(responseText);
        if (parsed.error) {
            throw new Error(parsed.error);
        }
    } catch (e) {
    }

    const prompts = responseText
        .split('\n')
        .filter(line => line.startsWith("PROMPT:"))
        .map(line => line.replace("PROMPT:", "").trim());
    
    if (prompts.length === 0) {
        if (responseText.includes("I apologize")) {
            throw new Error(responseText);
        }
        console.error("Failed to parse prompts from model response:", responseText);
        throw new Error("Could not generate valid image prompts from the AI. The model's response was not in the expected format. Please try rephrasing your topic.");
    }
    return prompts;
};

export const generateImage = async (prompt: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: imageModel,
            contents: { parts: [{ text: prompt }] },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64Image = part.inlineData.data;
                return `data:image/png;base64,${base64Image}`;
            }
        }
        throw new Error("No image data found in response.");
    } catch (error) {
        console.error(`Error generating image for prompt "${prompt}":`, error);
        throw new Error("Failed to generate an image.");
    }
};

export const generatePracticeContent = async (topic: string, detailLevel: DetailLevel): Promise<PracticeContent> => {
    const prompt = `
      ${basePrompt}
      Topic: "${topic}"
      Detail Level: ${detailLevel}
      Required format: JSON
  
      Generate a JSON object with three keys: "learningContent", "assessment", and "cheatsheet".
      - "learningContent": A concise, easy-to-understand summary of the topic in markdown format, tailored to the detail level.
      - "assessment": An array of 5 unique multiple-choice question objects. Each object must have:
          - "question": The question text.
          - "options": An array of 4 unique string options. One of them must be the correct answer.
          - "answer": The correct answer string, which must exactly match one of the options.
          - "explanation": A concise, one-sentence explanation of why the answer is correct.
      - "cheatsheet": A quick-reference cheatsheet in markdown format. Include key terms, formulas, and concepts.
    `;
    const response = await getModelResponse(prompt);
    return parseJsonResponse(response.text);
};