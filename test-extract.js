const fetch = require('node-fetch');

async function extractStore() {
  try {
    const url = 'https://cursos.nbpsicanalise.com.br/handlers/getProduto.ashx';
    // Trying with empty prefix or a common vowel to get products
    const payload = { strPrefixo: "a", sSelecionados: "" };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log(`Found ${data.length} products`);
    if(data.length > 0) {
      console.log('Sample product:', data[0]);
    }
  } catch(e) {
    console.error('Error fetching store:', e.message);
  }
}

extractStore();
