<?php
/**
 * NBP Psicanálise — Video Upload Endpoint
 * 
 * Coloque este arquivo em: /public_html/upload/video-upload.php
 * 
 * Configuração:
 *   - Defina a constante UPLOAD_SECRET com a mesma senha do .env do Next.js
 *   - A pasta /public_html/videos/ precisa ter permissão 755 ou 777
 */

// ── Configuração ──────────────────────────────────────────
define('UPLOAD_SECRET', getenv('NBP_UPLOAD_SECRET') ?: 'nbp_video_upload_secret_7d2f91a');
define('VIDEOS_DIR',    __DIR__ . '/../videos/');
define('VIDEOS_URL',    'https://nbpsicanalise.com.br/videos/');
define('MAX_SIZE_BYTES', 500 * 1024 * 1024); // 500 MB

// Tipos de vídeo permitidos
$ALLOWED_TYPES = [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
    'video/mpeg',
];

$ALLOWED_EXTS = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'mpeg', 'mpg'];

// ── CORS — permite requisições do domínio do app ──────────
header('Access-Control-Allow-Origin: https://nbpsicanalise.com.br');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ── Só aceita POST ────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

// ── Autenticação ──────────────────────────────────────────
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (!preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['error' => 'Authorization header ausente ou inválido']);
    exit;
}

$token = trim($matches[1]);

/**
 * Aceita dois tipos de token:
 * 1. Token fixo: direto do UPLOAD_SECRET (para testes via curl)
 * 2. Token temporário: base64url de "SECRET:timestamp" gerado pelo Next.js
 *    Válido por 15 minutos a partir do timestamp embutido
 */
function validateToken(string $token): bool {
    $secret = UPLOAD_SECRET;

    // Tipo 1: token fixo
    if (hash_equals($secret, $token)) {
        return true;
    }

    // Tipo 2: token temporário base64url (gerado pelo Next.js API)
    $decoded = base64_decode(strtr($token, '-_', '+/'), true);
    if ($decoded === false) {
        return false;
    }

    // Formato: "SECRET:timestamp_unix"
    $parts = explode(':', $decoded, 2);
    if (count($parts) !== 2) {
        return false;
    }

    [$tokenSecret, $timestampStr] = $parts;
    $timestamp = (int) $timestampStr;

    // Valida o secret
    if (!hash_equals($secret, $tokenSecret)) {
        return false;
    }

    // Valida a expiração (15 minutos = 900 segundos)
    $now = time();
    if ($now > $timestamp) {
        return false; // expirado
    }

    // Token não pode ser de mais de 15 minutos no futuro (clock skew)
    if ($timestamp > $now + 900) {
        return false;
    }

    return true;
}

if (!validateToken($token)) {
    http_response_code(401);
    echo json_encode(['error' => 'Token inválido ou expirado']);
    exit;
}

// ── Verifica se arquivo foi enviado ───────────────────────
if (empty($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Nenhum arquivo enviado. Use o campo "file".']);
    exit;
}

$file = $_FILES['file'];

// Verifica erros de upload PHP
if ($file['error'] !== UPLOAD_ERR_OK) {
    $phpErrors = [
        UPLOAD_ERR_INI_SIZE   => 'Arquivo excede upload_max_filesize do PHP',
        UPLOAD_ERR_FORM_SIZE  => 'Arquivo excede MAX_FILE_SIZE do formulário',
        UPLOAD_ERR_PARTIAL    => 'Upload incompleto',
        UPLOAD_ERR_NO_FILE    => 'Nenhum arquivo enviado',
        UPLOAD_ERR_NO_TMP_DIR => 'Pasta temporária não encontrada',
        UPLOAD_ERR_CANT_WRITE => 'Falha ao escrever no disco',
        UPLOAD_ERR_EXTENSION  => 'Upload bloqueado por extensão PHP',
    ];
    $errorMsg = $phpErrors[$file['error']] ?? 'Erro desconhecido no upload';
    http_response_code(400);
    echo json_encode(['error' => $errorMsg]);
    exit;
}

// ── Valida tamanho ────────────────────────────────────────
if ($file['size'] > MAX_SIZE_BYTES) {
    $maxMB = MAX_SIZE_BYTES / 1024 / 1024;
    http_response_code(400);
    echo json_encode(['error' => "Arquivo muito grande. Máximo: {$maxMB} MB"]);
    exit;
}

// ── Valida extensão ───────────────────────────────────────
$originalName = $file['name'];
$ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
if (!in_array($ext, $ALLOWED_EXTS, true)) {
    http_response_code(400);
    echo json_encode(['error' => "Extensão não permitida: .{$ext}. Use: " . implode(', ', $ALLOWED_EXTS)]);
    exit;
}

// ── Valida MIME type real (via finfo) ─────────────────────
$finfo    = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($file['tmp_name']);

if (!in_array($mimeType, $ALLOWED_TYPES, true)) {
    // Fallback: aceita application/octet-stream para formatos menos comuns
    if ($mimeType !== 'application/octet-stream') {
        http_response_code(400);
        echo json_encode(['error' => "Tipo de arquivo inválido: {$mimeType}"]);
        exit;
    }
}

// ── Cria pasta de destino se não existir ─────────────────
if (!is_dir(VIDEOS_DIR)) {
    if (!mkdir(VIDEOS_DIR, 0755, true)) {
        http_response_code(500);
        echo json_encode(['error' => 'Não foi possível criar a pasta de vídeos']);
        exit;
    }
}

// ── Gera nome único para o arquivo ───────────────────────
$uuid     = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
    mt_rand(0, 0xffff), mt_rand(0, 0xffff),
    mt_rand(0, 0xffff),
    mt_rand(0, 0x0fff) | 0x4000,
    mt_rand(0, 0x3fff) | 0x8000,
    mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
);
$filename = $uuid . '.' . $ext;
$destPath = VIDEOS_DIR . $filename;

// ── Move arquivo ──────────────────────────────────────────
if (!move_uploaded_file($file['tmp_name'], $destPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Falha ao salvar o arquivo no servidor']);
    exit;
}

// Define permissões do arquivo
chmod($destPath, 0644);

// ── Sucesso ───────────────────────────────────────────────
$videoUrl = VIDEOS_URL . $filename;

http_response_code(200);
echo json_encode([
    'url'          => $videoUrl,
    'filename'     => $filename,
    'originalName' => $originalName,
    'size'         => $file['size'],
    'mimeType'     => $mimeType,
]);
