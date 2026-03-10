import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";
import { RegisterRequestSchema } from "@wildchat/types";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = RegisterRequestSchema.safeParse(body);

        if (!parsed.success) {
            const firstError = parsed.error.errors[0];
            return NextResponse.json(
                { error: firstError.message, field: firstError.path[0] as string },
                { status: 400 }
            );
        }

        const { username, email, password } = parsed.data;

        // Check existing username
        const existingUsername = await prisma.user.findUnique({
            where: { username },
        });
        if (existingUsername) {
            return NextResponse.json(
                { error: "Username is already taken", field: "username" },
                { status: 409 }
            );
        }

        // Check existing email
        const existingEmail = await prisma.user.findUnique({
            where: { email },
        });
        if (existingEmail) {
            return NextResponse.json(
                { error: "Email is already registered", field: "email" },
                { status: 409 }
            );
        }

        const passwordHash = await hash(password, 12);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash,
            },
        });

        return NextResponse.json({ id: user.id }, { status: 201 });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred" },
            { status: 500 }
        );
    }
}
