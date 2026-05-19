import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../lib/db/schema'
import * as fs from 'fs'
import * as path from 'path'
import { eq, sql as drizzleSql } from 'drizzle-orm'

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
const db = drizzle(sql, { schema })

async function seed() {
  console.log('🌱 Inserindo dados iniciais do NBP Psicanálise...')

  // Configurações
  await db.insert(schema.configuracoes).values([
    { chave: 'whatsapp_numero', valor: '5511961695163', descricao: 'Número WhatsApp sem formatação' },
    { chave: 'whatsapp_mensagem_padrao', valor: 'Olá! Gostaria de saber mais sobre as formações do NBP Psicanálise.', descricao: 'Mensagem padrão WhatsApp' },
    { chave: 'sla_followup_horas', valor: '48', descricao: 'Horas para alertar lead sem interação' },
    { chave: 'desconto_seg_qui', valor: 'false', descricao: 'Exibir banner de desconto segunda a quinta' },
  ]).onConflictDoUpdate({
    target: schema.configuracoes.chave,
    set: {
      valor: drizzleSql`excluded.valor`,
      descricao: drizzleSql`excluded.descricao`,
    }
  })
  console.log('✅ Configurações inseridas/atualizadas')

  // Admin user (senha: nbp@2025)
  const passwordHash = '$2b$10$XHdSVDX1MLsFNjlXKSim.OmqyJ3VrH8PtJ/WsCkaGcJ0XjCJ/Xjvm'
  
  // Deletar o admin antigo se existir
  await db.delete(schema.adminUsers).where(eq(schema.adminUsers.email, 'admin@twixeventos.com'))
  
  await db.insert(schema.adminUsers).values([{
    email: 'admin@nbpsicanalise.com.br',
    passwordHash,
    nome: 'Admin NBP',
  }]).onConflictDoNothing()
  console.log('✅ Usuário admin inserido/atualizado')

  // Limpar os cursos antigos (Twix Eventos)
  await db.delete(schema.cursos)
  console.log('🗑️ Cursos antigos removidos')

  // Cursos NBP Psicanálise
  await db.insert(schema.cursos).values([
    {
      nome: 'Formação em Psicanálise',
      slug: 'formacao-em-psicanalise',
      descricao: 'Curso completo de formação em psicanálise com duração de 26 meses, baseado no tripé psicanalítico (análise pessoal, conhecimento teórico e supervisão).',
      categoria: 'formacao',
      faixaEtaria: 'Mínimo 21 anos',
      capacidade: 'Presencial / Ao Vivo / Gravado',
      dimensoes: '26 meses',
      energia: 'N/A',
      destaque: true,
      ordemDestaque: 1,
      fotos: ['https://nbpsicanalise.com.br/wp-content/uploads/2021/04/curso-formacao-min.png'],
      fotoDestaque: 'https://nbpsicanalise.com.br/wp-content/uploads/2021/04/curso-formacao-min.png',
      ativo: true,
      monitoresNecessarios: 0
    },
    {
      nome: '8º Elaborando a Psicanálise - Sábado',
      slug: 'crs-8-elaborando-a-psicanalise-sabado-30-05-26-das-9h-as-18',
      descricao: 'Workshop intensivo de elaboração de casos clínicos e teoria psicanalítica aplicada. Sábado das 9h às 18h.',
      categoria: 'presencial',
      faixaEtaria: 'Estudantes e Profissionais',
      capacidade: 'Sala de aula',
      dimensoes: '09 horas',
      energia: 'N/A',
      destaque: true,
      ordemDestaque: 2,
      fotos: ['https://cursos.nbpsicanalise.com.br/Digitalizacao/Produto/Imagem/154/154_F.jpeg'],
      fotoDestaque: 'https://cursos.nbpsicanalise.com.br/Digitalizacao/Produto/Imagem/154/154_F.jpeg',
      ativo: true,
      monitoresNecessarios: 0
    },
    {
      nome: '8º Elaborando a Psicanálise - Domingo',
      slug: 'crs-8-elaborando-a-psicanalise-domingo-31-05-26-das-9h-as-18',
      descricao: 'Workshop intensivo de elaboração de casos clínicos e teoria psicanalítica aplicada. Domingo das 9h às 18h.',
      categoria: 'presencial',
      faixaEtaria: 'Estudantes e Profissionais',
      capacidade: 'Sala de aula',
      dimensoes: '09 horas',
      energia: 'N/A',
      destaque: true,
      ordemDestaque: 3,
      fotos: ['https://cursos.nbpsicanalise.com.br/Digitalizacao/Produto/Imagem/160/160_F.jpeg'],
      fotoDestaque: 'https://cursos.nbpsicanalise.com.br/Digitalizacao/Produto/Imagem/160/160_F.jpeg',
      ativo: true,
      monitoresNecessarios: 0
    },
    {
      nome: 'Palestra - Do Desamparo ao Desejo',
      slug: 'palestra-do-desamparo-ao-desejo-a-constituicao-do-sujeito-a-partir-dos-vinculos',
      descricao: 'Palestra sobre a constituição do sujeito a partir dos vínculos primários. Palestrante convidado.',
      categoria: 'aovivo',
      faixaEtaria: 'Livre para todos os interessados',
      capacidade: 'Transmissão Online',
      dimensoes: '02 horas',
      energia: 'N/A',
      destaque: true,
      ordemDestaque: 4,
      fotos: ['https://cursos.nbpsicanalise.com.br/Digitalizacao/Produto/Imagem/148/148_F.jpeg'],
      fotoDestaque: 'https://cursos.nbpsicanalise.com.br/Digitalizacao/Produto/Imagem/148/148_F.jpeg',
      ativo: true,
      monitoresNecessarios: 0
    },
    {
      nome: 'Grupoterapia - Quinta às 15h',
      slug: 'grupoterapia-07-08-25-quinta-as-15h',
      descricao: 'Sessões semanais de psicoterapia em grupo mediadas por psicanalistas certificados do Núcleo.',
      categoria: 'presencial',
      faixaEtaria: 'Adultos',
      capacidade: 'Sala de terapia',
      dimensoes: '02 horas',
      energia: 'N/A',
      destaque: true,
      ordemDestaque: 5,
      fotos: ['https://cursos.nbpsicanalise.com.br/Digitalizacao/Produto/Imagem/132/132_F.jpeg'],
      fotoDestaque: 'https://cursos.nbpsicanalise.com.br/Digitalizacao/Produto/Imagem/132/132_F.jpeg',
      ativo: true,
      monitoresNecessarios: 0
    },
    {
      nome: 'AULAS GRAVADAS - Leitura e Estudo do Livro "Édipo"',
      slug: 'aulas-gravadas-leitura-e-estudo-do-livro-edipo-de-j-d-nasio',
      descricao: 'Curso gravado com leitura e análise detalhada da obra "Édipo" do renomado psicanalista J.-D. Násio.',
      categoria: 'gravado',
      faixaEtaria: 'Interessados em Psicanálise',
      capacidade: 'Acesso Online Vitalício',
      dimensoes: '1:30h',
      energia: 'N/A',
      destaque: true,
      ordemDestaque: 6,
      fotos: ['https://cursos.nbpsicanalise.com.br/Digitalizacao/Produto/Imagem/50/50_F.jpeg'],
      fotoDestaque: 'https://cursos.nbpsicanalise.com.br/Digitalizacao/Produto/Imagem/50/50_F.jpeg',
      ativo: true,
      monitoresNecessarios: 0
    },
    {
      nome: 'AULAS GRAVADAS - Estudo do Livro "Porque Repetimos os Mesmos Erros"',
      slug: 'aulas-gravadas-estudo-do-livro-porque-repetimos-os-mesmos-erros-de-j-d',
      descricao: 'Curso gravado focado na repetição na clínica psicanalítica a partir da obra de J.-D. Násio.',
      categoria: 'gravado',
      faixaEtaria: 'Interessados em Psicanálise',
      capacidade: 'Acesso Online Vitalício',
      dimensoes: '1:30h',
      energia: 'N/A',
      destaque: false,
      ordemDestaque: 0,
      fotos: ['https://cursos.nbpsicanalise.com.br/Digitalizacao/Produto/Imagem/30/30_F.png'],
      fotoDestaque: 'https://cursos.nbpsicanalise.com.br/Digitalizacao/Produto/Imagem/30/30_F.png',
      ativo: true,
      monitoresNecessarios: 0
    }
  ]).onConflictDoNothing()
  console.log('✅ 7 cursos do NBP Psicanálise inseridos')

  console.log('\n🎉 Seed concluído!')
}

seed().catch(e => { console.error(e); process.exit(1) })
