import {
  chat,
  toServerSentEventsStream,
} from '@tanstack/ai';
import type { FastifyInstance } from 'fastify';

import { errorSchema } from '../docs/shared-schemas.js';
import type { AiService, ChatMessage } from '@/service/aiService.js';

export interface AiRoutesDependencies {
  aiService: AiService;
}

type ChatRequestBody = {
  messages: Array<ChatMessage>;
  conversationId?: string;
};

export function aiRoutes(
  fastify: FastifyInstance,
  options: { dependencies: AiRoutesDependencies },
): void {
  const { aiService } = options.dependencies;

  fastify.post<{
    Body: ChatRequestBody;
    Reply: ReadableStream<Uint8Array>;
  }>(
    '/chat',
    {
      schema: {
        tags: ['ai'],
        summary: 'Stream AI chat responses over SSE',
        body: {
          type: 'object',
          properties: {
            messages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  role: { type: 'string', enum: ['user', 'assistant', 'tool'] },
                  content: { type: ['string', 'array', 'null'] },
                  name: { type: 'string' },
                  toolCallId: { type: 'string' },
                  toolCalls: { type: 'array' },
                },
                required: ['role', 'content'],
                additionalProperties: true,
              },
            },
            conversationId: { type: 'string' },
          },
          required: ['messages'],
          additionalProperties: false,
        },
        response: {
          200: {
            description: 'Server-sent events stream of chat chunks',
            type: 'string',
            format: 'binary',
            headers: {
              'Content-Type': {
                description: 'text/event-stream',
                schema: { type: 'string' },
              },
            },
          },
          400: errorSchema,
        },
      },
      attachValidation: true,
    },
    async (request) => {
      const { messages, conversationId } = request.body;

      const stream = chat({
        adapter: aiService.getAdapter(),
        messages,
        conversationId,
        systemPrompts: [aiService.getSystemPrompt()],
        tools: aiService.getTools(),
      });

      return toServerSentEventsStream(stream);
    },
  );
}
