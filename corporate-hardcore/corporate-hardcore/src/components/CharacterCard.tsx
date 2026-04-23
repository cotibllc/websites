import type { Character } from "@/data/content";

interface CharacterCardProps {
  character: Character;
  compact?: boolean;
}

export default function CharacterCard({ character, compact = false }: CharacterCardProps) {
  return (
    <article className="intranet-card flex flex-col">
      {/* Header bar */}
      <div className="intranet-header flex items-center justify-between">
        <span className="truncate">{character.department}</span>
        <span className="text-white/50 ml-2 flex-shrink-0">#{character.badgeNumber}</span>
      </div>

      <div className="p-4 flex gap-3 flex-1">
        {/* Badge photo placeholder */}
        <div className="flex-shrink-0 w-16 h-20 border border-dashed border-synergy-rule bg-synergy-gray flex flex-col items-center justify-center gap-1">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="10" cy="7" r="4" stroke="#c8c4bc" strokeWidth="1.2"/>
            <path d="M2 18c0-4 3.6-7 8-7s8 3 8 7" stroke="#c8c4bc" strokeWidth="1.2" fill="none"/>
          </svg>
          <span className="font-mono text-[7px] text-synergy-muted text-center leading-tight px-1">
            ID PHOTO<br />PENDING
          </span>
        </div>

        {/* Fields */}
        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <p className="dept-label">Name</p>
            <p className="font-sans font-semibold text-synergy-dark text-sm">{character.name}</p>
          </div>
          <div>
            <p className="dept-label">Title</p>
            <p className="font-sans text-sm text-synergy-dark">{character.title}</p>
          </div>
          {!compact && (
            <>
              <div className="flex gap-4">
                <div>
                  <p className="dept-label">Yrs of Service</p>
                  <p className="font-mono text-sm text-synergy-dark">{character.yearsOfService}</p>
                </div>
                <div>
                  <p className="dept-label">Clearance</p>
                  <p className="font-mono text-sm text-synergy-dark">{character.clearanceLevel}</p>
                </div>
              </div>
              <div>
                <p className="dept-label">Known For</p>
                <p className="font-sans text-xs text-synergy-muted italic">{character.knownFor}</p>
              </div>
            </>
          )}
          {compact && (
            <div>
              <p className="dept-label">Known For</p>
              <p className="font-sans text-xs text-synergy-muted italic line-clamp-2">{character.knownFor}</p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
