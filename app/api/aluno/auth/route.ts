import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { alunos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET ?? 'nbp-aluno-secret-fallback')

export async function POST(req: NextRequest) {
  try {
    const { email, senha } = await req.json()

    if (!email || !senha) {
      return NextResponse.json({ error: 'Email e senha obrigatórios' }, { status: 400 })
    }

    const [aluno] = await db.select().from(alunos).where(eq(alunos.email, email))
    if (!aluno) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

    if (!aluno.ativo) {
      return NextResponse.json({ error: 'Conta desativada' }, { status: 403 })
    }

    const senhaOk = await bcrypt.compare(senha, aluno.senhaHash)
    if (!senhaOk) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

    // Gerar JWT de 7 dias
    const token = await new SignJWT({
      sub: aluno.id,
      email: aluno.email,
      nome: aluno.nome,
      role: 'aluno',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(SECRET)

    const response = NextResponse.json({
      ok: true,
      aluno: { id: aluno.id, nome: aluno.nome, email: aluno.email },
    })

    // Salvar token em cookie httpOnly
    response.cookies.set('aluno_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    })

    return response
  } catch (err) {
    console.error('[aluno/auth]', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete('aluno_token')
  return response
}
