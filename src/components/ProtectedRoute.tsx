'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './../hooks/useAuth';

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
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  useEffect(() => {
    // Aguardar o carregamento da autenticação
    if (isLoading) {
      return;
    }

    console.log('[ProtectedRoute] Verificando autenticação...', {
      isAuthenticated,
      isAdmin,
      requireAdmin
    });
    
    if (!isAuthenticated) {
      console.log('[ProtectedRoute] Não autenticado, redirecionando para /login');
      router.push('/login');
      return;
    }

    if (requireAdmin && !isAdmin) {
      console.log('[ProtectedRoute] Não é admin, redirecionando para /');
      router.push('/'); // Redirecionar para home se não for admin
      return;
    }

    console.log('[ProtectedRoute] Autorizado!');
    setIsAuthorized(true);
  }, [router, requireAdmin, isAuthenticated, isAdmin, isLoading]);

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