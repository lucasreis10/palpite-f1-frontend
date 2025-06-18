'use client'

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Bars3Icon, 
  XMarkIcon, 
  ChevronDownIcon,
  HomeIcon,
  DocumentTextIcon,
  ClockIcon,
  ChartBarIcon,
  TrophyIcon,
  CalculatorIcon,
  PlayIcon,
  UserGroupIcon,
  CogIcon,
  StarIcon
} from '@heroicons/react/24/outline';
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

interface MobileMenuItemProps {
  href: string;
  label: string;
  icon: React.ElementType;
  isExperimental?: boolean;
  category?: string;
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
    { href: '/meu-dashboard', label: 'Meu Dashboard', description: 'Estatísticas pessoais avançadas' },
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

  // Menu items organizados para mobile com ícones e categorias
  const mobileMenuCategories = [
    {
      title: 'Principal',
      items: [
        { href: '/', label: 'Tela Inicial', icon: HomeIcon },
      ]
    },
    {
      title: 'Palpites',
      items: [
        { href: '/palpites', label: 'Fazer Palpite', icon: DocumentTextIcon },
        { href: '/palpites/historico', label: 'Meus Palpites', icon: ClockIcon },
      ]
    },
    {
      title: 'Análise',
      items: [
        { href: '/meu-dashboard', label: 'Meu Dashboard', icon: ChartBarIcon },
        { href: '/historico', label: 'Ranking', icon: TrophyIcon },
        { href: '/ultimo-evento', label: 'Último Evento', icon: StarIcon },
        { href: '/calculadora-pontos', label: 'Calculadora', icon: CalculatorIcon },
      ]
    },
    {
      title: 'Tempo Real',
      items: [
        { href: '/live-timing', label: 'Live Timing', icon: PlayIcon, isExperimental: true },
      ]
    },
    {
      title: 'Outros',
      items: [
        { href: '/equipes', label: 'Equipes', icon: UserGroupIcon },
      ]
    },
    ...(isAuthenticated && isAdmin ? [{
      title: 'Administração',
      items: [
        { href: '/admin', label: 'Administração', icon: CogIcon },
      ]
    }] : []),
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
          className="lg:hidden z-50 relative text-black hover:text-red-700 transition-colors p-2 rounded-lg hover:bg-black/10"
          aria-label="Toggle menu"
        >
          <div className="relative w-6 h-6">
            <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isMenuOpen ? 'rotate-45 opacity-0' : 'rotate-0 opacity-100'}`}>
              <Bars3Icon className="h-6 w-6" />
            </span>
            <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isMenuOpen ? 'rotate-0 opacity-100' : 'rotate-45 opacity-0'}`}>
              <XMarkIcon className="h-6 w-6" />
            </span>
          </div>
        </button>

        {/* Overlay do Menu Mobile */}
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 lg:hidden z-30 ${
            isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Menu Mobile Sidebar */}
        <div
          className={`fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-white shadow-2xl transform transition-all duration-300 ease-out lg:hidden z-40 ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Header do Menu Mobile */}
            <div className="bg-gradient-to-r from-f1-red to-f1-red-dark p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Menu</h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                  aria-label="Fechar menu"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <AuthHeader />
            </div>

            {/* Conteúdo do Menu Mobile */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
              <div className="py-2">
                {mobileMenuCategories.map((category, categoryIndex) => (
                  <div key={category.title} className="mb-1">
                    {/* Título da Categoria */}
                    <div className="px-6 py-3 bg-white border-b border-gray-100">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {category.title}
                      </h3>
                    </div>
                    
                    {/* Items da Categoria */}
                    <div className="bg-white">
                      {category.items.map((item, itemIndex) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-4 px-6 py-4 text-sm font-medium transition-all duration-200 border-l-4 ${
                              isActive 
                                ? 'bg-f1-red/5 text-f1-red border-f1-red shadow-sm' 
                                : 'text-gray-700 hover:bg-f1-red/5 hover:text-f1-red border-transparent hover:border-f1-red/30 hover:shadow-sm'
                            }`}
                          >
                            <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                              isActive 
                                ? 'bg-f1-red text-white' 
                                : 'bg-gray-100 text-gray-600 group-hover:bg-f1-red/10 group-hover:text-f1-red'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            
                            <span className="flex-1">{item.label}</span>
                            
                            {item.isExperimental && (
                              <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-full font-bold shadow-sm">
                                BETA
                              </span>
                            )}
                            
                            {isActive && (
                              <div className="w-2 h-2 bg-f1-red rounded-full"></div>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Footer do Menu Mobile */}
              <div className="p-6 bg-white border-t border-gray-200 mt-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    F1 Bolão © 2024
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Versão Mobile
                  </p>
                </div>
              </div>
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