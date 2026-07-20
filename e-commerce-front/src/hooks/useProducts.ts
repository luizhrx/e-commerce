import { useState, useEffect, useRef } from 'react';
import categoriaService, { type Categoria } from '../services/categoriaService';
import produtoService, { type Produto } from '../services/produtoService';
import { logErro } from '../utils/seguranca';


const PRODUTOS_MOCK: Produto[] = [
  { id: 1, nome: 'Teclado Mecânico CoreX Pro', descricao: 'Switch Brown...', preco: 450.00, quantidadeStock: 15, categoriaNome: 'Periféricos', imagem: '' },
  { id: 2, nome: 'Mouse Gamer CoreX Neon X', descricao: 'Sensor óptico...', preco: 380.00, quantidadeStock: 8, categoriaNome: 'Periféricos', imagem: '' },
  { id: 3, nome: 'Monitor Gamer CoreX Vision 27"', descricao: 'Painel IPS...', preco: 2199.90, quantidadeStock: 5, categoriaNome: 'Monitores', imagem: '' },
  { id: 4, nome: 'Headset CoreX SoundStage 7.1', descricao: 'Drivers...', preco: 620.00, quantidadeStock: 12, categoriaNome: 'Áudio', imagem: '' },
  { id: 5, nome: 'Gabinete CoreX CyberCube Glass', descricao: 'Chassi...', preco: 480.00, quantidadeStock: 4, categoriaNome: 'Hardware', imagem: '' },
  { id: 6, nome: 'SSD CoreX HyperDrive 1TB NVMe', descricao: 'Taxas...', preco: 550.00, quantidadeStock: 22, categoriaNome: 'Hardware', imagem: '' },
];

const CATEGORIAS_MOCK: Categoria[] = [
  { id: 1, nome: 'Periféricos' },
  { id: 2, nome: 'Monitores' },
  { id: 3, nome: 'Áudio' },
  { id: 4, nome: 'Hardware' },
];

export function useProducts() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [buscaNome, setBuscaNome] = useState<string>('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<number | undefined>(undefined);
  const [precoMin, setPrecoMin] = useState<string>('');
  const [precoMax, setPrecoMax] = useState<string>('');
  
  const [isSandboxMode, setIsSandboxMode] = useState<boolean>(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function inicializarDados() {
      setLoading(true);
      setError(null);
      try {
        const cats = await categoriaService.listarTodas();
        setCategorias(cats);
        const prods = await produtoService.listarDisponiveis();
        setProdutos(prods);
        setIsSandboxMode(false);
      } catch (err: unknown) {
        logErro('useProducts:inicializar', err);
        if (import.meta.env.VITE_ENABLE_MOCKS === 'true') {
          setCategorias(CATEGORIAS_MOCK);
          setProdutos(PRODUTOS_MOCK);
          setIsSandboxMode(true);
        } else {
          setError("O servidor está temporariamente indisponível.");
          setIsSandboxMode(false);
        }
      } finally {
        setLoading(false);
      }
    }
    inicializarDados();
  }, []);

  const aplicarFiltros = async () => {
    setLoading(true);
    setError(null);
    setPaginaAtual(1); 

    if (isSandboxMode) {
      setTimeout(() => {
        let filtrados = [...PRODUTOS_MOCK];
        if (precoMin !== '' && precoMax !== '') {
          const min = parseFloat(precoMin);
          const max = parseFloat(precoMax);
          if (!isNaN(min) && !isNaN(max)) {
            filtrados = filtrados.filter(p => p.preco >= min && p.preco <= max);
          }
        }
        if (buscaNome !== '') {
          filtrados = filtrados.filter(p => p.nome.toLowerCase().includes(buscaNome.toLowerCase()));
        }
        if (categoriaSelecionada !== undefined) {
          const catNome = CATEGORIAS_MOCK.find(c => c.id === categoriaSelecionada)?.nome;
          if (catNome) filtrados = filtrados.filter(p => p.categoriaNome === catNome);
        }
        setProdutos(filtrados);
        setLoading(false);
      }, 250);
      return;
    }

    try {
      if (precoMin !== '' && precoMax !== '') {
        const min = parseFloat(precoMin);
        const max = parseFloat(precoMax);
        if (!isNaN(min) && !isNaN(max)) {
          const data = await produtoService.buscarPorPreco(min, max);
          setProdutos(data);
          return;
        }
      }
      if (buscaNome !== '' || categoriaSelecionada !== undefined) {
        const data = await produtoService.buscarPorNomeECategoria(buscaNome, categoriaSelecionada);
        setProdutos(data);
        return;
      }
      const data = await produtoService.listarDisponiveis();
      setProdutos(data);
    } catch (err: unknown) {
      logErro('useProducts:aplicarFiltros', err);
      setError("Não foi possível carregar a seleção filtrada. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    aplicarFiltros();
  
  }, [categoriaSelecionada]);

  useEffect(() => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => { aplicarFiltros(); }, 400);
    return () => { if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current); };
  
  }, [buscaNome]);

  const limparFiltros = async () => {
    setBuscaNome('');
    setCategoriaSelecionada(undefined);
    setPrecoMin('');
    setPrecoMax('');
    setLoading(true);
    setError(null);
    setPaginaAtual(1);

    if (isSandboxMode) {
      setProdutos(PRODUTOS_MOCK);
      setLoading(false);
    } else {
      try {
        const data = await produtoService.listarDisponiveis();
        setProdutos(data);
      } catch (err) {
        logErro('useProducts:limparFiltros', err);
      } finally {
        setLoading(false);
      }
    }
  };

 
  return {
    produtos, categorias, loading, error,
    buscaNome, setBuscaNome,
    categoriaSelecionada, setCategoriaSelecionada,
    precoMin, setPrecoMin,
    precoMax, setPrecoMax,
    isSandboxMode,
    paginaAtual, setPaginaAtual,
    aplicarFiltros, limparFiltros
  };
}