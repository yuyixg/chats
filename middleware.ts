import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let sessionId = request.cookies.get('sessionId')?.value;
  if (sessionId) {
    return NextResponse.next();
  } else {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
