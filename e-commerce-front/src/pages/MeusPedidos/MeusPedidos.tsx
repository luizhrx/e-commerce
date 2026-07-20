import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  ArrowLeft, 
  Package, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertTriangle,
  Truck,
  Sparkles
} from 'lucide-react';
import pedidoService, { type Pedido } from '../../services/pedidoService';
import { useAuth } from '../../context/AuthContext';
import { mensagemDeErro, logErro } from '../../utils/seguranca';

const PEDIDOS_MOCK: Pedido[] = [
  { id: 1045, dataCriacao: '2026-07-10T14:30:00Z', status: 'ENTREGUE', valorTotal: 830.00 },
  { id: 1042, dataCriacao: '2026-07-08T09:15:00Z', status: 'ENVIADO', valorTotal: 2199.90 },
  { id: 1039, dataCriacao: '2026-07-05T18:45:00Z', status: 'PAGO', valorTotal: 450.00 },
  { id: 1024, dataCriacao: '2026-06-20T11:00:00Z', status: 'CANCELADO', valorTotal: 380.00 }
];

export default function MeusPedidos() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function carregarPedidos() {
      if (!user) return;

      setLoading(true);
      setError(null);
      try {
        const dados = await pedidoService.listarMeusPedidos(user.id);
        const ordenados = [...dados].sort(
          (a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
        );
        setPedidos(ordenados);
      } catch (err) {
        logErro('meusPedidos:listar', err);
        if (import.meta.env.VITE_ENABLE_MOCKS === 'true') {
          setPedidos(PEDIDOS_MOCK);
        } else {
          setError(mensagemDeErro(err, 'Não foi possível carregar seu histórico de pedidos.'));
        }
      } finally {
        setLoading(false);
      }
    }

    carregarPedidos();
  }, [user]);

  const formatarData = (dataString: string) => {
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dataString;
    }
  };

  const renderStatusBadge = (status: Pedido['status']) => {
    switch (status) {
      case 'ENTREGUE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/30 text-xs font-bold text-[#10b981] font-mono uppercase tracking-wide">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Entregue</span>
          </span>
        );
      case 'ENVIADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-bold text-blue-400 font-mono uppercase tracking-wide">
            <Truck className="w-3.5 h-3.5 animate-pulse" />
            <span>Em Trânsito</span>
          </span>
        );
      case 'PAGO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400 font-mono uppercase tracking-wide">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Aprovado</span>
          </span>
        );
      case 'PENDENTE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-400 font-mono uppercase tracking-wide">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>Processando</span>
          </span>
        );
      case 'CANCELADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-bold text-red-400 font-mono uppercase tracking-wide">
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelado</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-500/10 border border-gray-500/30 text-xs font-bold text-gray-400 font-mono uppercase tracking-wide">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Desconhecido</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex flex-col font-sans selection:bg-[#10b981]/30 selection:text-[#10b981]">
      
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-[#141414] to-[#1e1e1e] border border-[#10b981]/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <ShoppingBag className="w-5 h-5 text-[#10b981]" />
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-wider text-white">
                CORE<span className="text-[#10b981] drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">X</span>
              </span>
              <p className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">Premium Gaming Setup</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-gray-300 hover:text-white hover:border-white/15 hover:bg-white/[0.06] transition-all text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar à Loja</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 md:py-14 w-full">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Meus <span className="text-[#10b981]">Pedidos</span>
            </h1>
            <p className="text-xs text-gray-500 font-mono mt-1">Acompanhe suas aquisições de alta performance CoreX</p>
          </div>
          <span className="text-[10px] bg-[#121212] border border-gray-900 rounded-xl px-3 py-1.5 text-gray-400 font-mono flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#10b981]" /> Atualizações em tempo real
          </span>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-gray-800 border-t-2 border-t-[#10b981] animate-spin" />
            <span className="text-xs text-gray-500 font-mono uppercase tracking-widest">Sincronizando com o servidor...</span>
          </div>
        ) : error ? (
          <div className="p-10 rounded-2xl bg-red-950/20 border border-red-500/20 flex flex-col items-center justify-center text-center py-20 mt-8">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-lg font-bold text-white">Falha de Comunicação</h2>
            <p className="text-xs text-gray-400 mt-2 max-w-md">{error}</p>
          </div>
        ) : pedidos.length === 0 ? ( 
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-10 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm flex flex-col items-center justify-center text-center py-20"
          >
            <div className="w-16 h-16 rounded-full bg-[#181818] border border-gray-800 flex items-center justify-center mb-5">
              <Package className="w-7 h-7 text-gray-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-300">Nenhum pedido localizado</h2>
            <p className="text-xs text-gray-500 mt-2 max-w-sm leading-relaxed">
              Você ainda não realizou compras na plataforma. Descubra produtos de última geração e dê o próximo passo no seu setup gamer.
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 bg-[#10b981] hover:bg-[#059669] text-[#0a0a0a] font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-lg shadow-[#10b981]/15 cursor-pointer flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Voltar às Compras</span>
            </button>
          </motion.div>

        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido, index) => (
              <motion.div
                key={pedido.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-6 rounded-2xl bg-white/[0.025] border border-white/5 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.45)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group hover:border-[#10b981]/25 hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#161616] border border-gray-800/80 flex items-center justify-center group-hover:bg-[#10b981]/5 group-hover:border-[#10b981]/20 transition-all flex-shrink-0">
                    <Package className="w-5 h-5 text-gray-400 group-hover:text-[#10b981] transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-black text-white tracking-wide font-mono group-hover:text-[#10b981] transition-colors">
                      PEDIDO #{(pedido.id ?? 0).toString().padStart(4, '0')}X
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-600" />
                        {formatarData(pedido.dataCriacao)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 w-full md:w-auto border-t border-[#1a1a1a] md:border-0 pt-4 md:pt-0">
                  
                  <div>
                    {renderStatusBadge(pedido.status)}
                  </div>

                  <div className="text-right flex flex-col md:items-end">
                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block md:hidden">Valor Total</span>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-[#10b981] font-bold" />
                      <span className="text-lg font-black text-[#10b981] font-mono tracking-tight">
                        {pedido.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                </div>

              </motion.div>
            ))}
          </div>

        )}

      </main>

      <footer className="bg-[#070707] border-t border-white/5 py-8 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-mono">
          <p>© 2026 CoreX E-Commerce. Todos os direitos reservados.</p>
          <p className="text-[#10b981] font-bold">Premium Experience</p>
        </div>
      </footer>

    </div>
  );
}