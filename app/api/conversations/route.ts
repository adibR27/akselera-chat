import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
  try {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { user1Id: currentUserId },
          { user2Id: currentUserId },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const result = conversations.map((conversation) => {
      const otherUser =
        conversation.user1Id === currentUserId
          ? conversation.user2
          : conversation.user1;

      return {
        id: conversation.id,
        user: otherUser,
        lastMessage: conversation.messages[0] ?? null,
        updatedAt: conversation.updatedAt,
      };
    });

    return NextResponse.json({
      conversations: result,
    });
  } catch (error) {
    console.error("Get conversations error:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const otherUserId = Number(body.userId);

    if (!Number.isInteger(otherUserId)) {
      return NextResponse.json(
        { message: "User tujuan tidak valid." },
        { status: 400 }
      );
    }

    if (otherUserId === currentUserId) {
      return NextResponse.json(
        { message: "Tidak dapat membuat chat dengan diri sendiri." },
        { status: 400 }
      );
    }

    const otherUser = await prisma.user.findUnique({
      where: {
        id: otherUserId,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!otherUser) {
      return NextResponse.json(
        { message: "User tidak ditemukan." },
        { status: 404 }
      );
    }

    // Urutkan ID supaya kombinasi A-B dan B-A
    // tetap dianggap sebagai satu conversation.
    const user1Id = Math.min(currentUserId, otherUserId);
    const user2Id = Math.max(currentUserId, otherUserId);

    const existingConversation =
      await prisma.conversation.findUnique({
        where: {
          user1Id_user2Id: {
            user1Id,
            user2Id,
          },
        },
      });

    if (existingConversation) {
      return NextResponse.json({
        message: "Conversation sudah ada.",
        conversation: existingConversation,
      });
    }

    const conversation = await prisma.conversation.create({
      data: {
        user1Id,
        user2Id,
      },
    });

    return NextResponse.json(
      {
        message: "Conversation berhasil dibuat.",
        conversation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create conversation error:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
