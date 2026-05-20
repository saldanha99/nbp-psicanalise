import { neon } from '@neondatabase/serverless'
import 'dotenv/config'

const sql = neon(process.env.DATABASE_URL!)

async function run() {
  console.log("=== ALUNOS IN DB ===")
  const alunos = await sql`SELECT id, nome, email FROM alunos LIMIT 10`
  console.log(JSON.stringify(alunos, null, 2))

  console.log("=== CLIENTES IN DB ===")
  const clientes = await sql`SELECT id, nome, email FROM clientes LIMIT 10`
  console.log(JSON.stringify(clientes, null, 2))
}

run().catch(console.error)
