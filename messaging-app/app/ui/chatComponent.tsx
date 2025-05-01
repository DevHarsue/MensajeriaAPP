'use client';
import { useState, useEffect, useRef } from 'react';

interface WebSocketMessage {
    type: string;
    users?: string[];
    content?: any;
    sender?: string;
}

interface ChatMessage {
    sender: string;
    content: string;
}

export default function ChatComponent() {
    const [username, setUsername] = useState('');
    const [recipient, setRecipient] = useState<string | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [users, setUsers] = useState<string[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [showChat, setShowChat] = useState(false);
    const [showUsers, setShowUsers] = useState(false);
    const ws = useRef<WebSocket | null>(null);
    const recipientRef = useRef<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        recipientRef.current = recipient;
    }, [recipient]);

    // Auto-scroll al recibir nuevos mensajes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const setUpWS = () => {
        if (!username) return;

        const formattedUsername = username.toUpperCase();
        localStorage.setItem('user', formattedUsername);
        
        ws.current = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL || 'localhost:8000'}/ws`);

        ws.current.onopen = () => {
            ws.current?.send(formattedUsername);
            setShowUsers(true);
        };

        ws.current.onmessage = (event) => {
            const data: WebSocketMessage = JSON.parse(event.data);
            
            switch (data.type) {
                case 'user_list':
                    if (data.users) {
                        setUsers(data.users.filter(u => u !== formattedUsername));
                    }
                    break;
                
                case 'message':
                    if (data.sender && data.content && data.sender === recipientRef.current) {
                        setMessages(prev => [...prev, { sender: data.sender!, content: data.content! }]);
                    }
                    break;
                
                case 'alert':
                    setShowUsers(false);
                    alert(data.content);
                    break;
                
                case 'chat_response':
                    if (data.content) {
                        const chatHistory = data.content.map((msg: any) => ({
                            sender: msg.sender,
                            content: msg.content
                        }));
                        setMessages(chatHistory);
                    }
                    break;
            }
        };
    };

    const selectChat = (r: string) => {
        setRecipient(r);
        setShowChat(true);
        setMessages([]);
        ws.current?.send(JSON.stringify({
            username: username,
            recipient: r,
            type: "fetch_chat"
        }));
    };

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput || !recipient || !ws.current) return;

        const messageData = {
            username: username,
            recipient: recipient,
            content: messageInput,
            type: "send_message"
        };

        ws.current.send(JSON.stringify(messageData));
        setMessages(prev => [...prev, { sender: username, content: messageInput }]);
        setMessageInput('');
    };

    return (
        <div>
            <section
                className={`${
                    showChat ? 'hidden md:flex' : 'flex'
                } flex-col w-full md:w-1/3 lg:w-1/4 bg-gray-900 border-r border-gray-700`}
            >
                {/* Header del sidebar */}
                <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-gray-200">
                        Chats
                    </h1>
                    <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-medium">
                        {username.charAt(0)}
                    </div>
                </div>
    
                {/* Lista de usuarios */}
                <div className="overflow-y-auto flex-1">
                    <ul>
                        {users.map((user) => (
                            <li
                                key={user}
                                className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors ${
                                    recipient === user ? 'bg-orange-700' : ''
                                }`}
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
            <section className="flex flex-col w-full md:w-2/3 lg:w-3/4 bg-gray-900">
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
                    className="flex-1 p-4 overflow-y-auto bg-gray-900 bg-opacity-90"
                    style={{
                        backgroundImage:
                            "url('data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E')",
                    }}
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
                                        {new Date().toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
    
                {/* Message Input */}
                <div className="p-4 bg-gray-800 border-t border-gray-700">
                    <form onSubmit={sendMessage} className="flex items-center gap-2">
                        <input
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
        </div>
    );
}