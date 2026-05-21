# Como fazer deploy no HostGator (cPanel)

## Passo 1 — Criar as pastas

Acesse: **cPanel → File Manager → public_html**

Crie as seguintes pastas (botão "New Folder"):
```
/public_html/upload/
/public_html/videos/
```

---

## Passo 2 — Upload dos arquivos

Ainda no File Manager, faça upload (botão "Upload") dos seguintes arquivos nas pastas corretas:

| Arquivo local | Destino no servidor |
|---|---|
| `hostgator/upload/video-upload.php` | `/public_html/upload/video-upload.php` |
| `hostgator/upload/.htaccess` | `/public_html/upload/.htaccess` |
| `hostgator/videos/.htaccess` | `/public_html/videos/.htaccess` |

> ⚠️ O arquivo `.htaccess` começa com ponto — no File Manager, certifique-se de que "Show Hidden Files" está marcado para vê-lo.

---

## Passo 3 — Configurar a senha no PHP

No File Manager, abra o arquivo `/public_html/upload/video-upload.php` para edição.

Encontre esta linha (linha ~8):
```php
define('UPLOAD_SECRET', getenv('NBP_UPLOAD_SECRET') ?: 'TROQUE_POR_UMA_SENHA_FORTE_AQUI');
```

Substitua `TROQUE_POR_UMA_SENHA_FORTE_AQUI` pela mesma senha que você colocar no `.env` do Next.js em `HOSTGATOR_UPLOAD_SECRET`.

Exemplo:
```php
define('UPLOAD_SECRET', getenv('NBP_UPLOAD_SECRET') ?: 'minhaSenhaSegura2026!@#');
```

---

## Passo 4 — Permissões das pastas

No File Manager:
1. Clique com botão direito na pasta `videos/` → **Change Permissions**
2. Marque: Owner (rwx), Group (r-x), World (r-x) → **755**
3. Faça o mesmo para a pasta `upload/`

---

## Passo 5 — Configurar o Next.js (.env)

No arquivo `.env` do projeto Next.js (e nas variáveis de ambiente do Vercel):

```env
HOSTGATOR_UPLOAD_URL=https://nbpsicanalise.com.br/upload/video-upload.php
HOSTGATOR_UPLOAD_SECRET=minhaSenhaSegura2026!@#
```

> A senha precisa ser **idêntica** ao que você colocou no PHP.

---

## Passo 6 — Testar

Use o terminal para testar se está funcionando:

```bash
curl -X POST https://nbpsicanalise.com.br/upload/video-upload.php \
  -H "Authorization: Bearer minhaSenhaSegura2026!@#" \
  -F "file=@/caminho/para/um/video-teste.mp4"
```

Resposta esperada:
```json
{
  "url": "https://nbpsicanalise.com.br/videos/uuid-gerado.mp4",
  "filename": "uuid-gerado.mp4",
  "size": 12345678
}
```

---

## Solução de problemas comuns

| Erro | Causa | Solução |
|---|---|---|
| 401 Unauthorized | Token errado | Verifique se a senha no PHP é igual ao .env |
| 400 Arquivo muito grande | Limite PHP | Verifique se o .htaccess da pasta upload foi colocado corretamente |
| 500 Falha ao salvar | Permissão | Dê permissão 755 (ou 777) na pasta videos/ |
| CORS error | Domínio diferente | Edite o PHP e mude o `Access-Control-Allow-Origin` |
| PHP não executa | HostGator desativou | Contate o suporte HostGator |

---

## Estrutura final no servidor

```
/public_html/
├── upload/
│   ├── .htaccess          ← limites de upload
│   └── video-upload.php   ← endpoint de recebimento
└── videos/
    ├── .htaccess          ← headers de vídeo
    ├── uuid-video-1.mp4   ← vídeos salvos automaticamente
    └── uuid-video-2.webm
```
