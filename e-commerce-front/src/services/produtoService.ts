import api from './api';

export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  quantidadeStock: number;
  categoriaNome: string; // Retornado no ResponseDTO do seu Java
  imagem: string;
}

// Interface EXATA do seu ProdutoRequestDTO
export interface ProdutoRequest {
  nome: string;
  descricao: string;
  preco: number;
  quantidadeStock: number;
  categoriaId: number;
  imagem: string;
}

const produtoService = {
  // --- MÉTODOS PÚBLICOS (LOJA) ---
  async listarDisponiveis(): Promise<Produto[]> {
    const response = await api.get<Produto[]>('/produtos/disponiveis');
    return response.data;
  },
  
  async buscarPorId(id: number): Promise<Produto> {
    const response = await api.get<Produto>(`/produtos/${id}`);
    return response.data;
  },

  async buscarPorPreco(min: number, max: number): Promise<Produto[]> {
    const response = await api.get<Produto[]>('/produtos/preco', {
      params: { min, max }
    });
    return response.data;
  },

  async buscarPorNomeECategoria(nome: string, categoriaId?: number): Promise<Produto[]> {
    const response = await api.get<Produto[]>('/produtos/nome', {
      params: { 
        nome, 
        categoriaId 
      }
    });
    return response.data;
  },

  // --- MÉTODOS DO ADMIN ---
  async listarTodos(): Promise<Produto[]> {
    const response = await api.get<Produto[]>('/produtos');
    return response.data;
  },

  async criarProduto(dados: ProdutoRequest): Promise<Produto> {
    const response = await api.post<Produto>('/produtos', dados);
    return response.data;
  },

  // Atenção aqui: rota /atualizar/{id} conforme seu ProdutoController
  async atualizarProduto(id: number, dados: ProdutoRequest): Promise<Produto> {
    const response = await api.put<Produto>(`/produtos/atualizar/${id}`, dados);
    return response.data;
  },

  async excluirProduto(id: number): Promise<void> {
    await api.delete(`/produtos/${id}`);
  }
};

export default produtoService;