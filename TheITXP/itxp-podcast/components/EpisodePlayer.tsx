"use client";

interface Props {
  src: string;
  title: string;
}

export default function EpisodePlayer({ src, title }: Props) {
  if (!src) return null;
  return (
    <div className="my-6">
      <audio
        controls
        className="w-full rounded-lg"
        aria-label={`Listen to ${title}`}
      >
        <source src={src} type="audio/mpeg" />
        Your browser does not support the audio element.{" "}
        <a href={src} download>
          Download the episode
        </a>
        .
      </audio>
    </div>
  );
}
