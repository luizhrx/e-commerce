import api from './api';

export interface Pedido {
  id: number;
  dataCriacao: string;
  status: 'PENDENTE' | 'PAGO' | 'ENVIADO' | 'CANCELADO' | 'ENTREGUE';
  valorTotal: number;
}

export interface DashboardStatus {
  status: string;
  quantidade: number;
}

export interface AtualizarStatusRequest {
  status: string;
}

export interface EnderecoDTO {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
}

// A interface do Carrinho que tinha sumido!
export interface CriarPedidoDTO {
  enderecoId: number;
  itens: {
    produtoId: number;
    quantidade: number;
  }[];
}

const pedidoService = {
  // --- MÉTODOS DO CLIENTE ---
  async criarPedido(usuarioId: number, dados: CriarPedidoDTO): Promise<Pedido> {
    const response = await api.post<Pedido>(`/usuarios/${usuarioId}/pedidos`, dados);
    return response.data;
  },

  async listarMeusPedidos(usuarioId: number): Promise<Pedido[]> {
    const response = await api.get<Pedido[]>(`/usuarios/${usuarioId}/pedidos`);
    return response.data;
  },

  // --- MÉTODOS DO ADMIN ---
  async listarPedidos(): Promise<Pedido[]> {
    const response = await api.get<Pedido[]>('/pedidos');
    return response.data;
  },

  async obterResumoDashboard(): Promise<DashboardStatus[]> {
    const response = await api.get<DashboardStatus[]>('/pedidos/dashboard');
    return response.data;
  },

  async atualizarStatusPedido(id: number, dados: AtualizarStatusRequest): Promise<Pedido> {
    const response = await api.patch<Pedido>(`/pedidos/${id}/status`, dados);
    return response.data;
  }
};

export default pedidoService;