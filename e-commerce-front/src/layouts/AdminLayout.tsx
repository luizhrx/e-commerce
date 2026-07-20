import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tags, ShoppingCart,
  ArrowLeft, ShoppingBag, Menu, X, LogOut
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Produtos', path: '/admin/produtos', icon: Package },
  { name: 'Categorias', path: '/admin/categorias', icon: Tags },
  { name: 'Pedidos', path: '/admin/pedidos', icon: ShoppingCart },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex font-sans selection:bg-[#10b981]/30 selection:text-[#10b981]">
      
      <aside className="hidden lg:flex flex-col w-64 bg-[#0d0d0d] border-r border-[#151515] shrink-0 sticky top-0 h-screen">
        <div className="h-20 flex items-center gap-3 px-6 border-b border-[#151515]">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#141414] to-[#1e1e1e] border border-[#10b981]/25 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <ShoppingBag className="w-5 h-5 text-[#10b981]" />
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          </div>
          <div>
            <span className="text-lg font-black tracking-wider text-white">
              CORE<span className="text-[#10b981]">X</span>
            </span>
            <p className="text-[8px] text-gray-500 font-mono tracking-widest uppercase">Admin Area</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all cursor-pointer group ${
                  isActive 
                    ? 'bg-[#10b981]/10 border border-[#10b981]/25 text-[#10b981] font-bold shadow-[inset_0_0_12px_rgba(16,185,129,0.05)]' 
                    : 'text-gray-400 hover:text-white hover:bg-[#121212] border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#10b981]' : 'text-gray-500 group-hover:text-gray-300'}`} />
                <span>{item.name}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeIndicator" 
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-[#10b981]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#151515]">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#121212] hover:bg-[#161616] border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white transition-all text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para a Loja</span>
          </button>
        </div>
      </aside>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative flex flex-col w-64 max-w-xs bg-[#0d0d0d] border-r border-[#151515] h-full z-10"
            >
              <div className="h-20 flex items-center justify-between px-6 border-b border-[#151515]">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-[#141414] to-[#1e1e1e] border border-[#10b981]/25">
                    <ShoppingBag className="w-4 h-4 text-[#10b981]" />
                  </div>
                  <div>
                    <span className="text-base font-black tracking-wider text-white">
                      CORE<span className="text-[#10b981]">X</span>
                    </span>
                    <p className="text-[7px] text-gray-500 font-mono tracking-widest uppercase">Admin</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#161616] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-[#10b981]/10 border border-[#10b981]/25 text-[#10b981] font-bold' 
                          : 'text-gray-400 hover:text-white hover:bg-[#121212]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#10b981]' : 'text-gray-500'}`} />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-[#151515]">
                <button
                  onClick={() => {
                    navigate('/');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#121212] border border-gray-800 text-gray-300 text-xs font-semibold cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar para a Loja</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        
        <header className="h-20 bg-[#0a0a0a]/60 backdrop-blur-md border-b border-[#141414] px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-40">
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-[#121212] border border-gray-800 text-gray-400 hover:text-white lg:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-sm font-mono tracking-widest text-gray-500 uppercase">Administração</h2>
              <h1 className="text-base font-bold text-white tracking-tight">Painel de Controle</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#121212] hover:bg-[#161616] border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white transition-all text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para a Loja</span>
            </button>

            <div className="flex items-center gap-2.5 bg-white/[0.03] border border-white/5 rounded-xl pl-3 pr-1.5 py-1.5">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#10b981] to-emerald-400 flex items-center justify-center text-[#04140f] font-mono text-[10px] font-extrabold shadow-[0_0_10px_rgba(16,185,129,0.25)]">
                {user?.nome ? user.nome.substring(0, 2).toUpperCase() : 'AD'}
              </div>
              <span className="text-[11px] font-mono text-gray-400 font-bold hidden sm:inline">
                {user?.nome ?? 'Administrador'}
              </span>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-950/20 transition-all cursor-pointer"
                title="Sair"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
