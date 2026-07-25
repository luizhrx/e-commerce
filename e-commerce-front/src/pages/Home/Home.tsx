import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import {
  ShoppingBag, LogOut, RefreshCw, AlertCircle, ArrowRight,
  Package, PackageOpen, Zap, Menu, X, LayoutDashboard
} from 'lucide-react';

import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../hooks/useProducts';

import ProductCard from '../../components/ProductCard';
import Pagination from '../../components/Pagination';
import ProductFilters from '../../components/ProductFilters';

export default function Home() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { cartItems } = useCart();

  // Controla o drawer de navegação no mobile (< md). No desktop a nav é inline.
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  const {
    produtos, categorias, loading, error, isSandboxMode,
    buscaNome, setBuscaNome,
    categoriaSelecionada, setCategoriaSelecionada,
    precoMin, setPrecoMin,
    precoMax, setPrecoMax,
    paginaAtual, setPaginaAtual,
    aplicarFiltros, limparFiltros
  } = useProducts();

  const produtosPorPagina = 6;
  const totalPaginas = Math.ceil(produtos.length / produtosPorPagina);
  const produtosExibidos = produtos.slice(
    (paginaAtual - 1) * produtosPorPagina,
    paginaAtual * produtosPorPagina
  );

  const rolarParaProdutos = () => {
    const el = document.getElementById('vitrine-produtos');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const irPara = (rota: string) => {
    setMenuMobileAberto(false);
    navigate(rota);
  };

  const handleLogout = () => {
    setMenuMobileAberto(false);
    logout();
    navigate('/login');
  };

  const totalItensCarrinho = cartItems.reduce(
    (acc, item) => acc + item.quantidadeSelecionada,
    0
  );

  const iniciais = user?.nome ? user.nome.substring(0, 2).toUpperCase() : 'CX';

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-gray-100 flex flex-col font-sans selection:bg-[#10b981]/30 selection:text-[#10b981]">

      {/* AMBIENTE — camada de brilhos de fundo (profundidade / vibe cyberpunk) */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#10b981]/8 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -left-40 w-[420px] h-[420px] bg-[#6d28d9]/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-0 -right-32 w-[480px] h-[480px] bg-[#06b6d4]/6 rounded-full blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 40%, transparent 100%)'
          }}
        />
      </div>

      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">

          <button
            onClick={() => irPara('/')}
            className="flex items-center gap-3 cursor-pointer"
            aria-label="Página inicial CoreX"
          >
            <div className="relative flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-tr from-[#141414] to-[#1e1e1e] border border-[#10b981]/20 shadow-[0_0_25px_rgba(16,185,129,0.12),inset_0_1px_0_rgba(255,255,255,0.06)]">
              <ShoppingBag className="w-5 h-5 text-[#10b981]" />
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            </div>
            <span className="text-xl font-bold tracking-wider text-white">
              CORE<span className="text-[#10b981] drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">X</span>
            </span>
          </button>

          {/* AÇÕES DESKTOP (md+) — layout original preservado */}
          <div className="hidden md:flex items-center gap-2 sm:gap-3">
            {user?.role === 'ADMIN' && (
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#10b981]/20 bg-[#10b981]/5 text-[#10b981] text-xs font-semibold hover:bg-[#10b981]/15 hover:border-[#10b981]/40 transition-all cursor-pointer">
                <span>Painel Admin</span>
              </button>
            )}

            <button
              onClick={() => navigate('/pedidos')}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-gray-300 hover:text-white hover:border-white/15 hover:bg-white/[0.06] transition-all text-xs font-semibold cursor-pointer"
            >
              <Package className="w-4 h-4 text-[#10b981]" />
              <span>Meus Pedidos</span>
            </button>

            <button
              onClick={() => navigate('/carrinho')}
              className="relative p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-gray-300 hover:text-white hover:border-white/15 hover:bg-white/[0.06] transition-all cursor-pointer flex items-center justify-center"
            >
              <ShoppingBag className="w-4 h-4 text-[#10b981]" />
              {totalItensCarrinho > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#10b981] text-[#0a0a0a] text-[9px] font-black min-w-4.5 h-4.5 px-1 rounded-full flex items-center justify-center font-mono shadow-[0_0_12px_rgba(16,185,129,0.6)]">
                  {totalItensCarrinho}
                </span>
              )}
            </button>

            <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 pl-3.5 pr-2 py-1.5 rounded-xl">
              <div className="flex flex-col items-end">
                <span className="text-xs font-medium text-gray-200">{user?.nome}</span>
                <span className="text-[9px] text-[#10b981] font-mono tracking-wider uppercase">
                  {user?.role}
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#181818] to-[#2a2a2a] border border-white/10 flex items-center justify-center text-gray-300 font-bold text-xs uppercase">
                {iniciais}
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-950/20 transition-all ml-1 cursor-pointer"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* AÇÕES MOBILE (< md) — carrinho sempre visível + hambúrguer */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => navigate('/carrinho')}
              aria-label="Abrir carrinho"
              className="relative w-11 h-11 rounded-xl bg-white/[0.03] border border-white/5 text-gray-300 active:bg-white/[0.08] transition-all flex items-center justify-center"
            >
              <ShoppingBag className="w-5 h-5 text-[#10b981]" />
              {totalItensCarrinho > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#10b981] text-[#0a0a0a] text-[9px] font-black min-w-4.5 h-4.5 px-1 rounded-full flex items-center justify-center font-mono shadow-[0_0_12px_rgba(16,185,129,0.6)]">
                  {totalItensCarrinho}
                </span>
              )}
            </button>

            <button
              onClick={() => setMenuMobileAberto((v) => !v)}
              aria-label={menuMobileAberto ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menuMobileAberto}
              className="w-11 h-11 rounded-xl bg-white/[0.03] border border-white/5 text-gray-200 active:bg-white/[0.08] transition-all flex items-center justify-center"
            >
              {menuMobileAberto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* DRAWER MOBILE */}
        <AnimatePresence>
          {menuMobileAberto && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="md:hidden overflow-hidden border-t border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl"
            >
              <div className="px-4 py-4 space-y-1.5">
                <div className="flex items-center gap-3 px-2 py-3 mb-1 border-b border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-[#181818] to-[#2a2a2a] border border-white/10 flex items-center justify-center text-gray-300 font-bold text-sm uppercase shrink-0">
                    {iniciais}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user?.nome ?? 'Visitante'}</p>
                    <p className="text-[10px] text-[#10b981] font-mono tracking-wider uppercase">{user?.role}</p>
                  </div>
                </div>

                {user?.role === 'ADMIN' && (
                  <button
                    onClick={() => irPara('/admin')}
                    className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl border border-[#10b981]/20 bg-[#10b981]/5 text-[#10b981] text-sm font-semibold active:bg-[#10b981]/15 transition-all"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Painel Admin</span>
                  </button>
                )}

                <button
                  onClick={() => irPara('/pedidos')}
                  className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl bg-white/[0.03] border border-white/5 text-gray-200 text-sm font-semibold active:bg-white/[0.08] transition-all"
                >
                  <Package className="w-5 h-5 text-[#10b981]" />
                  <span>Meus Pedidos</span>
                </button>

                <button
                  onClick={() => irPara('/carrinho')}
                  className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl bg-white/[0.03] border border-white/5 text-gray-200 text-sm font-semibold active:bg-white/[0.08] transition-all"
                >
                  <ShoppingBag className="w-5 h-5 text-[#10b981]" />
                  <span>Carrinho</span>
                  {totalItensCarrinho > 0 && (
                    <span className="ml-auto bg-[#10b981] text-[#0a0a0a] text-[10px] font-black min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center font-mono">
                      {totalItensCarrinho}
                    </span>
                  )}
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl bg-white/[0.03] border border-white/5 text-red-400 text-sm font-semibold active:bg-red-950/20 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sair</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Fecha o menu ao tocar fora dele */}
      {menuMobileAberto && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMenuMobileAberto(false)}
          className="md:hidden fixed inset-0 top-16 z-40 bg-black/50 cursor-default"
        />
      )}

      {isSandboxMode && (
        <div className="relative z-10 bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-center gap-2 text-amber-400 text-[10px] font-mono tracking-widest uppercase text-center">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Modo Demonstrativo Ativo: Exibindo dados simulados (Mocks). As compras reais estão desativadas.</span>
        </div>
      )}

      <section className="relative z-10 overflow-hidden px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-20 sm:pb-24 md:pt-28 md:pb-32">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center">

          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#10b981] bg-[#10b981]/8 px-4 py-2 rounded-full border border-[#10b981]/20 shadow-[0_0_30px_rgba(16,185,129,0.15)] backdrop-blur-sm"
          >
            <Zap className="w-3 h-3 fill-[#10b981]" />
            Nova Geração CoreX
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mt-6 sm:mt-8 text-[2rem] sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1] md:leading-[1.08]"
          >
            Equipamentos de alta performance{' '}
            <span className="bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#06b6d4] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(16,185,129,0.25)]">
              para o seu setup
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="mt-5 sm:mt-7 text-sm sm:text-base text-gray-400 leading-relaxed max-w-xl"
          >
            Eleve sua jogabilidade e produtividade com os componentes mais requisitados
            do cenário gamer. Desempenho extremo, ergonomia incomparável e qualidade
            testada e aprovada.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="mt-8 sm:mt-10 w-full sm:w-auto"
          >
            <button
              onClick={rolarParaProdutos}
              className="group relative overflow-hidden w-full sm:w-auto bg-gradient-to-r from-[#059669] to-[#10b981] text-[#04140f] font-bold text-sm px-8 py-4 rounded-2xl transition-all duration-300 shadow-[0_8px_30px_rgba(16,185,129,0.25)] hover:shadow-[0_10px_45px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              {/* Varredura de brilho no hover */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              <span className="relative">Ver Ofertas</span>
              <ArrowRight className="relative w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      <main
        id="vitrine-produtos"
        className="relative z-10 flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28 w-full scroll-mt-20 md:scroll-mt-24"
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">

          <ProductFilters
            buscaNome={buscaNome} setBuscaNome={setBuscaNome}
            categoriaSelecionada={categoriaSelecionada} setCategoriaSelecionada={setCategoriaSelecionada}
            categorias={categorias}
            precoMin={precoMin} setPrecoMin={setPrecoMin}
            precoMax={precoMax} setPrecoMax={setPrecoMax}
            aplicarFiltros={aplicarFiltros} limparFiltros={limparFiltros}
          />

          <section className="lg:col-span-3 space-y-6">

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/[0.02] backdrop-blur-md p-4 border border-white/5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_10px_#10b981]" />
                <h2 className="text-sm font-semibold text-white tracking-wide">Equipamentos Disponíveis</h2>
                <span className="text-[11px] bg-white/[0.04] border border-white/5 text-gray-400 px-2.5 py-0.5 rounded-md font-mono">
                  {produtos.length} {produtos.length === 1 ? 'item' : 'itens'}
                </span>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/25 text-red-300 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <div className="text-xs">
                  <p className="font-semibold">Erro</p>
                  <p className="opacity-85">{error}</p>
                </div>
              </div>
            )}

            {loading ? (
              /* Skeletons preservam o layout do grid enquanto carrega */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden animate-pulse"
                  >
                    <div className="aspect-square bg-[#161616]" />
                    <div className="p-5 space-y-3">
                      <div className="h-3.5 w-3/4 rounded bg-white/5" />
                      <div className="h-3 w-full rounded bg-white/5" />
                      <div className="h-3 w-2/3 rounded bg-white/5" />
                      <div className="h-9 w-full rounded-xl bg-white/5 mt-5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : produtos.length === 0 ? (
              <div className="min-h-[380px] flex flex-col items-center justify-center p-8 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl text-center backdrop-blur-sm">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-5">
                  <PackageOpen className="w-7 h-7 text-gray-600" />
                </div>
                <h3 className="text-base font-bold text-gray-200">Nenhum produto localizado</h3>
                <p className="text-xs text-gray-500 mt-2 max-w-xs">
                  Tente ajustar os filtros ou buscar por outro termo.
                </p>
                <button
                  onClick={limparFiltros}
                  className="mt-6 text-xs font-semibold text-[#10b981] flex items-center gap-1.5 px-4 py-3 rounded-xl border border-[#10b981]/20 bg-[#10b981]/5 hover:bg-[#10b981]/15 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Limpar Busca
                </button>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={paginaAtual}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6"
                >
                  {produtosExibidos.map((produto, index) => (
                    <ProductCard key={produto.id} produto={produto} index={index} />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}

            <Pagination
              paginaAtual={paginaAtual}
              totalPaginas={totalPaginas}
              onPageChange={(novaPagina) => {
                setPaginaAtual(novaPagina);
                rolarParaProdutos();
              }}
            />

          </section>
        </div>
      </main>

      <footer className="relative z-10 bg-[#070707] border-t border-white/5 py-8 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 font-mono text-center">
          <p>© 2026 CoreX E-Commerce. Todos os direitos reservados.</p>
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#10b981]" /> Premium Gaming Setup
          </span>
        </div>
      </footer>

    </div>
  );
}
