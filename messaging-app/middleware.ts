
import { NextResponse, type NextRequest } from 'next/server';


export function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;
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