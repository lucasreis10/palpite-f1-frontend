'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from './../hooks/useAuth';

export default function AuthHeader() {
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showDropdown && !target.closest('[data-auth-dropdown]')) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <Link
          href="/login"
          className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          Entrar
        </Link>
        <Link
          href="/register"
          className="bg-red-600 text-black px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          Criar conta
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" data-auth-dropdown>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 transition-colors"
      >
        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="hidden md:block text-left max-w-48">
          <p className="font-medium truncate">{user.name}</p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="font-medium text-gray-900 truncate">{user.name}</p>
            <p className="text-sm text-gray-500 break-all">{user.email}</p>
            {user.role === 'ADMIN' && (
              <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                Admin
              </span>
            )}
          </div>
          
          <Link
            href="/perfil"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => setShowDropdown(false)}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Meu Perfil
            </div>
          </Link>

          <Link
            href="/configuracoes"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => setShowDropdown(false)}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configurações
            </div>
          </Link>
          
          <div className="border-t border-gray-100 mt-2 pt-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 