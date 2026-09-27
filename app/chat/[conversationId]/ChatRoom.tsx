"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type User = {
  id: number;
  name: string;
  email: string;
};

type Message = {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt: string;
  sender: {
    id: number;
    name: string;
  };
};

type Props = {
  conversationId: number;
  currentUserId: number;
  otherUser: User;
};

export default function ChatRoom({
  conversationId,
  currentUserId,
  otherUser,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function loadMessages() {
    try {
      setError("");

      const response = await fetch(
        `/api/conversations/${conversationId}/messages`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Gagal mengambil pesan."
        );
      }

      setMessages(data.messages);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Gagal mengambil pesan."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const messageContent = content.trim();

    if (!messageContent || sending) {
      return;
    }

    try {
      setSending(true);
      setError("");

      const response = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: messageContent,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Gagal mengirim pesan."
        );
      }

      setMessages((current) => [
        ...current,
        data.message,
      ]);

      setContent("");
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Gagal mengirim pesan."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow">
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b px-6 py-4">
          <Link
            href="/chat"
            className="text-xl text-gray-600 hover:text-gray-900"
          >
            ←
          </Link>

          <div>
            <h1 className="font-semibold text-gray-900">
              {otherUser.name}
            </h1>

            <p className="text-sm text-gray-500">
              {otherUser.email}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-3 overflow-y-auto p-6">
          {loading ? (
            <p className="text-center text-gray-500">
              Memuat pesan...
            </p>
          ) : messages.length === 0 ? (
            <p className="text-center text-gray-500">
              Belum ada pesan. Mulai percakapan!
            </p>
          ) : (
            messages.map((message) => {
              const isMine =
                message.senderId === currentUserId;

              return (
                <div
                  key={message.id}
                  className={`flex ${
                    isMine
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isMine
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    <p>{message.content}</p>

                    <p
                      className={`mt-1 text-xs ${
                        isMine
                          ? "text-blue-100"
                          : "text-gray-500"
                      }`}
                    >
                      {new Date(
                        message.createdAt
                      ).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="border-t px-6 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex gap-3 border-t p-4"
        >
          <input
            type="text"
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            placeholder="Ketik pesan..."
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
            disabled={sending}
          />

          <button
            type="submit"
            disabled={sending || !content.trim()}
            className="rounded-md bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? "Mengirim..." : "Kirim"}
          </button>
        </form>
      </div>
    </main>
  );
}