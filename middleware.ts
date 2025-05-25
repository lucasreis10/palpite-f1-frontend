import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que precisam de autenticação
const protectedRoutes = [
  '/palpites',
  '/admin',
];

// Rotas que usuários logados não devem acessar (redirecionam para home)
const authRoutes = [
  '/login',
  '/register',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verificar se há token de autenticação no cookie
  const authCookie = request.cookies.get('auth_token');
  const hasToken = !!authCookie?.value;
  
  // Para rotas de autenticação, redirecionar se já estiver logado
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (hasToken) {
      const redirectParam = request.nextUrl.searchParams.get('redirect');
      const redirectUrl = redirectParam || '/';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  // Para rotas protegidas, deixar o componente ProtectedRoute lidar com a verificação
  // Isso é melhor porque o middleware não tem acesso ao localStorage

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 