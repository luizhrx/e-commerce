import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import {
  Package, Plus, Edit3, Trash2, X, Save, AlertCircle, RefreshCw,
  Image as ImageIcon, Upload, Search, PackageOpen, Loader2
} from 'lucide-react';
import produtoService, { type Produto } from '../../../services/produtoService';
import categoriaService, { type Categoria } from '../../../services/categoriaService';
import { mensagemDeErro, logErro, urlImagemSegura, LIMITES } from '../../../utils/seguranca';

const TIPOS_IMAGEM = ['image/png', 'image/jpeg', 'image/webp'];
const TAMANHO_MAX_IMAGEM = 5 * 1024 * 1024;

export default function ProdutosAdmin() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [excluindoId, setExcluindoId] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState<number | ''>('');
  const [quantidadeStock, setQuantidadeStock] = useState<number | ''>('');
  const [categoriaId, setCategoriaId] = useState<number | ''>('');

  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [arrastando, setArrastando] = useState(false);

  // Guarda a object URL ativa para revogá-la depois — sem isso cada troca de
  // imagem no modal vaza um blob na memória do navegador.
  const objectUrlRef = useRef<string | null>(null);

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

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  // Filtro por nome em tempo real. Client-side porque `listarTodos` já traz o
  // catálogo inteiro — filtrar aqui é instantâneo e evita bater na API a cada tecla.
  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return produtos;
    return produtos.filter((p) => p.nome.toLowerCase().includes(termo));
  }, [produtos, busca]);

  const definirPreview = (url: string | null, ehObjectUrl: boolean) => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (url && ehObjectUrl) objectUrlRef.current = url;
    setPreviewUrl(url);
  };

  const aplicarArquivo = (file: File) => {
    if (!TIPOS_IMAGEM.includes(file.type)) {
      setModalError('Formato inválido. Envie um arquivo PNG, JPG ou WEBP.');
      return;
    }
    if (file.size > TAMANHO_MAX_IMAGEM) {
      setModalError('A imagem excede o limite de 5MB.');
      return;
    }
    setModalError(null);
    setImagemFile(file);
    definirPreview(URL.createObjectURL(file), true);
  };

  const handleImagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) aplicarArquivo(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setArrastando(false);
    const file = e.dataTransfer.files?.[0];
    if (file) aplicarArquivo(file);
  };

  const handleRemoverImagem = () => {
    setImagemFile(null);
    definirPreview(null, false);
  };

  const abrirModalNovo = () => {
    setProdutoEditando(null);
    setNome('');
    setDescricao('');
    setPreco('');
    setQuantidadeStock('');
    setCategoriaId(categorias.length > 0 ? categorias[0].id : '');
    setImagemFile(null);
    definirPreview(null, false);
    setModalError(null);
    setIsModalOpen(true);
  };

  const abrirModalEdicao = (prod: Produto) => {
    setProdutoEditando(prod);
    setNome(prod.nome);
    setDescricao(prod.descricao);
    setPreco(prod.preco);
    setQuantidadeStock(prod.quantidadeStock);

    // O DTO devolve o nome da categoria, não o id — reconciliamos pelo nome.
    const catEncontrada = categorias.find((c) => c.nome === prod.categoriaNome);
    setCategoriaId(catEncontrada ? catEncontrada.id : '');

    setImagemFile(null);
    definirPreview(urlImagemSegura(prod.imagem), false);
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
    if (!produtoEditando && !imagemFile) return 'Selecione uma imagem para o produto.';
    return null;
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (salvando) return;

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
      categoriaId: Number(categoriaId)
    };

    try {
      if (produtoEditando) {
        await produtoService.atualizarProduto(produtoEditando.id, payload, imagemFile);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await produtoService.criarProduto(payload, imagemFile);
        toast.success('Produto cadastrado com sucesso!');
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

  const handleExcluir = async (id: number, nomeProduto: string) => {
    if (!window.confirm(`Excluir o produto "${nomeProduto}" definitivamente?`)) return;

    setExcluindoId(id);
    try {
      await produtoService.excluirProduto(id);
      setProdutos((prev) => prev.filter((p) => p.id !== id));
      toast.success('Produto excluído.');
    } catch (err: unknown) {
      // Violação de chave estrangeira (produto já vinculado a um pedido) cai aqui.
      // A tela permanece intacta e o usuário recebe uma explicação legível.
      logErro('produtosAdmin:excluir', err);
      toast.error('Não foi possível excluir', {
        description: 'Este produto está vinculado a um pedido existente e não pode ser removido.'
      });
    } finally {
      setExcluindoId(null);
    }
  };

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/[0.025] backdrop-blur-xl p-6 border border-white/5 rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.45)]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-[#10b981]" />
            Catálogo de Produtos
          </h2>
          <p className="text-xs text-gray-500 font-mono mt-1">Gerencie estoque, preços e equipamentos</p>
        </div>
        <button
          onClick={abrirModalNovo}
          className="group relative overflow-hidden bg-gradient-to-r from-[#059669] to-[#10b981] text-[#04140f] font-bold text-xs px-5 py-3 rounded-xl transition-all duration-300 shadow-[0_8px_30px_rgba(16,185,129,0.25)] hover:shadow-[0_10px_45px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <Plus className="relative w-4 h-4" />
          <span className="relative">Novo Produto</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar produto pelo nome..."
            aria-label="Pesquisar produto pelo nome"
            className="w-full bg-white/[0.03] border border-white/5 focus:border-[#10b981]/60 focus:ring-[3px] focus:ring-[#10b981]/15 text-sm text-gray-200 pl-11 pr-10 py-3 rounded-xl outline-none transition-all placeholder-gray-600"
          />
          {busca && (
            <button
              onClick={() => setBusca('')}
              aria-label="Limpar pesquisa"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] font-mono text-gray-400 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
          {produtosFiltrados.length} de {produtos.length} {produtos.length === 1 ? 'item' : 'itens'}
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-gray-800 border-t-2 border-t-[#10b981] animate-spin" />
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-red-950/20 border border-red-500/25 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-sm text-gray-400">{error}</p>
          <button
            onClick={carregarDados}
            className="mt-5 text-xs font-semibold text-[#10b981] inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#10b981]/20 bg-[#10b981]/5 hover:bg-[#10b981]/15 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Tentar novamente
          </button>
        </div>
      ) : (
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-2xl overflow-x-auto shadow-[0_16px_50px_rgba(0,0,0,0.45)]">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/5">
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
                  <td colSpan={6} className="py-16 text-center">
                    <PackageOpen className="w-9 h-9 text-gray-600 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-300">Nenhum produto cadastrado</p>
                    <p className="text-xs text-gray-500 mt-1">Clique em “Novo Produto” para começar.</p>
                  </td>
                </tr>
              ) : produtosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Search className="w-9 h-9 text-gray-600 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-300">Nenhum produto encontrado</p>
                    <p className="text-xs text-gray-500 mt-1">Nada corresponde a “{busca}”.</p>
                    <button
                      onClick={() => setBusca('')}
                      className="mt-5 text-xs font-semibold text-[#10b981] inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#10b981]/20 bg-[#10b981]/5 hover:bg-[#10b981]/15 transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Limpar pesquisa
                    </button>
                  </td>
                </tr>
              ) : (
                produtosFiltrados.map((prod) => (
                  <tr key={prod.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                    <td className="py-3 px-6">
                      <div className="w-10 h-10 rounded-lg bg-[#161616] border border-white/5 overflow-hidden flex items-center justify-center shrink-0">
                        {urlImagemSegura(prod.imagem) ? (
                          <img src={urlImagemSegura(prod.imagem)!} alt={prod.nome} loading="lazy" className="w-full h-full object-contain p-1" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-6 text-sm font-bold text-gray-200 group-hover:text-[#10b981] transition-colors">{prod.nome}</td>
                    <td className="py-3 px-6 text-xs text-gray-400 font-mono">
                      <span className="bg-white/[0.04] px-2 py-1 rounded-md border border-white/5">{prod.categoriaNome}</span>
                    </td>
                    <td className="py-3 px-6 text-right text-sm font-mono text-white">
                      R$ {prod.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-6 text-center text-xs font-mono">
                      <span className={`px-2 py-1 rounded-md border ${prod.quantidadeStock > 0 ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50' : 'bg-red-950/30 text-red-400 border-red-900/50'}`}>
                        {prod.quantidadeStock} un.
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => abrirModalEdicao(prod)}
                          title={`Atualizar ${prod.nome}`}
                          aria-label={`Atualizar ${prod.nome}`}
                          className="p-2 rounded-lg bg-white/[0.04] border border-white/5 text-blue-400 hover:bg-blue-950/30 hover:border-blue-500/30 transition-all cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleExcluir(prod.id, prod.nome)}
                          disabled={excluindoId === prod.id}
                          title={`Excluir ${prod.nome}`}
                          aria-label={`Excluir ${prod.nome}`}
                          className="p-2 rounded-lg bg-white/[0.04] border border-white/5 text-red-400 hover:bg-red-950/30 hover:border-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                        >
                          {excluindoId === prod.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5" />}
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-[#0d0d0d] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
                <h3 className="text-lg font-bold text-white">
                  {produtoEditando ? 'Editar Produto' : 'Cadastrar Produto'}
                </h3>
                <button onClick={fecharModal} aria-label="Fechar" className="text-gray-500 hover:text-white transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <form id="produtoForm" onSubmit={handleSalvar} className="space-y-5">
                  {modalError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{modalError}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="prod-nome" className="text-xs font-semibold text-gray-400 font-mono">NOME DO PRODUTO *</label>
                    <input
                      id="prod-nome"
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      maxLength={LIMITES.textoMax}
                      required
                      className="w-full bg-black/25 border border-white/5 focus:border-[#10b981]/60 focus:ring-[3px] focus:ring-[#10b981]/15 text-sm text-white px-4 py-3 rounded-xl outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="prod-descricao" className="text-xs font-semibold text-gray-400 font-mono">DESCRIÇÃO</label>
                    <textarea
                      id="prod-descricao"
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      rows={3}
                      className="w-full bg-black/25 border border-white/5 focus:border-[#10b981]/60 focus:ring-[3px] focus:ring-[#10b981]/15 text-sm text-white px-4 py-3 rounded-xl outline-none resize-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="prod-preco" className="text-xs font-semibold text-gray-400 font-mono">PREÇO (R$) *</label>
                      <input
                        id="prod-preco"
                        type="number"
                        step="0.01"
                        min="0"
                        value={preco}
                        onChange={(e) => setPreco(e.target.value === '' ? '' : Number(e.target.value))}
                        required
                        className="w-full bg-black/25 border border-white/5 focus:border-[#10b981]/60 focus:ring-[3px] focus:ring-[#10b981]/15 text-sm text-white px-4 py-3 rounded-xl outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="prod-estoque" className="text-xs font-semibold text-gray-400 font-mono">ESTOQUE *</label>
                      <input
                        id="prod-estoque"
                        type="number"
                        min="0"
                        value={quantidadeStock}
                        onChange={(e) => setQuantidadeStock(e.target.value === '' ? '' : Number(e.target.value))}
                        required
                        className="w-full bg-black/25 border border-white/5 focus:border-[#10b981]/60 focus:ring-[3px] focus:ring-[#10b981]/15 text-sm text-white px-4 py-3 rounded-xl outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="prod-categoria" className="text-xs font-semibold text-gray-400 font-mono">CATEGORIA *</label>
                    <select
                      id="prod-categoria"
                      value={categoriaId}
                      onChange={(e) => setCategoriaId(Number(e.target.value))}
                      required
                      className="w-full bg-black/25 border border-white/5 focus:border-[#10b981]/60 focus:ring-[3px] focus:ring-[#10b981]/15 text-sm text-white px-4 py-3 rounded-xl outline-none cursor-pointer transition-all"
                    >
                      <option value="" disabled className="bg-black text-white">Selecione uma categoria...</option>
                      {categorias.map((c) => (
                        <option key={c.id} value={c.id} className="bg-black text-white">{c.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 font-mono">
                      IMAGEM DO PRODUTO {produtoEditando ? '' : '*'}
                    </label>

                    {previewUrl ? (
                      <div className="relative w-full h-48 rounded-xl border border-[#10b981]/30 bg-[#141414] overflow-hidden flex items-center justify-center">
                        <img src={previewUrl} alt="Pré-visualização do produto" className="object-contain w-full h-full p-2" />
                        <button
                          type="button"
                          onClick={handleRemoverImagem}
                          aria-label="Remover imagem"
                          className="absolute top-3 right-3 bg-red-500/80 hover:bg-red-500 text-white p-1.5 rounded-full backdrop-blur-sm transition-all cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {produtoEditando && !imagemFile && (
                          <span className="absolute bottom-3 left-3 text-[10px] font-mono text-gray-300 bg-black/60 px-2 py-1 rounded-md backdrop-blur-sm">
                            Imagem atual — envie outra para substituir
                          </span>
                        )}
                      </div>
                    ) : (
                      <label
                        onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
                        onDragLeave={() => setArrastando(false)}
                        onDrop={handleDrop}
                        className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-all group ${
                          arrastando
                            ? 'border-[#10b981] bg-[#10b981]/10 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
                            : 'border-white/10 hover:border-[#10b981]/60 bg-black/25'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center py-4 pointer-events-none">
                          <Upload className={`w-6 h-6 mb-2 transition-colors ${arrastando ? 'text-[#10b981]' : 'text-gray-500 group-hover:text-[#10b981]'}`} />
                          <p className="text-xs text-gray-300 font-semibold">
                            {arrastando ? 'Solte a imagem aqui' : 'Clique para enviar ou arraste o arquivo'}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-1">PNG, JPG ou WEBP (máx. 5MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/png, image/jpeg, image/webp"
                          onChange={handleImagemChange}
                        />
                      </label>
                    )}
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-white/5 flex gap-3 shrink-0 bg-[#0d0d0d]">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 text-gray-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="produtoForm"
                  disabled={salvando}
                  className="flex-1 bg-gradient-to-r from-[#059669] to-[#10b981] disabled:from-white/[0.04] disabled:to-white/[0.04] disabled:text-gray-500 disabled:cursor-not-allowed text-[#04140f] font-bold text-xs px-4 py-3 rounded-xl transition-all shadow-[0_8px_30px_rgba(16,185,129,0.25)] disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer"
                >
                  {salvando
                    ? <RefreshCw className="w-4 h-4 animate-spin" />
                    : <><Save className="w-4 h-4" /><span>{produtoEditando ? 'Atualizar' : 'Cadastrar'}</span></>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
