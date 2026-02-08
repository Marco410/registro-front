"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon } from "@hugeicons/core-free-icons";

interface MobileMenuButtonProps {
  onClick: () => void;
  ariaLabel?: string;
}

export function MobileMenuButton({
  onClick,
  ariaLabel = "Abrir menú",
}: MobileMenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="flex h-10 w-10 items-center justify-center rounded-lg text-brown-600 transition-colors hover:bg-brown-100 lg:hidden dark:text-brown-400 dark:hover:bg-brown-800"
    >
      <HugeiconsIcon icon={Menu01Icon} size={24} />
    </button>
  );
}
