import api from './api';

export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  quantidadeStock: number;
  categoriaNome: string; 
  imagem: string; 
}

export interface ProdutoRequest {
  nome: string;
  descricao: string;
  preco: number;
  quantidadeStock: number;
  categoriaId: number;
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

  // --- ATUALIZADO: ENVIO COM IMAGEM PARA A NUVEM ---
  async criarProduto(dados: ProdutoRequest, imagem: File | null): Promise<Produto> {
    const formData = new FormData();

    // 1. Transforma o DTO em um Blob JSON para o Spring Boot ler o texto
    formData.append(
      'dados',
      new Blob([JSON.stringify(dados)], { type: 'application/json' })
    );

    // 2. Anexa a foto física
    if (imagem) {
      formData.append('imagem', imagem);
    }

    // 3. Dispara avisando que é multipart
    const response = await api.post<Produto>('/produtos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async atualizarProduto(id: number, dados: ProdutoRequest, imagem: File | null): Promise<Produto> {
    const formData = new FormData();

    // Empacota o texto
    formData.append(
      'dados',
      new Blob([JSON.stringify(dados)], { type: 'application/json' })
    );

    // Se o usuário selecionou uma foto nova, anexa. Se não, vai null e o Java ignora.
    if (imagem) {
      formData.append('imagem', imagem);
    }

    const response = await api.put<Produto>(`/produtos/atualizar/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async excluirProduto(id: number): Promise<void> {
    await api.delete(`/produtos/${id}`);
  }
};

export default produtoService;