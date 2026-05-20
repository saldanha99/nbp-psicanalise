const fetch = require('node-fetch');

async function test() {
  const url = 'http://localhost:3000/cursos/aulas-gravadas-leitura-e-estudo-do-livro-edipo-de-j-d-nasio';
  console.log(`Fetching ${url}...`);
  try {
    const res = await fetch(url);
    console.log('Status Code:', res.status);
    const body = await res.text();
    if (res.status !== 200) {
      console.error('Error Body Snippet:', body.substring(0, 1000));
    } else {
      console.log('Success! Page loaded. Length:', body.length);
      console.log('Body Snippet:', body.substring(0, 500));
    }
  } catch (err) {
    console.error('Fetch failed:', err);
  }
}

test();
