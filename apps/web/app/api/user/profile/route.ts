import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { OnboardingRequestSchema } from "@wildchat/types";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const profile = await prisma.userProfile.findUnique({
            where: { userId: session.user.id },
        });

        return NextResponse.json({ profile });
    } catch (error) {
        console.error("Profile fetch error:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const parsed = OnboardingRequestSchema.safeParse(body);

        if (!parsed.success) {
            const firstError = parsed.error.errors[0];
            return NextResponse.json(
                { error: firstError.message, field: firstError.path[0] as string },
                { status: 400 }
            );
        }

        const { displayName, firstName, lastName, phone, bio } = parsed.data;

        const profile = await prisma.userProfile.upsert({
            where: { userId: session.user.id },
            update: {
                displayName,
                firstName: firstName ?? null,
                lastName: lastName ?? null,
                phone: phone ?? null,
                bio: bio ?? null,
            },
            create: {
                userId: session.user.id,
                displayName,
                firstName: firstName ?? null,
                lastName: lastName ?? null,
                phone: phone ?? null,
                bio: bio ?? null,
            },
        });

        return NextResponse.json({ profile }, { status: 200 });
    } catch (error) {
        console.error("Profile save error:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred" },
            { status: 500 }
        );
    }
}
