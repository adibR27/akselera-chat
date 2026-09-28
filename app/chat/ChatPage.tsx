"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "./logout-button";
import ThemeToggle from "../ThemeToggle";

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
  const [search, setSearch] = useState("");

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingConversations, setLoadingConversations] =
    useState(true);
  const [creatingChat, setCreatingChat] = useState<number | null>(
    null
  );

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

  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.user.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      conversation.user.email
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <main
      className="
        min-h-screen
        bg-[#f7f7f7]
        text-gray-900
        transition-colors

        dark:bg-gray-950
        dark:text-white
      "
    >
      <div className="flex min-h-screen">

        {/* ================= SIDEBAR ================= */}
        <aside
          className="
            flex
            w-full
            max-w-[360px]
            flex-col
            border-r
            border-gray-200
            bg-white
            transition-colors

            dark:border-gray-800
            dark:bg-gray-900
          "
        >

          {/* Brand */}
          <div
            className="
              border-b
              border-gray-200
              px-6
              py-5

              dark:border-gray-800
            "
          >
            <div className="flex items-center justify-between">

              {/* Logo */}
              <div className="flex min-w-0 items-center">

                {/* Light Mode Logo */}
                <Image
                  src="/images/akselera-logo-dark.png"
                  alt="Akselera.Tech"
                  width={260}
                  height={100}
                  priority
                  className="
                    h-auto
                    w-[180px]
                    dark:hidden
                  "
                />

                {/* Dark Mode Logo */}
                <Image
                  src="/images/akselera-logo-light.png"
                  alt="Akselera.Tech"
                  width={260}
                  height={100}
                  priority
                  className="
                    hidden
                    h-auto
                    w-[180px]
                    dark:block
                  "
                />
              </div>

              <ThemeToggle />
            </div>

            <p
              className="
                mt-1
                text-xs
                text-gray-500

                dark:text-gray-400
              "
            >
              Internal Chat
            </p>
          </div>

          {/* Search + New Chat */}
          <div
            className="
              border-b
              border-gray-200
              p-4

              dark:border-gray-800
            "
          >
            <div className="relative">
              <span
                className="
                  pointer-events-none
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              >
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search conversations..."
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  py-2.5
                  pl-9
                  pr-3
                  text-sm
                  text-gray-900
                  outline-none
                  transition

                  placeholder:text-gray-400

                  focus:border-gray-400
                  focus:bg-white

                  dark:border-gray-700
                  dark:bg-gray-800
                  dark:text-white
                  dark:focus:border-gray-500
                  dark:focus:bg-gray-800
                "
              />
            </div>

            <button
              type="button"
              onClick={handleNewChat}
              className="
                mt-3
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-black
                px-4
                py-2.5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-gray-800

                dark:bg-white
                dark:text-black
                dark:hover:bg-gray-200
              "
            >
              <span className="text-lg leading-none">+</span>
              Chat baru
            </button>
          </div>

          {/* Conversation title */}
          <div className="px-5 pb-2 pt-5">
            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-wider
                text-gray-400
              "
            >
              Percakapan
            </p>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto px-3 pb-4">

            {loadingConversations ? (
              <div
                className="
                  px-3
                  py-10
                  text-center
                  text-sm
                  text-gray-400
                "
              >
                Memuat percakapan...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="px-4 py-10 text-center">

                <div
                  className="
                    mx-auto
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    bg-gray-100
                    text-xl

                    dark:bg-gray-800
                  "
                >
                  💬
                </div>

                <p
                  className="
                    mt-3
                    text-sm
                    font-medium
                    text-gray-700

                    dark:text-gray-300
                  "
                >
                  {search
                    ? "Percakapan tidak ditemukan"
                    : "Belum ada percakapan"}
                </p>

                {!search && (
                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-gray-400
                    "
                  >
                    Mulai percakapan baru dengan anggota
                    lainnya.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredConversations.map(
                  (conversation) => (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() =>
                        openConversation(conversation.id)
                      }
                      className="
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        py-3
                        text-left
                        transition

                        hover:bg-gray-100

                        dark:hover:bg-gray-800
                      "
                    >

                      {/* Avatar */}
                      <div
                        className="
                          flex
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-black
                          text-sm
                          font-bold
                          text-white

                          dark:bg-white
                          dark:text-black
                        "
                      >
                        {conversation.user.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">

                          <p
                            className="
                              truncate
                              text-sm
                              font-semibold
                              text-gray-900

                              dark:text-white
                            "
                          >
                            {conversation.user.name}
                          </p>

                          {conversation.lastMessage && (
                            <span
                              className="
                                shrink-0
                                text-[10px]
                                text-gray-400
                              "
                            >
                              {new Date(
                                conversation.lastMessage.createdAt
                              ).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>

                        <p
                          className="
                            mt-0.5
                            truncate
                            text-xs
                            text-gray-500

                            dark:text-gray-400
                          "
                        >
                          {conversation.lastMessage
                            ? conversation.lastMessage.content
                            : "Belum ada pesan"}
                        </p>
                      </div>
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* Bottom user area */}
          <div
            className="
              border-t
              border-gray-200
              p-4

              dark:border-gray-800
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
                rounded-xl
                bg-gray-50
                p-3

                dark:bg-gray-800
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-black
                  text-xs
                  font-bold
                  text-white

                  dark:bg-white
                  dark:text-black
                "
              >
                U
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className="
                    truncate
                    text-sm
                    font-semibold
                    text-gray-900

                    dark:text-white
                  "
                >
                  Account
                </p>

                <p
                  className="
                    text-xs
                    text-gray-400
                  "
                >
                  Akselera User
                </p>
              </div>
            </div>

            <div className="mt-3">
              <LogoutButton />
            </div>
          </div>
        </aside>

        {/* ================= EMPTY CHAT AREA ================= */}
        <section
          className="
            hidden
            flex-1
            items-center
            justify-center
            bg-[#fafafa]

            dark:bg-gray-950

            md:flex
          "
        >
          <div className="max-w-sm px-6 text-center">

            <div
              className="
                mx-auto
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-3xl
                bg-black
                text-3xl
                text-white
                shadow-sm

                dark:bg-white
                dark:text-black
              "
            >
              💬
            </div>

            <h2
              className="
                mt-6
                text-xl
                font-bold
                text-gray-900

                dark:text-white
              "
            >
              Pilih percakapan
            </h2>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-gray-500

                dark:text-gray-400
              "
            >
              Pilih percakapan dari daftar di sebelah kiri
              atau mulai chat baru dengan pengguna lain.
            </p>

            <button
              type="button"
              onClick={handleNewChat}
              className="
                mt-6
                rounded-xl
                bg-black
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-gray-800

                dark:bg-white
                dark:text-black
                dark:hover:bg-gray-200
              "
            >
              + Chat baru
            </button>
          </div>
        </section>
      </div>

      {/* ================= NEW CHAT MODAL ================= */}
      {showNewChat && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/40
            p-4
            backdrop-blur-sm
          "
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowNewChat(false);
            }
          }}
        >
          <div
            className="
              w-full
              max-w-md
              overflow-hidden
              rounded-2xl
              bg-white
              shadow-2xl

              dark:bg-gray-900
            "
          >

            {/* Modal header */}
            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-gray-100
                px-5
                py-4

                dark:border-gray-800
              "
            >
              <div>
                <h2
                  className="
                    text-lg
                    font-bold
                    text-gray-900

                    dark:text-white
                  "
                >
                  Chat baru
                </h2>

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-gray-500

                    dark:text-gray-400
                  "
                >
                  Pilih pengguna untuk memulai percakapan.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowNewChat(false)}
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  text-xl
                  text-gray-400
                  transition

                  hover:bg-gray-100
                  hover:text-gray-700

                  dark:hover:bg-gray-800
                  dark:hover:text-gray-200
                "
              >
                ×
              </button>
            </div>

            {/* Users */}
            <div className="max-h-[420px] overflow-y-auto p-3">

              {loadingUsers ? (
                <div
                  className="
                    py-10
                    text-center
                    text-sm
                    text-gray-400
                  "
                >
                  Memuat pengguna...
                </div>
              ) : users.length === 0 ? (
                <div className="py-10 text-center">

                  <p
                    className="
                      text-sm
                      font-medium
                      text-gray-700

                      dark:text-gray-300
                    "
                  >
                    Tidak ada pengguna lain.
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-gray-400
                    "
                  >
                    Belum ada pengguna yang dapat diajak chat.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() =>
                        createConversation(user.id)
                      }
                      disabled={
                        creatingChat === user.id
                      }
                      className="
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-xl
                        p-3
                        text-left
                        transition

                        hover:bg-gray-100

                        dark:hover:bg-gray-800

                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      <div
                        className="
                          flex
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-gray-100
                          text-sm
                          font-bold
                          text-gray-700

                          dark:bg-gray-800
                          dark:text-gray-200
                        "
                      >
                        {user.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className="
                            truncate
                            text-sm
                            font-semibold
                            text-gray-900

                            dark:text-white
                          "
                        >
                          {user.name}
                        </p>

                        <p
                          className="
                            truncate
                            text-xs
                            text-gray-500

                            dark:text-gray-400
                          "
                        >
                          {user.email}
                        </p>
                      </div>

                      {creatingChat === user.id && (
                        <span
                          className="
                            text-xs
                            text-gray-400
                          "
                        >
                          Membuat...
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}