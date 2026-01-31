import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const currentUser = request.cookies.get('user_email')?.value;
    const currentRole = request.cookies.get('user_role')?.value;

    // Paths requiring Login
    const protectedPaths = ['/portfolio', '/create-poster', '/poster-editor'];
    const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

    if (isProtectedPath) {
        if (!currentUser) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Paths requiring Teacher Role
    if (request.nextUrl.pathname.startsWith('/teacher')) {
        if (!currentUser) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        if (currentRole !== 'teacher') {
            // Redirect students attempting to access teacher dashboard back to portfolio
            return NextResponse.redirect(new URL('/portfolio', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
