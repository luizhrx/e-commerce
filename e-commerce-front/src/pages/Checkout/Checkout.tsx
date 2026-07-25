import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import pedidoService from '../../services/pedidoService';
import enderecoService, { type EnderecoResponse } from '../../services/enderecoService';
import { MapPin, CreditCard, ShoppingBag, ShieldCheck, Truck, Loader2, Plus, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import {
  mensagemDeErro, statusDoErro, logErro, urlImagemSegura,
  apenasDigitos, formatarCep, LIMITES
} from '../../utils/seguranca';

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, valorTotal, limparCarrinho } = useCart();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);

  const [enderecosSalvos, setEnderecosSalvos] = useState<EnderecoResponse[]>([]);
  const [enderecoSelecionadoId, setEnderecoSelecionadoId] = useState<number | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(true);

  const [carregandoCep, setCarregandoCep] = useState(false);
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');

  // O carrinho é esvaziado ao concluir o pedido; sem esta trava o effect de guarda
  // veria o carrinho vazio e redirecionaria para /carrinho, competindo com a ida
  // para /pedidos.
  const pedidoConcluido = useRef(false);

  useEffect(() => {
    if (pedidoConcluido.current) return;

    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    if (cartItems.length === 0) {
      navigate('/carrinho', { replace: true });
    }
  }, [user, cartItems, navigate]);

  useEffect(() => {
    if (!user) return;

    enderecoService.listarEnderecos(user.id)
      .then(dados => {
        setEnderecosSalvos(dados);
        if (dados.length > 0) {
          setMostrarFormulario(false);
          setEnderecoSelecionadoId(dados[0].id);
        }
      })
      .catch(err => logErro('checkout:listarEnderecos', err));
  }, [user]);

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const mascarado = formatarCep(e.target.value);
    setCep(mascarado);

    const cepLimpo = apenasDigitos(mascarado);
    if (cepLimpo.length !== LIMITES.cepDigitos) return;

    setCarregandoCep(true);
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      if (response.data.erro) {
        toast.error('CEP não encontrado', { description: 'Confira o número informado.' });
        setLogradouro(''); setBairro(''); setCidade(''); setUf('');
        return;
      }
      setLogradouro(response.data.logradouro ?? '');
      setBairro(response.data.bairro ?? '');
      setCidade(response.data.localidade ?? '');
      setUf(response.data.uf ?? '');
      toast.success('Endereço localizado!');
      document.getElementById('input-numero')?.focus();
    } catch (err) {
      logErro('checkout:viaCep', err);
      toast.error('Erro de conexão', { description: 'Não foi possível consultar o CEP.' });
    } finally {
      setCarregandoCep(false);
    }
  };

  const validarEndereco = (): string | null => {
    if (apenasDigitos(cep).length !== LIMITES.cepDigitos) return 'Informe um CEP válido com 8 dígitos.';
    if (!logradouro.trim()) return 'Informe a rua / logradouro.';
    if (!numero.trim()) return 'Informe o número.';
    if (!bairro.trim()) return 'Informe o bairro.';
    if (!cidade.trim()) return 'Informe a cidade.';
    if (!/^[A-Z]{2}$/.test(uf.trim())) return 'Informe uma UF válida com 2 letras.';
    return null;
  };

  const handleFinalizarPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || loading) return;

    let finalEnderecoId = enderecoSelecionadoId;

    if (mostrarFormulario) {
      const invalido = validarEndereco();
      if (invalido) {
        toast.error('Dados incompletos', { description: invalido });
        return;
      }

      setLoading(true);
      try {
        const novoEndereco = await enderecoService.criarEndereco(user.id, {
          rua: logradouro.trim(),
          numero: numero.trim(),
          complemento: complemento.trim(),
          bairro: bairro.trim(),
          cidade: cidade.trim(),
          estado: uf.trim().substring(0, 2),
          cep: apenasDigitos(cep)
        });
        finalEnderecoId = novoEndereco.id;
      } catch (err) {
        logErro('checkout:criarEndereco', err);
        setLoading(false);
        toast.error('Erro no endereço', {
          description: mensagemDeErro(err, 'Não foi possível cadastrar o novo endereço.')
        });
        return;
      }
    }

    if (!finalEnderecoId) {
      setLoading(false);
      toast.error('Selecione um endereço para continuar.');
      return;
    }

    setLoading(true);
    try {
      const payloadPedido = {
        enderecoId: finalEnderecoId,
        itens: cartItems.map(item => ({
          produtoId: item.id,
          quantidade: item.quantidadeSelecionada
        }))
      };

      await pedidoService.criarPedido(user.id, payloadPedido);
      pedidoConcluido.current = true;
      limparCarrinho();
      toast.success('Pedido realizado com sucesso!');
      navigate('/pedidos', { replace: true });
    } catch (err) {
      logErro('checkout:criarPedido', err);

      // 409 é o conflito de estoque do backend. A mensagem é escrita aqui, no
      // front — o texto do servidor nunca é repassado ao usuário.
      const descricao = statusDoErro(err) === 409
        ? 'Um dos itens não tem mais estoque suficiente. Revise seu carrinho.'
        : mensagemDeErro(err, 'Verifique os dados e tente novamente.');

      toast.error('Falha ao finalizar', { description: descricao });
    } finally {
      setLoading(false);
    }
  };

  const freteFixo = valorTotal > 250 ? 0 : 45.90;
  const totalGeral = valorTotal + freteFixo;

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-gray-100 font-sans selection:bg-[#10b981]/30 selection:text-[#10b981]">

      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[420px] bg-[#10b981]/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 -right-32 w-[420px] h-[420px] bg-[#6d28d9]/8 rounded-full blur-[140px]" />
      </div>

      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-[#141414] to-[#1e1e1e] border border-[#10b981]/20 shadow-[0_0_25px_rgba(16,185,129,0.12)]">
              <ShoppingBag className="w-5 h-5 text-[#10b981]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-wider text-white">
                CORE<span className="text-[#10b981] drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">X</span>
              </span>
              <p className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">Finalizar Compra</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/carrinho')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-gray-300 hover:text-white hover:border-white/15 transition-all text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:block">Voltar ao Carrinho</span>
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-14 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white/[0.025] backdrop-blur-xl border border-white/5 rounded-2xl p-5 sm:p-6 md:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] relative overflow-hidden">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <MapPin className="w-5 h-5 text-[#10b981]" />
              Endereço de Entrega
            </h2>

            {enderecosSalvos.length > 0 && (
              <div className="mb-8">
                <p className="text-xs text-gray-400 mb-3 font-semibold uppercase tracking-wider">Selecione onde quer receber</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {enderecosSalvos.map((end) => (
                    <div 
                      key={end.id}
                      onClick={() => { setEnderecoSelecionadoId(end.id); setMostrarFormulario(false); }}
                      className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:-translate-y-0.5 ${
                        enderecoSelecionadoId === end.id && !mostrarFormulario
                          ? 'border-[#10b981]/40 bg-[#10b981]/10 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
                          : 'border-white/5 bg-white/[0.02] hover:border-white/15'
                      }`}
                    >
                      {enderecoSelecionadoId === end.id && !mostrarFormulario && (
                        <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-[#10b981]" />
                      )}
                      <p className="text-sm font-bold text-white mb-1 pr-6 truncate">{end.rua}, {end.numero}</p>
                      <p className="text-xs text-gray-400 truncate">{end.bairro}</p>
                      <p className="text-xs text-gray-400 truncate">{end.cidade} - {end.estado}</p>
                      <p className="text-[10px] font-mono text-gray-500 mt-2">CEP: {end.cep}</p>
                    </div>
                  ))}

                  <div 
                    onClick={() => { setEnderecoSelecionadoId(null); setMostrarFormulario(true); }}
                    className={`p-4 rounded-xl border border-dashed flex flex-col items-center justify-center cursor-pointer transition-all min-h-[120px] ${mostrarFormulario ? 'border-[#10b981] bg-[#10b981]/5 text-[#10b981]' : 'border-gray-700 bg-transparent text-gray-500 hover:border-gray-500 hover:text-gray-300'}`}
                  >
                    <Plus className="w-6 h-6 mb-2" />
                    <span className="text-xs font-bold uppercase tracking-wider">Novo Endereço</span>
                  </div>
                </div>
              </div>
            )}

            {mostrarFormulario && (
              <form id="form-checkout" onSubmit={handleFinalizarPedido} className="space-y-4 animate-in fade-in slide-in-from-top-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">CEP</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        maxLength={9}
                        value={cep} 
                        onChange={handleCepChange}
                        placeholder="00000-000"
                        className="w-full bg-black/25 border border-white/5 focus:border-[#10b981]/60 focus:ring-[3px] focus:ring-[#10b981]/15 text-sm text-gray-200 px-4 py-3 rounded-xl outline-none transition-all placeholder-gray-600" 
                      />
                      {carregandoCep && <Loader2 className="w-4 h-4 text-[#10b981] animate-spin absolute right-3 top-3.5" />}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Rua / Logradouro</label>
                    <input type="text" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} className="w-full bg-black/25 border border-white/5 focus:border-[#10b981]/60 focus:ring-[3px] focus:ring-[#10b981]/15 text-sm text-gray-200 px-4 py-3 rounded-xl outline-none transition-all placeholder-gray-600" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Número</label>
                    <input id="input-numero" type="text" maxLength={10} value={numero} onChange={(e) => setNumero(e.target.value)} className="w-full bg-black/25 border border-white/5 focus:border-[#10b981]/60 focus:ring-[3px] focus:ring-[#10b981]/15 text-sm text-gray-200 px-4 py-3 rounded-xl outline-none transition-all placeholder-gray-600" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Complemento <span className="text-gray-600 font-normal">(Opcional)</span></label>
                    <input type="text" value={complemento} onChange={(e) => setComplemento(e.target.value)} placeholder="Apto, Bloco, Casa..." className="w-full bg-black/25 border border-white/5 focus:border-[#10b981]/60 focus:ring-[3px] focus:ring-[#10b981]/15 text-sm text-gray-200 px-4 py-3 rounded-xl outline-none transition-all placeholder-gray-600" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Bairro</label>
                    <input type="text" value={bairro} onChange={(e) => setBairro(e.target.value)} className="w-full bg-black/25 border border-white/5 focus:border-[#10b981]/60 focus:ring-[3px] focus:ring-[#10b981]/15 text-sm text-gray-200 px-4 py-3 rounded-xl outline-none transition-all placeholder-gray-600" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Cidade</label>
                    <input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} className="w-full bg-black/25 border border-white/5 focus:border-[#10b981]/60 focus:ring-[3px] focus:ring-[#10b981]/15 text-sm text-gray-200 px-4 py-3 rounded-xl outline-none transition-all placeholder-gray-600" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">UF</label>
                    <input
                      type="text"
                      maxLength={2}
                      value={uf}
                      onChange={(e) => setUf(e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase())}
                      className="w-full bg-black/25 border border-white/5 focus:border-[#10b981]/60 focus:ring-[3px] focus:ring-[#10b981]/15 text-sm text-gray-200 px-4 py-3 rounded-xl outline-none transition-all placeholder-gray-600 uppercase"
                    />
                  </div>
                </div>
              </form>
            )}
          </div>

          <div className="bg-white/[0.025] backdrop-blur-xl border border-white/5 rounded-2xl p-5 sm:p-6 md:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)]">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <CreditCard className="w-5 h-5 text-[#10b981]" />
              Pagamento <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-mono uppercase ml-2 border border-amber-500/20">Simulação</span>
            </h2>
            <div className="p-4 border border-white/5 bg-white/[0.02] rounded-xl flex items-center justify-between opacity-70">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#111] border border-white/10 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-200">Cartão de Crédito</p>
                  <p className="text-xs text-gray-500">**** **** **** 4242</p>
                </div>
              </div>
              <ShieldCheck className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white/[0.025] backdrop-blur-xl border border-white/5 rounded-2xl p-5 sm:p-6 md:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] lg:sticky lg:top-28">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
              <ShoppingBag className="w-5 h-5 text-[#10b981]" />
              Resumo do Pedido
            </h2>

            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-[#161616] rounded-lg flex items-center justify-center shrink-0 border border-white/5 overflow-hidden">
                    {urlImagemSegura(item.imagem) ? (
                      <img src={urlImagemSegura(item.imagem)!} alt={item.nome} loading="lazy" className="w-full h-full object-contain p-1.5" />
                    ) : (
                      <ShoppingBag className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-200 truncate">{item.nome}</p>
                    <p className="text-xs text-gray-500 font-mono">Qtd: {item.quantidadeSelecionada}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#10b981] font-mono">
                      R$ {(item.preco * item.quantidadeSelecionada).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
              <div className="flex justify-between text-sm text-gray-400 font-mono">
                <span>Subtotal</span>
                <span>R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400 font-mono">
                <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Frete</span>
                {freteFixo === 0 ? (
                  <span className="text-[#10b981]">Grátis</span>
                ) : (
                  <span>R$ {freteFixo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                )}
              </div>
              
              <div className="flex justify-between items-end pt-4 mt-2 border-t border-white/5">
                <span className="text-sm font-bold text-white uppercase tracking-wider">Total</span>
                <span className="text-2xl font-black text-[#10b981] font-mono">
                  R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button
              onClick={handleFinalizarPedido}
              disabled={loading}
              className="group relative overflow-hidden w-full mt-8 bg-gradient-to-r from-[#059669] to-[#10b981] disabled:from-white/[0.04] disabled:to-white/[0.04] disabled:text-gray-500 disabled:cursor-not-allowed text-[#04140f] font-black text-sm py-4 rounded-xl transition-all duration-300 shadow-[0_8px_30px_rgba(16,185,129,0.25)] hover:shadow-[0_10px_45px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              {loading ? (
                <Loader2 className="relative w-5 h-5 animate-spin" />
              ) : (
                <><CheckCircle2 className="relative w-4 h-4" /><span className="relative">Confirmar e Pagar</span></>
              )}
            </button>
            <p className="text-center text-[10px] text-gray-500 mt-4 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#10b981]" /> Ambiente Seguro e Criptografado
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}