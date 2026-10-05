"use client";

import Image from "next/image";
import { useState } from "react";

type CastAvatarProps = {
  src?: string | null;
  initials: string;
  alt: string;
  size?: number;
  className?: string;
};

export default function CastAvatar({
  src,
  initials,
  alt,
  size = 48,
  className = "",
}: CastAvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  if (!showImage) {
    return (
      <div
        className={`rounded-full bg-linkedin-blue/10 flex items-center justify-center flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
        aria-hidden={!alt}
      >
        <span
          className="text-linkedin-blue font-bold"
          style={{ fontSize: size <= 36 ? "0.75rem" : "0.875rem" }}
        >
          {initials}
        </span>
        <span className="sr-only">{alt}</span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-full overflow-hidden flex-shrink-0 bg-linkedin-blue/10 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={src!}
        alt={alt}
        width={size}
        height={size}
        className="w-full h-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
