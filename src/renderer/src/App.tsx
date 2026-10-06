import { useState } from "react"
import LibraryPanel from "./components/LibraryPanel"
import PreviewPanel from "./components/PreviewPanel"
import { LibraryItem } from "src/shared/types";

export default function App() {
  const [games, setGames] = useState<LibraryItem[]>([]);
  const [selectedGame, setSelectedGame] = useState<LibraryItem | null>(null)

  return (
    <div className="h-screen flex">
      <LibraryPanel games={games} setGames={setGames} setSelectedGame={setSelectedGame} />
      <PreviewPanel selectedGame={selectedGame} />
    </div>
  )
}