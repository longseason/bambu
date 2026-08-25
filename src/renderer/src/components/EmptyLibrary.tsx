import bao from '../assets/bao.png'

export default function EmptyLibrary() {
    return(
        <div className="flex h-full flex-col items-center justify-start pt-32 gap-3 text-center">
            <img src={bao} className="w-32 h-32 object-contain mb-2" />
            <p className="text-2xl font-semibold text-[#173404]">
                No bamboo in sight...
            </p>
            <p className="text-base text-[#5F5E5A]">
                Add your game with the top button and follow the steps!
            </p>
            <p className="text-base text-[#5F5E5A] italic">
                "I only get paid in bamboo, you know?" - Bao
            </p>
        </div>
    )
}