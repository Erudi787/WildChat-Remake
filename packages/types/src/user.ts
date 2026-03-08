import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const UserProfileSchema = z.object({
  userId: z.string(),
  displayName: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional().nullable(),
  bio: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
