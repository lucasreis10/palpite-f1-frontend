'use client'

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import AuthHeader from './AuthHeader';
import { useAuth } from './../hooks/useAuth';
import { usePathname } from 'next/navigation';

interface DropdownItemProps {
  href: string;
  label: string;
  isExperimental?: boolean;
  description?: string;
}

interface DropdownProps {
  label: string;
  items: DropdownItemProps[];
  isActive: boolean;
}

function Dropdown({ label, items, isActive }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    const id = setTimeout(() => setIsOpen(false), 150);
    setTimeoutId(id);
  };

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return (
    <div 
      ref={dropdownRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-1 ${
          isActive 
            ? 'bg-red-700 text-white shadow-sm' 
            : 'text-black hover:bg-red-700/10'
        }`}
      >
        <span>{label}</span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {items.map((item) => {
            const isItemActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-3 text-sm transition-colors ${
                  isItemActive 
                    ? 'bg-red-50 text-f1-red border-r-4 border-f1-red' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.label}</span>
                      {item.isExperimental && (
                        <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full font-bold">
                          BETA
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
  }, [pathname]);

  // Menu items organizados por categoria
  const palpitesItems = [
    { href: '/palpites', label: 'Fazer Palpite', description: 'Criar novos palpites para GPs' },
    { href: '/palpites/historico', label: 'Meus Palpites', description: 'Ver histórico de palpites' },
  ];

  const analiseItems = [
    { href: '/historico', label: 'Ranking', description: 'Classificação geral dos participantes' },
    { href: '/ultimo-evento', label: 'Último Evento', description: 'Resultados do GP mais recente' },
    { href: '/calculadora-pontos', label: 'Calculadora', description: 'Simule pontuações de palpites' },
  ];

  const tempoRealItems = [
    { href: '/live-timing', label: 'Live Timing', description: 'Acompanhe corridas ao vivo', isExperimental: true },
  ];

  const outrosItems = [
    { href: '/equipes', label: 'Equipes', description: 'Informações sobre as equipes' },
  ];

  // Menu items para mobile (lista simples)
  const mobileMenuItems = [
    { href: '/', label: 'Tela Inicial' },
    { href: '/palpites', label: 'Fazer Palpite' },
    { href: '/palpites/historico', label: 'Meus Palpites' },
    { href: '/historico', label: 'Ranking' },
    { href: '/ultimo-evento', label: 'Último Evento' },
    { href: '/calculadora-pontos', label: 'Calculadora' },
    { href: '/live-timing', label: 'Live Timing', isExperimental: true },
    { href: '/equipes', label: 'Equipes' },
    ...(isAuthenticated && isAdmin ? [{ href: '/admin', label: 'Administração' }] : []),
  ];

  // Verificar se algum item de uma categoria está ativo
  const isPalpitesActive = palpitesItems.some(item => pathname === item.href);
  const isAnaliseActive = analiseItems.some(item => pathname === item.href);
  const isTempoRealActive = tempoRealItems.some(item => pathname === item.href);
  const isOutrosActive = outrosItems.some(item => pathname === item.href);

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
              {mobileMenuItems.map((item) => {
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

        {/* Menu Desktop Reorganizado */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Tela Inicial - link direto */}
          <Link
            href="/"
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              pathname === '/' 
                ? 'bg-red-700 text-white shadow-sm' 
                : 'text-black hover:bg-red-700/10'
            }`}
          >
            Inicio
          </Link>

          {/* Palpites - dropdown */}
          <Dropdown 
            label="Palpites" 
            items={palpitesItems} 
            isActive={isPalpitesActive}
          />

          {/* Análise - dropdown */}
          <Dropdown 
            label="Análise" 
            items={analiseItems} 
            isActive={isAnaliseActive}
          />

          {/* Tempo Real - dropdown */}
          <Dropdown 
            label="Tempo Real" 
            items={tempoRealItems} 
            isActive={isTempoRealActive}
          />

          {/* Outros - dropdown */}
          <Dropdown 
            label="Outros" 
            items={outrosItems} 
            isActive={isOutrosActive}
          />

          {/* Administração - link direto (apenas para admins) */}
          {isAuthenticated && isAdmin && (
            <Link
              href="/admin"
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                pathname === '/admin' 
                  ? 'bg-red-700 text-white shadow-sm' 
                  : 'text-black hover:bg-red-700/10'
              }`}
            >
              Admin
            </Link>
          )}

          <div className="ml-4 pl-4 border-l border-red-700/20">
            <AuthHeader />
          </div>
        </div>
      </nav>
    </header>
  );
} 