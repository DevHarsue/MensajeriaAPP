export interface WebSocketMessage {
    type: string;
    users?: string[];
    content?: any;
    sender?: string;
}

export interface ChatMessage {
    sender: string;
    content: string;
}
