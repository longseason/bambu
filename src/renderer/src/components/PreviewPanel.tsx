export default function PreviewPanel({ selectedGame }) {
    if(!selectedGame) {
        return <div className="flex-1" />
    }

    const launchGame = () => {
        window.api.launchGame(selectedGame.exePath)
    }
    return(
        <div className="flex-1 flex flex-col items-center justify-start pt-12 gap-3 bg-neutral-900">
            <img src={selectedGame.cover} className="h-48 w-48 rounded-lg aspect-2/3 object-cover" />
            <p className="text-lg font-semibold text-white">{selectedGame.name}</p>
            <button onClick={launchGame} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-4 py-2">
                Launch game
            </button>
        </div>
    )
}