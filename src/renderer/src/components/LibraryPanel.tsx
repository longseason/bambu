import EmptyLibrary from "./EmptyLibrary"

export default function LibraryPanel() {
    const handleAddGame = async () => {
        const path = await window.api.pickExecutable()
        console.log(path)
    }

    return(
        <div className="flex flex-col h-full w-[70%] bg-[#FAFAF7]">
            <div className="flex items-center justify-between w-full px-4 py-3
             bg-[#FDFDFB] shadow-md">
                <p className="text-[#173404] text-lg">
                    Library
                </p>
                <button className="bg-transparent border border-[#173404] text-[#173404] px-4 py-1 text-sm rounded-md"
                onClick={handleAddGame}
                >
                    Add Game
                </button>
            </div>
            <div className="flex-1">
                <EmptyLibrary />
            </div>
        </div>
    )
}