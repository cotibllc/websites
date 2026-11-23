import type { ReactNode } from "react";
import type { MemoHeader } from "@/lib/memo-header";

interface Props {
  header: MemoHeader;
  subject: string;
  /** Extra typed rows after DATE (e.g. ARC, FILING CODE). */
  extraRows?: { label: string; value: ReactNode }[];
  from: ReactNode;
}

/**
 * Typed memo block at the top of every Field Note and Field Memo:
 * MEMO, DEPARTMENT, CLASSIFICATION, DATE, then any extra rows, SUBJECT and FROM.
 */
export default function MemoHeaderBlock({ header, subject, extraRows = [], from }: Props) {
  const rows: { label: string; value: ReactNode }[] = [
    { label: "Memo", value: header.number },
    { label: "Department", value: header.department },
    { label: "Classification", value: header.classification },
    { label: "Date", value: <time dateTime={header.isoDate}>{header.date}</time> },
    ...extraRows,
  ];
  return (
    <header className="bg-synergy-amber-light border-b border-synergy-rule px-6 py-4" data-memo-header>
      <dl className="font-mono text-[12px] border-y-2 border-double border-synergy-rule divide-y divide-dashed divide-synergy-rule">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[8.5rem_1fr] sm:grid-cols-[10rem_1fr] gap-x-3 py-1.5">
            <dt className="dept-label self-center">{row.label}</dt>
            <dd className="text-synergy-dark tracking-wide min-w-0 break-words">{row.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3">
        <span className="dept-label">Subject</span>
        <h1 className="font-sans font-semibold text-synergy-dark text-lg leading-snug mt-0.5">{subject}</h1>
      </div>
      <div className="mt-2">
        <span className="dept-label">From</span>
        <p className="font-sans text-sm text-synergy-dark mt-0.5">{from}</p>
      </div>
    </header>
  );
}
