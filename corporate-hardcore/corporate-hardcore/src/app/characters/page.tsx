import type { Metadata } from "next";
import { characters } from "@/data/content";
import CharacterCard from "@/components/CharacterCard";

export const metadata: Metadata = {
  title: "Employee Directory",
  description: "Synergy Corp active personnel. Accuracy not guaranteed.",
  alternates: { canonical: "/characters" },
};

export default function CharactersPage() {
  return (
    <div className="mx-auto content-max px-4 py-8">
      {/* Page header */}
      <div className="intranet-card mb-6">
        <div className="intranet-header">
          Synergy Corp — Employee Directory
        </div>
        <div className="px-4 py-3 bg-synergy-white border-t border-synergy-rule flex items-center justify-between">
          <p className="font-sans text-sm text-synergy-muted">
            Active personnel. Accuracy not guaranteed.
          </p>
          <span className="dept-label">{characters.length} records</span>
        </div>
      </div>

      {/* Character grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map((character) => (
          <CharacterCard key={character.id} character={character} />
        ))}
      </div>

      {/* Footer note */}
      <p className="font-mono text-[10px] text-synergy-muted text-center mt-8 tracking-wider">
        CLEARANCE LEVEL: STANDARD — This directory is for internal use only. Do not distribute.
      </p>
    </div>
  );
}
