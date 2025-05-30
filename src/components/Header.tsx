'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import AuthHeader from './AuthHeader';
import { useAuth } from './../hooks/useAuth';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAdmin, isAuthenticated } = useAuth();

  // Fechar menu com tecla Escape e controlar scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll do body quando menu estiver aberto
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Fechar menu quando a rota mudar
  useEffect(() => {
    setIsMenuOpen(false);
  }, []);

  const baseMenuItems = [
    { href: '/', label: 'Tela Inicial' },
    { href: '/palpites', label: 'Fazer Palpite' },
    { href: '/historico', label: 'Ranking' },
    { href: '/ultimo-evento', label: 'Último Evento' },
    { href: '/equipes', label: 'Equipes' },
  ];

  // Adicionar menu Administração apenas se o usuário for ADMIN
  const menuItems = isAuthenticated && isAdmin 
    ? [...baseMenuItems, { href: '/admin', label: 'Administração' }]
    : baseMenuItems;

  return (
    <header className="bg-f1-red relative">
      <nav className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-2xl font-bold text-black hover:text-red-500 transition-colors z-40 relative">
          F1 Bolão
        </Link>
        
        {/* Menu Hambúrguer para Mobile */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden z-40 relative text-black hover:text-red-500 transition-colors"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <XMarkIcon className="h-8 w-8" />
          ) : (
            <Bars3Icon className="h-8 w-8" />
          )}
        </button>

        {/* Menu Mobile */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity lg:hidden z-20 ${
            isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsMenuOpen(false)}
        />
        
        <div
          className={`fixed inset-y-0 right-0 w-64 bg-white shadow-xl transform transition-transform lg:hidden z-30 ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col gap-2 p-4 mt-16">
            <div className="mb-4 pb-4 border-b border-gray-200">
              <AuthHeader />
            </div>
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-black hover:text-f1-red transition-colors py-2 px-4 rounded-md hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Menu Desktop */}
        <div className="hidden lg:flex items-center gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-black hover:text-red-500 transition-colors font-medium"
            >
              {item.label}
            </Link>
          ))}
          <div className="ml-4">
            <AuthHeader />
          </div>
        </div>
      </nav>
    </header>
  );
} 