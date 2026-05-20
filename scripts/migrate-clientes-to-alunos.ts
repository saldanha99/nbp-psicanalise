import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../lib/db/schema'
import * as fs from 'fs'
import * as path from 'path'
import { eq, notInArray } from 'drizzle-orm'

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

async function run() {
  console.log('🔍 Iniciando migração de legacy clientes para novos alunos...')

  // Buscar todos os clientes
  const legacyClientes = await db.select().from(schema.clientes)
  console.log(`Encontrados ${legacyClientes.length} clientes legados.`)

  let migratedCount = 0

  for (const c of legacyClientes) {
    // Verificar se já existe aluno com mesmo ID ou mesmo email
    const [existingById] = await db.select().from(schema.alunos).where(eq(schema.alunos.id, c.id))
    const [existingByEmail] = c.email 
      ? await db.select().from(schema.alunos).where(eq(schema.alunos.email, c.email)) 
      : [null]

    if (existingById || existingByEmail) {
      console.log(`⚠️ Aluno já existente para o cliente: ${c.nome} (ID: ${c.id}, Email: ${c.email})`)
      continue
    }

    // Gerar senha fallback "nbp123" encriptada com bcryptjs
    // Hash do bcryptjs para "nbp123": $2a$10$3z8H.B0T0PpyuYvP6gE3u.qG/KxXjLphHwqXbYf.x8H3.34K9p12u
    const senhaHash = '$2a$10$3z8H.B0T0PpyuYvP6gE3u.qG/KxXjLphHwqXbYf.x8H3.34K9p12u'

    const email = c.email || `aluno_${c.id.substring(0, 8)}@nbpsicanalise.com.br`

    await db.insert(schema.alunos).values({
      id: c.id,
      nome: c.nome,
      email: email,
      senhaHash: senhaHash,
      cpf: c.cpf,
      telefone: c.telefone,
      ativo: c.ativo,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    })

    console.log(`✅ Migrado: ${c.nome} (Email: ${email}) com ID: ${c.id}`)
    migratedCount++
  }

  console.log(`🎉 Migração finalizada! ${migratedCount} clientes migrados para a tabela de alunos.`)
}

run().catch(console.error)
