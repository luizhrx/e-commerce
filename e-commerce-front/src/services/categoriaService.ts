import api from './api';

export interface Categoria {
  id: number;
  nome: string;
}

// Representa o CategoriaRequestDTO que o seu Spring Boot espera receber
export interface CategoriaRequest {
  nome: string;
}

const categoriaService = {
  
  async listarTodas(): Promise<Categoria[]> {
    const response = await api.get<Categoria[]>('/categorias');
    return response.data;
  },

  // NOVO: Chama o @PostMapping
  async criarCategoria(dados: CategoriaRequest): Promise<Categoria> {
    const response = await api.post<Categoria>('/categorias', dados);
    return response.data;
  },

  // NOVO: Chama o @PutMapping("/{id}")
  async atualizarCategoria(id: number, dados: CategoriaRequest): Promise<Categoria> {
    const response = await api.put<Categoria>(`/categorias/${id}`, dados);
    return response.data;
  },

  // NOVO: Chama o @DeleteMapping("/{id}")
  async excluirCategoria(id: number): Promise<void> {
    await api.delete(`/categorias/${id}`);
  }
};

export default categoriaService;