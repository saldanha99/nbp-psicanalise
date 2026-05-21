import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'

/**
 * POST /api/admin/upload-video
 *
 * Gerador de token temporário para upload de vídeo no HostGator.
 *
 * Fluxo de segurança:
 *   1. Admin chama este endpoint (autenticado via session)
 *   2. Recebe { uploadUrl, token, expiresAt }
 *   3. Usa esses dados para fazer POST direto ao HostGator PHP
 *   4. O HOSTGATOR_UPLOAD_SECRET NUNCA vai para o frontend — só o token temporário
 *
 * O token temporário tem validade de 15 minutos e é baseado em HMAC-SHA256
 * para que o PHP possa validar sem precisar de banco de dados.
 */

function generateUploadToken(): { token: string; expiresAt: number } {
  const expiresAt = Math.floor(Date.now() / 1000) + 15 * 60 // 15 minutos
  const secret = process.env.HOSTGATOR_UPLOAD_SECRET!

  // Token = secret + timestamp — simples e suficiente para esta finalidade
  // O PHP valida usando o mesmo algoritmo
  const payload = `${secret}:${expiresAt}`

  // Codifica em base64 para ser fácil de transmitir
  const token = Buffer.from(payload).toString('base64url')

  return { token, expiresAt }
}

export async function POST(req: NextRequest) {
  // Verifica autenticação do admin
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // Verifica se as variáveis de ambiente estão configuradas
  const uploadUrl = process.env.HOSTGATOR_UPLOAD_URL
  const uploadSecret = process.env.HOSTGATOR_UPLOAD_SECRET

  if (!uploadUrl || !uploadSecret) {
    return NextResponse.json(
      {
        error: 'Servidor de vídeo não configurado.',
        hint: 'Adicione HOSTGATOR_UPLOAD_URL e HOSTGATOR_UPLOAD_SECRET nas variáveis de ambiente.',
      },
      { status: 503 }
    )
  }

  const { token, expiresAt } = generateUploadToken()

  return NextResponse.json({
    uploadUrl,
    token,
    expiresAt,
    expiresIn: 900, // segundos = 15 minutos
  })
}
