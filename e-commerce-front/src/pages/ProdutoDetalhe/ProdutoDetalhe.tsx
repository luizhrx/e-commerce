import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import { 
  ShoppingBag, 
  ArrowLeft, 
  AlertCircle, 
  Sparkles, 
  Package, 
  ShieldCheck, 
  Truck, 
  CreditCard 
} from 'lucide-react';
import produtoService, { type Produto } from '../../services/produtoService';
import { useCart } from '../../context/CartContext';
import { mensagemDeErro, logErro, urlImagemSegura } from '../../utils/seguranca';

export default function ProdutoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { adicionarAoCarrinho, cartItems } = useCart();

  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [adicionado, setAdicionado] = useState<boolean>(false);

  useEffect(() => {
    async function carregarProduto() {
      const idNumerico = Number(id);
      if (!id || !Number.isInteger(idNumerico) || idNumerico <= 0) {
        setError('Produto não encontrado.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await produtoService.buscarPorId(idNumerico);
        if (data) {
          setProduto(data);
        } else {
          throw new Error('Produto não retornado pela API');
        }
      } catch (err) {
        logErro('produtoDetalhe:buscarPorId', err);
        setError(mensagemDeErro(err, 'Não encontramos este produto em nosso catálogo.'));
      } finally {
        setLoading(false);
      }
    }

    carregarProduto();
  }, [id]);

  const handleAdicionarAoCarrinho = () => {
    if (produto) {
      adicionarAoCarrinho(produto, 1);
      setAdicionado(true);
      setTimeout(() => setAdicionado(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex flex-col items-center justify-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border-2 border-gray-800 border-t-2 border-t-[#10b981] animate-spin" />
          <ShoppingBag className="w-5 h-5 text-[#10b981] absolute animate-pulse" />
        </div>
        <span className="text-xs text-gray-400 font-mono tracking-widest uppercase animate-pulse">
          Carregando especificações...
        </span>
      </div>
    );
  }

  if (error || !produto) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="p-5 bg-red-950/20 border border-red-500/20 rounded-3xl mb-6 max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">Item indisponível</h3>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            {error || 'Não foi possível encontrar as informações detalhadas para este produto no momento.'}
          </p>
        </div>
        
        <button
          onClick={() => navigate('/')}
          className="px-5 py-3 rounded-xl border border-gray-800 hover:border-gray-600 bg-[#121212] text-xs font-semibold text-gray-300 transition-all flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao catálogo</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex flex-col font-sans selection:bg-[#10b981]/30 selection:text-[#10b981]">
      
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-[#141414] to-[#1e1e1e] border border-[#10b981]/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <ShoppingBag className="w-5 h-5 text-[#10b981]" />
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-wider text-white">
                CORE<span className="text-[#10b981] drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">X</span>
              </span>
              <p className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">Premium Gaming Setup</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/carrinho')}
              className="relative p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-gray-300 hover:text-white hover:border-white/15 hover:bg-white/[0.06] transition-all cursor-pointer flex items-center justify-center"
              title="Ir para o Carrinho"
            >
              <ShoppingBag className="w-4 h-4 text-[#10b981]" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#10b981] text-[#0a0a0a] text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center font-mono animate-pulse">
                  {cartItems.reduce((acc, item) => acc + item.quantidadeSelecionada, 0)}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-gray-300 hover:text-white hover:border-white/15 hover:bg-white/[0.06] transition-all text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 md:py-16 w-full flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full items-start">
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="relative rounded-3xl bg-[#161616] border border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.55)] flex flex-col items-center justify-center aspect-square min-h-[350px] overflow-hidden group"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_75%)] pointer-events-none z-10" />

            {urlImagemSegura(produto.imagem) ? (
              <img
                src={urlImagemSegura(produto.imagem)!}
                alt={produto.nome}
                className="absolute inset-0 w-full h-full object-contain p-10 group-hover:scale-105 transition-transform duration-700 z-0"
              />
            ) : (
              <div className="flex flex-col items-center justify-center z-20 relative">
                <div className="w-40 h-40 rounded-full bg-[#161616] border border-gray-800/80 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-500 mb-8">
                  <Package className="w-16 h-16 text-gray-600 group-hover:text-[#10b981]/40 transition-colors duration-500" />
                </div>
                <span className="text-[10px] font-mono text-gray-600 tracking-wider uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#10b981]" /> Imagem Meramente Ilustrativa
                </span>
              </div>
            )}

            <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#10b981] group-hover:w-full transition-all duration-700 z-20" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col space-y-6"
          >
            <div>
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/25 text-[10px] font-bold font-mono uppercase tracking-wider text-[#10b981]">
                {produto.categoriaNome}
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none">
                {produto.nome}
              </h1>
              <p className="text-xs text-gray-500 font-mono">CÓDIGO REF: 000{produto.id}X</p>
            </div>

            <div className="py-4 border-y border-[#181818] flex items-baseline gap-2">
              <span className="text-sm font-semibold text-[#10b981] font-mono">R$</span>
              <span className="text-4xl md:text-5xl font-black text-white font-mono tracking-tight">
                {produto.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-gray-500 font-mono ml-2">à vista ou em até 12x</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest font-mono">Descrição do Produto</h3>
              <p className="text-sm md:text-base text-gray-400 leading-relaxed font-sans">
                {produto.descricao}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${produto.quantidadeStock > 0 ? 'bg-[#10b981] shadow-[0_0_8px_#10b981]' : 'bg-red-500 shadow-[0_0_8px_red]'}`} />
              <span className="text-xs font-mono text-gray-300">
                {produto.quantidadeStock > 0 ? (
                  <>Disponível: <strong className="text-white">{produto.quantidadeStock} unidades</strong> no estoque</>
                ) : (
                  <span className="text-red-400 font-bold">Produto Esgotado</span>
                )}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3">
              <div className="p-3.5 rounded-xl bg-[#121212] border border-gray-900 flex flex-col items-center text-center space-y-1">
                <Truck className="w-4 h-4 text-[#10b981]" />
                <span className="text-[10px] font-bold text-gray-300 font-mono">Frete Rápido</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#121212] border border-gray-900 flex flex-col items-center text-center space-y-1">
                <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                <span className="text-[10px] font-bold text-gray-300 font-mono">1 Ano Garantia</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#121212] border border-gray-900 flex flex-col items-center text-center space-y-1">
                <CreditCard className="w-4 h-4 text-[#10b981]" />
                <span className="text-[10px] font-bold text-gray-300 font-mono">Parcele 12x</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleAdicionarAoCarrinho}
                disabled={produto.quantidadeStock === 0}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-black font-extrabold text-sm py-4 rounded-2xl transition-all shadow-lg shadow-emerald-950/20 hover:shadow-emerald-950/40 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4.5 h-4.5" />
                <span>{adicionado ? 'ADICIONADO COM SUCESSO!' : 'ADICIONAR AO CARRINHO'}</span>
              </button>
            </div>

          </motion.div>

        </div>
      </main>

      <footer className="bg-[#070707] border-t border-white/5 py-8 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-mono">
          <p>© 2026 CoreX E-Commerce. Todos os direitos reservados.</p>
          <p className="text-[#10b981] font-bold">Premium Experience</p>
        </div>
      </footer>

    </div>
  );
}