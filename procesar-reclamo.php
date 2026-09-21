<?php
declare(strict_types=1);

header('X-Robots-Tag: noindex, nofollow', true);
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header("Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'");

$config = require __DIR__ . '/config-reclamos.php';
$timezone = new DateTimeZone('America/Lima');

function escape(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function respond(int $status, string $title, string $message, ?array $copy = null): void
{
    http_response_code($status);
    ?>
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <meta name="theme-color" content="#0f6b45">
  <title><?= escape($title) ?> | Adventure</title>
  <link rel="icon" href="DADVENTUREICON.png">
  <link rel="stylesheet" href="styles.css">
  <script src="script.js" defer></script>
</head>
<body class="ad-legal ad-claims">
  <main class="legal-shell claims-result" id="contenido-principal">
    <p class="legal-kicker">Libro de Reclamaciones</p>
    <h1><?= escape($title) ?></h1>
    <p><?= escape($message) ?></p>
    <?php if ($copy !== null): ?>
      <section class="claim-copy" aria-label="Copia de la reclamación">
        <h2>Hoja de Reclamación <?= escape((string) $copy['codigo']) ?></h2>
        <dl>
          <?php foreach ($copy as $field => $value): ?>
            <?php if ($field === 'codigo') continue; ?>
            <div>
              <dt><?= escape(ucwords(str_replace('_', ' ', (string) $field))) ?></dt>
              <dd><?= nl2br(escape((string) $value)) ?></dd>
            </div>
          <?php endforeach; ?>
        </dl>
      </section>
      <div class="ad-actions">
        <button class="ad-button" type="button" data-print-page>Imprimir o guardar copia</button>
        <a class="ad-button ad-button--light" href="index.html">Volver a Adventure</a>
      </div>
    <?php else: ?>
      <p><a class="ad-button" href="libro-reclamaciones.html">Volver al formulario</a></p>
    <?php endif; ?>
  </main>
</body>
</html>
    <?php
    exit;
}

function inputText(string $field, int $maximum): string
{
    $value = trim((string) ($_POST[$field] ?? ''));
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value) ?? '';
    return function_exists('mb_substr')
        ? mb_substr($value, 0, $maximum, 'UTF-8')
        : substr($value, 0, $maximum);
}

function nextNumber(string $directory, string $year): int
{
    $path = $directory . DIRECTORY_SEPARATOR . "contador-{$year}.txt";
    $handle = fopen($path, 'c+');
    if ($handle === false || !flock($handle, LOCK_EX)) {
        respond(500, 'No se pudo registrar', 'El servidor no pudo generar el código de seguimiento. Comunícate con Adventure.');
    }

    $number = (int) trim((string) stream_get_contents($handle)) + 1;
    rewind($handle);
    ftruncate($handle, 0);
    if (fwrite($handle, (string) $number) === false) {
        fclose($handle);
        respond(500, 'No se pudo registrar', 'El servidor no pudo guardar el código de seguimiento. Comunícate con Adventure.');
    }
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
    @chmod($path, 0600);
    return $number;
}

function uploadedFiles(string $field): array
{
    if (!isset($_FILES[$field])) return [];
    $input = $_FILES[$field];
    $names = is_array($input['name']) ? $input['name'] : [$input['name']];
    $files = [];

    foreach ($names as $index => $name) {
        $error = (int) (is_array($input['error']) ? $input['error'][$index] : $input['error']);
        if ($error === UPLOAD_ERR_NO_FILE) continue;
        $files[] = [
            'name' => (string) $name,
            'tmp_name' => (string) (is_array($input['tmp_name']) ? $input['tmp_name'][$index] : $input['tmp_name']),
            'size' => (int) (is_array($input['size']) ? $input['size'][$index] : $input['size']),
            'error' => $error,
        ];
    }
    return $files;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, 'Método no permitido', 'Abre el formulario del Libro de Reclamaciones para registrar tu solicitud.');
}
if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 12 * 1024 * 1024) {
    respond(413, 'Solicitud demasiado grande', 'Reduce el contenido e inténtalo nuevamente.');
}
if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0 && empty($_POST) && empty($_FILES)) {
    respond(413, 'El servidor rechazó el envío', 'El alojamiento tiene un límite de carga menor. Aumenta post_max_size y upload_max_filesize o utiliza archivos más pequeños.');
}
$fetchSite = (string) ($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '');
if ($fetchSite !== '' && !in_array($fetchSite, ['same-origin', 'same-site', 'none'], true)) {
    respond(403, 'Solicitud bloqueada', 'Por seguridad, abre el formulario directamente desde el sitio de Adventure.');
}
if (trim((string) ($_POST['sitio_web'] ?? '')) !== '') {
    respond(400, 'No se pudo registrar', 'La solicitud no pasó la validación automática.');
}

