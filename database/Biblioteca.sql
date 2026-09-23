-- Script de creación de la base de datos para Microsoft SQL Server.
-- El sistema administra el catálogo, los clientes y las operaciones de una biblioteca.

IF DB_ID(N'Biblioteca') IS NULL
BEGIN
    CREATE DATABASE Biblioteca;
END;
GO

USE Biblioteca;
GO

-- En esta tabla se guardan los perfiles de acceso disponibles para los operadores del sistema.
CREATE TABLE Roles
(
    id_rol INT IDENTITY(1,1) NOT NULL,
    nombre VARCHAR(30) NOT NULL,
    descripcion VARCHAR(200) NULL,
    CONSTRAINT PK_Roles PRIMARY KEY (id_rol),
    CONSTRAINT UQ_Roles_Nombre UNIQUE (nombre),
    CONSTRAINT CK_Roles_Nombre CHECK (nombre IN ('Bibliotecario', 'Administrador'))
);
GO

-- En esta tabla se guardan las cuentas del personal que utiliza el sistema y su información de acceso.
CREATE TABLE UsuariosOperadores
(
    id_usuario INT IDENTITY(1,1) NOT NULL,
    nombre_usuario VARCHAR(50) NOT NULL,
    nombre VARCHAR(80) NOT NULL,
    apellido VARCHAR(80) NOT NULL,
    correo VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    id_rol INT NOT NULL,
    activo BIT NOT NULL CONSTRAINT DF_Usuarios_Activo DEFAULT (1),
    fecha_alta DATETIME2(0) NOT NULL CONSTRAINT DF_Usuarios_FechaAlta DEFAULT (SYSDATETIME()),
    ultimo_acceso DATETIME2(0) NULL,
    CONSTRAINT PK_UsuariosOperadores PRIMARY KEY (id_usuario),
    CONSTRAINT UQ_Usuarios_Nombre UNIQUE (nombre_usuario),
    CONSTRAINT UQ_Usuarios_Correo UNIQUE (correo),
    CONSTRAINT FK_Usuarios_Roles FOREIGN KEY (id_rol) REFERENCES Roles(id_rol)
);
GO

-- En esta tabla se guardan los datos de los clientes o socios de la biblioteca.
CREATE TABLE Clientes
(
    ci VARCHAR(20) NOT NULL,
    nombre VARCHAR(80) NOT NULL,
    apellido VARCHAR(80) NOT NULL,
    telefono VARCHAR(30) NULL,
    correo VARCHAR(150) NULL,
    estado VARCHAR(20) NOT NULL CONSTRAINT DF_Clientes_Estado DEFAULT ('Habilitado'),
    fecha_registro DATETIME2(0) NOT NULL CONSTRAINT DF_Clientes_FechaRegistro DEFAULT (SYSDATETIME()),
    fecha_baja DATETIME2(0) NULL,
    CONSTRAINT PK_Clientes PRIMARY KEY (ci),
    CONSTRAINT UQ_Clientes_Correo UNIQUE (correo),
    CONSTRAINT CK_Clientes_Estado CHECK (estado IN ('Habilitado', 'Inhabilitado', 'Inactivo'))
);
GO

-- En esta tabla se guardan las categorías utilizadas para clasificar los libros del catálogo.
CREATE TABLE Categorias
(
    id_categoria INT IDENTITY(1,1) NOT NULL,
    nombre VARCHAR(80) NOT NULL,
    descripcion VARCHAR(250) NULL,
    CONSTRAINT PK_Categorias PRIMARY KEY (id_categoria),
    CONSTRAINT UQ_Categorias_Nombre UNIQUE (nombre)
);
GO

-- En esta tabla se guardan los autores asociados a los libros disponibles en el catálogo.
CREATE TABLE Autores
(
    id_autor INT IDENTITY(1,1) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    CONSTRAINT PK_Autores PRIMARY KEY (id_autor)
);
GO

-- En esta tabla se guardan las editoriales responsables de la publicación de los libros.
CREATE TABLE Editoriales
(
    id_editorial INT IDENTITY(1,1) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    CONSTRAINT PK_Editoriales PRIMARY KEY (id_editorial),
    CONSTRAINT UQ_Editoriales_Nombre UNIQUE (nombre)
);
GO

-- En esta tabla se guardan los datos principales de cada título del catálogo bibliográfico.
CREATE TABLE Libros
(
    isbn VARCHAR(20) NOT NULL,
    titulo VARCHAR(250) NOT NULL,
    id_categoria INT NOT NULL,
    id_editorial INT NULL,
    fecha_ingreso DATE NOT NULL,
    imagen_url VARCHAR(500) NULL,
    activo BIT NOT NULL CONSTRAINT DF_Libros_Activo DEFAULT (1),
    fecha_baja DATETIME2(0) NULL,
    CONSTRAINT PK_Libros PRIMARY KEY (isbn),
    CONSTRAINT FK_Libros_Categorias FOREIGN KEY (id_categoria) REFERENCES Categorias(id_categoria),
    CONSTRAINT FK_Libros_Editoriales FOREIGN KEY (id_editorial) REFERENCES Editoriales(id_editorial)
);
GO

