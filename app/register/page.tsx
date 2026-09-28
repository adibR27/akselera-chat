import Image from "next/image";

import RegisterForm from "./RegisterForm";
import ThemeToggle from "../ThemeToggle";

export default function RegisterPage() {
  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-gray-100
        px-4
        transition-colors
        dark:bg-gray-950
      "
    >
      {/* Theme Toggle */}
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      {/* Register Card */}
      <div
        className="
          w-full
          max-w-md
          rounded-xl
          border
          border-gray-200
          bg-white
          p-8
          shadow-md
          transition-colors

          dark:border-gray-800
          dark:bg-gray-900
        "
      >
        {/* Logo & Heading */}
        <div className="mb-8 text-center">
          <div className="mb-6 flex justify-center">
            {/* Light Mode Logo */}
            <Image
              src="/images/akselera-logo-dark.png"
              alt="Akselera.Tech"
              width={260}
              height={100}
              priority
              className="
                h-auto
                w-[220px]
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
                w-[220px]
                dark:block
              "
            />
          </div>

          <p
            className="
              mt-2
              text-sm
              text-gray-500
              dark:text-gray-400
            "
          >
            Buat akun untuk menggunakan Akselera.Tech
          </p>
        </div>

        {/* Register Form */}
        <RegisterForm />
      </div>
    </main>
  );
}