$data = [
    'local' => inputText('local', 40),
    'nombre' => inputText('nombre', 120),
    'documento' => inputText('documento', 20),
    'correo' => inputText('correo', 160),
    'telefono' => inputText('telefono', 30),
    'domicilio' => inputText('domicilio', 220),
    'representante' => inputText('representante', 120),
    'tipo_bien' => inputText('tipo_bien', 20),
    'monto' => inputText('monto', 20),
    'descripcion_bien' => inputText('descripcion_bien', 1200),
    'tipo_reclamacion' => inputText('tipo_reclamacion', 20),
    'detalle' => inputText('detalle', 4000),
    'pedido' => inputText('pedido', 2000),
];
$required = ['local', 'nombre', 'documento', 'correo', 'telefono', 'domicilio', 'tipo_bien', 'descripcion_bien', 'tipo_reclamacion', 'detalle', 'pedido'];
foreach ($required as $field) {
    if ($data[$field] === '') respond(422, 'Faltan datos', 'Completa todos los campos obligatorios.');
}
if (!isset($config['locales'][$data['local']])) respond(422, 'Local no válido', 'Selecciona uno de los locales disponibles.');
if (!filter_var($data['correo'], FILTER_VALIDATE_EMAIL)) respond(422, 'Correo no válido', 'Revisa la dirección de correo electrónico.');
if (!in_array($data['tipo_bien'], ['producto', 'servicio'], true)) respond(422, 'Tipo de bien no válido', 'Selecciona producto o servicio.');
if (!in_array($data['tipo_reclamacion'], ['reclamo', 'queja'], true)) respond(422, 'Tipo de reclamación no válido', 'Selecciona reclamo o queja.');
if (!isset($_POST['declaracion'])) respond(422, 'Falta la confirmación', 'Debes confirmar que la información es verdadera.');
if (isset($_POST['menor']) && $data['representante'] === '') respond(422, 'Falta el representante', 'Indica el nombre del padre, madre o representante del menor.');
if ($data['monto'] !== '' && (!is_numeric($data['monto']) || (float) $data['monto'] < 0 || (float) $data['monto'] > 999999.99)) {
    respond(422, 'Monto no válido', 'Revisa el monto reclamado.');
}

$uploads = uploadedFiles('evidencias');
if (count($uploads) > 3) respond(422, 'Demasiados archivos', 'Adjunta como máximo 3 archivos.');
$allowedTypes = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
    'application/pdf' => 'pdf',
];
$totalSize = 0;
$fileInfo = class_exists('finfo') ? new finfo(FILEINFO_MIME_TYPE) : null;
if ($uploads && $fileInfo === null) respond(500, 'Adjuntos no disponibles', 'El servidor necesita la extensión Fileinfo de PHP para validar archivos.');
foreach ($uploads as $index => $upload) {
    if ($upload['error'] !== UPLOAD_ERR_OK) respond(422, 'No se pudo cargar un archivo', 'Revisa el tamaño del archivo e inténtalo nuevamente.');
    if ($upload['size'] <= 0 || $upload['size'] > 4 * 1024 * 1024) respond(422, 'Archivo no válido', 'Cada archivo debe pesar como máximo 4 MB.');
    if (!is_uploaded_file($upload['tmp_name'])) respond(422, 'Archivo no válido', 'El servidor no reconoció correctamente uno de los adjuntos.');
    $mime = $fileInfo->file($upload['tmp_name']);
    if (!is_string($mime) || !isset($allowedTypes[$mime])) respond(422, 'Formato no permitido', 'Solo se admiten archivos JPG, PNG, WebP o PDF.');
    $uploads[$index]['mime'] = $mime;
    $uploads[$index]['extension'] = $allowedTypes[$mime];
    $totalSize += $upload['size'];
}
if ($totalSize > 8 * 1024 * 1024) respond(422, 'Adjuntos demasiado grandes', 'El conjunto de archivos debe pesar como máximo 8 MB.');

$now = new DateTimeImmutable('now', $timezone);
$storage = (string) ($config['directorio_datos'] ?? (__DIR__ . DIRECTORY_SEPARATOR . 'reclamos-data'));
if (!is_dir($storage) && !mkdir($storage, 0700, true) && !is_dir($storage)) {
    respond(500, 'No se pudo registrar', 'El servidor no pudo crear el almacenamiento protegido. Comunícate con Adventure.');
}
$number = nextNumber($storage, $now->format('Y'));
$prefix = preg_replace('/[^A-Z0-9]/', '', strtoupper((string) $config['prefijo'])) ?: 'ADV';
$code = sprintf('%s-%s-%06d', $prefix, $now->format('Y'), $number);
$local = $config['locales'][$data['local']];
$record = [
    'codigo' => $code,
    'fecha' => $now->format(DateTimeInterface::ATOM),
    'proveedor' => (string) $local['proveedor'],
    'ruc' => (string) $local['ruc'],
    'domicilio_legal' => (string) $local['domicilio_legal'],
    'establecimiento' => (string) $local['establecimiento'],
    'consumidor' => $data['nombre'],
    'documento' => $data['documento'],
    'correo' => $data['correo'],
    'telefono' => $data['telefono'],
    'domicilio' => $data['domicilio'],
    'representante' => $data['representante'] ?: 'No corresponde',
    'tipo_bien' => ucfirst($data['tipo_bien']),
    'monto_soles' => $data['monto'] === '' ? 'No indicado' : number_format((float) $data['monto'], 2, '.', ''),
    'descripcion_bien' => $data['descripcion_bien'],
    'tipo_reclamacion' => ucfirst($data['tipo_reclamacion']),
    'detalle' => $data['detalle'],
    'pedido' => $data['pedido'],
    'acciones_proveedor' => 'Pendiente de atención',
];

