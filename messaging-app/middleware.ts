
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const token = await request.cookies.get('access_token')?.value;
    console.log('Token en middleware:', token)
    
    const { pathname } = new URL(request.url);

    // Rutas públicas
    const publicRoutes = ['/', '/register'];
    // Rutas protegidas
    const protectedRoutes = ['/home'];

    if (token && publicRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL('/home', request.url));
    }

    if (!token && protectedRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}