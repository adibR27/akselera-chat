import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

type Params = {
  params: Promise<{
    conversationId: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    const userId =
      await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        {
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const { conversationId } =
      await params;

    const id = Number(
      conversationId
    );

    if (!Number.isInteger(id)) {
      return NextResponse.json(
        {
          message:
            "Conversation ID tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Pastikan user memang anggota
     * conversation tersebut.
     */
    const conversation =
      await prisma.conversation.findFirst({
        where: {
          id,

          OR: [
            {
              user1Id: userId,
            },
            {
              user2Id: userId,
            },
          ],
        },
      });

    if (!conversation) {
      return NextResponse.json(
        {
          message:
            "Percakapan tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Tandai pesan dari user lain
     * sebagai sudah dibaca.
     *
     * Hanya pesan yang:
     * - berada di conversation ini
     * - bukan milik current user
     * - readAt masih null
     */
    await prisma.message.updateMany({
      where: {
        conversationId: id,

        senderId: {
          not: userId,
        },

        readAt: null,
      },

      data: {
        readAt: new Date(),
      },
    });

    /*
     * Ambil semua pesan setelah
     * proses read status diperbarui.
     */
    const messages =
      await prisma.message.findMany({
        where: {
          conversationId: id,
        },

        orderBy: {
          createdAt: "asc",
        },

        include: {
          sender: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        user1Id:
          conversation.user1Id,
        user2Id:
          conversation.user2Id,
      },

      messages,
    });
  } catch (error) {
    console.error(
      "Get messages error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Terjadi kesalahan pada server.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request,
  { params }: Params
) {
  try {
    const userId =
      await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        {
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const { conversationId } =
      await params;

    const id = Number(
      conversationId
    );

    if (!Number.isInteger(id)) {
      return NextResponse.json(
        {
          message:
            "Conversation ID tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

    const body =
      await request.json();

    const content =
      typeof body.content === "string"
        ? body.content.trim()
        : "";

    if (!content) {
      return NextResponse.json(
        {
          message:
            "Pesan tidak boleh kosong.",
        },
        {
          status: 400,
        }
      );
    }

    const conversation =
      await prisma.conversation.findFirst({
        where: {
          id,

          OR: [
            {
              user1Id: userId,
            },
            {
              user2Id: userId,
            },
          ],
        },
      });

    if (!conversation) {
      return NextResponse.json(
        {
          message:
            "Percakapan tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    const message =
      await prisma.message.create({
        data: {
          conversationId: id,
          senderId: userId,
          content,
        },

        include: {
          sender: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

    /*
     * Update waktu conversation
     * supaya conversation naik ke atas
     * sidebar.
     */
    await prisma.conversation.update({
      where: {
        id,
      },

      data: {
        updatedAt:
          new Date(),
      },
    });

    return NextResponse.json({
      message,
    });
  } catch (error) {
    console.error(
      "Send message error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Terjadi kesalahan pada server.",
      },
      {
        status: 500,
      }
    );
  }
}