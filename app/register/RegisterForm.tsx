"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    /*
     * ==========================================
     * VALIDASI
     * ==========================================
     */

    if (
      !trimmedName ||
      !trimmedEmail ||
      !password ||
      !confirmPassword
    ) {
      setError(
        "Semua field wajib diisi."
      );

      return;
    }

    if (trimmedName.length < 2) {
      setError(
        "Nama minimal terdiri dari 2 karakter."
      );

      return;
    }

    if (password.length < 6) {
      setError(
        "Password minimal terdiri dari 6 karakter."
      );

      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Konfirmasi password tidak cocok."
      );

      return;
    }

    /*
     * ==========================================
     * REGISTER
     * ==========================================
     */

    try {
      setLoading(true);

      const response = await fetch(
        "/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: trimmedName,
            email: trimmedEmail,
            password,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ??
            "Registrasi gagal."
        );

        return;
      }

      /*
       * Registrasi berhasil.
       *
       * User diarahkan kembali
       * ke halaman login.
       */

      router.push(
        "/login?registered=true"
      );
    } catch (error) {
      console.error(
        "Register error:",
        error
      );

      setError(
        "Terjadi kesalahan pada server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* ========================================
          ERROR
      ========================================= */}

      {error && (
        <div
          className="
            rounded-lg
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            font-semibold
            text-red-600

            dark:border-red-900
            dark:bg-red-950
            dark:text-red-400
          "
        >
          {error}
        </div>
      )}

      {/* ========================================
          NAME
      ========================================= */}

      <div>
        <label
          htmlFor="name"
          className="
            mb-2
            block
            text-sm
            font-bold
            text-gray-800
            dark:text-gray-200
          "
        >
          Nama
        </label>

        <input
          id="name"
          type="text"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          placeholder="Masukkan nama"
          autoComplete="name"
          disabled={loading}
          className="
            w-full
            rounded-lg
            border
            border-gray-300
            bg-white
            px-4
            py-3
            text-sm
            text-gray-900
            outline-none
            transition

            placeholder:text-gray-400

            focus:border-black
            focus:ring-1
            focus:ring-black

            disabled:cursor-not-allowed
            disabled:opacity-50

            dark:border-gray-700
            dark:bg-gray-950
            dark:text-white

            dark:focus:border-white
            dark:focus:ring-white
          "
        />
      </div>

      {/* ========================================
          EMAIL
      ========================================= */}

      <div>
        <label
          htmlFor="email"
          className="
            mb-2
            block
            text-sm
            font-bold
            text-gray-800
            dark:text-gray-200
          "
        >
          Email
        </label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          placeholder="Masukkan email"
          autoComplete="email"
          disabled={loading}
          className="
            w-full
            rounded-lg
            border
            border-gray-300
            bg-white
            px-4
            py-3
            text-sm
            text-gray-900
            outline-none
            transition

            placeholder:text-gray-400

            focus:border-black
            focus:ring-1
            focus:ring-black

            disabled:cursor-not-allowed
            disabled:opacity-50

            dark:border-gray-700
            dark:bg-gray-950
            dark:text-white

            dark:focus:border-white
            dark:focus:ring-white
          "
        />
      </div>

      {/* ========================================
          PASSWORD
      ========================================= */}

      <div>
        <label
          htmlFor="password"
          className="
            mb-2
            block
            text-sm
            font-bold
            text-gray-800
            dark:text-gray-200
          "
        >
          Password
        </label>

        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          placeholder="Minimal 6 karakter"
          autoComplete="new-password"
          disabled={loading}
          className="
            w-full
            rounded-lg
            border
            border-gray-300
            bg-white
            px-4
            py-3
            text-sm
            text-gray-900
            outline-none
            transition

            placeholder:text-gray-400

            focus:border-black
            focus:ring-1
            focus:ring-black

            disabled:cursor-not-allowed
            disabled:opacity-50

            dark:border-gray-700
            dark:bg-gray-950
            dark:text-white

            dark:focus:border-white
            dark:focus:ring-white
          "
        />
      </div>

      {/* ========================================
          CONFIRM PASSWORD
      ========================================= */}

      <div>
        <label
          htmlFor="confirmPassword"
          className="
            mb-2
            block
            text-sm
            font-bold
            text-gray-800
            dark:text-gray-200
          "
        >
          Konfirmasi Password
        </label>

        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(event) =>
            setConfirmPassword(
              event.target.value
            )
          }
          placeholder="Masukkan ulang password"
          autoComplete="new-password"
          disabled={loading}
          className="
            w-full
            rounded-lg
            border
            border-gray-300
            bg-white
            px-4
            py-3
            text-sm
            text-gray-900
            outline-none
            transition

            placeholder:text-gray-400

            focus:border-black
            focus:ring-1
            focus:ring-black

            disabled:cursor-not-allowed
            disabled:opacity-50

            dark:border-gray-700
            dark:bg-gray-950
            dark:text-white

            dark:focus:border-white
            dark:focus:ring-white
          "
        />
      </div>

      {/* ========================================
          REGISTER BUTTON
      ========================================= */}

      <button
        type="submit"
        disabled={loading}
        className="
          w-full
          rounded-lg
          bg-black
          px-4
          py-3
          text-sm
          font-extrabold
          text-white
          transition

          hover:bg-gray-800

          disabled:cursor-not-allowed
          disabled:opacity-50

          dark:bg-white
          dark:text-black
          dark:hover:bg-gray-200
        "
      >
        {loading
          ? "Mendaftarkan..."
          : "Daftar"}
      </button>

      {/* ========================================
          BACK TO LOGIN
      ========================================= */}

      <div className="pt-1 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sudah punya akun?
        </p>

        <Link
          href="/login"
          className="
            mt-1
            inline-block
            text-sm
            font-bold
            text-black
            underline
            underline-offset-4
            transition
            hover:text-gray-600

            dark:text-white
            dark:hover:text-gray-300
          "
        >
          Kembali ke login
        </Link>
      </div>
    </form>
  );
}