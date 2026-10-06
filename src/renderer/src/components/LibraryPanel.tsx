import { useState } from "react";
import EmptyLibrary from "./EmptyLibrary"
import GameCard from "./GameCard";
import Modal from "./Modal";

export default function LibraryPanel({ games, setGames, setSelectedGame }) {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [gamePath, setGamePath] = useState<string | null>(null);
    
    const handleAddGame = async () => {
        const path = await window.api.pickExecutable();
        console.log(path);

        if(path) {
            setGamePath(path);
            setIsModalOpen(true);
        }
    }

    return(
        <div className="flex flex-col h-full w-[70%] bg-[#FAFAF7]">
            <div className="flex items-center justify-between w-full px-4 py-3
             bg-[#FDFDFB] shadow-md">
                <p className="text-[#173404] text-lg">
                    Library
                </p>
                <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1 text-sm rounded-md"
                onClick={handleAddGame}
                >
                    Add Game
                </button>
            </div>
            <div className="flex-1 min-h-0">
                {isModalOpen && <Modal gamePath={gamePath} games={games} setGames={setGames} setIsModalOpen={setIsModalOpen} />}

                {games.length > 0 
                ? (
                    <div className="flex flex-wrap gap-4 p-4">
                        {games.map(game => (
                            <GameCard key={game.id} item={game} onClick={() => setSelectedGame(game)} />
                        ))}
                    </div>
                )
                : <EmptyLibrary />
                }
            </div>
        </div>
    )
}