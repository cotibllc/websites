import Image from "next/image";
import type { Video } from "@/lib/youtube";

interface Props {
  video: Video;
}

export default function VideoCard({ video }: Props) {
  const date = video.published
    ? new Date(video.published).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-slate border border-slate/50 rounded-xl overflow-hidden hover:border-blue hover:shadow-lg hover:shadow-blue/5 transition-all flex flex-col"
    >
      <div className="relative aspect-video bg-navy">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
        <span className="absolute inset-0 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-black/60">
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 ml-0.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
      </div>
      <div className="p-5 flex flex-col gap-2">
        {date && <span className="text-xs text-steel font-mono">{date}</span>}
        <h3 className="font-semibold text-white leading-snug group-hover:text-amber transition-colors line-clamp-2">
          {video.title}
        </h3>
      </div>
    </a>
  );
}
