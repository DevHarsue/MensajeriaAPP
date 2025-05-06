interface ChatsBarProps{
    showChat: boolean
    users: string[]
    selectChat: (recipient:string)=>void
    recipient: string
}

export const ChatsBar = ({showChat,users,selectChat,recipient}:ChatsBarProps) => { 
    return (
        <section
            className={`${showChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-1/3 lg:w-1/4 bg-gray-900 border-r border-gray-700`}
        >
            {/* Header del sidebar */}
            <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-200">
                    Chats
                </h1>
            </div>

            {/* Lista de usuarios */}
            <div className="overflow-y-auto flex-1">
                <ul>
                    {users.map((user) => (
                        <li
                            key={user}
                            className={`p-4 border-b border-gray-700 cursor-pointer  transition-colors duration-500 ${recipient === user ? 'bg-orange-700 hover:bg-orange-600' : 'hover:bg-gray-800'} `}
                            onClick={() => selectChat(user)}
                        >
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-orange-600 font-medium">
                                    {user.charAt(0)}
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-200">{user}</p>
                                    <p className="text-xs text-gray-400">
                                        Online
                                    </p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};