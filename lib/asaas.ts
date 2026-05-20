/**
 * lib/asaas.ts — Cliente tipado para a API do Asaas
 * Documentação: https://docs.asaas.com
 */

const ASAAS_BASE_URL =
  process.env.ASAAS_ENV === 'production'
    ? 'https://api.asaas.com/v3'
    : 'https://sandbox.asaas.com/api/v3'

const ASAAS_API_KEY = process.env.ASAAS_API_KEY ?? ''

async function asaasFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${ASAAS_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      access_token: ASAAS_API_KEY,
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const msg =
      (body as { errors?: { description: string }[] })?.errors?.[0]?.description ??
      `Asaas error ${res.status}`
    throw new Error(msg)
  }

  return res.json() as Promise<T>
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AsaasCliente {
  id: string
  name: string
  email: string
  cpfCnpj?: string
  mobilePhone?: string
}

export interface AsaasCobranca {
  id: string
  status: string // PENDING | RECEIVED | CONFIRMED | OVERDUE | REFUNDED | CANCELLED
  value: number
  netValue: number
  billingType: 'PIX' | 'CREDIT_CARD' | 'BOLETO'
  dueDate: string
  invoiceUrl: string
  bankSlipUrl?: string
  // PIX
  pixQrCodeId?: string
}

export interface AsaasPixQrCode {
  encodedImage: string  // base64
  payload: string       // chave copia e cola
  expirationDate: string
}

export interface AsaasCriarClienteInput {
  name: string
  email: string
  cpfCnpj?: string
  mobilePhone?: string
}

export interface AsaasCriarCobrancaInput {
  customer: string   // ID do cliente no Asaas
  billingType: 'PIX' | 'CREDIT_CARD' | 'BOLETO'
  value: number
  dueDate: string    // YYYY-MM-DD
  description?: string
  externalReference?: string  // nosso pedidoId
  installmentCount?: number   // parcelas (só cartão)
  installmentValue?: number
  creditCard?: {
    holderName: string
    number: string
    expiryMonth: string
    expiryYear: string
    ccv: string
  }
  creditCardHolderInfo?: {
    name: string
    email: string
    cpfCnpj: string
    postalCode?: string
    phone?: string
  }
  remoteIp?: string
}

// ─── Clientes ────────────────────────────────────────────────────────────────

export async function criarCliente(
  data: AsaasCriarClienteInput
): Promise<AsaasCliente> {
  return asaasFetch<AsaasCliente>('/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function buscarClientePorEmail(
  email: string
): Promise<AsaasCliente | null> {
  const res = await asaasFetch<{ data: AsaasCliente[] }>(
    `/customers?email=${encodeURIComponent(email)}`
  )
  return res.data[0] ?? null
}

export async function criarOuRecuperarCliente(
  data: AsaasCriarClienteInput
): Promise<AsaasCliente> {
  const existente = await buscarClientePorEmail(data.email)
  if (existente) return existente
  return criarCliente(data)
}

// ─── Cobranças ───────────────────────────────────────────────────────────────

export async function criarCobranca(
  data: AsaasCriarCobrancaInput
): Promise<AsaasCobranca> {
  return asaasFetch<AsaasCobranca>('/payments', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function consultarPagamento(
  paymentId: string
): Promise<AsaasCobranca> {
  return asaasFetch<AsaasCobranca>(`/payments/${paymentId}`)
}

// ─── PIX ─────────────────────────────────────────────────────────────────────

export async function gerarPixQrCode(
  paymentId: string
): Promise<AsaasPixQrCode> {
  return asaasFetch<AsaasPixQrCode>(
    `/payments/${paymentId}/pixQrCode`
  )
}

// ─── Boleto ──────────────────────────────────────────────────────────────────

export async function getBoletoPdf(paymentId: string): Promise<string> {
  const res = await asaasFetch<{ bankSlipUrl: string }>(
    `/payments/${paymentId}/identificationField`
  )
  return res.bankSlipUrl
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Formata data como YYYY-MM-DD para o Asaas (com 1 dia de folga mínimo) */
export function asaasDueDate(diasAFrente = 1): string {
  const d = new Date()
  d.setDate(d.getDate() + diasAFrente)
  return d.toISOString().split('T')[0]
}
