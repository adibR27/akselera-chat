import { redirect } from "next/navigation";

import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "./logout-button";

export default async function ChatPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Akselera Chat
              </h1>

              <p className="mt-2 text-gray-600">
                Selamat datang, {user.name}.
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {user.email}
              </p>
            </div>

            <LogoutButton />
          </div>
        </div>
      </div>
    </main>
  );
}