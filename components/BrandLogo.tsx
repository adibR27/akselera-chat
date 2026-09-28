"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type Props = {
  width?: number;
  height?: number;
  className?: string;
};

export default function BrandLogo({
  width = 180,
  height = 50,
  className = "",
}: Props) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /*
   * Sebelum theme terdeteksi, gunakan logo light
   * untuk menghindari hydration mismatch.
   */
  const isDark = mounted && theme === "dark";

  return (
    <Image
      src={
        isDark
          ? "/logo-akselera-dark.png"
          : "/logo-akselera-light.png"
      }
      alt="Akselera.Tech"
      width={width}
      height={height}
      priority
      className={className}
    />
  );
}