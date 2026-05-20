import { neon } from '@neondatabase/serverless'
import 'dotenv/config'

const sql = neon(process.env.DATABASE_URL!)

async function run() {
  const result = await sql`SELECT slug, nome, preco_referencia FROM cursos WHERE slug = 'aulas-gravadas-leitura-e-estudo-do-livro-dipo-de-j-d-nsio'`
  console.log(JSON.stringify(result, null, 2))
}

run().catch(console.error)
