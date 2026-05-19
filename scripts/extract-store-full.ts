import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { db } from '../lib/db';
import { cursos } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import 'dotenv/config';

// Função para gerar slug a partir do nome
function generateSlug(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

async function scrapeStore() {
  console.log('Iniciando raspagem de cursos...');
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const allProductsMap = new Map();

  // 1. Coletar todos os produtos buscando de A a Z
  for (const letter of alphabet) {
    try {
      const res = await fetch('https://cursos.nbpsicanalise.com.br/handlers/getProduto.ashx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ strPrefixo: letter, sSelecionados: "" })
      });
      const data = await res.json() as any[];
      data.forEach(p => {
        if (!allProductsMap.has(p.LinkProduto)) {
          allProductsMap.set(p.LinkProduto, p);
        }
      });
    } catch (e) {
      console.error(`Erro ao buscar letra ${letter}:`, e);
    }
  }

  const products = Array.from(allProductsMap.values());
  console.log(`Encontrados ${products.length} cursos únicos. Baixando detalhes...`);

  // 2. Para cada produto, baixar a página HTML para extrair a imagem e detalhes
  for (const p of products) {
    console.log(`Processando: ${p.NomeProduto}`);
    try {
      const htmlRes = await fetch(p.LinkProduto);
      const html = await htmlRes.text();
      const $ = cheerio.load(html);

      // Extrair imagem principal
      let imageUrl = $('.produto-imagem img').attr('src');
      if (!imageUrl) {
        imageUrl = $('.zoom img').attr('src'); 
      }
      if (!imageUrl) {
         // tentar achar qualquer imagem grande
         imageUrl = $('meta[property="og:image"]').attr('content');
      }

      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = 'https://cursos.nbpsicanalise.com.br' + imageUrl;
      }

      // Extrair preço
      let precoTexto = $('.preco-por').text() || $('.preco-venda').text();
      let preco = 0;
      if (precoTexto) {
         const matches = precoTexto.match(/[\d,.]+/);
         if (matches) {
            preco = parseFloat(matches[0].replace(/\./g, '').replace(',', '.'));
         }
      }

      // Extrair descrição
      let descricao = $('.descricao-produto').html() || $('.descricao').html() || p.NomeProduto;

      // Gerar dados para inserção
      let slug = generateSlug(p.NomeProduto);
      // Se a string ficar vazia, criar um fallback
      if (!slug || slug.length === 0) {
         slug = 'curso-' + Math.floor(Math.random() * 100000);
      }

      const cursoData = {
        nome: p.NomeProduto,
        slug: slug,
        descricao: descricao || p.NomeProduto,
        categoria: p.NomeProduto.includes('GRAVADAS') ? 'Aulas Gravadas' : 'Curso',
        faixaEtaria: 'Livre',
        capacidade: 'Ilimitado',
        dimensoes: 'Online',
        precoReferencia: preco ? preco.toString() : '0',
        fotoDestaque: imageUrl || '',
        fotos: imageUrl ? [imageUrl] : [],
        ativo: true
      };

      // 3. Inserir ou atualizar no banco de dados (Neon DB) via Drizzle
      const existing = await db.query.cursos.findFirst({
         where: eq(cursos.slug, slug)
      });

      if (!existing) {
         await db.insert(cursos).values(cursoData);
         console.log(` ✅ Inserido: ${slug}`);
      } else {
         console.log(` ⚠️ Já existe: ${slug}`);
      }
      
      // Delay to be polite
      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      console.error(` ❌ Erro ao processar ${p.NomeProduto}:`, e);
    }
  }

  console.log('Extração e população concluídas!');
  process.exit(0);
}

scrapeStore();
