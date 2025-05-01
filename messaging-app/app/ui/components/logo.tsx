import Image from "next/image"


export const Logo = () => { 
    return (
            <div className="w-16 h-16 rounded-full bg-orange-600 flex items-center justify-center text-white text-2xl font-bold">
                <Image src="/favicon.ico" alt="alt" width={200} height={200} className="rounded-full"/>
            </div>
    )
};