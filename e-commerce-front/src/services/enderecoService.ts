import api from './api';

export interface EnderecoRequest {
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface EnderecoResponse {
  id: number;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

const enderecoService = {
  // Cadastra um novo endereço
  async criarEndereco(usuarioId: number, dados: EnderecoRequest): Promise<EnderecoResponse> {
    const response = await api.post<EnderecoResponse>(`/usuarios/${usuarioId}/enderecos`, dados);
    return response.data;
  },

  // NOVO: Busca todos os endereços já salvos do usuário
  async listarEnderecos(usuarioId: number): Promise<EnderecoResponse[]> {
    const response = await api.get<EnderecoResponse[]>(`/usuarios/${usuarioId}/enderecos`);
    return response.data;
  }
};

export default enderecoService;