-- En esta tabla se relacionan los libros con sus autores, permitiendo que un libro tenga uno o varios autores.
CREATE TABLE LibroAutores
(
    isbn VARCHAR(20) NOT NULL,
    id_autor INT NOT NULL,
    CONSTRAINT PK_LibroAutores PRIMARY KEY (isbn, id_autor),
    CONSTRAINT FK_LibroAutores_Libros FOREIGN KEY (isbn) REFERENCES Libros(isbn),
    CONSTRAINT FK_LibroAutores_Autores FOREIGN KEY (id_autor) REFERENCES Autores(id_autor)
);
GO

-- En esta tabla se registran las copias físicas de cada libro y su estado dentro del inventario.
CREATE TABLE Ejemplares
(
    id_ejemplar INT IDENTITY(1,1) NOT NULL,
    isbn VARCHAR(20) NOT NULL,
    codigo_inventario VARCHAR(40) NOT NULL,
    estado VARCHAR(20) NOT NULL CONSTRAINT DF_Ejemplares_Estado DEFAULT ('Operativo'),
    fecha_alta DATETIME2(0) NOT NULL CONSTRAINT DF_Ejemplares_FechaAlta DEFAULT (SYSDATETIME()),
    fecha_baja DATETIME2(0) NULL,
    observaciones VARCHAR(500) NULL,
    CONSTRAINT PK_Ejemplares PRIMARY KEY (id_ejemplar),
    CONSTRAINT UQ_Ejemplares_Codigo UNIQUE (codigo_inventario),
    CONSTRAINT FK_Ejemplares_Libros FOREIGN KEY (isbn) REFERENCES Libros(isbn),
    CONSTRAINT CK_Ejemplares_Estado CHECK (estado IN ('Operativo', 'Prestado', 'Reservado', 'Danado', 'En reparacion', 'Extraviado', 'Baja'))
);
GO

-- En esta tabla se registran los préstamos de ejemplares realizados a los clientes de la biblioteca.
CREATE TABLE Prestamos
(
    id_prestamo INT IDENTITY(1,1) NOT NULL,
    ci VARCHAR(20) NOT NULL,
    id_ejemplar INT NOT NULL,
    id_usuario INT NOT NULL,
    fecha_prestamo DATETIME2(0) NOT NULL CONSTRAINT DF_Prestamos_FechaPrestamo DEFAULT (SYSDATETIME()),
    fecha_limite DATE NOT NULL,
    fecha_devolucion DATETIME2(0) NULL,
    estado VARCHAR(20) NOT NULL CONSTRAINT DF_Prestamos_Estado DEFAULT ('Activo'),
    observaciones VARCHAR(500) NULL,
    CONSTRAINT PK_Prestamos PRIMARY KEY (id_prestamo),
    CONSTRAINT FK_Prestamos_Clientes FOREIGN KEY (ci) REFERENCES Clientes(ci),
    CONSTRAINT FK_Prestamos_Ejemplares FOREIGN KEY (id_ejemplar) REFERENCES Ejemplares(id_ejemplar),
    CONSTRAINT FK_Prestamos_Usuarios FOREIGN KEY (id_usuario) REFERENCES UsuariosOperadores(id_usuario),
    CONSTRAINT CK_Prestamos_Estado CHECK (estado IN ('Activo', 'Finalizado', 'Vencido', 'Cancelado')),
    CONSTRAINT CK_Prestamos_Fechas CHECK (fecha_devolucion IS NULL OR fecha_devolucion >= fecha_prestamo)
);
GO

CREATE UNIQUE INDEX UX_Prestamos_EjemplarActivo
    ON Prestamos(id_ejemplar)
    WHERE estado = 'Activo';
GO

-- En esta tabla se guardan las reservas de libros y la posición de cada cliente en la cola de espera.
CREATE TABLE Reservas
(
    id_reserva INT IDENTITY(1,1) NOT NULL,
    ci VARCHAR(20) NOT NULL,
    isbn VARCHAR(20) NOT NULL,
    fecha_reserva DATETIME2(0) NOT NULL CONSTRAINT DF_Reservas_Fecha DEFAULT (SYSDATETIME()),
    posicion_cola INT NOT NULL,
    estado VARCHAR(20) NOT NULL CONSTRAINT DF_Reservas_Estado DEFAULT ('Pendiente'),
    fecha_atencion DATETIME2(0) NULL,
    CONSTRAINT PK_Reservas PRIMARY KEY (id_reserva),
    CONSTRAINT FK_Reservas_Clientes FOREIGN KEY (ci) REFERENCES Clientes(ci),
    CONSTRAINT FK_Reservas_Libros FOREIGN KEY (isbn) REFERENCES Libros(isbn),
    CONSTRAINT CK_Reservas_Estado CHECK (estado IN ('Pendiente', 'Atendida', 'Cancelada', 'Vencida')),
    CONSTRAINT CK_Reservas_Posicion CHECK (posicion_cola > 0)
);
GO

