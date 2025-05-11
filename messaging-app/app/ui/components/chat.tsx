import { ChatMessage } from "@/types/chat";
import { Ref } from "react";

interface ChatProps{
    setShowChat: React.Dispatch<React.SetStateAction<boolean>>;
    recipient: string
    messages: ChatMessage[]
    username: string
    messageInput: string
    setMessageInput: React.Dispatch<React.SetStateAction<string>>;
    sendMessage: (e:React.FormEvent) => void
    messagesEndRef: Ref<HTMLDivElement>
    showChat: boolean
}

export const Chat = (
        {
            setShowChat,
            recipient,
            messages,
            username,
            messageInput,
            setMessageInput,
            sendMessage,
            messagesEndRef,
            showChat
        }:ChatProps
    ) => {  
    return (
        <section className={`${showChat ? 'flex' : 'hidden'} flex-col w-full md:w-2/3 lg:w-3/4 bg-gray-900 h-[100dvh] fixed md:relative inset-0`}>
            {/* Chat Header */}
            <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center">
                <button
                    onClick={() => setShowChat(false)}
                    className="md:hidden mr-3 p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                    {/* Icono de cerrar chat */}
                        <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-orange-600 font-medium">
                    {recipient?.charAt(0)}
                </div>
                <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-200">{recipient}</p>
                    <p className="text-xs text-gray-400">En línea</p>
                </div>
            </div>

            {/* Messages Area */}
            <div
                className="flex-1 p-4 overflow-y-auto bg-gray-900 bg-opacity-90 max-h-full"
            >
                <div className="space-y-3">
                    {messages.map((msg, index) => (
                        
                        <div
                            key={index}
                            className={`flex ${
                                msg.sender === username ? 'justify-end' : 'justify-start'
                            }`}
                        >
                            {/* Avatar del usuario */}
                            <div
                                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                                    msg.sender === username
                                        ? 'bg-orange-600 text-white rounded-br-none'
                                        : 'bg-gray-800 text-gray-200 rounded-bl-none'
                                }`}
                            >
                                <p className="text-sm">{msg.content}</p>
                                <p
                                    className={`text-xs mt-1 text-right ${
                                        msg.sender === username ? 'text-orange-200' : 'text-gray-400'
                                    }`}
                                >
                                    {msg.date}
                                </p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Message Input */}
            <div className="sticky bottom-0 p-4 bg-gray-800 border-t border-gray-700 z-10">
                <form onSubmit={sendMessage} className="flex items-center gap-2" autoComplete="off">
                    <input
                        name="inputMessageToSend"
                        autoComplete="off"
                        type="text"
                        id="message"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 px-4 py-3 bg-gray-700 text-gray-200 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                    <button
                        type="submit"
                        className="p-3 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!messageInput}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </form>
            </div>
        </section>
    )
};