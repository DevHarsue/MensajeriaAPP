'use client';
import { useState, useEffect, useRef } from 'react';
import { SideBar } from './components/sidebar';
import { ChatMessage,WebSocketMessage } from '@/types/chat';
import { Chat } from './components/chat';

export default function ChatComponent() {
    const [username, setUsername] = useState('');
    const [recipient, setRecipient] = useState<string>("");
    const [messageInput, setMessageInput] = useState('');
    const [users, setUsers] = useState<string[]>(["Epa","pepito"]);
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
        <div className='flex w-full bg-gray-800'>
            <SideBar 
                showChat={showChat}
                userLetter={username.charAt(0)}
                users={users}
                selectChat={selectChat}
                recipient={recipient}
            />
            <Chat 
                setShowChat={setShowChat}
                recipient={recipient}
                messages={messages}
                username={username}
                messageInput={messageInput}
                setMessageInput={setMessageInput}
                sendMessage={sendMessage}
                messagesEndRef={messagesEndRef}
                showChat={showChat}
            />
        </div>
    );
}