import { test } from "node:test";
import assert from "node:assert/strict";
import { excludePodcastVideos, normalizeTitle } from "./videoFilter";
import type { Video } from "./youtube";

function video(id: string, title: string): Video {
  return {
    id,
    title,
    url: `https://www.youtube.com/watch?v=${id}`,
    thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    published: "2026-10-30T00:00:00+00:00",
  };
}

const ids = (videos: Video[]) => videos.map((v) => v.id);

test("normalizeTitle folds curly quotes, dashes, and case", () => {
  assert.equal(
    normalizeTitle("AWS US-East-1 Goes Down \u2014 Why DNS Still Rules"),
    "aws us east 1 goes down why dns still rules",
  );
  assert.equal(
    normalizeTitle("Don\u2019t Fear the AI Revolution"),
    normalizeTitle("Don't Fear the AI Revolution"),
  );
});

test("excludes a video whose ID is in the podcast playlist, even with a different title", () => {
  const videos = [video("podcastId01", "A YouTube only title"), video("regular0001", "Regular video")];
  const result = excludePodcastVideos(videos, new Set(["podcastId01"]), []);
  assert.deepEqual(ids(result), ["regular0001"]);
});

test("excludes a video whose title matches a Libsyn title (curly quotes, em dash)", () => {
  const videos = [
    video("titleOnly01", "Don\u2019t Fear the AI Revolution"),
    video("titleOnly02", "AWS US-East-1 Goes Down \u2014 Why DNS Still Rules the Internet"),
    video("regular0001", "Claude Code Is Not for Developers"),
  ];
  const libsyn = [
    "Don't Fear the AI Revolution",
    "AWS US-East-1 Goes Down - Why DNS Still Rules the Internet",
  ];
  const result = excludePodcastVideos(videos, new Set(), libsyn);
  assert.deepEqual(ids(result), ["regular0001"]);
});

test("keeps regular videos and Shorts, in their original order", () => {
  const videos = [
    video("regular0001", "Claude Code Is Not for Developers"),
    video("shortVideo1", "AI Agents vs Automation Scripts: What's the Real Difference?"),
    video("regular0002", "What Nobody Tells You About Claude in the First Week"),
  ];
  const result = excludePodcastVideos(videos, new Set(["otherPodcast"]), ["Your IT Career Is a Sport"]);
  assert.deepEqual(ids(result), ["regular0001", "shortVideo1", "regular0002"]);
});

test("empty ID set and empty Libsyn list leave the list unchanged", () => {
  const videos = [video("regular0001", "One"), video("regular0002", "Two")];
  assert.deepEqual(excludePodcastVideos(videos, new Set(), []), videos);
});

test("a blank Libsyn title does not hide videos with blank or symbol-only titles", () => {
  const videos = [video("regular0001", "!!!")];
  assert.deepEqual(ids(excludePodcastVideos(videos, new Set(), ["", "  "])), ["regular0001"]);
});
