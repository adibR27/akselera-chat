"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
  email: string;
};

type Conversation = {
  id: number;
  user: User;
  lastMessage: {
    content: string;
    createdAt: string;
  } | null;
  updatedAt: string;
};

export default function ChatPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [creatingChat, setCreatingChat] = useState<number | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    try {
      setLoadingConversations(true);

      const response = await fetch("/api/conversations");

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setConversations(data.conversations ?? []);
    } catch (error) {
      console.error("Load conversations error:", error);
    } finally {
      setLoadingConversations(false);
    }
  }

  async function loadUsers() {
    try {
      setLoadingUsers(true);

      const response = await fetch("/api/users");

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setUsers(data.users ?? []);
    } catch (error) {
      console.error("Load users error:", error);
    } finally {
      setLoadingUsers(false);
    }
  }

  async function handleNewChat() {
    setShowNewChat(true);
    await loadUsers();
  }

  async function createConversation(userId: number) {
    try {
      setCreatingChat(userId);

      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message ?? "Gagal membuat chat.");
        return;
      }

      setShowNewChat(false);

      await loadConversations();

      // Langsung buka percakapan yang baru dibuat
      if (data.conversation?.id) {
        router.push(`/chat/${data.conversation.id}`);
      }
    } catch (error) {
      console.error("Create conversation error:", error);
      alert("Terjadi kesalahan pada server.");
    } finally {
      setCreatingChat(null);
    }
  }

  function openConversation(conversationId: number) {
    router.push(`/chat/${conversationId}`);
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Akselera Chat
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Percakapan kamu
              </p>
            </div>

            <button
              onClick={handleNewChat}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + New Chat
            </button>
          </div>

          {loadingConversations ? (
            <div className="py-10 text-center text-sm text-gray-500">
              Memuat percakapan...
            </div>
          ) : conversations.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500">
                Belum ada percakapan.
              </p>

              <button
                onClick={handleNewChat}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Mulai Chat Baru
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() =>
                    openConversation(conversation.id)
                  }
                  className="flex cursor-pointer items-center gap-4 py-4 hover:bg-gray-50"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
                    {conversation.user.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900">
                      {conversation.user.name}
                    </p>

                    <p className="truncate text-sm text-gray-500">
                      {conversation.lastMessage
                        ? conversation.lastMessage.content
                        : "Belum ada pesan"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showNewChat && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  New Chat
                </h2>

                <p className="text-sm text-gray-500">
                  Pilih pengguna yang ingin diajak chat.
                </p>
              </div>

              <button
                onClick={() => setShowNewChat(false)}
                className="text-xl text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-3">
              {loadingUsers ? (
                <p className="py-8 text-center text-sm text-gray-500">
                  Memuat pengguna...
                </p>
              ) : users.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">
                  Tidak ada pengguna lain.
                </p>
              ) : (
                users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => createConversation(user.id)}
                    disabled={creatingChat === user.id}
                    className="flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-gray-100 disabled:opacity-50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 font-semibold text-gray-600">
                      {user.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900">
                        {user.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        {user.email}
                      </p>
                    </div>

                    {creatingChat === user.id && (
                      <span className="text-xs text-gray-500">
                        Membuat...
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}