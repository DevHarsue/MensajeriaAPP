"use client";

import { useEffect } from 'react';

type NotificationProps = {
    message: string;
    type?: 'success' | 'error' | 'info';
    onClose: () => void;
};

export default function Notification({ message, type = 'info', onClose }: NotificationProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const colors = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        info: 'bg-orange-600'
    };

    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className={`${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-4 transition-transform duration-300 transform translate-x-0`}>
            <span>{message}</span>
            <button onClick={onClose} className="hover:text-gray-200 cursor-pointer">
                ×
            </button>
        </div>
        </div>
    );
}