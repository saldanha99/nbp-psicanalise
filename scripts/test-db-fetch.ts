import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../lib/db/schema'
import * as fs from 'fs'
import * as path from 'path'
import { eq, desc } from 'drizzle-orm'

// Parse .env manually
const envPath = path.resolve(process.cwd(), '.env')
let databaseUrl = process.env.DATABASE_URL

try {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
      const parts = line.split('=')
      if (parts.length >= 2) {
        const key = parts[0].trim()
        const value = parts.slice(1).join('=').trim()
        if (key === 'DATABASE_URL') {
          databaseUrl = value
        }
      }
    })
  }
} catch (e) {
  console.log('Aviso ao ler .env:', e)
}

if (!databaseUrl) {
  console.error('DATABASE_URL não encontrada')
  process.exit(1)
}

const sql = neon(databaseUrl)
const db = drizzle(sql, { schema })

const id = 'd5e10964-320f-42d9-8664-081965ea576f'

async function run() {
  console.log('=== TEST DETAILED FETCH FOR ID:', id)

  // 1. AlunoById
  console.log('1. getAlunoById...')
  const [aluno] = await db.select().from(schema.alunos).where(eq(schema.alunos.id, id))
  console.log('Result:', aluno)

  // 2. AlunoMatriculas
  console.log('2. getAlunoMatriculas...')
  const matriculas = await db
    .select({
      id: schema.matriculas.id,
      status: schema.matriculas.status,
      progressoPercent: schema.matriculas.progressoPercent,
      certificadoUrl: schema.matriculas.certificadoUrl,
      certificadoAt: schema.matriculas.certificadoAt,
      ultimoAcessoAt: schema.matriculas.ultimoAcessoAt,
      createdAt: schema.matriculas.createdAt,
      cursoId: schema.cursos.id,
      cursoNome: schema.cursos.nome,
      cursoSlug: schema.cursos.slug,
      cargaHoraria: schema.cursos.cargaHoraria,
      temCertificado: schema.cursos.certificado,
    })
    .from(schema.matriculas)
    .innerJoin(schema.cursos, eq(schema.matriculas.cursoId, schema.cursos.id))
    .where(eq(schema.matriculas.alunoId, id))
    .orderBy(desc(schema.matriculas.createdAt))
  console.log('Result length:', matriculas.length)

  // 3. AlunoPedidos
  console.log('3. getAlunoPedidos...')
  const pedidos = await db
    .select({
      id: schema.pedidos.id,
      valor: schema.pedidos.valor,
      formaPagamento: schema.pedidos.formaPagamento,
      parcelas: schema.pedidos.parcelas,
      status: schema.pedidos.status,
      paidAt: schema.pedidos.paidAt,
      createdAt: schema.pedidos.createdAt,
      cursoNome: schema.cursos.nome,
      asaasPaymentLink: schema.pedidos.asaasPaymentLink,
    })
    .from(schema.pedidos)
    .innerJoin(schema.cursos, eq(schema.pedidos.cursoId, schema.cursos.id))
    .where(eq(schema.pedidos.alunoId, id))
    .orderBy(desc(schema.pedidos.createdAt))
  console.log('Result length:', pedidos.length)

  // 4. AlunoRegistros
  console.log('4. getAlunoRegistros...')
  const registros = await db
    .select()
    .from(schema.alunoRegistros)
    .where(eq(schema.alunoRegistros.alunoId, id))
    .orderBy(desc(schema.alunoRegistros.data))
  console.log('Result length:', registros.length)

  console.log('=== ALL SUCCESSFUL! ===')
}

run().catch(err => {
  console.error('❌ QUERY FAILED:', err)
})
