import { NextResponse } from 'next/server';
import { VARS } from '@/app/utils/env';
import { cookies } from 'next/headers';

export async function GET() {
    const token = (await cookies()).get("access_token")?.value;
    if (!token) {
        return NextResponse.json(
            { error: 'Token no encontrado' },
            { status: 401 }
        );
    }

    const response = await fetch(VARS.API_URL+'users/validate_token', {
        headers: {"Authorization": "Bearer "+ token}
    })
    
    if (response.status==401){
        return NextResponse.json(
            { error: 'Token Invalido' },
            { status: 401 }
        );
    }else if (!response.ok){
        return NextResponse.json(
            { error: 'Intente nuevamente' },
            { status: 400 }
        );
    }
    
    const data = await response.json()
    
    
    return NextResponse.json(data);;
}
