# Base de datos Biblioteca - SkillForge

Script de base de datos para la plataforma digital de gestión bibliotecaria del proyecto SkillForge.

La base de datos permite administrar el catálogo de libros, los clientes de la biblioteca y las operaciones de préstamos, reservas, multas y donaciones.

## Motor de base de datos

El archivo `Biblioteca.sql` está desarrollado para **Microsoft SQL Server**.

El script utiliza características propias de SQL Server, entre ellas:

- `IDENTITY` para columnas autoincrementales.
- `DATETIME2` para fechas y horas.
- `BIT` para valores booleanos.
- `GO` como separador de lotes.
- `DB_ID()` para verificar si la base de datos ya existe.

## Requisitos

- Microsoft SQL Server.
- SQL Server Management Studio (SSMS), Azure Data Studio u otra herramienta compatible.
- Permisos suficientes para crear la base de datos y sus tablas.

## Ejecución

1. Abrir SQL Server Management Studio o Azure Data Studio.
2. Conectarse a una instancia de Microsoft SQL Server.
3. Abrir el archivo `Biblioteca.sql`.
4. Ejecutar el script completo.
5. Verificar que se haya creado la base de datos `Biblioteca` y sus tablas.

El script crea la base de datos `Biblioteca` solamente si todavía no existe y luego selecciona esa base para crear las tablas, relaciones, restricciones e índices.

> Importante: el script no contiene datos de prueba. Luego de crear la estructura se pueden agregar registros mediante sentencias `INSERT` o desde la aplicación.

## Estructura de la base de datos

### Usuarios y clientes

- `Roles`: perfiles de acceso disponibles, como bibliotecario y administrador.
- `UsuariosOperadores`: cuentas del personal que utiliza el sistema.
- `Clientes`: datos de los socios o clientes de la biblioteca.

### Catálogo e inventario

- `Categorias`: categorías de los libros.
- `Autores`: autores registrados.
- `Editoriales`: editoriales de los libros.
- `Libros`: información principal de cada título.
- `LibroAutores`: relación entre libros y autores.
- `Ejemplares`: copias físicas y estado de cada libro.

### Préstamos y sanciones

- `Prestamos`: préstamos de ejemplares realizados a clientes.
- `Reservas`: reservas de libros y posición en la cola de espera.
- `Multas`: multas generadas por devoluciones tardías.
- `PagosMultas`: pagos realizados para cancelar multas.

### Donaciones y trazabilidad

- `Donantes`: información de las personas que realizan donaciones.
- `Donaciones`: solicitudes y estados de las donaciones.
- `DetalleDonaciones`: libros y cantidades recibidas o aceptadas.
- `HistorialDonaciones`: historial de cambios de estado y ubicación.
- `AuditoriaDonaciones`: acciones realizadas sobre las donaciones.

## Integridad y reglas de negocio

El script incluye:

- Claves primarias para identificar los registros.
- Claves foráneas para relacionar las tablas.
- Restricciones `UNIQUE` para evitar valores duplicados.
- Restricciones `CHECK` para validar estados y cantidades.
- Valores predeterminados para fechas, estados y otros campos.
- Índices para mejorar las búsquedas frecuentes.
- Un índice filtrado que impide tener más de un préstamo activo para el mismo ejemplar.
- Un índice filtrado que evita reservas pendientes duplicadas de un mismo libro por cliente.

## Seguridad

La tabla `UsuariosOperadores` almacena el campo `password_hash`, destinado a guardar contraseñas protegidas mediante un algoritmo de hash. La aplicación debe generar el hash antes de guardarlo y nunca almacenar contraseñas en texto plano.

El campo `datos_cifrados` de `Donantes` está preparado para almacenar información protegida en formato binario cuando corresponda.

## Relación con el proyecto

Esta base de datos respalda las funciones definidas para el sistema de gestión bibliotecaria:

- Gestión del catálogo e inventario.
- Administración de clientes.
- Registro de préstamos y devoluciones.
- Gestión de reservas.
- Generación y pago de multas.
- Administración de donaciones.
- Auditoría y trazabilidad de las operaciones.

## Archivos

```text
Base del proyecto/
├── Biblioteca.sql
└── README.md
```
