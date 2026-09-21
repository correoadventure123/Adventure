<?php
declare(strict_types=1);
/* COMPLETAR ANTES DE PUBLICAR: reemplaza los valores PENDIENTE con datos legales reales. */
return [
    'correo_reclamos' => 'correoadventure@gmail.com',
    'prefijo' => 'ADV',
    // En producción es preferible usar una ruta privada fuera de public_html.
    'directorio_datos' => __DIR__ . DIRECTORY_SEPARATOR . 'reclamos-data',
    'locales' => [
        'huaycan-1' => [
            'establecimiento' => 'Huaycán · Local 1 — Av. José C. Mariátegui, lote 9, zona B',
            'proveedor' => 'PENDIENTE: razón social o titular legal del Local 1',
            'ruc' => 'PENDIENTE: RUC del Local 1',
            'domicilio_legal' => 'PENDIENTE: domicilio legal del Local 1',
        ],
        'huaycan-2' => [
            'establecimiento' => 'Huaycán · Local 2 — Av. José C. Mariátegui, lote 3A, zona B',
            'proveedor' => 'PENDIENTE: razón social o titular legal del Local 2',
            'ruc' => 'PENDIENTE: RUC del Local 2',
            'domicilio_legal' => 'PENDIENTE: domicilio legal del Local 2',
        ],
        'chaclacayo' => [
            'establecimiento' => 'Chaclacayo · Local 3 — Calle Los Cerezos 311',
            'proveedor' => 'PENDIENTE: razón social o titular legal del Local 3',
            'ruc' => 'PENDIENTE: RUC del Local 3',
            'domicilio_legal' => 'PENDIENTE: domicilio legal del Local 3',
        ],
    ],
];
