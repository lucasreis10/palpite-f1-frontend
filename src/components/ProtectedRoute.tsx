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
      // Aguardar um pouco para garantir que o localStorage foi carregado
      setTimeout(() => {
        const isAuthenticated = authService.isAuthenticated();
        
        if (!isAuthenticated) {
          router.push('/login');
          return;
        }

        if (requireAdmin && !authService.isAdmin()) {
          router.push('/'); // Redirecionar para home se não for admin
          return;
        }

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