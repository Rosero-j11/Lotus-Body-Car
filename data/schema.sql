-- ============================================================================
-- Lotus Body Car — Esquema de base de datos
-- Ejecutar en: Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================================

-- 1. Usuario (extiende auth.users)
CREATE TABLE IF NOT EXISTS usuario (
  id UUID PRIMARY KEY,
  nombre TEXT NOT NULL,
  correo TEXT UNIQUE NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('buyer', 'seller', 'admin')),
  telefono TEXT,
  direccion TEXT,
  reputacion DECIMAL(3,2),
  verificado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Producto
CREATE TABLE IF NOT EXISTS producto (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  id_vendedor UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  marca TEXT NOT NULL,
  modelo TEXT,
  anio INTEGER,
  categoria TEXT NOT NULL,
  precio DECIMAL(12,2) NOT NULL CHECK (precio > 0),
  stock INTEGER NOT NULL DEFAULT 1 CHECK (stock >= 0),
  estado_publicacion TEXT NOT NULL DEFAULT 'Activa',
  condicion_pieza TEXT NOT NULL DEFAULT 'Nuevo' CHECK (condicion_pieza IN ('Nuevo', 'Usado', 'Reacondicionado')),
  fecha_fabricacion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Detalle Producto
CREATE TABLE IF NOT EXISTS detalle_producto (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  id_producto UUID NOT NULL REFERENCES producto(id) ON DELETE CASCADE,
  descripcion TEXT DEFAULT '',
  especificaciones JSONB DEFAULT '{}',
  imagenes JSONB DEFAULT '[]'
);

-- 4. Carrito
CREATE TABLE IF NOT EXISTS carrito (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  id_usuario UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  subtotal DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0
);

-- 5. Articulo Carrito
CREATE TABLE IF NOT EXISTS articulo_carrito (
  id_carrito UUID NOT NULL REFERENCES carrito(id) ON DELETE CASCADE,
  id_producto UUID NOT NULL REFERENCES producto(id) ON DELETE CASCADE,
  cantidad INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  PRIMARY KEY (id_carrito, id_producto)
);

-- 6. Pedido
CREATE TABLE IF NOT EXISTS pedido (
  numero_pedido TEXT PRIMARY KEY,
  id_usuario UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  fecha TEXT NOT NULL,
  estado_pedido TEXT NOT NULL DEFAULT 'Procesando',
  subtotal DECIMAL(12,2) NOT NULL,
  impuestos_iva DECIMAL(12,2) NOT NULL Default 0,
  total DECIMAL(12,2) NOT NULL,
  id_transaccion TEXT,
  direccion_entrega TEXT
);

-- 7. Articulo Pedido
CREATE TABLE IF NOT EXISTS articulo_pedido (
  id_producto UUID NOT NULL REFERENCES producto(id) ON DELETE CASCADE,
  id_pedido TEXT NOT NULL REFERENCES pedido(numero_pedido) ON DELETE CASCADE,
  precio_compra DECIMAL(12,2) NOT NULL,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  PRIMARY KEY (id_producto, id_pedido)
);

-- 8. Factura
CREATE TABLE IF NOT EXISTS factura (
  id_pedido TEXT PRIMARY KEY REFERENCES pedido(numero_pedido) ON DELETE CASCADE,
  numero_factura TEXT NOT NULL,
  fecha_emision TEXT NOT NULL,
  url_pdf TEXT,
  datos_xml TEXT,
  clave_fiscal TEXT
);

-- 9. Mensaje
CREATE TABLE IF NOT EXISTS mensaje (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  id_remitente UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  id_destinatario UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL,
  fecha_envio TEXT NOT NULL
);

-- 10. Calificación
CREATE TABLE IF NOT EXISTS calificacion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  id_calificador UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  id_calificado UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  puntaje INTEGER NOT NULL CHECK (puntaje BETWEEN 1 AND 5),
  comentario TEXT
);

-- ============================================================================
-- Índices
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_producto_id_vendedor ON producto(id_vendedor);
CREATE INDEX IF NOT EXISTS idx_producto_marca ON producto(marca);
CREATE INDEX IF NOT EXISTS idx_producto_categoria ON producto(categoria);
CREATE INDEX IF NOT EXISTS idx_producto_estado ON producto(estado_publicacion);
CREATE INDEX IF NOT EXISTS idx_detalle_producto ON detalle_producto(id_producto);
CREATE INDEX IF NOT EXISTS idx_articulo_carrito ON articulo_carrito(id_carrito);
CREATE INDEX IF NOT EXISTS idx_pedido_usuario ON pedido(id_usuario);
CREATE INDEX IF NOT EXISTS idx_calificacion_calificado ON calificacion(id_calificado);

-- ============================================================================
-- Row Level Security (permite operaciones con la publishable key)
-- ============================================================================
ALTER TABLE usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE producto ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_producto ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrito ENABLE ROW LEVEL SECURITY;
ALTER TABLE articulo_carrito ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE articulo_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE factura ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensaje ENABLE ROW LEVEL SECURITY;
ALTER TABLE calificacion ENABLE ROW LEVEL SECURITY;

-- Lectura pública para el catálogo
CREATE POLICY "Lectura publica" ON producto FOR SELECT USING (true);
CREATE POLICY "Lectura publica" ON detalle_producto FOR SELECT USING (true);
CREATE POLICY "Lectura publica" ON usuario FOR SELECT USING (true);

-- Escritura permitida (demo — en producción usar auth.uid())
CREATE POLICY "Insertar producto" ON producto FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualizar producto" ON producto FOR UPDATE USING (true);
CREATE POLICY "Insertar detalle" ON detalle_producto FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualizar detalle" ON detalle_producto FOR UPDATE USING (true);
CREATE POLICY "Insertar usuario" ON usuario FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualizar usuario" ON usuario FOR UPDATE USING (true);
CREATE POLICY "Insertar carrito" ON carrito FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualizar carrito" ON carrito FOR UPDATE USING (true);
CREATE POLICY "Lectura carrito" ON carrito FOR SELECT USING (true);
CREATE POLICY "Insertar articulo_carrito" ON articulo_carrito FOR INSERT WITH CHECK (true);
CREATE POLICY "Lectura articulo_carrito" ON articulo_carrito FOR SELECT USING (true);

-- ============================================================================
-- Supabase Storage — Bucket para imágenes de productos
-- ============================================================================

-- Crear bucket público para imágenes de productos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Política: lectura pública
CREATE POLICY "Lectura publica imagenes"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Política: subida permitida (demo — en producción restringir por auth.uid())
CREATE POLICY "Subida permitida imagenes"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images');

-- Política: eliminación permitida
CREATE POLICY "Eliminacion permitida imagenes"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images');

