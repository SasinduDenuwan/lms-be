declare module "@dukebot/open-router" {
  export interface CompleteChatOptions {
    prompt: string;
    system?: string;
    model?: string;
    max_tokens?: number;
    temperature?: number;
  }

  export interface CompleteChatResponse {
    content: string;
  }

  export class OpenRouter {
    constructor(options: { apiKey: string });
    service: {
      completeChat: (options: CompleteChatOptions) => Promise<CompleteChatResponse>;
    };
  }
}