CREATE UNIQUE INDEX UX_Reservas_ClienteLibroPendiente
    ON Reservas(ci, isbn)
    WHERE estado = 'Pendiente';
GO

-- En esta tabla se registran las multas generadas por la devolución tardía de los préstamos.
CREATE TABLE Multas
(
    id_multa INT IDENTITY(1,1) NOT NULL,
    id_prestamo INT NOT NULL,
    ci VARCHAR(20) NOT NULL,
    dias_atraso INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    dias_suspension INT NOT NULL CONSTRAINT DF_Multas_DiasSuspension DEFAULT (0),
    estado VARCHAR(20) NOT NULL CONSTRAINT DF_Multas_Estado DEFAULT ('Pendiente'),
    fecha_generacion DATETIME2(0) NOT NULL CONSTRAINT DF_Multas_Fecha DEFAULT (SYSDATETIME()),
    CONSTRAINT PK_Multas PRIMARY KEY (id_multa),
    CONSTRAINT UQ_Multas_Prestamo UNIQUE (id_prestamo),
    CONSTRAINT FK_Multas_Prestamos FOREIGN KEY (id_prestamo) REFERENCES Prestamos(id_prestamo),
    CONSTRAINT FK_Multas_Clientes FOREIGN KEY (ci) REFERENCES Clientes(ci),
    CONSTRAINT CK_Multas_Dias CHECK (dias_atraso > 0),
    CONSTRAINT CK_Multas_Monto CHECK (monto >= 0),
    CONSTRAINT CK_Multas_Estado CHECK (estado IN ('Pendiente', 'Pagada', 'Condonada'))
);
GO

-- En esta tabla se registran los pagos realizados para cancelar las multas de los clientes.
CREATE TABLE PagosMultas
(
    id_pago INT IDENTITY(1,1) NOT NULL,
    id_multa INT NOT NULL,
    id_usuario INT NOT NULL,
    monto_abonado DECIMAL(10,2) NOT NULL,
    forma_pago VARCHAR(30) NOT NULL,
    fecha_pago DATETIME2(0) NOT NULL CONSTRAINT DF_PagosMultas_Fecha DEFAULT (SYSDATETIME()),
    observaciones VARCHAR(300) NULL,
    CONSTRAINT PK_PagosMultas PRIMARY KEY (id_pago),
    CONSTRAINT FK_PagosMultas_Multas FOREIGN KEY (id_multa) REFERENCES Multas(id_multa),
    CONSTRAINT FK_PagosMultas_Usuarios FOREIGN KEY (id_usuario) REFERENCES UsuariosOperadores(id_usuario),
    CONSTRAINT CK_PagosMultas_Monto CHECK (monto_abonado > 0)
);
GO

-- En esta tabla se guardan los datos de las personas que realizan donaciones a la biblioteca.
CREATE TABLE Donantes
(
    id_donante INT IDENTITY(1,1) NOT NULL,
    nombre VARCHAR(160) NOT NULL,
    documento VARCHAR(30) NULL,
    telefono VARCHAR(30) NULL,
    correo VARCHAR(150) NULL,
    datos_cifrados VARBINARY(MAX) NULL,
    CONSTRAINT PK_Donantes PRIMARY KEY (id_donante),
    CONSTRAINT UQ_Donantes_Documento UNIQUE (documento)
);
GO

-- En esta tabla se registran las solicitudes y el estado de las donaciones recibidas.
CREATE TABLE Donaciones
(
    id_donacion INT IDENTITY(1,1) NOT NULL,
    id_donante INT NOT NULL,
    id_usuario INT NOT NULL,
    fecha_solicitud DATETIME2(0) NOT NULL CONSTRAINT DF_Donaciones_FechaSolicitud DEFAULT (SYSDATETIME()),
    estado VARCHAR(20) NOT NULL CONSTRAINT DF_Donaciones_Estado DEFAULT ('Solicitada'),
    observaciones VARCHAR(500) NULL,
    CONSTRAINT PK_Donaciones PRIMARY KEY (id_donacion),
    CONSTRAINT FK_Donaciones_Donantes FOREIGN KEY (id_donante) REFERENCES Donantes(id_donante),
    CONSTRAINT FK_Donaciones_Usuarios FOREIGN KEY (id_usuario) REFERENCES UsuariosOperadores(id_usuario),
    CONSTRAINT CK_Donaciones_Estado CHECK (estado IN ('Solicitada', 'Evaluada', 'Aceptada', 'Rechazada', 'Catalogada'))
);
GO

