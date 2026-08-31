export default function GameCard({ name, cover, onClick }) {
    return (
        <div onClick={onClick} className="flex flex-col items-center gap-2 cursor-pointer w-32">
            <img src={cover} alt={name} className="w-32 aspect-2/3 object-cover rounded bg-neutral-100" />
            <p className="text-sm text-neutral-900 truncate w-full text-center">{name}</p>
        </div>
    )
}