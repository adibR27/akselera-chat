"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

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
  readAt: string | null;

  sender: {
    id: number;
    name: string;
  };
};

type Conversation = {
  id: number;

  user: User;

  lastMessage: {
    id?: number;
    content: string;
    createdAt: string;
    senderId?: number;
  } | null;

  unreadCount: number;

  updatedAt: string;
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
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);

  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(true);

  const [
    loadingConversations,
    setLoadingConversations,
  ] = useState(true);

  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  /*
   * =========================================================
   * LOAD CONVERSATIONS
   * =========================================================
   *
   * showLoading = true
   * hanya digunakan saat pertama kali mengambil data.
   *
   * showLoading = false
   * digunakan saat polling agar sidebar tidak berkedip.
   */

  async function loadConversations(
    showLoading = false
  ) {
    try {
      if (showLoading) {
        setLoadingConversations(true);
      }

      const response = await fetch(
        "/api/conversations",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Gagal mengambil percakapan."
        );
      }

      setConversations(
        data.conversations ?? []
      );
    } catch (error) {
      console.error(
        "Load conversations error:",
        error
      );
    } finally {
      if (showLoading) {
        setLoadingConversations(false);
      }
    }
  }

  /*
   * =========================================================
   * LOAD MESSAGES
   * =========================================================
   */

  async function loadMessages(
    showLoading = true
  ) {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const response = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Gagal mengambil pesan."
        );
      }

      /*
       * Ambil messages dari API.
       */

      const newMessages: Message[] =
        data.messages ?? [];

      /*
       * Pastikan message ID unik.
       *
       * Ini mencegah error:
       *
       * Encountered two children with the same key
       */

      const uniqueMessages = Array.from(
        new Map(
          newMessages.map((message) => [
            message.id,
            message,
          ])
        ).values()
      );

      setMessages(uniqueMessages);

      setError("");
    } catch (error) {
      console.error(
        "Load messages error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Gagal mengambil pesan."
      );
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }

  /*
   * =========================================================
   * INITIAL LOAD CONVERSATIONS
   * =========================================================
   *
   * Hanya menampilkan loading pada initial load.
   */

  useEffect(() => {
    loadConversations(true);
  }, [conversationId]);

  /*
   * =========================================================
   * LOAD MESSAGES + POLLING
   * =========================================================
   *
   * Setiap 3 detik:
   *
   * - refresh messages
   * - refresh conversations
   *
   * Tetapi TIDAK mengaktifkan loading sidebar.
   *
   * Ini yang mencegah sidebar kelap-kelip.
   */

  useEffect(() => {
    loadMessages(true);

    const interval = setInterval(() => {
      loadMessages(false);

      /*
       * Jangan gunakan true di sini.
       *
       * true akan membuat:
       *
       * loadingConversations = true
       *
       * sehingga sidebar berubah menjadi
       * "Memuat percakapan..."
       *
       * dan menyebabkan flicker.
       */

      loadConversations(false);
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [conversationId]);

  /*
   * =========================================================
   * SEND MESSAGE
   * =========================================================
   */

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    const messageContent =
      content.trim();

    if (
      !messageContent ||
      sending
    ) {
      return;
    }

    try {
      setSending(true);
      setError("");

      const response =
        await fetch(
          `/api/conversations/${conversationId}/messages`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              content:
                messageContent,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Gagal mengirim pesan."
        );
      }

      const newMessage:
        Message = data.message;

      /*
       * Pastikan message yang baru
       * belum ada di state.
       */

      setMessages(
        (currentMessages) => {
          const exists =
            currentMessages.some(
              (message) =>
                message.id ===
                newMessage.id
            );

          if (exists) {
            return currentMessages;
          }

          return [
            ...currentMessages,
            newMessage,
          ];
        }
      );

      setContent("");

      /*
       * Update sidebar setelah
       * berhasil mengirim pesan.
       *
       * Tidak menampilkan loading.
       */

      await loadConversations(false);
    } catch (error) {
      console.error(
        "Send message error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Gagal mengirim pesan."
      );
    } finally {
      setSending(false);
    }
  }

  /*
   * =========================================================
   * OPEN CONVERSATION
   * =========================================================
   */

  function openConversation(
    id: number
  ) {
    setSidebarOpen(false);

    if (id === conversationId) {
      return;
    }

    router.push(
      `/chat/${id}`
    );
  }

  /*
   * =========================================================
   * FORMAT TIME
   * =========================================================
   */

  function formatTime(
    date: string
  ) {
    return new Date(
      date
    ).toLocaleTimeString(
      "id-ID",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  return (
    <main
      className="
        h-dvh
        w-full
        overflow-hidden
        bg-[#f5f5f5]
        text-black
        font-[var(--font-nunito)]
      "
    >
      <div className="relative flex h-full w-full">

        {/* =====================================================
            MOBILE OVERLAY
        ====================================================== */}

        {sidebarOpen && (
          <button
            type="button"
            aria-label="Tutup sidebar"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="
              fixed
              inset-0
              z-40
              bg-black/40
              md:hidden
            "
          />
        )}

        {/* =====================================================
            SIDEBAR
        ====================================================== */}

        <aside
          className={`
            fixed
            inset-y-0
            left-0
            z-50
            flex
            w-[300px]
            flex-col
            border-r
            border-black
            bg-white
            transition-transform
            duration-200

            md:static
            md:w-[350px]
            md:translate-x-0

            ${
              sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full"
            }
          `}
        >
          {/* =================================================
              LOGO
          ================================================= */}

          <div
            className="
              flex
              shrink-0
              items-center
              justify-between
              border-b
              border-black
              px-5
              py-5
              md:px-6
            "
          >
            <div>
              <h1
                className="
                  text-xl
                  font-extrabold
                  tracking-tight
                  text-black
                "
              >
                Akselera.Tech
              </h1>

              <p
                className="
                  mt-0.5
                  text-xs
                  font-semibold
                  text-gray-500
                "
              >
                Internal Chat
              </p>
            </div>

            {/* Mobile close */}

            <button
              type="button"
              onClick={() =>
                setSidebarOpen(false)
              }
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                border
                border-black
                text-lg
                font-bold
                text-black
                hover:bg-black
                hover:text-white
                md:hidden
              "
            >
              ×
            </button>
          </div>

          {/* =================================================
              SEARCH
          ================================================= */}

          <div className="shrink-0 px-4 py-4 md:px-5">
            <div
              className="
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-gray-300
                bg-gray-50
                px-4
                py-3
                focus-within:border-black
                focus-within:bg-white
              "
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="shrink-0 text-gray-500"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                />

                <path d="m20 20-3.5-3.5" />
              </svg>

              <input
                type="text"
                placeholder="Search conversation..."
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  text-sm
                  font-semibold
                  text-black
                  outline-none
                  placeholder:text-gray-400
                "
              />
            </div>
          </div>

          {/* =================================================
              SECTION TITLE
          ================================================= */}

          <div className="shrink-0 px-5 pb-3">
            <p
              className="
                text-[11px]
                font-extrabold
                uppercase
                tracking-[0.15em]
                text-gray-400
              "
            >
              Percakapan
            </p>
          </div>

          {/* =================================================
              CONVERSATION LIST
          ================================================= */}

          <div className="min-h-0 flex-1 overflow-y-auto px-3">
            {loadingConversations ? (
              <div className="px-3 py-8 text-center">
                <p className="text-sm font-semibold text-gray-400">
                  Memuat percakapan...
                </p>
              </div>
            ) : conversations.length ===
              0 ? (
              <div className="px-3 py-8 text-center">
                <p className="text-sm font-semibold text-gray-400">
                  Belum ada percakapan.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map(
                  (conversation) => {
                    const isActive =
                      conversation.id ===
                      conversationId;

                    /*
                     * Conversation yang sedang dibuka
                     * dianggap sudah dibaca.
                     */

                    const unreadCount =
                      isActive
                        ? 0
                        : conversation.unreadCount;

                    return (
                      <button
                        key={
                          conversation.id
                        }
                        type="button"
                        onClick={() =>
                          openConversation(
                            conversation.id
                          )
                        }
                        className={`
                          group
                          flex
                          w-full
                          items-center
                          gap-3
                          rounded-xl
                          border
                          px-3
                          py-3
                          text-left
                          transition

                          ${
                            isActive
                              ? "border-black bg-black text-white"
                              : "border-transparent bg-white text-black hover:border-gray-300 hover:bg-gray-50"
                          }
                        `}
                      >
                        {/* Avatar */}

                        <div
                          className={`
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            border
                            text-sm
                            font-extrabold

                            ${
                              isActive
                                ? "border-white bg-white text-black"
                                : "border-black bg-black text-white"
                            }
                          `}
                        >
                          {conversation.user.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        {/* Information */}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={`
                                truncate
                                text-sm

                                ${
                                  isActive
                                    ? "font-extrabold text-white"
                                    : "font-bold text-black"
                                }
                              `}
                            >
                              {
                                conversation
                                  .user
                                  .name
                              }
                            </p>

                            {conversation.lastMessage && (
                              <span
                                className={`
                                  shrink-0
                                  text-[10px]
                                  font-semibold

                                  ${
                                    isActive
                                      ? "text-gray-300"
                                      : "text-gray-400"
                                  }
                                `}
                              >
                                {formatTime(
                                  conversation
                                    .lastMessage
                                    .createdAt
                                )}
                              </span>
                            )}
                          </div>

                          <div className="mt-0.5 flex items-center gap-2">
                            <p
                              className={`
                                min-w-0
                                flex-1
                                truncate
                                text-xs
                                font-medium

                                ${
                                  isActive
                                    ? "text-gray-300"
                                    : "text-gray-500"
                                }
                              `}
                            >
                              {conversation.lastMessage
                                ? conversation
                                    .lastMessage
                                    .content
                                : "Belum ada pesan"}
                            </p>

                            {/* =================================================
                                UNREAD BADGE
                            ================================================== */}

                            {unreadCount >
                              0 && (
                              <span
                                className="
                                  flex
                                  h-5
                                  min-w-5
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-full
                                  bg-black
                                  px-1.5
                                  text-[10px]
                                  font-extrabold
                                  leading-none
                                  text-white
                                "
                              >
                                {unreadCount >
                                99
                                  ? "99+"
                                  : unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {/* =================================================
              NEW CHAT
          ================================================= */}

          <div
            className="
              shrink-0
              border-t
              border-black
              p-4
            "
          >
            <Link
              href="/chat"
              onClick={() =>
                setSidebarOpen(false)
              }
              className="
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-black
                px-4
                py-3
                text-sm
                font-extrabold
                text-white
                hover:bg-gray-800
              "
            >
              <span className="text-lg leading-none">
                +
              </span>

              New Chat
            </Link>
          </div>
        </aside>

        {/* =====================================================
            MAIN CHAT
        ====================================================== */}

        <section
          className="
            flex
            min-w-0
            flex-1
            flex-col
            bg-[#f5f5f5]
          "
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <header
            className="
              flex
              h-[73px]
              shrink-0
              items-center
              gap-3
              border-b
              border-black
              bg-white
              px-4
              sm:px-6
            "
          >
            {/* Mobile menu */}

            <button
              type="button"
              onClick={() =>
                setSidebarOpen(true)
              }
              aria-label="Buka daftar percakapan"
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                border-black
                text-black
                hover:bg-black
                hover:text-white
                md:hidden
              "
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </svg>
            </button>

            {/* Desktop back */}

            <Link
              href="/chat"
              className="
                hidden
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                border-gray-300
                text-lg
                text-black
                hover:border-black
                hover:bg-black
                hover:text-white
                sm:flex
              "
            >
              ←
            </Link>

            {/* Avatar */}

            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-black
                text-sm
                font-extrabold
                text-white
              "
            >
              {otherUser.name
                .charAt(0)
                .toUpperCase()}
            </div>

            {/* User */}

            <div className="min-w-0 flex-1">
              <h2
                className="
                  truncate
                  text-sm
                  font-extrabold
                  text-black
                  md:text-base
                "
              >
                {otherUser.name}
              </h2>

              <p
                className="
                  truncate
                  text-xs
                  font-semibold
                  text-gray-500
                "
              >
                {otherUser.email}
              </p>
            </div>
          </header>

          {/* =================================================
              MESSAGES
          ================================================= */}

          <div
            className="
              min-h-0
              flex-1
              overflow-y-auto
              px-3
              py-5
              sm:px-8
              sm:py-7
            "
          >
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm font-semibold text-gray-400">
                  Memuat pesan...
                </p>
              </div>
            ) : messages.length ===
              0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div
                    className="
                      mx-auto
                      mb-4
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-black
                      bg-white
                      text-xl
                    "
                  >
                    💬
                  </div>

                  <p className="text-sm font-extrabold text-black">
                    Belum ada pesan
                  </p>

                  <p className="mt-1 text-xs font-semibold text-gray-400">
                    Mulai percakapan
                    dengan{" "}
                    {otherUser.name}.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mx-auto w-full max-w-4xl space-y-4">
                {messages.map(
                  (message) => {
                    const isMine =
                      message.senderId ===
                      currentUserId;

                    return (
                      <div
                        key={
                          message.id
                        }
                        className={`flex ${
                          isMine
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`
                            max-w-[85%]
                            px-4
                            py-3
                            sm:max-w-[65%]

                            ${
                              isMine
                                ? "rounded-2xl rounded-br-md bg-black text-white"
                                : "rounded-2xl rounded-bl-md border border-gray-300 bg-white text-black"
                            }
                          `}
                        >
                          <p
                            className="
                              whitespace-pre-wrap
                              break-words
                              text-sm
                              font-semibold
                              leading-6
                            "
                          >
                            {
                              message.content
                            }
                          </p>

                          <div className="mt-1 flex items-center justify-end gap-1">
                            <p
                              className="
                                text-[10px]
                                font-semibold
                                text-gray-400
                              "
                            >
                              {formatTime(
                                message.createdAt
                              )}
                            </p>

                            {/* Read status */}

                            {isMine && (
                              <span
                                className={`
                                  text-[10px]
                                  font-bold

                                  ${
                                    message.readAt
                                      ? "text-white"
                                      : "text-gray-500"
                                  }
                                `}
                              >
                                {message.readAt
                                  ? "✓✓"
                                  : "✓"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div
              className="
                shrink-0
                border-t
                border-black
                bg-white
                px-4
                py-2
                text-xs
                font-bold
                text-black
                sm:px-6
              "
            >
              {error}
            </div>
          )}

          {/* =================================================
              MESSAGE INPUT
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="
              shrink-0
              border-t
              border-black
              bg-white
              p-3
              sm:p-4
            "
          >
            <div
              className="
                mx-auto
                flex
                w-full
                max-w-4xl
                items-center
                gap-2
                rounded-2xl
                border
                border-black
                bg-white
                p-2
              "
            >
              <input
                type="text"
                value={content}
                onChange={(event) =>
                  setContent(
                    event.target.value
                  )
                }
                placeholder="Ketik pesan..."
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  px-3
                  py-2
                  text-sm
                  font-semibold
                  text-black
                  outline-none
                  placeholder:text-gray-400
                "
                disabled={sending}
              />

              <button
                type="submit"
                disabled={
                  sending ||
                  !content.trim()
                }
                aria-label="Kirim pesan"
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-black
                  text-lg
                  font-bold
                  text-white
                  hover:bg-gray-800
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
              >
                ↑
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}