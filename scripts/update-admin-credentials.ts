import { neon } from '@neondatabase/serverless'
import * as fs from 'fs'
import * as path from 'path'
import bcrypt from 'bcryptjs'

// Parse .env manualmente
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
  console.error('❌ DATABASE_URL não encontrada no .env ou process.env')
  process.exit(1)
}

const sql = neon(databaseUrl)

async function run() {
  console.log('🔄 Atualizando credenciais do Admin na base de dados...')

  const password = 'nbp@2025'
  const passwordHash = await bcrypt.hash(password, 10)
  const email = 'admin@nbpsicanalise.com.br'

  // Deletar o admin antigo se existir
  await sql`DELETE FROM admin_users WHERE email = 'admin@twixeventos.com'`
  console.log('🗑️ Removido admin@twixeventos.com se existia.')

  // Inserir ou atualizar o novo admin
  const existing = await sql`SELECT id FROM admin_users WHERE email = ${email} LIMIT 1`

  if (existing.length > 0) {
    await sql`UPDATE admin_users SET password_hash = ${passwordHash}, nome = 'Admin NBP' WHERE email = ${email}`
    console.log('✅ Admin atualizado com sucesso!')
  } else {
    await sql`INSERT INTO admin_users (email, password_hash, nome) VALUES (${email}, ${passwordHash}, 'Admin NBP')`
    console.log('✅ Novo Admin inserido com sucesso!')
  }

  // Atualizar configurações padrão para o NBP Psicanálise se existirem
  await sql`
    INSERT INTO configuracoes (chave, valor, descricao) 
    VALUES ('whatsapp_mensagem_padrao', 'Olá! Gostaria de saber mais sobre as formações do NBP Psicanálise.', 'Mensagem padrão do WhatsApp')
    ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor
  `
  console.log('✅ Configurações de WhatsApp atualizadas!')
  
  console.log('🎉 Concluído!')
}

run().catch(e => {
  console.error('❌ Erro ao atualizar:', e)
  process.exit(1)
})
