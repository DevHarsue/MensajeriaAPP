export interface WebSocketMessage {
    type: string;
    users?: string[];
    content?: any;
    sender?: string;
    date?: string;
}

export interface ChatMessage {
    sender: string;
    content: string;
    date: string;
}
