

export default function Modal({gamePath}) {
    return(
        <div className="flex justify-center items-center h-full w-full bg-neutral-800/80 fixed inset-0">
            <div className="bg-white rounded-lg p-6 w-96 flex flex-col gap-4">
                <p className="text-neutral-500 text-sm truncate">{gamePath}</p>
                <input type="text" placeholder="Enter game name"
                className="bg-neutral-100 text-neutral-900 rounded px-3 py-2 outline-none focus:ring-1 focus:ring-neutral-400" />
                <button className="self-start bg-neutral-200 hover:bg-neutral-300 text-neutral-900 text-sm rounded px-3 py-1">
                    Confirm game?
                </button>
                <img src="" alt="game preview"
                className="w-full aspect-[2/3] object-cover rounded bg-neutral-100"
                />
                <button className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-3 py-2">
                    Add game to library
                </button>
            </div>
        </div>
    )
}