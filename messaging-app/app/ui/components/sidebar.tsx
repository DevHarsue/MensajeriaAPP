import { useUser } from "@/providers/UserContext"
import { useRouter } from "next/navigation"

interface SideBarProps{
    userLetter: string
    showChat: boolean
}

export function SideBar({userLetter,showChat}:SideBarProps){
    const {setUser} = useUser()
    const Router = useRouter()
    const CloseSession = async ()=>{
        if (!confirm("¿Desea Cerrar Sesion?")) return;
        setUser(null)
        await fetch("api/logout",{method:"POST"})
        Router.push("/")
    }
    return (
        <section className={`${showChat ? 'hidden md:flex' : 'flex'} bg-gray-800 w-min border-b border-r border-gray-700 p-2 flex-col justify-between`}>
            <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-medium select-none">
                    {userLetter}
            </div>
            <button
                type="button"
                className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                onClick={CloseSession}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.586 9l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 9H7a1 1 0 100 2h6.586z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>
        </section>
    )
}