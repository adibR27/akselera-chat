import { getCurrentUserId } from "@/lib/auth";
import { redirect } from "next/navigation";

import ChatPage from "./ChatPage";

export default async function Chat() {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/login");
  }

  return <ChatPage />;
}