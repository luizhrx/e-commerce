import { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle2, Clock, Truck, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import pedidoService, { type Pedido } from '../../../services/pedidoService';
import { toast } from 'sonner';
import { mensagemDeErro, logErro } from '../../../utils/seguranca';

export default function PedidosAdmin() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [atualizandoId, setAtualizandoId] = useState<number | null>(null);

  async function carregarPedidos() {
    setLoading(true);
    setError(null);
    try {
      const dados = await pedidoService.listarPedidos();
      const ordenados = [...dados].sort((a, b) => b.id - a.id);
      setPedidos(ordenados);
    } catch (err: unknown) {
      logErro('pedidosAdmin:listar', err);
      setError(mensagemDeErro(err, 'Não foi possível carregar a lista de pedidos.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarPedidos();
  }, []);

  const handleAtualizarStatus = async (id: number, novoStatus: string) => {
    setAtualizandoId(id);
    try {
      const pedidoAtualizado = await pedidoService.atualizarStatusPedido(id, { status: novoStatus });

      setPedidos(prevPedidos =>
        prevPedidos.map(p => p.id === id ? pedidoAtualizado : p)
      );

      // O backend pode recusar a transição e devolver o pedido com o status antigo.
      if (pedidoAtualizado.status === novoStatus) {
        toast.success(`Pedido #${id} atualizado para ${novoStatus}!`);
      } else {
        toast.warning('Mudança recusada', {
          description: `O servidor manteve o status como ${pedidoAtualizado.status}. Verifique as regras de negócio.`
        });
      }

    } catch (err: unknown) {
      logErro('pedidosAdmin:atualizarStatus', err);
      toast.error('Falha ao atualizar', {
        description: mensagemDeErro(err, 'Não foi possível atualizar o status do pedido.')
      });
    } finally {
      setAtualizandoId(null);
    }
  };

  const formatarData = (dataString: string) => {
    try {
      return new Date(dataString).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dataString;
    }
  };

  const obterIconeStatus = (status: string) => {
    switch (status) {
      case 'ENTREGUE': return <CheckCircle2 className="w-4 h-4 text-[#10b981]" />;
      case 'PAGO': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'ENVIADO': return <Truck className="w-4 h-4 text-blue-500" />;
      case 'PENDENTE': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'CANCELADO': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#121212]/40 p-6 border border-[#1a1a1a] rounded-2xl backdrop-blur-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-[#10b981]" />
            Gerenciar Pedidos
          </h2>
          <p className="text-xs text-gray-500 font-mono mt-1">
            Acompanhe e atualize o fluxo logístico de todas as vendas
          </p>
        </div>
        <button
          onClick={carregarPedidos}
          className="bg-[#121212] hover:bg-[#161616] text-gray-300 border border-gray-800 font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#10b981]' : ''}`} />
          <span>Recarregar</span>
        </button>
      </div>

      {loading ? (
        <div className="py-24 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-gray-800 border-t-2 border-t-[#10b981] animate-spin" />
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-red-950/20 border border-red-500/20 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      ) : (
        <div className="bg-[#121212]/80 border border-[#1c1c1c] rounded-2xl overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[820px]">
            <thead>
              <tr className="bg-[#161616] border-b border-[#1c1c1c]">
                <th className="py-4 px-6 text-[10px] font-mono text-gray-500 uppercase font-semibold">ID do Pedido</th>
                <th className="py-4 px-6 text-[10px] font-mono text-gray-500 uppercase font-semibold">Cliente</th>
                <th className="py-4 px-6 text-[10px] font-mono text-gray-500 uppercase font-semibold">Data da Compra</th>
                <th className="py-4 px-6 text-[10px] font-mono text-gray-500 uppercase font-semibold text-right">Valor Total</th>
                <th className="py-4 px-6 text-[10px] font-mono text-gray-500 uppercase font-semibold text-right w-48">Alterar Status</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-xs text-gray-500">Nenhum pedido registrado.</td>
                </tr>
              ) : (
                pedidos.map((pedido) => (
                  <tr key={pedido.id} className="border-b border-[#1c1c1c]/50 hover:bg-[#161616]/50 transition-colors">
                    <td className="py-4 px-6 text-sm font-bold text-gray-200">#{pedido.id}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#181818] to-[#2a2a2a] border border-white/10 flex items-center justify-center text-gray-300 font-bold text-[10px] uppercase shrink-0">
                          {(pedido.usuarioNome ?? '?').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-gray-200 truncate">
                            {pedido.usuarioNome ?? 'Cliente não identificado'}
                          </span>
                          {pedido.usuarioEmail && (
                            <span className="text-[11px] text-gray-500 font-mono truncate">{pedido.usuarioEmail}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-400 font-mono">{formatarData(pedido.dataCriacao)}</td>
                    <td className="py-4 px-6 text-right text-sm font-mono text-[#10b981] font-bold">
                      R$ {pedido.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {obterIconeStatus(pedido.status)}
                        <select
                          value={pedido.status}
                          disabled={atualizandoId === pedido.id}
                          onChange={(e) => handleAtualizarStatus(pedido.id, e.target.value)}
                          className="bg-[#181818] border border-gray-800 text-xs text-gray-300 px-3 py-2 rounded-lg outline-none focus:border-[#10b981] cursor-pointer disabled:opacity-50"
                        >
                          <option value="PENDENTE">Pendente</option>
                          <option value="PAGO">Pago</option>
                          <option value="ENVIADO">Enviado</option>
                          <option value="ENTREGUE">Entregue</option>
                          <option value="CANCELADO">Cancelado</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}