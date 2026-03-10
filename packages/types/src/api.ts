import { z } from "zod";

export const LoginRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const RegisterRequestSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
});

export const OnboardingRequestSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().max(200).optional(),
});

export const ApiErrorSchema = z.object({
  error: z.string(),
  field: z.string().optional(),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type OnboardingRequest = z.infer<typeof OnboardingRequestSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
