'use client';
import { useState, useEffect, useRef } from 'react';
import { ChatsBar } from './components/chatsBar';
import { ChatMessage,WebSocketMessage } from '@/types/chat';
import { Chat } from './components/chat';
import { useUser } from '@/providers/UserContext';
import Loader from './components/loader';
import { VARS } from '../utils/env';
import { SideBar } from './components/sidebar';

export default function HomeComponent() {
    const [recipient, setRecipient] = useState<string>("");
    const [messageInput, setMessageInput] = useState('');
    const [users, setUsers] = useState<string[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [showChat, setShowChat] = useState(false);
    const ws = useRef<WebSocket | null>(null);
    const recipientRef = useRef<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const {user} = useUser()

    useEffect(() => {
        recipientRef.current = recipient;
    }, [recipient]);

    useEffect(() => {
        const scrollToBottom = () => {
            messagesEndRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        };
        
        scrollToBottom();
        // Agrega event listener para resize (teclado móvil)
        window.addEventListener('resize', scrollToBottom);
        return () => window.removeEventListener('resize', scrollToBottom);
    }, [messages]);

    useEffect(()=>{
        setUpWS()
    },[user])

    const setUpWS = () => {
        if (!user?.username) return;
        
        ws.current = new WebSocket(`${VARS.WS_URL || 'localhost:8000'}/ws`);

        ws.current.onopen = () => {
            ws.current?.send(user.ws_token);
        };

        ws.current.onclose = (e:CloseEvent) =>{
            console.log(e)
        }

        ws.current.onmessage = (event) => {
            const data: WebSocketMessage = JSON.parse(event.data);
            
            switch (data.type) {
                case 'user_list':
                    if (data.users) {
                        setUsers(data.users.filter(u => u !== user.username));
                    }
                    break;
                
                case 'message':
                    if (data.sender && data.content && data.date && data.sender === recipientRef.current) {
                        setMessages(prev => [...prev, { sender: data.sender!, content: data.content!, date: data.date!}]);
                    }
                    break;
                
                case 'alert':
                    alert(data.content);
                    break;
                
                case 'chat_response':
                    if (data.content) {
                        console.log(data.content)
                        const chatHistory = data.content.map((msg: any) => ({
                            sender: msg.sender,
                            content: msg.content,
                            date: msg.date
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
            username: user?.username,
            recipient: r,
            type: "fetch_chat"
        }));
    };

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.username) return;

        if (!messageInput || !recipient || !ws.current) return;
    
        const messageData = {
            username: user?.username,
            recipient: recipient,
            content: messageInput,
            type: "send_message"
        };

        ws.current.send(JSON.stringify(messageData));
        setMessages(prev => [...prev, { sender: user.username, content: messageInput, date: new Date().toLocaleTimeString([], {hour: '2-digit',minute: '2-digit',second: '2-digit'}).toUpperCase().replace(".","")}]);
        setMessageInput('');
    };
    if (!user?.username) return <Loader />;
    return (
        <div className='flex w-full bg-gray-800 h-[100dvh] relative'>
            <SideBar 
                userLetter={user.username.charAt(0)}
                showChat={showChat}
            />
            <ChatsBar 
                showChat={showChat}
                users={users}
                selectChat={selectChat}
                recipient={recipient}
            />
            <Chat 
                setShowChat={setShowChat}
                recipient={recipient}
                messages={messages}
                username={user.username}
                messageInput={messageInput}
                setMessageInput={setMessageInput}
                sendMessage={sendMessage}
                messagesEndRef={messagesEndRef}
                showChat={showChat}
            />
        </div>
    );
}