$storedFiles = [];
if ($uploads) {
    $attachmentDirectory = $storage . DIRECTORY_SEPARATOR . 'adjuntos' . DIRECTORY_SEPARATOR . $code;
    if (!is_dir($attachmentDirectory) && !mkdir($attachmentDirectory, 0700, true) && !is_dir($attachmentDirectory)) {
        respond(500, 'No se pudieron guardar los adjuntos', 'El servidor no pudo crear la carpeta de evidencias. Comunícate con Adventure.');
    }
    foreach ($uploads as $index => $upload) {
        $storedName = sprintf('%s-%02d.%s', $code, $index + 1, $upload['extension']);
        $destination = $attachmentDirectory . DIRECTORY_SEPARATOR . $storedName;
        if (!move_uploaded_file($upload['tmp_name'], $destination)) {
            respond(500, 'No se pudieron guardar los adjuntos', 'El servidor no pudo guardar uno de los archivos. Comunícate con Adventure.');
        }
        @chmod($destination, 0600);
        $storedFiles[] = [
            'path' => $destination,
            'name' => $storedName,
            'original' => substr(preg_replace('/[\x00-\x1F\x7F]/u', '', basename($upload['name'])) ?? 'archivo', 0, 180),
            'mime' => $upload['mime'],
        ];
    }
}
$record['adjuntos'] = $storedFiles
    ? implode(', ', array_map(static fn(array $file): string => $file['original'], $storedFiles))
    : 'Sin adjuntos';

$json = json_encode($record, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
if ($json === false) respond(500, 'No se pudo registrar', 'El servidor no pudo preparar la reclamación. Comunícate con Adventure.');
$recordPath = $storage . DIRECTORY_SEPARATOR . 'reclamos-' . $now->format('Y') . '.jsonl';
if (file_put_contents($recordPath, $json . PHP_EOL, FILE_APPEND | LOCK_EX) === false) {
    respond(500, 'No se pudo registrar', 'El servidor no pudo guardar la reclamación. Comunícate con Adventure.');
}
@chmod($recordPath, 0600);

$subject = 'Libro de Reclamaciones ' . $code;
$body = "Se registró una nueva hoja de reclamación.\n\n";
foreach ($record as $field => $value) $body .= ucwords(str_replace('_', ' ', (string) $field)) . ': ' . $value . "\n";
$rawHost = (string) ($_SERVER['HTTP_HOST'] ?? 'localhost');
$host = preg_replace('/[^a-z0-9.-]/i', '', explode(':', $rawHost)[0]) ?: 'localhost';
$boundary = 'adventure-' . bin2hex(random_bytes(12));
$headers = "From: Adventure Web <no-reply@{$host}>\r\n";
$headers .= "Reply-To: {$data['correo']}\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/mixed; boundary=\"{$boundary}\"\r\n";
$message = "--{$boundary}\r\n";
$message .= "Content-Type: text/plain; charset=UTF-8\r\n";
$message .= "Content-Transfer-Encoding: 8bit\r\n\r\n{$body}\r\n";
foreach ($storedFiles as $file) {
    $contents = file_get_contents($file['path']);
    if ($contents === false) continue;
    $message .= "--{$boundary}\r\n";
    $message .= "Content-Type: {$file['mime']}; name=\"{$file['name']}\"\r\n";
    $message .= "Content-Transfer-Encoding: base64\r\n";
    $message .= "Content-Disposition: attachment; filename=\"{$file['name']}\"\r\n\r\n";
    $message .= chunk_split(base64_encode($contents)) . "\r\n";
}
$message .= "--{$boundary}--\r\n";
$mailSent = @mail((string) $config['correo_reclamos'], $subject, $message, $headers);

respond(
    200,
    'Reclamación registrada',
    "Tu código de seguimiento es {$code}. La reclamación y sus adjuntos quedaron guardados" . ($mailSent ? ' y el aviso fue enviado por correo.' : '. El servidor no confirmó el aviso por correo; comunícate con Adventure indicando tu código.') . ' Conserva o imprime esta copia. Adventure debe responder por escrito en un plazo máximo de 15 días hábiles improrrogables.',
    $record
);
