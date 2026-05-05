-- ============================================================================
-- Lotus Body Car — Datos semilla (UUIDs generados con toUUID())
-- Ejecutar DESPUÉS de schema.sql en Supabase SQL Editor
-- ============================================================================

-- Usuarios (toUUID('u1')...toUUID('u4'))
INSERT INTO usuario (id, nombre, correo, rol, telefono, direccion, reputacion, verificado) VALUES
('e4774cdd-a079-4f86-a14e-8b9140bb6db4', 'Administrador LBC', 'admin@lotusbodycar.com', 'admin', '+57 300 000 0001', 'Bogotá, Colombia', 5.0, true),
('270c1b08-4f3f-446e-a578-7075158d9c53', 'Carlos Vendedor', 'vendedor@lotusbodycar.com', 'seller', '+57 311 234 5678', 'Medellín, Colombia', 4.8, true),
('532a7b8e-0328-48d0-aa8e-6258b28b9a36', 'María Compradora', 'buyer@lotusbodycar.com', 'buyer', '+57 322 987 6543', 'Cali, Colombia', null, false),
('7b8d62fd-2f0f-4b2e-aba5-437e5b983128', 'Pedro Antiguo', 'pedro@ejemplo.com', 'buyer', '+57 333 111 2222', 'Barranquilla, Colombia', null, true);

-- Productos (toUUID('1')...toUUID('6'), id_vendedor = toUUID('u2'))
INSERT INTO producto (id, id_vendedor, nombre, marca, modelo, anio, categoria, precio, stock, estado_publicacion, condicion_pieza, fecha_fabricacion) VALUES
('c4ca4238-a0b9-4382-adcc-509a6f75849b', '270c1b08-4f3f-446e-a578-7075158d9c53', 'Motor V8 BMW M5', 'BMW', 'M5 F90', 2023, 'Motor', 15000000, 3, 'Activa', 'Nuevo', '2023-01-15'),
('c81e728d-9d4c-4f63-af06-7f89cc14862c', '270c1b08-4f3f-446e-a578-7075158d9c53', 'Rines Deportivos AMG 20"', 'Mercedes-Benz', 'AMG GT', 2022, 'Llantas y Rines', 8500000, 5, 'Activa', 'Nuevo', null),
('eccbc87e-4b5c-42fe-a830-8fd9f2a7baf3', '270c1b08-4f3f-446e-a578-7075158d9c53', 'Asientos Deportivos Recaro', 'Universal', 'Deportivos', 2024, 'Interiores', 4500000, 8, 'Activa', 'Nuevo', null),
('a87ff679-a2f3-471d-a181-a67b7542122c', '270c1b08-4f3f-446e-a578-7075158d9c53', 'Sistema de Escape Akrapovic', 'Porsche', '911 GT3', 2023, 'Escape', 12000000, 1, 'Reservado', 'Nuevo', null),
('e4da3b7f-bbce-4345-a777-2b0674a318d5', '270c1b08-4f3f-446e-a578-7075158d9c53', 'Turbo Garrett GT3582R', 'Universal', 'Alto Rendimiento', 2021, 'Motor', 6800000, 0, 'Vendida', 'Nuevo', null),
('1679091c-5a88-4faf-afb5-e6087eb1b2dc', '270c1b08-4f3f-446e-a578-7075158d9c53', 'Frenos Brembo Gran Turismo', 'Audi', 'RS6', 2023, 'Frenos', 9500000, 2, 'Activa', 'Nuevo', null);

-- Detalle producto (toUUID('1')..toUUID('6'))
INSERT INTO detalle_producto (id_producto, descripcion, especificaciones, imagenes) VALUES
('c4ca4238-a0b9-4382-adcc-509a6f75849b', 'Motor V8 biturbo de alto rendimiento para BMW M5 F90. Incluye garantía del fabricante y certificado de autenticidad. Perfecto estado, nunca instalado. Compatible con modelos 2018-2023.',
  '{"Compatibilidad":"BMW M5 F90 (2018-2023)","Cilindrada":"4.4L V8 Biturbo","Potencia":"600 HP","Estado":"Nuevo sin usar","Garantia":"12 meses","Origen":"Alemania - Original BMW"}',
  '["https://images.unsplash.com/photo-1762139258224-236877b2c571?w=1080","https://images.unsplash.com/photo-1752959818576-b0991721789d?w=1080","https://images.unsplash.com/photo-1759580596227-741485a217e6?w=1080"]'),
('c81e728d-9d4c-4f63-af06-7f89cc14862c', 'Rines deportivos de aleación ligera originales AMG de 20 pulgadas.',
  '{"Diametro":"20\"","Material":"Aleación ligera"}',
  '["https://images.unsplash.com/photo-1677917362048-a9e5267d7882?w=1080"]'),
('eccbc87e-4b5c-42fe-a830-8fd9f2a7baf3', 'Asientos deportivos tipo cubo de la marca Recaro. Máximo agarre y confort.',
  '{"Color":"Negro","Material":"Alcantara"}',
  '["https://images.unsplash.com/photo-1741086011537-c935f6f29724?w=1080"]'),
('a87ff679-a2f3-471d-a181-a67b7542122c', 'Sistema de escape Akrapovic fabricado en titanio de alta calidad para Porsche 911 GT3. Sonido inigualable y reducción de peso significativa.',
  '{"Material":"Titanio","Reducción de peso":"4kg","Sonido":"Sport"}',
  '["https://images.unsplash.com/photo-1617406181730-cbc3e4665411?w=1080"]'),
('e4da3b7f-bbce-4345-a777-2b0674a318d5', 'Turbocompresor Garrett GT3582R para preparaciones de alto rendimiento. Capaz de soportar hasta 700 HP.',
  '{"Marca":"Garrett","Modelo":"GT3582R","Rango":"400-700 HP"}',
  '["https://images.unsplash.com/photo-1614165939020-f71f0683a35c?w=1080"]'),
('1679091c-5a88-4faf-afb5-e6087eb1b2dc', 'Kit de frenos Brembo Gran Turismo con pinzas de 6 pistones y discos perforados de 380mm.',
  '{"Marca":"Brembo","Pistones":"6","Discos":"380mm"}',
  '["https://images.unsplash.com/photo-1603811463131-017e8c3b0a72?w=1080"]');

-- Carrito demo (María Compradora, toUUID('u3'))
INSERT INTO carrito (id, id_usuario, subtotal, total) VALUES
('00000000-0000-4000-a000-000000000001', '532a7b8e-0328-48d0-aa8e-6258b28b9a36', 32500000, 38675000);

INSERT INTO articulo_carrito (id_carrito, id_producto, cantidad) VALUES
('00000000-0000-4000-a000-000000000001', 'c4ca4238-a0b9-4382-adcc-509a6f75849b', 1),
('00000000-0000-4000-a000-000000000001', 'c81e728d-9d4c-4f63-af06-7f89cc14862c', 1),
('00000000-0000-4000-a000-000000000001', 'eccbc87e-4b5c-42fe-a830-8fd9f2a7baf3', 2);
