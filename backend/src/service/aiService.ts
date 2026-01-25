import { toolDefinition, type ConstrainedModelMessage } from '@tanstack/ai';
import { anthropicText, type AnthropicTextAdapter } from '@tanstack/ai-anthropic';
import { openaiText, type OpenAITextAdapter } from '@tanstack/ai-openai';
import type {
  AnthropicMessageMetadataByModality,
  AnthropicModelInputModalitiesByName,
} from '@tanstack/ai-anthropic';
import type {
  OpenAIMessageMetadataByModality,
  OpenAIModelInputModalitiesByName,
} from '@tanstack/ai-openai';
import { z } from "zod";
import { EmailService } from './emailService.js';

type OpenAIModel = keyof OpenAIModelInputModalitiesByName;
type AnthropicModel = keyof AnthropicModelInputModalitiesByName;
type SupportedAdapter =
  | OpenAITextAdapter<OpenAIModel>
  | AnthropicTextAdapter<AnthropicModel>;

type AiInputModalities =
  | OpenAIModelInputModalitiesByName[keyof OpenAIModelInputModalitiesByName]
  | AnthropicModelInputModalitiesByName[keyof AnthropicModelInputModalitiesByName];

type AiMessageMetadata =
  | OpenAIMessageMetadataByModality
  | AnthropicMessageMetadataByModality;

export type ChatMessage = ConstrainedModelMessage<{
  inputModalities: AiInputModalities;
  messageMetadataByModality: AiMessageMetadata;
}>;

const GetEligibilityAmountToolInputSchema = z.object({
  state: z.string().describe("The state where the claimant resides e.g. CA, Maine"),
  monthlyIncome: z.number().describe("The claimant's monthly income"),
});

const getEligibilityAmountTool = toolDefinition({
  name: "get_eligibility_amount",
  description: "Get the monthly eligibility given a claimant's monthly income.",
  inputSchema: GetEligibilityAmountToolInputSchema,
  outputSchema: z.object({
    monthlyBenefitAmount: z.number(),
  }),
});

const SendMessageToCustomerSupportInputSchema = z.object({
  email: z.email().describe("The email of the person requesting to contact human support."),
  message: z.string().min(1).describe("The message or question to send to customer support."),
});

const sendMessageToCustomerSupportTool = toolDefinition({
  name: "send_message_to_customer_support",
  description: "Send a message to customer support.",
  inputSchema: SendMessageToCustomerSupportInputSchema,
  outputSchema: z.object({
    responseHours: z.number().describe("Number of hours providing estimate of when customer support will respond back."),
  }),
});

export class AiService {
  private readonly openaiApiKey?: string;
  private readonly anthropicApiKey?: string;
  private readonly emailService: EmailService;

  constructor(env: NodeJS.ProcessEnv = process.env) {
    this.openaiApiKey = env.OPENAI_API_KEY;
    this.anthropicApiKey = env.ANTHROPIC_API_KEY;
    this.emailService = new EmailService(env);
  }

  getAdapter(): SupportedAdapter {
    if (!this.openaiApiKey && !this.anthropicApiKey) {
      throw new Error('OPENAI_API_KEY or ANTHROPIC_API_KEY not configured');
    }

    // TODO provide top level prompt / instructions for each adapter

    if (this.openaiApiKey) {
      return openaiText('gpt-5-nano');
    }

    return anthropicText('claude-haiku-4-5');
  }

  getSystemPrompt(): string {
    return `
      You are a paid leave benefit expert and you will help claimants answer any questions they may have. Use the tools to you have available whenever relevant, but provide general assistance around paid leave benefits otherwise. If the user is asking questions outside of this scope, redirect them back to paid leave conversation.
    `
  }

  getTools() {
    const getEligibilityAmount = getEligibilityAmountTool.server((args) => {
      const { state, monthlyIncome } = args as z.infer<typeof GetEligibilityAmountToolInputSchema>;
      const monthlyBenefitAmount = monthlyIncome * .6;
      console.log('** Tool: getEligibilityAmount', state, monthlyIncome, monthlyBenefitAmount);
      return {
        monthlyBenefitAmount
      };
    });

    const sendMessageToCustomerSupport = sendMessageToCustomerSupportTool.server(async (args) => {
      const { email, message } = args as z.infer<typeof SendMessageToCustomerSupportInputSchema>;
      console.log('** Tool: sending message to customer support', email, message);

      await this.emailService.sendEmail({
        from: 'noreply@example.com',
        to: 'support@example.com',
        subject: `Customer Support Request from ${email}`,
        text: `From: ${email}\n\nMessage:\n${message}`,
      });

      return {
        responseHours: 24
      }
    })

    return [getEligibilityAmount, sendMessageToCustomerSupport];
  }
}
