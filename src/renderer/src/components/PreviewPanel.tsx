export default function PreviewPanel({ selectedGame }) {
    if(!selectedGame) {
        return <div className="flex-1" />
    }

    const launchGame = () => {
        window.api.launchGame(selectedGame.exePath)
    }
    return(
        <div className="flex-1 flex flex-col items-center justify-start pt-12 gap-3 bg-neutral-900
            shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.3)]">
            <img src={selectedGame.cover} className="w-48 aspect-2/3 object-cover rounded" />
            <p className="text-lg font-semibold text-white">{selectedGame.name}</p>
            <button onClick={launchGame} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-4 py-2">
                Launch game
            </button>
        </div>
    )
}