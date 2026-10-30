import type { Video } from "./youtube";

// Normalizes a title for comparison between YouTube and Libsyn. Lowercases,
// folds Unicode compatibility forms, drops quotes and apostrophes (straight
// and curly), and collapses every other run of punctuation, dashes, and
// whitespace into a single space.
export function normalizeTitle(title: string): string {
  return title
    .normalize("NFKC")
    .toLowerCase()
    .replace(/['"\u2018\u2019\u201C\u201D]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

// Removes YouTube uploads that are podcast episodes, so the Latest Videos
// grid does not repeat what the Libsyn episode list already shows. A video is
// a podcast episode if its ID is in the channel's podcast playlist, or if its
// normalized title matches a Libsyn episode title. Either signal alone is
// enough, so the filter still works when one of the two feeds is unavailable.
export function excludePodcastVideos(
  videos: readonly Video[],
  podcastVideoIds: ReadonlySet<string>,
  libsynTitles: readonly string[],
): Video[] {
  const podcastTitles = new Set(
    libsynTitles.map(normalizeTitle).filter((t) => t.length > 0),
  );
  return videos.filter(
    (video) =>
      !podcastVideoIds.has(video.id) &&
      !podcastTitles.has(normalizeTitle(video.title)),
  );
}
