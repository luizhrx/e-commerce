import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import {
  mensagemDeErro, statusDoErro, logErro,
  validarEmail, validarSenha, validarNome, LIMITES
} from '../../utils/seguranca';
import {
  Eye, EyeOff, Mail, Lock, User, ShoppingBag, ArrowRight,
  AlertCircle, Loader2, Gamepad2, Headphones, Truck
} from 'lucide-react';

// Variantes compartilhadas — entrada em stagger (mesma linguagem da Home)
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

export default function Registro() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: ''
  });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  // Força da senha (0 a 3) — feedback visual instantâneo, sem custo de backend
  const forcaSenha = (() => {
    const s = formData.senha;
    if (!s) return 0;
    let forca = 1;
    if (s.length >= 10) forca++;
    if (/[A-Z]/.test(s) && /[0-9]/.test(s)) forca++;
    return forca;
  })();

  const rotuloForca = ['', 'Fraca', 'Média', 'Forte'][forcaSenha];
  const corForca = ['', 'bg-red-400', 'bg-amber-400', 'bg-[#10b981]'][forcaSenha];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (carregando) return;

    const invalido =
      validarNome(formData.nome) ??
      validarEmail(formData.email) ??
      validarSenha(formData.senha);

    if (invalido) {
      setErro(invalido);
      return;
    }

    setErro('');
    setCarregando(true);

    try {
      const response = await authService.registro({
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        senha: formData.senha
      });
      login(response.token, response.usuario);
      navigate('/', { replace: true });
    } catch (err) {
      logErro('registro:criarConta', err);
      // 409 = email já cadastrado. É a única pista que damos, e só porque o
      // usuário precisa dela para seguir; o texto do backend não é repassado.
      const status = statusDoErro(err);
      setErro(
        status === 409
          ? 'Este email já está cadastrado. Tente entrar na sua conta.'
          : mensagemDeErro(err, 'Não foi possível criar sua conta. Tente novamente.')
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] text-gray-200 overflow-hidden font-sans selection:bg-[#10b981]/30 selection:text-[#10b981]">

      {/* AMBIENTE — brilhos de fundo (emerald / violeta / cyan) + grid mascarado */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-32 -left-32 w-[560px] h-[560px] bg-[#10b981]/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 w-[420px] h-[420px] bg-[#6d28d9]/10 rounded-full blur-[130px]" />
        <div className="absolute -top-20 right-0 w-[440px] h-[440px] bg-[#06b6d4]/6 rounded-full blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 30% 30%, #000 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 30% 30%, #000 40%, transparent 100%)'
          }}
        />
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1.05fr_0.95fr] min-h-screen w-full">

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="hidden md:flex flex-col justify-between p-12 lg:p-14 border-r border-white/5"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-[#141414] to-[#1e1e1e] border border-[#10b981]/20 shadow-[0_0_25px_rgba(16,185,129,0.12),inset_0_1px_0_rgba(255,255,255,0.06)]">
              <ShoppingBag className="w-5 h-5 text-[#10b981]" />
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-wider text-white">
                CORE<span className="text-[#10b981] drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">X</span>
              </span>
              <p className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">Premium Gaming Setup</p>
            </div>
          </motion.div>

          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-5">
              <motion.h1
                variants={fadeUp}
                className="font-extrabold text-4xl lg:text-5xl leading-[1.08] tracking-tight text-white max-w-[14ch] text-balance"
              >
                Junte-se{' '}
                <span className="bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#06b6d4] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(16,185,129,0.25)]">
                  a nós!
                </span>
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="text-gray-400 text-sm md:text-base leading-relaxed max-w-xs"
              >
                Faça parte da nossa comunidade e tenha acesso a todos os recursos da plataforma.
              </motion.p>
            </div>

            <motion.ul variants={stagger} className="flex flex-col gap-3">
              {[
                { icon: Gamepad2, texto: 'Periféricos de elite' },
                { icon: Headphones, texto: 'Suporte especializado' },
                { icon: Truck, texto: 'Envio expresso garantido' }
              ].map(({ icon: Icon, texto }) => (
                <motion.li
                  key={texto}
                  variants={fadeUp}
                  className="flex items-center gap-3.5 w-max pl-2.5 pr-5 py-2.5 rounded-2xl bg-white/[0.025] backdrop-blur-md border border-white/5 shadow-[0_8px_25px_rgba(0,0,0,0.35)]"
                >
                  <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20">
                    <Icon className="w-4 h-4 text-[#10b981]" />
                  </span>
                  <span className="text-sm text-gray-300">{texto}</span>
                </motion.li>
              ))}
            </motion.ul>

            <motion.div variants={fadeUp}>
              <Link
                to="/login"
                className="group w-max flex flex-col gap-2 px-6 py-5 rounded-[20px] bg-white/[0.025] backdrop-blur-xl border border-white/5 shadow-[0_16px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-300 hover:border-[#10b981]/40 hover:shadow-[0_16px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(16,185,129,0.15)] hover:-translate-y-1"
              >
                <span className="text-[13px] text-gray-400 tracking-wide">Já é membro?</span>
                <span className="flex items-center gap-2.5 font-semibold text-[19px] text-white">
                  Entrar
                  <ArrowRight className="w-[18px] h-[18px] text-[#10b981] group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        <div className="flex flex-col justify-center p-8 sm:p-14 bg-neutral-950/50 backdrop-blur-2xl min-h-screen">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="w-full max-w-[400px] mx-auto flex flex-col gap-7"
          >
            {/* Logo mobile (painel esquerdo fica oculto) */}
            <motion.div variants={fadeUp} className="md:hidden flex items-center gap-3">
              <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-[#141414] to-[#1e1e1e] border border-[#10b981]/20 shadow-[0_0_25px_rgba(16,185,129,0.12)]">
                <ShoppingBag className="w-5 h-5 text-[#10b981]" />
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              </div>
              <span className="text-xl font-bold tracking-wider text-white">
                CORE<span className="text-[#10b981] drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">X</span>
              </span>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-col gap-2.5">
              <h2 className="font-bold text-3xl tracking-tight text-white">Criar conta</h2>
              <p className="text-[15px] text-gray-400 leading-relaxed">
                Junte-se ao COREX — leva só um minuto.
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
              {erro && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2.5 bg-red-950/20 border border-red-500/25 text-red-300 rounded-xl px-4 py-3 text-xs"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{erro}</span>
                </motion.div>
              )}

              <motion.div variants={fadeUp} className="flex flex-col gap-2">
                <label htmlFor="nome" className="text-[13px] font-medium text-gray-400">Nome completo</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 flex text-gray-500 pointer-events-none">
                    <User size={18} />
                  </span>
                  <input
                    id="nome"
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Seu nome"
                    autoComplete="name"
                    maxLength={LIMITES.nomeMax}
                    required
                    className="w-full h-[52px] pl-[46px] pr-4 rounded-2xl bg-white/[0.04] border border-white/5 text-gray-200 text-[15px] outline-none transition-all placeholder-gray-600 focus:border-[#10b981]/60 focus:ring-[3px] focus:ring-[#10b981]/15 focus:bg-white/[0.06]"
                  />
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-col gap-2">
                <label htmlFor="email" className="text-[13px] font-medium text-gray-400">Email</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 flex text-gray-500 pointer-events-none">
                    <Mail size={18} />
                  </span>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="exemplo@gmail.com"
                    autoComplete="email"
                    maxLength={LIMITES.textoMax}
                    required
                    className="w-full h-[52px] pl-[46px] pr-4 rounded-2xl bg-white/[0.04] border border-white/5 text-gray-200 text-[15px] outline-none transition-all placeholder-gray-600 focus:border-[#10b981]/60 focus:ring-[3px] focus:ring-[#10b981]/15 focus:bg-white/[0.06]"
                  />
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-col gap-2">
                <label htmlFor="senha" className="text-[13px] font-medium text-gray-400">Senha</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 flex text-gray-500 pointer-events-none">
                    <Lock size={18} />
                  </span>
                  <input
                    id="senha"
                    type={showPassword ? 'text' : 'password'}
                    name="senha"
                    value={formData.senha}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    minLength={LIMITES.senhaMin}
                    maxLength={LIMITES.senhaMax}
                    className="w-full h-[52px] pl-[46px] pr-12 rounded-2xl bg-white/[0.04] border border-white/5 text-gray-200 text-[15px] outline-none transition-all placeholder-gray-600 focus:border-[#10b981]/60 focus:ring-[3px] focus:ring-[#10b981]/15 focus:bg-white/[0.06]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 flex text-gray-500 p-1 transition-colors hover:text-[#10b981] focus:outline-none cursor-pointer"
                    aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Medidor de força da senha */}
                {formData.senha && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2.5 pt-1"
                  >
                    <div className="flex-1 flex gap-1.5">
                      {[1, 2, 3].map((nivel) => (
                        <span
                          key={nivel}
                          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                            nivel <= forcaSenha ? corForca : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-gray-500 font-mono w-11 text-right">{rotuloForca}</span>
                  </motion.div>
                )}
              </motion.div>

              <motion.button
                variants={fadeUp}
                type="submit"
                disabled={carregando}
                className="group relative overflow-hidden h-[54px] mt-1 rounded-2xl bg-gradient-to-r from-[#059669] to-[#10b981] text-[#04140f] font-bold text-[15px] tracking-wide shadow-[0_8px_30px_rgba(16,185,129,0.25)] transition-all duration-300 hover:shadow-[0_10px_45px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[0_8px_30px_rgba(16,185,129,0.25)] disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {/* Varredura de brilho no hover */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                {carregando ? (
                  <>
                    <Loader2 className="relative w-4.5 h-4.5 animate-spin" />
                    <span className="relative">Criando conta...</span>
                  </>
                ) : (
                  <>
                    <span className="relative">Criar conta</span>
                    <ArrowRight className="relative w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>

            <motion.p variants={fadeUp} className="m-0 text-center text-sm text-gray-400">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-[#10b981] font-semibold hover:text-[#34d399] transition-colors">
                Entrar
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