-- En esta tabla se detallan los libros y las cantidades recibidas y aceptadas en cada donación.
CREATE TABLE DetalleDonaciones
(
    id_detalle INT IDENTITY(1,1) NOT NULL,
    id_donacion INT NOT NULL,
    isbn VARCHAR(20) NOT NULL,
    cantidad_recibida INT NOT NULL,
    cantidad_aceptada INT NOT NULL,
    CONSTRAINT PK_DetalleDonaciones PRIMARY KEY (id_detalle),
    CONSTRAINT FK_DetalleDonaciones_Donaciones FOREIGN KEY (id_donacion) REFERENCES Donaciones(id_donacion),
    CONSTRAINT FK_DetalleDonaciones_Libros FOREIGN KEY (isbn) REFERENCES Libros(isbn),
    CONSTRAINT CK_DetalleDonaciones_Cantidades CHECK (cantidad_recibida > 0 AND cantidad_aceptada >= 0 AND cantidad_aceptada <= cantidad_recibida)
);
GO

-- En esta tabla se conserva el historial de cambios de estado y ubicación asociados a las donaciones.
CREATE TABLE HistorialDonaciones
(
    id_historial BIGINT IDENTITY(1,1) NOT NULL,
    id_donacion INT NOT NULL,
    id_ejemplar INT NULL,
    id_usuario INT NOT NULL,
    estado_anterior VARCHAR(30) NULL,
    estado_nuevo VARCHAR(30) NOT NULL,
    ubicacion VARCHAR(150) NULL,
    fecha_evento DATETIME2(0) NOT NULL CONSTRAINT DF_HistorialDonaciones_Fecha DEFAULT (SYSDATETIME()),
    observaciones VARCHAR(500) NULL,
    CONSTRAINT PK_HistorialDonaciones PRIMARY KEY (id_historial),
    CONSTRAINT FK_HistorialDonaciones_Donaciones FOREIGN KEY (id_donacion) REFERENCES Donaciones(id_donacion),
    CONSTRAINT FK_HistorialDonaciones_Ejemplares FOREIGN KEY (id_ejemplar) REFERENCES Ejemplares(id_ejemplar),
    CONSTRAINT FK_HistorialDonaciones_Usuarios FOREIGN KEY (id_usuario) REFERENCES UsuariosOperadores(id_usuario)
);
GO

-- En esta tabla se registran las acciones realizadas sobre las donaciones para garantizar su trazabilidad.
CREATE TABLE AuditoriaDonaciones
(
    id_auditoria BIGINT IDENTITY(1,1) NOT NULL,
    id_donacion INT NULL,
    id_usuario INT NOT NULL,
    accion VARCHAR(30) NOT NULL,
    fecha_evento DATETIME2(0) NOT NULL CONSTRAINT DF_AuditoriaDonaciones_Fecha DEFAULT (SYSDATETIME()),
    ip_origen VARCHAR(45) NULL,
    detalle VARCHAR(1000) NULL,
    CONSTRAINT PK_AuditoriaDonaciones PRIMARY KEY (id_auditoria),
    CONSTRAINT FK_AuditoriaDonaciones_Donaciones FOREIGN KEY (id_donacion) REFERENCES Donaciones(id_donacion),
    CONSTRAINT FK_AuditoriaDonaciones_Usuarios FOREIGN KEY (id_usuario) REFERENCES UsuariosOperadores(id_usuario),
    CONSTRAINT CK_AuditoriaDonaciones_Accion CHECK (accion IN ('Creacion', 'Evaluacion', 'Aceptacion', 'Rechazo', 'Catalogacion'))
);
GO

CREATE INDEX IX_Libros_Titulo ON Libros(titulo);
CREATE INDEX IX_Libros_Categoria ON Libros(id_categoria);
CREATE INDEX IX_LibroAutores_Autor ON LibroAutores(id_autor, isbn);
CREATE INDEX IX_Ejemplares_ISBN_Estado ON Ejemplares(isbn, estado);
CREATE INDEX IX_Clientes_Nombre ON Clientes(apellido, nombre);
CREATE INDEX IX_Prestamos_Cliente_Estado ON Prestamos(ci, estado);
CREATE INDEX IX_Prestamos_FechaLimite ON Prestamos(fecha_limite, estado);
CREATE INDEX IX_Reservas_ISBN_Estado ON Reservas(isbn, estado, posicion_cola);
CREATE INDEX IX_Donaciones_FechaEstado ON Donaciones(fecha_solicitud, estado);
CREATE INDEX IX_AuditoriaDonaciones_DonacionFecha ON AuditoriaDonaciones(id_donacion, fecha_evento);
GO
