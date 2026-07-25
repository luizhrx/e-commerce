import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Check, ArrowRight } from 'lucide-react';
import { type Produto } from '../services/produtoService';
import { useCart } from '../context/CartContext';
import { urlImagemSegura } from '../utils/seguranca';

interface ProductCardProps {
  produto: Produto;
  /** Posição no grid — usada para o stagger de entrada */
  index?: number;
}

export default function ProductCard({ produto, index = 0 }: ProductCardProps) {
  const navigate = useNavigate();
  const { adicionarAoCarrinho } = useCart();
  const [adicionadoId, setAdicionadoId] = useState<number | null>(null);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    adicionarAoCarrinho(produto, 1);
    setAdicionadoId(produto.id);
    setTimeout(() => setAdicionadoId(null), 2000);
  };

  const foiAdicionado = adicionadoId === produto.id;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => navigate(`/produto/${produto.id}`)}
      className="group relative rounded-2xl bg-[#111]/80 backdrop-blur-sm border border-white/5 hover:border-[#10b981]/30 overflow-hidden flex flex-col cursor-pointer transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_30px_rgba(16,185,129,0.12)] hover:-translate-y-1"
    >
      {/* Proporção fixa + object-contain: o hardware nunca é cortado no enquadramento */}
      <div className="relative aspect-square bg-[#161616] border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.06)_0%,transparent_65%)] pointer-events-none" />

        {urlImagemSegura(produto.imagem) ? (
          <img
            src={urlImagemSegura(produto.imagem)!}
            alt={produto.nome}
            loading="lazy"
            className="relative z-10 w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-gray-800 group-hover:text-[#10b981]/25 group-hover:scale-110 transition-all duration-500" />
          </div>
        )}

        <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#10b981] shadow-[0_0_10px_#10b981] group-hover:w-full transition-all duration-500 z-20" />
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between relative z-20">
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-white group-hover:text-[#10b981] transition-colors leading-snug line-clamp-2">
            {produto.nome}
          </h3>
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
            {produto.descricao}
          </p>
        </div>

        <div className="pt-5 border-t border-white/5 mt-5 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">Preço</span>
            <span className="text-base font-black text-white font-mono flex items-baseline gap-0.5">
              <span className="text-xs text-[#10b981] font-semibold">R$</span>
              {produto.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <button
            onClick={handleAdd}
            aria-label={`Adicionar ${produto.nome} ao carrinho`}
            className={`${
              foiAdicionado
                ? 'bg-[#10b981] text-[#04140f] border-transparent shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                // Em telas de toque não há hover: o botão já nasce sólido (@media hover:none).
                // No desktop mantém o efeito de revelar no group-hover.
                : 'bg-white/[0.04] text-gray-300 border-white/10 group-hover:bg-[#10b981] group-hover:text-[#04140f] group-hover:border-transparent group-hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] [@media(hover:none)]:bg-[#10b981] [@media(hover:none)]:text-[#04140f] [@media(hover:none)]:border-transparent'
            } font-bold text-xs px-4 py-3 sm:py-2.5 rounded-xl border transition-all duration-300 flex items-center gap-1.5 cursor-pointer relative z-30 shrink-0 active:brightness-90`}
          >
            {foiAdicionado ? (
              <>
                <span>Adicionado</span>
                <Check className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Comprar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
