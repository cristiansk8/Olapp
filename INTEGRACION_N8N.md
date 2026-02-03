# Integración del Bot n8n con OLAPP

## Arquitectura

```
Telegram (mensaje con foto) → n8n → OLAPP API → WooCommerce
```

## Flujo Completo

1. **Usuario envía foto + descripción por Telegram**
2. **n8n recibe el mensaje** (Telegram Trigger)
3. **n8n consulta OLAPP API** para identificar el negocio
4. **OLAPP crea categoría en WooCommerce** (si no existe)
5. **n8n crea producto en WooCommerce** con la categoría correcta
6. **Producto aparece en OLAPP** filtrado por negocio

## Endpoint de OLAPP para n8n

### GET /api/business/by-telegram?chat_id={chat_id}

**Propósito:** Identificar el negocio y obtener/crear la categoría de WooCommerce

**Respuesta exitosa:**
```json
{
  "businessId": "clm123abc",
  "name": "Cevichería El Marino",
  "slug": "cevicheria-el-marino",
  "wooCategoryId": 45,
  "wooVendorId": null,
  "message": "Categoría creada exitosamente en WooCommerce"
}
```

**Respuesta si el negocio no existe:**
```json
{
  "error": "No se encontró un negocio asociado a este chat_id",
  "status": 404
}
```

### POST /api/business/by-telegram

**Propósito:** Asociar un chat_id de Telegram a un negocio existente

**Body:**
```json
{
  "businessSlug": "cevicheria-el-marino",
  "chatId": "123456789"
}
```

**Respuesta:**
```json
{
  "businessId": "clm123abc",
  "name": "Cevichería El Marino",
  "slug": "cevicheria-el-marino",
  "telegramChatId": "123456789",
  "message": "Chat de Telegram asociado exitosamente"
}
```

## Configuración del Workflow de n8n

### Paso 1: Telegram Trigger
Recibe mensaje con foto del usuario

### Paso 2: Extraer chat_id
```javascript
const chatId = $input.first().json.message.chat.id;
return [{ json: { chatId } }];
```

### Paso 3: Consultar API de OLAPP
**HTTP Request:**
- Method: GET
- URL: `https://olapp.com/api/business/by-telegram?chat_id={{ $json.chatId }}`

### Paso 4: Crear categoría en WooCommerce (si no existe)
Este paso ya está incluido en la respuesta de la API de OLAPP. La respuesta incluye el `wooCategoryId`.

### Paso 5: Generar metadata con GPT
Mantén tu prompt actual, pero asegúrate de que las categorías sean correctas.

### Paso 6: Crear producto en WooCommerce
Usa el `wooCategoryId` obtenido en el paso 3:

```json
{
  "name": "Nombre del producto",
  "categories": [{ "id": {{ $json.wooCategoryId }} }],
  "regular_price": "10.00",
  "description": "...",
  "images": [{ "src": "https://..." }]
}
```

## Configuración Inicial

### Paso 1: Crear negocio en OLAPP
1. Regístrate en OLAPP con rol "BUSINESS"
2. Ve a `/dashboard/negocios`
3. Crea tu negocio
4. Copia el `slug` de tu negocio

### Paso 2: Conectar Telegram
**Opción A: Vía Dashboard**
1. Envía un mensaje al bot: `/connect {slug}`
2. El bot llamará a la API de OLAPP para asociar el chat_id

**Opción B: Vía API directa**
```bash
curl -X POST https://olapp.com/api/business/by-telegram \
  -H "Content-Type: application/json" \
  -d '{
    "businessSlug": "cevicheria-el-marino",
    "chatId": "123456789"
  }'
```

### Paso 3: Probar el workflow
1. Envía una foto con descripción por Telegram
2. Verifica que el producto aparezca en WooCommerce
3. Verifica que el producto aparezca en OLAPP bajo tu negocio

## Variables de Entorno

Asegúrate de configurar estas variables en `.env`:

```env
# WooCommerce
WOOCOMMERCE_URL="https://khaki-caribou-311494.hostingersite.com"
WOOCOMMERCE_CONSUMER_KEY="ck_24d8a94cd0b08841d88785c8938c50bfba413282"
WOOCOMMERCE_CONSUMER_SECRET="cs_872b0c082b0aa2c79fa3cd02bc396b658f2f436e"

# OLAPP URL (para callback del bot)
NEXT_PUBLIC_APP_URL="https://tu-olapp.com"
```

## Estructura de Categorías en WooCommerce

Cada negocio de OLAPP = Una categoría en WooCommerce:

```
WooCommerce Categories:
├── Cevichería El Marino (id: 45)
│   ├── Ceviche Clásico
│   └── Ceviche Mixto
├── Panadería María (id: 67)
│   └── Pan de yema
└── Farmacia El Ecuador (id: 89)
    └── Paracetamol
```

## Verificación

Para verificar que la integración funciona:

1. **Verificar negocio en OLAPP:**
   - Ve a `/dashboard/negocios`
   - Verifica que aparezca `✅ Telegram conectado`
   - Verifica que aparezca `🛒 WooCommerce: {id}`

2. **Verificar productos:**
   - Ve a `/productos`
   - Deberías ver los productos que has subido vía bot

3. **Verificar productos por negocio:**
   - Ve a `/productos?business={slug}`
   - Solo deberías ver productos de ese negocio

## Troubleshooting

### Error: "No se encontró un negocio asociado a este chat_id"
- Solución: El chat_id no está asociado a ningún negocio. Usa el endpoint POST para asociarlo.

### Error: "Error al crear la categoría en WooCommerce"
- Solución: Verifica que las credenciales de WooCommerce sean correctas en `.env`

### Los productos no aparecen en OLAPP
- Solución: Verifica que el producto esté asignado a la categoría correcta en WooCommerce
- Solución: Verifica que el negocio tenga el `wooCategoryId` correcto

## Próximos Pasos

1. Implementar carrito de compras
2. Implementar checkout con pedidos en Supabase
3. Notificar al negocio por Telegram cuando llega un pedido
4. Implementar validación comunitaria de negocios
