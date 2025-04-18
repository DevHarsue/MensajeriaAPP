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
    useEffect(() => {
        recipientRef.current = recipient;
        console.log("useEffect")
    }, [recipient]);

    const setUpWS = () => {
        if (!username) return;

        const formattedUsername = username.toUpperCase();
        localStorage.setItem('user', formattedUsername);
        
        ws.current = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL || '192.168.1.37:8000'}/ws`);

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
            {/* Connect Form */}
            {!showUsers && (
                <div id="container_connect">
                    <input 
                        type="text" 
                        id="username" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toUpperCase())}
                        placeholder="Username"
                    />
                    <button onClick={setUpWS}>Connect</button>
                </div>
            )}

            {/* Users List */}
            {showUsers && (
                <div id="chats_users">
                    <h2>Users</h2>
                    <ul>
                        {users.map((user) => (
                        <li key={user} onClick={() => selectChat(user)}>
                            {user}
                        </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Chat Container */}
            {showChat && recipient && (
                <div id="chat">
                    <h2>Chat with {recipient}</h2>
                    <div id="messages">
                        {messages.map((msg, index) => (
                            <p 
                                key={index} 
                                style={{ textAlign: msg.sender === username ? 'right' : 'left' }}
                            >
                                {msg.content}
                            </p>
                        ))}
                    </div>
                    <form onSubmit={sendMessage}>
                        <input
                            type="text"
                            id="message"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            placeholder="Message"
                        />
                        <button type="submit">Send</button>
                    </form>
                </div>
            )}
        </div>
    );
}