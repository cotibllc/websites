import type { Character } from "@/data/content";
import CharacterBadgePhoto from "@/components/CharacterBadgePhoto";

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
        <CharacterBadgePhoto src={character.headshot} alt={character.name} />

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
