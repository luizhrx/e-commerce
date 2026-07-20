import { Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

import {
  ShoppingBag, ArrowLeft, Trash2, Plus, Minus,
  CreditCard, ShieldCheck, Truck, Sparkles
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { urlImagemSegura } from '../../utils/seguranca';

export default function Carrinho() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cartItems,
    atualizarQuantidade,
    removerDoCarrinho,
    limparCarrinho,
    valorTotal
  } = useCart();

  // Regra de negócio: frete grátis a partir de R$ 250,00; abaixo disso, taxa fixa.
  const freteGratisThreshold = 250;
  const valorFreteFixo = 25;
  const isFreteGratis = valorTotal >= freteGratisThreshold;
  const valorFrete = cartItems.length === 0 ? 0 : (isFreteGratis ? 0 : valorFreteFixo);
  const valorFinal = valorTotal + valorFrete;

  // Defesa em profundidade: mesmo protegida por RotaPrivada, a tela não renderiza
  // dados de compra sem uma identidade carregada.
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-gray-100 flex flex-col font-sans selection:bg-[#10b981]/30 selection:text-[#10b981]">

      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[420px] bg-[#10b981]/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 -right-32 w-[420px] h-[420px] bg-[#6d28d9]/8 rounded-full blur-[140px]" />
      </div>

      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-[#141414] to-[#1e1e1e] border border-[#10b981]/20 shadow-[0_0_25px_rgba(16,185,129,0.12)]">
              <ShoppingBag className="w-5 h-5 text-[#10b981]" />
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-wider text-white">
                CORE<span className="text-[#10b981] drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">X</span>
              </span>
              <p className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">Premium Gaming Setup</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-gray-300 hover:text-white hover:border-white/15 hover:bg-white/[0.06] transition-all text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:block">Continuar Comprando</span>
          </button>
        </div>
      </nav>

      <main className="relative z-10 flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 w-full">

        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-8">
          Seu Carrinho de <span className="bg-gradient-to-r from-[#10b981] to-[#06b6d4] bg-clip-text text-transparent">Compras</span>
        </h1>

        <AnimatePresence mode="wait">
          {cartItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-6">
                <ShoppingBag className="w-8 h-8 text-gray-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-300">Seu carrinho está vazio</h2>
              <p className="text-sm text-gray-500 mt-2 max-w-sm leading-relaxed">
                Você ainda não adicionou nenhum equipamento de alta performance ao seu setup. Navegue pelas ofertas da loja para começar!
              </p>
              
              <button
                onClick={() => navigate('/')}
                className="group relative overflow-hidden mt-8 bg-gradient-to-r from-[#059669] to-[#10b981] text-[#04140f] font-bold text-xs px-6 py-3.5 rounded-xl transition-all duration-300 shadow-[0_8px_30px_rgba(16,185,129,0.25)] hover:shadow-[0_10px_45px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                <ArrowLeft className="relative w-4 h-4" />
                <span className="relative">Voltar para a Loja</span>
              </button>
            </motion.div>

          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
            >
              
              <div className="lg:col-span-2 space-y-4">
                <AnimatePresence mode="popLayout">
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 15 }}
                      className="p-5 rounded-2xl bg-white/[0.025] border border-white/5 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.45)] flex flex-col sm:flex-row items-center justify-between gap-5 group hover:border-[#10b981]/25 hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <div
                          className="w-16 h-16 rounded-xl bg-[#161616] border border-white/5 flex items-center justify-center shrink-0 cursor-pointer overflow-hidden"
                          onClick={() => navigate(`/produto/${item.id}`)}
                        >
                          {urlImagemSegura(item.imagem) ? (
                            <img
                              src={urlImagemSegura(item.imagem)!}
                              alt={item.nome}
                              loading="lazy"
                              className="w-full h-full object-contain p-2"
                            />
                          ) : (
                            <ShoppingBag className="w-6 h-6 text-gray-700 group-hover:text-[#10b981]/40 transition-colors" />
                          )}
                        </div>

                        <div className="text-center sm:text-left space-y-1">
                          <span className="text-[9px] font-bold font-mono tracking-wider text-[#10b981] uppercase">
                            {item.categoriaNome}
                          </span>
                          <h3 
                            className="text-sm font-bold text-white hover:text-[#10b981] transition-colors cursor-pointer leading-tight"
                            onClick={() => navigate(`/produto/${item.id}`)}
                          >
                            {item.nome}
                          </h3>
                          <p className="text-xs text-gray-500 font-mono">
                            Valor: R$ {item.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t border-white/5 sm:border-0 pt-4 sm:pt-0">

                        <div className="flex items-center gap-2.5 bg-black/25 border border-white/5 rounded-xl p-1">
                          <button
                            onClick={() => atualizarQuantidade(item.id, item.quantidadeSelecionada - 1)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                            aria-label={`Remover uma unidade de ${item.nome}`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <span className="text-xs font-bold text-white w-6 text-center font-mono select-none">
                            {item.quantidadeSelecionada}
                          </span>

                          <button
                            onClick={() => atualizarQuantidade(item.id, item.quantidadeSelecionada + 1)}
                            disabled={item.quantidadeSelecionada >= item.quantidadeStock}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                            aria-label={`Adicionar uma unidade de ${item.nome}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right flex flex-col min-w-[80px]">
                          <span className="text-[9px] text-gray-500 font-mono">TOTAL</span>
                          <span className="text-sm font-extrabold text-white font-mono">
                            R$ {(item.preco * item.quantidadeSelecionada).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        <button
                          onClick={() => removerDoCarrinho(item.id)}
                          className="p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-950/20 transition-all cursor-pointer"
                          aria-label={`Remover ${item.nome} do carrinho`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={limparCarrinho}
                    className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1.5 px-4 py-2 rounded-xl hover:bg-red-950/15 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Esvaziar Carrinho</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="p-6 rounded-2xl bg-white/[0.025] backdrop-blur-xl border border-white/5 shadow-[0_16px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] space-y-6 sticky top-28">

                  <h2 className="text-base font-bold text-white tracking-wide border-b border-white/5 pb-4">
                    Resumo do Pedido
                  </h2>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal dos Itens:</span>
                      <span className="text-white font-bold">
                        R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-gray-400">
                      <span>Frete CoreX Expresso:</span>
                      {valorFrete === 0 ? (
                        <span className="text-[#10b981] font-bold bg-[#10b981]/10 border border-[#10b981]/25 px-2 py-0.5 rounded text-[10px]">
                          GRÁTIS
                        </span>
                      ) : (
                        <span className="text-white font-bold">
                          R$ {valorFrete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>

                    {!isFreteGratis && (
                      <div className="p-3 bg-black/25 border border-white/5 rounded-xl space-y-1.5 text-[10px]">
                        <p className="text-gray-400 font-sans leading-relaxed">
                          Adicione mais <strong className="text-white">R$ {(freteGratisThreshold - valorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> para liberar <strong className="text-[#10b981]">Frete Grátis</strong>!
                        </p>
                        <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                          <div
                            className="bg-[#10b981] h-1 rounded-full transition-all duration-500 shadow-[0_0_8px_#10b981]"
                            style={{ width: `${Math.min((valorTotal / freteGratisThreshold) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">Valor Final</span>
                      <span className="text-2xl font-black text-[#10b981] font-mono leading-none">
                        R$ {valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono text-right pb-1">ou até 12x s/ juros</span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/25 border border-white/5 space-y-2 text-[10px] text-gray-400">
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-[#10b981]" />
                      <span>Despacho expresso prioritário</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
                      <span>Checkout 100% criptografado e seguro</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/checkout')}
                    className="group relative overflow-hidden w-full bg-gradient-to-r from-[#059669] to-[#10b981] text-[#04140f] font-black text-sm py-4 rounded-xl transition-all duration-300 shadow-[0_8px_30px_rgba(16,185,129,0.25)] hover:shadow-[0_10px_45px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    <CreditCard className="relative w-4.5 h-4.5" />
                    <span className="relative">AVANÇAR PARA PAGAMENTO</span>
                  </button>

                  <div className="text-center">
                    <span className="inline-flex items-center gap-1 text-[9px] text-gray-600 font-mono uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-[#10b981]" /> CoreX Security Shield
                    </span>
                  </div>

                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </main>

      <footer className="relative z-10 bg-[#070707] border-t border-white/5 py-8 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-mono">
          <p>© 2026 CoreX E-Commerce. Todos os direitos reservados.</p>
          <p className="text-[#10b981] font-bold">Premium Experience</p>
        </div>
      </footer>

    </div>
  );
}
