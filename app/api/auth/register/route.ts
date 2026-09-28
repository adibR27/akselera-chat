import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    /*
     * ==========================================
     * VALIDASI
     * ==========================================
     */

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          message:
            "Nama, email, dan password wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        {
          message:
            "Nama minimal terdiri dari 2 karakter.",
        },
        {
          status: 400,
        }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          message:
            "Password minimal terdiri dari 6 karakter.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Validasi format email sederhana.
     */

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          message:
            "Format email tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ==========================================
     * CEK EMAIL
     * ==========================================
     */

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingUser) {
      return NextResponse.json(
        {
          message:
            "Email sudah terdaftar.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * ==========================================
     * HASH PASSWORD
     * ==========================================
     */

    const passwordHash =
      await bcrypt.hash(password, 10);

    /*
     * ==========================================
     * CREATE USER
     * ==========================================
     */

    const user =
      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

    /*
     * ==========================================
     * RESPONSE
     * ==========================================
     */

    return NextResponse.json(
      {
        message:
          "Registrasi berhasil.",
        user,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Register error:",
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