import { useEffect, useState } from "react";
import DefaultLayout from "../layouts/base";
import Input from "../components/Input";

interface CharacterData {
  name: string;
  level: number;
  stats: {
    vigor: number;
    agility: number;
    strength: number;
    will: number;
    focus: number;
  };
  perks: [];
}

export default function CharacterEditor() {
  const [characterData, setCharacterData] = useState<CharacterData | undefined>(
    undefined,
  );

  return (
    <DefaultLayout title="Character editor">
      <div className="w-full min-h-full h-full flex flex-row gap-4">
        <div className="min-w-72 flex flex-col gap-2 shrink-0">
          <p className="font-semibold text-lg">Characters</p>
          <div className="w-full bg-neutral-800 grow rounded-md p-2 overflow-auto">
            {/* TODO: Add a character selector here
              - It should get the files from resources/characters folder which already exists
              - It should poll every 5 seconds for changes to see if there are new files
            */}
          </div>
        </div>
        <div className="grow flex flex-col min-w-0">
          <CharacterDataEditor initialData={characterData} />
        </div>
      </div>
    </DefaultLayout>
  );
}

const statPerLevel = 3;

function CharacterDataEditor(props: { initialData?: CharacterData }) {
  const [characterData, setCharacterData] = useState<CharacterData>({
    name: "",
    level: 1,
    stats: {
      vigor: 5,
      agility: 5,
      strength: 5,
      will: 5,
      focus: 5,
    },
    perks: [],
  });

  const currentStats = (() => {
    let statsUsed = 0;
    Object.keys(characterData.stats).forEach((key) => {
      statsUsed += characterData.stats[key as keyof typeof characterData.stats];
    });
    return statsUsed;
  })();
  const maxStats = 25 + (characterData.level - 1) * statPerLevel;

  const handleStatChange = (
    stat: keyof typeof characterData.stats,
    value: any,
  ) => {
    setCharacterData((prev) => ({
      ...prev,
      stats: { ...prev.stats, [stat]: parseInt(value) },
    }));
  };

  useEffect(() => {}, []);

  return (
    <div className="flex flex-col gap-2">
      <Input
        label="Name"
        type="text"
        className="w-72"
        value={characterData.name}
        onChange={(value) => {
          setCharacterData((prev) => ({ ...prev, name: value }));
        }}
      />
      <Input
        label="Level"
        type="number"
        className="w-72"
        value={characterData.level}
        onChange={(value) => {
          setCharacterData((prev) => ({ ...prev, level: value }));
        }}
      />
      <div className="h-px my-2 bg-neutral-500" />
      <p className={currentStats > maxStats ? "text-red-400" : ""}>
        STATS [{currentStats}/{maxStats}]
      </p>
      <div className="grid grid-cols-2 gap-2 mr-auto">
        <Input
          label="Vigor"
          type="number"
          className="w-72"
          value={characterData.stats.vigor}
          onChange={(value) => handleStatChange("vigor", value)}
        />
        <Input
          label="Agility"
          type="number"
          className="w-72"
          value={characterData.stats.agility}
          onChange={(value) => handleStatChange("agility", value)}
        />
        <Input
          label="Strength"
          type="number"
          className="w-72"
          value={characterData.stats.strength}
          onChange={(value) => handleStatChange("strength", value)}
        />
        <Input
          label="Will"
          type="number"
          className="w-72"
          value={characterData.stats.will}
          onChange={(value) => handleStatChange("will", value)}
        />
        <Input
          label="Focus"
          type="number"
          className="w-72"
          value={characterData.stats.focus}
          onChange={(value) => handleStatChange("focus", value)}
        />
      </div>
      <div className="h-px my-2 bg-neutral-500" />
    </div>
  );
}
