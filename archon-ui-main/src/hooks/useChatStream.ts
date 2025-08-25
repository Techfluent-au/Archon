import { useState, useCallback } from 'react';
import { Agent } from '../types/Agent';

interface UseChatStreamOptions {
  agent: Agent | null;
  conversationId: string | null;
  onChunk: (chunk: string) => void;
  onComplete: (fullResponse: string) => void;
  onError: (error: Error) => void;
}

interface StreamingResponse {
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  abort: () => void;
}

export const useChatStream = (options: UseChatStreamOptions): StreamingResponse => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!options.agent) {.
      throw new Error('No agent selected');
    }

    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          agent: options.agent,
          conversationId: options.conversationId,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              options.onComplete(fullResponse);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';

              if (content) {
                fullResponse += content;
                options.onChunk(content);
              }
            } catch (parseError) {
              console.warn('Failed to parse streaming chunk:', parseError);
            }
          }
        }
      }

    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err);
        options.onError(err);
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  }, [options]);

  const abort = useCallback(() => {
    abortController?.abort();
  }, [abortController]);

  return {
    sendMessage,
    isLoading,
    error,
    abort
  };
};
