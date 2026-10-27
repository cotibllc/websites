import { SUBSTACK_URL } from "@/lib/site";

export default function FeedNotice({ snapshotDate }: { snapshotDate: string }) {
  return (
    <p className="feed-notice" role="status">
      The live article list could not be loaded right now. This is the Core Series as of {snapshotDate}. Newer articles are on{" "}
      <a href={SUBSTACK_URL} target="_blank" rel="noopener noreferrer">
        Substack
      </a>
      .
    </p>
  );
}
