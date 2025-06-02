'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import AuthHeader from './AuthHeader';
import { useAuth } from './../hooks/useAuth';
import { usePathname } from 'next/navigation';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAdmin, isAuthenticated } = useAuth();
  const pathname = usePathname();

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
    { href: '/palpites/historico', label: 'Meus Palpites' },
    { href: '/historico', label: 'Ranking' },
    { href: '/ultimo-evento', label: 'Último Evento' },
    { href: '/live-timing', label: 'Live Timing', isExperimental: true },
    { href: '/equipes', label: 'Equipes' },
  ];

  // Adicionar menu Administração apenas se o usuário for ADMIN
  const menuItems = isAuthenticated && isAdmin 
    ? [...baseMenuItems, { href: '/admin', label: 'Administração' }]
    : baseMenuItems;

  return (
    <header className="bg-f1-red relative z-50 shadow-md">
      <nav className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-2xl font-bold text-black hover:text-red-700 transition-colors z-40 relative">
          F1 Bolão
        </Link>
        
        {/* Menu Hambúrguer para Mobile */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden z-40 relative text-black hover:text-red-700 transition-colors"
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
          className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity lg:hidden z-20 ${
            isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsMenuOpen(false)}
        />
        
        <div
          className={`fixed inset-y-0 right-0 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden z-30 ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200">
              <AuthHeader />
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-6 py-3 text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-red-50 text-f1-red border-r-4 border-f1-red' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-f1-red hover:pl-8'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.isExperimental && (
                      <span className="ml-2 text-xs bg-yellow-500 text-black px-2 py-1 rounded-full font-bold">
                        BETA
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Menu Desktop */}
        <div className="hidden lg:flex items-center gap-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                  isActive 
                    ? 'bg-red-700 text-white shadow-sm' 
                    : 'text-black hover:bg-red-700/10'
                }`}
              >
                <span>{item.label}</span>
                {item.isExperimental && (
                  <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full font-bold">
                    BETA
                  </span>
                )}
              </Link>
            );
          })}
          <div className="ml-4 pl-4 border-l border-red-700/20">
            <AuthHeader />
          </div>
        </div>
      </nav>
    </header>
  );
} 