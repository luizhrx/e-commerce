import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { 
  Package, Plus, Edit3, Trash2, X, Save, AlertCircle, RefreshCw, Image as ImageIcon
} from 'lucide-react';
import produtoService, { type Produto } from '../../../services/produtoService';
import categoriaService, { type Categoria } from '../../../services/categoriaService';
import { mensagemDeErro, logErro, urlImagemSegura, LIMITES } from '../../../utils/seguranca';

export default function ProdutosAdmin() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Campos do Formulário
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState<number | ''>('');
  const [quantidadeStock, setQuantidadeStock] = useState<number | ''>('');
  const [categoriaId, setCategoriaId] = useState<number | ''>('');
  const [imagem, setImagem] = useState('');

  async function carregarDados() {
    setLoading(true);
    setError(null);
    try {
      const [prods, cats] = await Promise.all([
        produtoService.listarTodos(),
        categoriaService.listarTodas()
      ]);
      setProdutos(prods);
      setCategorias(cats);
    } catch (err: unknown) {
      logErro('produtosAdmin:carregarDados', err);
      setError(mensagemDeErro(err, 'Não foi possível carregar os dados do catálogo.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const abrirModalNovo = () => {
    setProdutoEditando(null);
    setNome('');
    setDescricao('');
    setPreco('');
    setQuantidadeStock('');
    setCategoriaId(categorias.length > 0 ? categorias[0].id : '');
    setImagem('');
    setModalError(null);
    setIsModalOpen(true);
  };

  const abrirModalEdicao = (prod: Produto) => {
    setProdutoEditando(prod);
    setNome(prod.nome);
    setDescricao(prod.descricao);
    setPreco(prod.preco);
    setQuantidadeStock(prod.quantidadeStock);
    
    // Descobre o ID da categoria baseada no nome que veio no DTO
    const catEncontrada = categorias.find(c => c.nome === prod.categoriaNome);
    setCategoriaId(catEncontrada ? catEncontrada.id : '');
    
    setImagem(prod.imagem);
    setModalError(null);
    setIsModalOpen(true);
  };

  const fecharModal = () => setIsModalOpen(false);

  const validarFormulario = (): string | null => {
    if (!nome.trim()) return 'Informe o nome do produto.';
    if (nome.trim().length > LIMITES.textoMax) return `O nome deve ter no máximo ${LIMITES.textoMax} caracteres.`;
    if (preco === '' || Number(preco) <= 0) return 'Informe um preço maior que zero.';
    if (quantidadeStock === '' || Number(quantidadeStock) < 0) return 'Informe um estoque válido (0 ou mais).';
    if (!Number.isInteger(Number(quantidadeStock))) return 'O estoque deve ser um número inteiro.';
    if (categoriaId === '') return 'Selecione uma categoria.';
    // A URL vira o `src` de um <img>; barramos aqui esquemas como javascript:/data:.
    if (!urlImagemSegura(imagem)) return 'Informe uma URL de imagem válida (http:// ou https://).';
    return null;
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();

    const invalido = validarFormulario();
    if (invalido) {
      setModalError(invalido);
      return;
    }

    setSalvando(true);
    setModalError(null);

    const payload = {
      nome: nome.trim(),
      descricao: descricao.trim(),
      preco: Number(preco),
      quantidadeStock: Number(quantidadeStock),
      categoriaId: Number(categoriaId),
      imagem: imagem.trim()
    };

    try {
      if (produtoEditando) {
        await produtoService.atualizarProduto(produtoEditando.id, payload);
      } else {
        await produtoService.criarProduto(payload);
      }
      fecharModal();
      carregarDados();
    } catch (err: unknown) {
      logErro('produtosAdmin:salvar', err);
      setModalError(mensagemDeErro(err, 'Não foi possível salvar o produto.'));
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (id: number, nome: string) => {
    if (!window.confirm(`Excluir o produto "${nome}" definitivamente?`)) return;

    try {
      await produtoService.excluirProduto(id);
      setProdutos(produtos.filter(p => p.id !== id));
    } catch (err: unknown) {
      logErro('produtosAdmin:excluir', err);
      toast.error('Não foi possível excluir', {
        description: 'O produto pode estar vinculado a um pedido existente.'
      });
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#121212]/40 p-6 border border-[#1a1a1a] rounded-2xl backdrop-blur-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-[#10b981]" />
            Catálogo de Produtos
          </h2>
          <p className="text-xs text-gray-500 font-mono mt-1">Gerencie estoque, preços e equipamentos</p>
        </div>
        <button
          onClick={abrirModalNovo}
          className="bg-[#10b981] hover:bg-[#059669] text-[#0a0a0a] font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-[#10b981]/15 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Produto</span>
        </button>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-gray-800 border-t-2 border-t-[#10b981] animate-spin" />
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-red-950/20 border border-red-500/20 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      ) : (
        <div className="bg-[#121212]/80 border border-[#1c1c1c] rounded-2xl overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#161616] border-b border-[#1c1c1c]">
                <th className="py-4 px-6 text-[10px] font-mono text-gray-500 uppercase tracking-wider font-semibold w-16">Img</th>
                <th className="py-4 px-6 text-[10px] font-mono text-gray-500 uppercase tracking-wider font-semibold">Produto</th>
                <th className="py-4 px-6 text-[10px] font-mono text-gray-500 uppercase tracking-wider font-semibold">Categoria</th>
                <th className="py-4 px-6 text-[10px] font-mono text-gray-500 uppercase tracking-wider font-semibold text-right">Preço</th>
                <th className="py-4 px-6 text-[10px] font-mono text-gray-500 uppercase tracking-wider font-semibold text-center">Estoque</th>
                <th className="py-4 px-6 text-[10px] font-mono text-gray-500 uppercase tracking-wider font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-xs text-gray-500">Nenhum produto cadastrado.</td>
                </tr>
              ) : (
                produtos.map((prod) => (
                  <tr key={prod.id} className="border-b border-[#1c1c1c]/50 hover:bg-[#161616]/50 transition-colors group">
                    <td className="py-3 px-6">
                      <div className="w-10 h-10 rounded-lg bg-[#161616] border border-white/5 overflow-hidden flex items-center justify-center shrink-0">
                        {urlImagemSegura(prod.imagem) ? (
                          <img src={urlImagemSegura(prod.imagem)!} alt={prod.nome} loading="lazy" className="w-full h-full object-contain p-1" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-6 text-sm font-bold text-gray-200 group-hover:text-[#10b981] transition-colors line-clamp-1">{prod.nome}</td>
                    <td className="py-3 px-6 text-xs text-gray-400 font-mono"><span className="bg-[#1a1a1a] px-2 py-1 rounded-md border border-gray-800">{prod.categoriaNome}</span></td>
                    <td className="py-3 px-6 text-right text-sm font-mono text-white">R$ {prod.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-6 text-center text-xs font-mono">
                      <span className={`px-2 py-1 rounded-md border ${prod.quantidadeStock > 0 ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50' : 'bg-red-950/30 text-red-400 border-red-900/50'}`}>
                        {prod.quantidadeStock} un.
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => abrirModalEdicao(prod)} className="p-2 rounded-lg bg-[#1a1a1a] border border-gray-800 text-blue-400 hover:bg-blue-950/30 hover:border-blue-500/30 transition-all cursor-pointer"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleExcluir(prod.id, prod.nome)} className="p-2 rounded-lg bg-[#1a1a1a] border border-gray-800 text-red-400 hover:bg-red-950/30 hover:border-red-500/30 transition-all cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }} onClick={fecharModal} className="absolute inset-0 bg-black backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-[#0d0d0d] border border-[#1c1c1c] rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-[#1c1c1c] shrink-0">
                <h3 className="text-lg font-bold text-white">{produtoEditando ? 'Editar Produto' : 'Cadastrar Produto'}</h3>
                <button onClick={fecharModal} className="text-gray-500 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <form id="produtoForm" onSubmit={handleSalvar} className="space-y-5">
                  {modalError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{modalError}</span></div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 font-mono">NOME DO PRODUTO *</label>
                    <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required className="w-full bg-[#141414] border border-gray-800 focus:border-[#10b981] text-sm text-white px-4 py-3 rounded-xl outline-none" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 font-mono">DESCRIÇÃO</label>
                    <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} className="w-full bg-[#141414] border border-gray-800 focus:border-[#10b981] text-sm text-white px-4 py-3 rounded-xl outline-none resize-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-400 font-mono">PREÇO (R$) *</label>
                      <input type="number" step="0.01" min="0" value={preco} onChange={(e) => setPreco(Number(e.target.value))} required className="w-full bg-[#141414] border border-gray-800 focus:border-[#10b981] text-sm text-white px-4 py-3 rounded-xl outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-400 font-mono">ESTOQUE *</label>
                      <input type="number" min="0" value={quantidadeStock} onChange={(e) => setQuantidadeStock(Number(e.target.value))} required className="w-full bg-[#141414] border border-gray-800 focus:border-[#10b981] text-sm text-white px-4 py-3 rounded-xl outline-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 font-mono">CATEGORIA *</label>
                    <select value={categoriaId} onChange={(e) => setCategoriaId(Number(e.target.value))} required className="w-full bg-[#141414] border border-gray-800 focus:border-[#10b981] text-sm text-white px-4 py-3 rounded-xl outline-none cursor-pointer">
                      <option value="" disabled>Selecione uma categoria...</option>
                      {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 font-mono">URL DA IMAGEM *</label>
                    <input type="url" value={imagem} onChange={(e) => setImagem(e.target.value)} placeholder="https://..." required className="w-full bg-[#141414] border border-gray-800 focus:border-[#10b981] text-sm text-white px-4 py-3 rounded-xl outline-none" />
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-[#1c1c1c] flex gap-3 shrink-0 bg-[#0d0d0d]">
                <button type="button" onClick={fecharModal} className="flex-1 px-4 py-3 rounded-xl bg-[#1a1a1a] hover:bg-[#222] border border-gray-800 text-gray-300 text-xs font-bold transition-all">Cancelar</button>
                <button type="submit" form="produtoForm" disabled={salvando} className="flex-1 bg-[#10b981] hover:bg-[#059669] disabled:bg-gray-800 disabled:text-gray-500 text-[#0a0a0a] font-bold text-xs px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                  {salvando ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /><span>{produtoEditando ? 'Atualizar' : 'Cadastrar'}</span></>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}