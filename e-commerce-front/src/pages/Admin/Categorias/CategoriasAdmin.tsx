import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { 
  Tags, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Save, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import categoriaService, { type Categoria } from '../../../services/categoriaService';
import { mensagemDeErro, logErro, LIMITES } from '../../../utils/seguranca';

export default function CategoriasAdmin() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados do Modal de Criação/Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  const [nomeCategoria, setNomeCategoria] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  async function carregarCategorias() {
    setLoading(true);
    setError(null);
    try {
      const dados = await categoriaService.listarTodas();
      setCategorias(dados);
    } catch (err: unknown) {
      logErro('categoriasAdmin:listar', err);
      if (import.meta.env.VITE_ENABLE_MOCKS === 'true') {
        setCategorias([
          { id: 1, nome: 'Periféricos' },
          { id: 2, nome: 'Monitores' },
          { id: 3, nome: 'Áudio' },
          { id: 4, nome: 'Hardware' }
        ]);
      } else {
        setError(mensagemDeErro(err, 'Não foi possível carregar as categorias no momento.'));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarCategorias();
  }, []);

  const abrirModalNovo = () => {
    setCategoriaEditando(null);
    setNomeCategoria('');
    setModalError(null);
    setIsModalOpen(true);
  };

  const abrirModalEdicao = (cat: Categoria) => {
    setCategoriaEditando(cat);
    setNomeCategoria(cat.nome);
    setModalError(null);
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setNomeCategoria('');
    setCategoriaEditando(null);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();

    const nome = nomeCategoria.trim();
    if (!nome) {
      setModalError('O nome da categoria não pode estar vazio.');
      return;
    }
    if (nome.length < 2) {
      setModalError('O nome deve ter ao menos 2 caracteres.');
      return;
    }
    if (nome.length > LIMITES.textoMax) {
      setModalError(`O nome deve ter no máximo ${LIMITES.textoMax} caracteres.`);
      return;
    }

    setSalvando(true);
    setModalError(null);

    try {
      if (categoriaEditando) {
        await categoriaService.atualizarCategoria(categoriaEditando.id, { nome });
      } else {
        await categoriaService.criarCategoria({ nome });
      }

      fecharModal();
      carregarCategorias();
    } catch (err: unknown) {
      logErro('categoriasAdmin:salvar', err);
      setModalError(mensagemDeErro(err, 'Não foi possível salvar a categoria.'));
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (id: number, nome: string) => {
    // `window.confirm` é intencional: exclusão é destrutiva e sem desfazer.
    if (!window.confirm(`Tem certeza que deseja excluir a categoria "${nome}"? Esta ação não pode ser desfeita e pode afetar produtos vinculados.`)) {
      return;
    }

    try {
      await categoriaService.excluirCategoria(id);
      setCategorias(categorias.filter(cat => cat.id !== id));
    } catch (err: unknown) {
      logErro('categoriasAdmin:excluir', err);
      toast.error('Ação bloqueada', {
        description: 'Não foi possível excluir. Verifique se existem produtos vinculados a esta categoria.'
      });
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#121212]/40 p-6 border border-[#1a1a1a] rounded-2xl backdrop-blur-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Tags className="w-6 h-6 text-[#10b981]" />
            Gerenciar Categorias
          </h2>
          <p className="text-xs text-gray-500 font-mono mt-1">
            Controle a organização do catálogo de produtos do CoreX
          </p>
        </div>

        <button
          onClick={abrirModalNovo}
          className="bg-[#10b981] hover:bg-[#059669] text-[#0a0a0a] font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-[#10b981]/15 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-4">
          <div className="relative flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-2 border-gray-800 border-t-2 border-t-[#10b981] animate-spin" />
            <Tags className="w-4 h-4 text-[#10b981] absolute animate-pulse" />
          </div>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-red-950/20 border border-red-500/20 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      ) : (
        <div className="bg-[#121212]/80 border border-[#1c1c1c] rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#161616] border-b border-[#1c1c1c]">
                <th className="py-4 px-6 text-[10px] font-mono text-gray-500 uppercase tracking-wider font-semibold w-24">ID</th>
                <th className="py-4 px-6 text-[10px] font-mono text-gray-500 uppercase tracking-wider font-semibold">Nome da Categoria</th>
                <th className="py-4 px-6 text-[10px] font-mono text-gray-500 uppercase tracking-wider font-semibold text-right w-32">Ações</th>
              </tr>
            </thead>
            <tbody>
              {categorias.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-10 text-center text-xs text-gray-500">
                    Nenhuma categoria cadastrada no momento.
                  </td>
                </tr>
              ) : (
                categorias.map((cat) => (
                  <tr key={cat.id} className="border-b border-[#1c1c1c]/50 hover:bg-[#161616]/50 transition-colors group">
                    <td className="py-4 px-6 text-xs font-mono text-gray-400">#{cat.id}</td>
                    <td className="py-4 px-6 text-sm font-bold text-gray-200 group-hover:text-[#10b981] transition-colors">{cat.nome}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => abrirModalEdicao(cat)}
                          className="p-2 rounded-lg bg-[#1a1a1a] border border-gray-800 text-blue-400 hover:bg-blue-950/30 hover:border-blue-500/30 transition-all cursor-pointer"
                          title="Editar"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleExcluir(cat.id, cat.nome)}
                          className="p-2 rounded-lg bg-[#1a1a1a] border border-gray-800 text-red-400 hover:bg-red-950/30 hover:border-red-500/30 transition-all cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={fecharModal}
              className="absolute inset-0 bg-black backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-[#0d0d0d] border border-[#1c1c1c] rounded-3xl shadow-2xl overflow-hidden z-10"
            >
              <div className="flex items-center justify-between p-6 border-b border-[#1c1c1c]">
                <h3 className="text-lg font-bold text-white">
                  {categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}
                </h3>
                <button onClick={fecharModal} className="text-gray-500 hover:text-white transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSalvar} className="p-6 space-y-6">
                
                {modalError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{modalError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 font-mono uppercase tracking-wider">
                    Nome da Categoria
                  </label>
                  <input
                    type="text"
                    value={nomeCategoria}
                    onChange={(e) => setNomeCategoria(e.target.value)}
                    placeholder="Ex: Hardware, Periféricos..."
                    maxLength={LIMITES.textoMax}
                    autoFocus
                    className="w-full bg-black/25 border border-white/5 focus:border-[#10b981]/60 text-sm text-white px-4 py-3 rounded-xl outline-none transition-all placeholder-gray-600 focus:ring-[3px] focus:ring-[#10b981]/15"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={fecharModal}
                    className="flex-1 px-4 py-3 rounded-xl bg-[#1a1a1a] hover:bg-[#222] border border-gray-800 text-gray-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={salvando}
                    className="flex-1 bg-[#10b981] hover:bg-[#059669] disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-[#0a0a0a] font-bold text-xs px-4 py-3 rounded-xl transition-all shadow-lg shadow-[#10b981]/15 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {salvando ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{categoriaEditando ? 'Salvar Edição' : 'Cadastrar'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}