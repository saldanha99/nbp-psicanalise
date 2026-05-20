const date = new Date();
try {
  const result = new Date(date + 'T00:00:00').toLocaleDateString('pt-BR');
  console.log('Success:', result);
} catch (e) {
  console.error('Error:', e.message);
}
