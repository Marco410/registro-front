"use client";

import Image from "next/image";

export default function Logo({ size = 48 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="registro logo"
      width={size}
      height={size}
      className="rounded-xl bg-transparent"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: "contain",
      }}
    />
  );
}
