import { NextResponse } from 'next/server';
import { VARS } from '@/app/utils/env';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();
        
        const apiResponse = await fetch(VARS.API_URL+"token",{
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `username=${username}&password=${password}`
        })

        const data = await apiResponse.json();

        if (!apiResponse.ok) {
            return NextResponse.json(
                { error: data.message || 'Error de autenticación' },
                { status: apiResponse.status }
            );
        }

        const response = NextResponse.json(
            { message: 'Login exitoso' },
            { status: 200 }
        );

        response.cookies.set({
            name: 'access_token',
            value: data.access_token,
            httpOnly: true,
            secure: VARS.ENV === 'production',
            sameSite: VARS.ENV=="production" ? "none" : "lax",
            path: '/',
            maxAge: 86400*7
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}