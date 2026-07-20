import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  TrendingUp, 
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import pedidoService, { type DashboardStatus } from '../../../services/pedidoService';
import { logErro } from '../../../utils/seguranca';

const RESUMO_MOCK: DashboardStatus[] = [
  { status: 'PENDENTE', quantidade: 8 },
  { status: 'PAGO', quantidade: 14 },
  { status: 'ENVIADO', quantidade: 21 },
  { status: 'ENTREGUE', quantidade: 132 },
  { status: 'CANCELADO', quantidade: 4 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [resumos, setResumos] = useState<DashboardStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [usandoFallback, setUsandoFallback] = useState<boolean>(false);

  async function carregarResumo() {
    setLoading(true);
    try {
      const dados = await pedidoService.obterResumoDashboard();
      if (dados && dados.length > 0) {
        setResumos(dados);
        setUsandoFallback(false);
      } else {
        setResumos(RESUMO_MOCK);
        setUsandoFallback(true);
      }
    } catch (err) {
      logErro('dashboard:obterResumo', err);
      setResumos(RESUMO_MOCK);
      setUsandoFallback(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarResumo();
  }, []);

  // Mapeamento de estilos visuais (ícones, cores, gradientes e bordas) conforme o status
  const obterEstiloStatus = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ENTREGUE':
        return {
          label: 'Entregue',
          icone: CheckCircle2,
          gradiente: 'from-[#10b981]/15 to-transparent',
          borda: 'border-[#10b981]/30 hover:border-[#10b981]/60',
          texto: 'text-[#10b981]',
          bgIcone: 'bg-[#10b981]/10',
          sombra: 'shadow-[0_0_20px_rgba(16,185,129,0.05)]'
        };
      case 'PAGO':
        return {
          label: 'Pago / Aprovado',
          icone: CheckCircle2,
          gradiente: 'from-emerald-500/15 to-transparent',
          borda: 'border-emerald-500/30 hover:border-emerald-500/60',
          texto: 'text-emerald-400',
          bgIcone: 'bg-emerald-500/10',
          sombra: 'shadow-[0_0_20px_rgba(16,185,129,0.05)]'
        };
      case 'ENVIADO':
        return {
          label: 'Enviado / Trânsito',
          icone: Truck,
          gradiente: 'from-blue-500/15 to-transparent',
          borda: 'border-blue-500/30 hover:border-blue-500/60',
          texto: 'text-blue-400',
          bgIcone: 'bg-blue-500/10',
          sombra: 'shadow-[0_0_20px_rgba(59,130,246,0.05)]'
        };
      case 'PENDENTE':
        return {
          label: 'Pendente',
          icone: Clock,
          gradiente: 'from-amber-500/15 to-transparent',
          borda: 'border-amber-500/30 hover:border-amber-500/60',
          texto: 'text-amber-400',
          bgIcone: 'bg-amber-500/10',
          sombra: 'shadow-[0_0_20px_rgba(245,158,11,0.05)]'
        };
      case 'CANCELADO':
        return {
          label: 'Cancelado',
          icone: XCircle,
          gradiente: 'from-red-500/15 to-transparent',
          borda: 'border-red-500/30 hover:border-red-500/60',
          texto: 'text-red-400',
          bgIcone: 'bg-red-500/10',
          sombra: 'shadow-[0_0_20px_rgba(239,68,68,0.05)]'
        };
      default:
        return {
          label: status,
          icone: ShoppingBag,
          gradiente: 'from-gray-500/15 to-transparent',
          borda: 'border-gray-800 hover:border-gray-600',
          texto: 'text-gray-300',
          bgIcone: 'bg-gray-800/50',
          sombra: ''
        };
    }
  };

  const totalPedidos = resumos.reduce((total, item) => total + item.quantidade, 0);

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Estatísticas Administrativas
          </h2>
          <p className="text-xs text-gray-500 font-mono mt-1">
            Análise em tempo real do processamento de vendas
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={carregarResumo}
            className="p-2.5 rounded-xl bg-[#121212] border border-gray-800 text-gray-400 hover:text-[#10b981] hover:border-[#10b981]/40 transition-all cursor-pointer"
            title="Recarregar Dados"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#10b981]' : ''}`} />
          </button>
          
          <span className="text-[10px] bg-[#121212]/80 border border-gray-900 rounded-xl px-3 py-2 text-gray-400 font-mono flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#10b981]" /> CoreX Analytics Live
          </span>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-4">
          <div className="relative flex items-center justify-center">
            <div className="w-14 h-14 rounded-full border-2 border-gray-800 border-t-2 border-t-[#10b981] animate-spin" />
            <TrendingUp className="w-5 h-5 text-[#10b981] absolute animate-pulse" />
          </div>
          <span className="text-xs text-gray-400 font-mono tracking-widest uppercase animate-pulse">
            Sincronizando Métricas...
          </span>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#121212] via-[#0d0d0d] to-[#0a0a0a] border border-[#1a1a1a] relative overflow-hidden group hover:border-[#10b981]/20 transition-all duration-300">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.03)_0%,transparent_60%)] pointer-events-none" />
            <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-[#10b981]/25 to-transparent group-hover:from-[#10b981]/50 transition-all" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/25 text-[9px] font-bold font-mono uppercase tracking-wider text-[#10b981]">
                  <Layers className="w-3 h-3" /> Volume Geral
                </span>
                <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                  {totalPedidos} <span className="text-lg font-medium text-gray-500 font-mono tracking-normal">Pedidos Totais</span>
                </h3>
                <p className="text-xs text-gray-400 max-w-lg leading-relaxed">
                  Histórico acumulado de aquisições de periféricos, hardwares e componentes CoreX processados com excelência e segurança.
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-[#161616] border border-gray-800/80 flex items-center justify-center shadow-inner">
                  <TrendingUp className="w-6 h-6 text-[#10b981]" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest font-mono mb-4">
              Status Operacionais
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
              {resumos.map((resumo, idx) => {
                const estilo = obterEstiloStatus(resumo.status);
                const Icone = estilo.icone;

                return (
                  <motion.div
                    key={resumo.status}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className={`p-5 rounded-2xl bg-[#121212]/80 border backdrop-blur-md flex flex-col justify-between h-40 transition-all duration-300 relative overflow-hidden group ${estilo.borda} ${estilo.sombra}`}
                  >
                    <div className={`absolute -right-10 -bottom-10 w-28 h-28 rounded-full bg-gradient-to-br ${estilo.gradiente} filter blur-xl opacity-40 group-hover:scale-125 transition-transform duration-500 pointer-events-none`} />

                    <div className="flex items-center justify-between">
                      <div className={`w-9 h-9 rounded-xl ${estilo.bgIcone} flex items-center justify-center`}>
                        <Icone className={`w-4.5 h-4.5 ${estilo.texto}`} />
                      </div>
                      <span 
                        onClick={() => navigate('/admin/pedidos')} // <-- ADICIONE O ONCLICK AQUI
                        className="text-[10px] font-mono text-gray-600 flex items-center gap-0.5 hover:text-gray-400 transition-colors cursor-pointer"
                      >
                        Detalhes <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>

                    <div className="space-y-1 z-10">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block font-mono">
                        {estilo.label}
                      </span>
                      <span className="text-3xl font-black text-white font-mono leading-none tracking-tight block group-hover:scale-[1.03] origin-left transition-transform">
                        {resumo.quantidade}
                      </span>
                    </div>

                  </motion.div>
                );
              })}
            </div>
          </div>

          {usandoFallback ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-xs text-amber-400 font-mono">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <p>Painel de vendas indisponível — exibindo números de demonstração, não dados reais.</p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3 text-xs text-gray-500 font-mono">
              <AlertTriangle className="w-4 h-4 text-[#10b981] shrink-0" />
              <p>Os números exibidos representam o fluxo operacional consolidado no banco de dados.</p>
            </div>
          )}

        </motion.div>
      )}

    </div>
  );
}
