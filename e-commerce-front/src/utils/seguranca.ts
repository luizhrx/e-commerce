import axios from 'axios';

/**
 * Camada de contenção entre o backend e a interface.
 *
 * O Spring Boot devolve, em cenários de exceção não tratada, o `message` da stack
 * (constraints de banco, nomes de tabela, classes Java). Nenhuma tela deve ecoar
 * `error.response.data` na UI: as mensagens abaixo são derivadas apenas do STATUS
 * HTTP, nunca do corpo da resposta.
 */

const MENSAGENS_POR_STATUS: Record<number, string> = {
  400: 'Os dados enviados são inválidos. Revise os campos e tente novamente.',
  401: 'Sua sessão expirou. Faça login novamente para continuar.',
  403: 'Você não tem permissão para realizar esta ação.',
  404: 'Não encontramos o registro solicitado.',
  409: 'Esta operação conflita com um registro já existente.',
  422: 'Não foi possível processar os dados informados.',
  429: 'Muitas tentativas em sequência. Aguarde alguns instantes.',
  500: 'O servidor encontrou um erro interno. Tente novamente em instantes.',
  503: 'O serviço está temporariamente indisponível. Tente novamente em instantes.'
};

const MENSAGEM_PADRAO = 'Falha na comunicação com o servidor. Tente novamente em instantes.';
const MENSAGEM_SEM_REDE = 'Não foi possível conectar ao servidor. Verifique sua conexão.';

export function mensagemDeErro(erro: unknown, padrao: string = MENSAGEM_PADRAO): string {
  if (axios.isAxiosError(erro)) {
    if (!erro.response) return MENSAGEM_SEM_REDE;
    return MENSAGENS_POR_STATUS[erro.response.status] ?? padrao;
  }
  return padrao;
}

export function statusDoErro(erro: unknown): number | undefined {
  return axios.isAxiosError(erro) ? erro.response?.status : undefined;
}

/**
 * Log seguro. O objeto de erro do axios carrega `config.headers.Authorization`
 * (o JWT do usuário) — logá-lo inteiro expõe o token no console do navegador e em
 * qualquer ferramenta de captura de logs. Só extraímos metadados não sensíveis, e
 * nada é impresso em produção.
 */
export function logErro(contexto: string, erro: unknown): void {
  if (import.meta.env.PROD) return;

  const detalhe = axios.isAxiosError(erro)
    ? { status: erro.response?.status, url: erro.config?.url, code: erro.code }
    : erro instanceof Error
      ? { name: erro.name, message: erro.message }
      : { valor: String(erro) };

  console.warn(`[${contexto}]`, detalhe);
}

/** Impede que URLs `javascript:`, `data:` ou `blob:` cheguem a um atributo `src`. */
const PROTOCOLOS_PERMITIDOS = ['http:', 'https:'];

export function urlImagemSegura(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const { protocol } = new URL(url, window.location.origin);
    return PROTOCOLOS_PERMITIDOS.includes(protocol) ? url : null;
  } catch {
    return null;
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export const LIMITES = {
  senhaMin: 6,
  senhaMax: 72,
  nomeMin: 3,
  nomeMax: 120,
  textoMax: 255,
  cepDigitos: 8
} as const;

export function validarEmail(email: string): string | null {
  const valor = email.trim();
  if (!valor) return 'Informe seu email.';
  if (valor.length > LIMITES.textoMax) return 'Email longo demais.';
  if (!EMAIL_REGEX.test(valor)) return 'Informe um email válido.';
  return null;
}

export function validarSenha(senha: string): string | null {
  if (!senha) return 'Informe sua senha.';
  if (senha.length < LIMITES.senhaMin) return `A senha precisa ter ao menos ${LIMITES.senhaMin} caracteres.`;
  // Limite alto: bcrypt trunca em 72 bytes, então nada além disso agrega segurança.
  if (senha.length > LIMITES.senhaMax) return `A senha pode ter no máximo ${LIMITES.senhaMax} caracteres.`;
  return null;
}

export function validarNome(nome: string): string | null {
  const valor = nome.trim();
  if (!valor) return 'Informe seu nome.';
  if (valor.length < LIMITES.nomeMin) return 'O nome deve ter ao menos 3 caracteres.';
  if (valor.length > LIMITES.nomeMax) return 'Nome longo demais.';
  return null;
}

export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

export function formatarCep(valor: string): string {
  const digitos = apenasDigitos(valor).slice(0, LIMITES.cepDigitos);
  return digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos;
}
