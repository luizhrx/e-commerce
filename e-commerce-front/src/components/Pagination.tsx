import { ArrowLeft, ArrowRight } from 'lucide-react';

interface PaginationProps {
  paginaAtual: number;
  totalPaginas: number;
  onPageChange: (novaPagina: number) => void;
}

export default function Pagination({ paginaAtual, totalPaginas, onPageChange }: PaginationProps) {
  if (totalPaginas <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-6 mt-10 border-t border-white/5 pt-8">
      <button
        onClick={() => onPageChange(Math.max(paginaAtual - 1, 1))}
        disabled={paginaAtual === 1}
        className="p-3 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/5 text-gray-400 hover:text-[#10b981] hover:border-[#10b981]/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      
      <span className="text-xs text-gray-500 font-mono font-bold tracking-widest">
        PÁGINA {paginaAtual} / {totalPaginas}
      </span>

      <button
        onClick={() => onPageChange(Math.min(paginaAtual + 1, totalPaginas))}
        disabled={paginaAtual === totalPaginas}
        className="p-3 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/5 text-gray-400 hover:text-[#10b981] hover:border-[#10b981]/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all cursor-pointer"
      >
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}