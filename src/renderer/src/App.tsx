import { useState } from "react"
import LibraryPanel from "./components/LibraryPanel"
import PreviewPanel from "./components/PreviewPanel"

export default function App() {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null)

  return (
    <div className="h-screen flex">
      <LibraryPanel games={games} setGames={setGames} setSelectedGame={setSelectedGame} />
      <PreviewPanel selectedGame={selectedGame} />
    </div>
  )
}