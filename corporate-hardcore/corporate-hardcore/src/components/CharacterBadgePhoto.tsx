"use client";

import Image from "next/image";
import { useState } from "react";

type CharacterBadgePhotoProps = {
  src?: string | null;
  alt: string;
};

export default function CharacterBadgePhoto({ src, alt }: CharacterBadgePhotoProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  if (!showImage) {
    return (
      <div className="flex-shrink-0 w-16 h-20 border border-dashed border-synergy-rule bg-synergy-gray flex flex-col items-center justify-center gap-1">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="7" r="4" stroke="#c8c4bc" strokeWidth="1.2" />
          <path
            d="M2 18c0-4 3.6-7 8-7s8 3 8 7"
            stroke="#c8c4bc"
            strokeWidth="1.2"
            fill="none"
          />
        </svg>
        <span className="font-mono text-[7px] text-synergy-muted text-center leading-tight px-1">
          ID PHOTO
          <br />
          PENDING
        </span>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 w-16 h-20 border border-synergy-rule bg-synergy-gray overflow-hidden relative">
      <Image
        src={src!}
        alt={alt}
        fill
        sizes="64px"
        className="object-cover object-top"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
