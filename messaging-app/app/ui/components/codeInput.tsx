'use client'

import { useState, useEffect, useRef, KeyboardEvent } from 'react';

interface VerificationCodeInputProps {
    onCodeChange: (code: string) => void;
}

const VerificationCodeInput = ({ onCodeChange }: VerificationCodeInputProps) => {
    const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
    const inputsRef = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

    useEffect(() => {
        onCodeChange(digits.join(''));
    }, [digits,onCodeChange]);

    const handleChange = (index: number, value: string) => {
        if (/^\d*$/.test(value)) { // Solo permitir números
            const newDigits = [...digits];
            newDigits[index] = value;
            setDigits(newDigits);

            // Auto-focus al siguiente input
            if (value && index < 5) {
                inputsRef.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            // Mover al input anterior al borrar
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        const newDigits = [...digits];
        
        pastedData.split('').forEach((char, i) => {
            if (i < 6 && /^\d+$/.test(char)) {
                newDigits[i] = char;
            }
        });
        
        setDigits(newDigits);
        inputsRef.current[Math.min(pastedData.length - 1, 5)]?.focus();
    };

    return (
        <div className="flex gap-1 justify-center">
        {digits.map((digit, index) => (
            <input
            key={index}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            ref={(el) => {
                inputsRef.current[index] = el;
            }}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="w-12 h-12 text-center border-2 border-gray-700 rounded-lg
                        focus:border-orange-500 outline-none transition-all
                        [&::-webkit-inner-spin-button]:appearance-none
                        [&::-webkit-outer-spin-button]:appearance-none"
            autoFocus={index === 0}
            />
        ))}
        </div>
    );
};

export default VerificationCodeInput;