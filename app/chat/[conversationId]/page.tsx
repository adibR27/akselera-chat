import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

import ChatRoom from "./ChatRoom";

type Props = {
  params: Promise<{
    conversationId: string;
  }>;
};

export default async function ConversationPage({
  params,
}: Props) {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/login");
  }

  const { conversationId } = await params;
  const id = Number(conversationId);

  if (!Number.isInteger(id)) {
    redirect("/chat");
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      OR: [
        { user1Id: userId },
        { user2Id: userId },
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
    },
  });

  if (!conversation) {
    redirect("/chat");
  }

  const otherUser =
    conversation.user1Id === userId
      ? conversation.user2
      : conversation.user1;

  return (
    <ChatRoom
      conversationId={conversation.id}
      currentUserId={userId}
      otherUser={otherUser}
    />
  );
}