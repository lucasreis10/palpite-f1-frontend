'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from './../services/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  fallback 
}: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      console.log('[ProtectedRoute] Verificando autenticação...');
      
      // Aguardar um pouco para garantir que o localStorage foi carregado
      setTimeout(() => {
        const isAuthenticated = authService.isAuthenticated();
        console.log('[ProtectedRoute] isAuthenticated:', isAuthenticated);
        
        if (!isAuthenticated) {
          console.log('[ProtectedRoute] Não autenticado, redirecionando para /login');
          router.push('/login');
          return;
        }

        if (requireAdmin && !authService.isAdmin()) {
          console.log('[ProtectedRoute] Não é admin, redirecionando para /');
          router.push('/'); // Redirecionar para home se não for admin
          return;
        }

        console.log('[ProtectedRoute] Autorizado!');
        setIsAuthorized(true);
        setIsLoading(false);
      }, 100);
    };

    checkAuth();
  }, [router, requireAdmin]);

  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando autenticação...</p>
          </div>
        </div>
      )
    );
  }

  if (!isAuthorized) {
    return null; // O redirecionamento já foi feito
  }

  return <>{children}</>;
} 