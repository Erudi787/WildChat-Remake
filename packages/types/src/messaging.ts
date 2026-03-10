import { z } from "zod";

export const MessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  content: z.string(),
  type: z.enum(["TEXT", "IMAGE", "FILE", "SYSTEM"]),
  createdAt: z.string().datetime(),
});

export const ConversationSchema = z.object({
  id: z.string(),
  isGroup: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const SendMessageRequestSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(5000),
});

export const CreateConversationRequestSchema = z.object({
  participantId: z.string().min(1, "Participant is required"),
});

export type Message = z.infer<typeof MessageSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;
export type CreateConversationRequest = z.infer<typeof CreateConversationRequestSchema>;
