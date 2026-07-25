import { useState } from 'react';
import { Search, Layers, Check, DollarSign, SlidersHorizontal, RefreshCw, Filter, Trash2, ChevronDown } from 'lucide-react';
import { type Categoria } from '../services/categoriaService';

interface ProductFiltersProps {
  buscaNome: string;
  setBuscaNome: (v: string) => void;
  categoriaSelecionada: number | undefined;
  setCategoriaSelecionada: (v: number | undefined) => void;
  categorias: Categoria[];
  precoMin: string;
  setPrecoMin: (v: string) => void;
  precoMax: string;
  setPrecoMax: (v: string) => void;
  aplicarFiltros: () => void;
  limparFiltros: () => void;
}

export default function ProductFilters({
  buscaNome, setBuscaNome,
  categoriaSelecionada, setCategoriaSelecionada,
  categorias,
  precoMin, setPrecoMin,
  precoMax, setPrecoMax,
  aplicarFiltros, limparFiltros
}: ProductFiltersProps) {
  // Colapsado por padrão no mobile para os produtos aparecerem logo de cara.
  // No desktop (lg+) o corpo é sempre exibido via `lg:block`, ignorando este estado.
  const [aberto, setAberto] = useState(false);

  const temFiltroAtivo =
    buscaNome !== '' || categoriaSelecionada !== undefined || precoMin !== '' || precoMax !== '';

  return (
    <section className="lg:col-span-1">
      <div className="lg:sticky lg:top-24 rounded-2xl bg-white/[0.025] backdrop-blur-xl border border-white/5 shadow-[0_16px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] overflow-hidden">

        <div className={`flex items-center justify-between gap-3 p-4 lg:p-6 ${aberto ? 'border-b border-white/5' : ''} lg:border-b lg:border-white/5`}>
          <button
            onClick={() => setAberto((v) => !v)}
            aria-expanded={aberto}
            className="flex items-center gap-2 text-white font-semibold flex-1 min-w-0 lg:pointer-events-none cursor-pointer"
          >
            <Filter className="w-4 h-4 text-[#10b981] shrink-0" />
            <span className="text-sm">Filtrar Catálogo</span>
            {temFiltroAtivo && (
              <span className="lg:hidden w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981] shrink-0" />
            )}
            <ChevronDown
              className={`w-4 h-4 text-gray-500 ml-auto lg:hidden transition-transform duration-300 ${aberto ? 'rotate-180' : ''}`}
            />
          </button>

          {temFiltroAtivo && (
            <button
              onClick={limparFiltros}
              className="text-[11px] text-red-400 hover:text-red-300 active:text-red-300 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Trash2 className="w-3 h-3" />
              <span>Limpar</span>
            </button>
          )}
        </div>

        <div className={`${aberto ? 'block' : 'hidden'} lg:block p-4 lg:p-6 space-y-6`}>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-gray-500" />
              <span>Buscar por Nome</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                placeholder="Teclado, mouse..."
                className="w-full bg-black/25 border border-white/5 focus:border-[#10b981]/60 text-sm lg:text-xs text-gray-200 px-3.5 py-3 rounded-xl outline-none transition-all placeholder-gray-600 focus:ring-1 focus:ring-[#10b981]/10"
              />
              {buscaNome && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-gray-500" />
              <span>Categoria</span>
            </label>
            <div className="space-y-1.5">
              <button
                onClick={() => setCategoriaSelecionada(undefined)}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-sm lg:text-xs flex items-center justify-between transition-all cursor-pointer ${
                  categoriaSelecionada === undefined
                    ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/25 font-medium shadow-[0_0_20px_rgba(16,185,129,0.12)]'
                    : 'bg-white/[0.02] text-gray-400 border border-transparent hover:bg-white/[0.06] active:bg-white/[0.08] hover:text-gray-200'
                }`}
              >
                <span>Todas as Categorias</span>
                {categoriaSelecionada === undefined && <Check className="w-3.5 h-3.5 text-[#10b981]" />}
              </button>

              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaSelecionada(cat.id)}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-sm lg:text-xs flex items-center justify-between transition-all cursor-pointer ${
                    categoriaSelecionada === cat.id
                      ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/25 font-medium shadow-[0_0_20px_rgba(16,185,129,0.12)]'
                      : 'bg-white/[0.02] text-gray-400 border border-transparent hover:bg-white/[0.06] active:bg-white/[0.08] hover:text-gray-200'
                  }`}
                >
                  <span>{cat.nome}</span>
                  {categoriaSelecionada === cat.id && <Check className="w-3.5 h-3.5 text-[#10b981]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-gray-500" />
              <span>Valores Limites</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-600 font-mono">Min</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={precoMin}
                  onChange={(e) => setPrecoMin(e.target.value)}
                  placeholder="0"
                  className="w-full bg-black/25 border border-white/5 focus:border-[#10b981]/60 text-sm lg:text-xs text-gray-200 pl-9 pr-2 py-3 rounded-xl outline-none transition-all focus:ring-1 focus:ring-[#10b981]/10"
                />
              </div>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-600 font-mono">Max</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={precoMax}
                  onChange={(e) => setPrecoMax(e.target.value)}
                  placeholder="5000"
                  className="w-full bg-black/25 border border-white/5 focus:border-[#10b981]/60 text-sm lg:text-xs text-gray-200 pl-9 pr-2 py-3 rounded-xl outline-none transition-all focus:ring-1 focus:ring-[#10b981]/10"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={aplicarFiltros}
                disabled={precoMin === '' || precoMax === ''}
                className="flex-1 bg-gradient-to-r from-[#059669] to-[#10b981] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] active:brightness-95 disabled:from-white/[0.04] disabled:to-white/[0.04] disabled:text-gray-500 disabled:shadow-none disabled:cursor-not-allowed text-[#04140f] font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filtrar</span>
              </button>

              {(precoMin !== '' || precoMax !== '') && (
                <button
                  onClick={() => {
                    setPrecoMin('');
                    setPrecoMax('');
                    setTimeout(() => aplicarFiltros(), 0);
                  }}
                  className="p-3 bg-white/[0.03] hover:bg-white/[0.08] active:bg-white/[0.1] border border-white/5 text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer"
                  title="Redefinir preço"
                  aria-label="Redefinir preço"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
