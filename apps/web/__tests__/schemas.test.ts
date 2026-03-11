import { describe, it, expect } from "vitest";
import {
  LoginRequestSchema,
  RegisterRequestSchema,
  OnboardingRequestSchema,
  SendMessageRequestSchema,
} from "@wildchat/types";

describe("Validation Schemas", () => {
  describe("LoginRequestSchema", () => {
    it("accepts valid input", () => {
      const result = LoginRequestSchema.safeParse({
        username: "testuser",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty username", () => {
      const result = LoginRequestSchema.safeParse({
        username: "",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("RegisterRequestSchema", () => {
    it("accepts valid input", () => {
      const result = RegisterRequestSchema.safeParse({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects short password", () => {
      const result = RegisterRequestSchema.safeParse({
        username: "testuser",
        email: "test@example.com",
        password: "short",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid email", () => {
      const result = RegisterRequestSchema.safeParse({
        username: "testuser",
        email: "not-an-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("OnboardingRequestSchema", () => {
    it("accepts valid input with only required fields", () => {
      const result = OnboardingRequestSchema.safeParse({
        displayName: "Test User",
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid input with all fields", () => {
      const result = OnboardingRequestSchema.safeParse({
        displayName: "Test User",
        firstName: "Test",
        lastName: "User",
        phone: "1234567890",
        bio: "Hello world",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty displayName", () => {
      const result = OnboardingRequestSchema.safeParse({
        displayName: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("SendMessageRequestSchema", () => {
    it("accepts valid input", () => {
      const result = SendMessageRequestSchema.safeParse({
        content: "Hello there!",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty message", () => {
      const result = SendMessageRequestSchema.safeParse({
        content: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects overly long message", () => {
      const result = SendMessageRequestSchema.safeParse({
        content: "a".repeat(5001),
      });
      expect(result.success).toBe(false);
    });
  });
});
