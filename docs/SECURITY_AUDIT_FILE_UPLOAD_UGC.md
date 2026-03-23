# Auditoría de Seguridad - Carga de Archivos y Contenido Generado por el Usuario

**Proyecto:** Sign Flow (SaaS Multitenant)
**Fecha de Auditoría:** 2024-07-31
**Etapa:** 6 de 7 (Auditar el proceso de upload de archivos y contenido generado por el usuario para garantizar la seguridad de los assets y prevenir la ejecución de código malicioso.)

## Alcance

Esta auditoría se enfoca en la revisión de los mecanismos de seguridad implementados para la carga de archivos por parte de los usuarios (ej. logos, fotos de instalación) y para el manejo del contenido textual generado por los usuarios, con el objetivo de identificar vulnerabilidades que podrían llevar a la ejecución de código malicioso (XSS, inyección) o al compromiso de la integridad de los datos.

## Metodología

La auditoría se realiza analizando las implementaciones existentes en el código del frontend (React/TypeScript), la interacción con Supabase Storage para la gestión de archivos, y las prácticas de validación de entrada tanto en el cliente como a nivel de base de datos. Se consideran las mejores prácticas de seguridad web y las funcionalidades nativas de Supabase.

## Hallazgos y Recomendaciones

### 1. Auditoría del Proceso de Carga de Archivos

**Componentes revisados:** `AddLeadModal.tsx`, `AvatarUpload.tsx`, `InstallationPhotos.tsx`, `InstallerCompanyModal.tsx`, `EditLeadModal.tsx`.

**Hallazgos:**
*   **Validación Frontend:** Existe validación inicial en el cliente (`accept="image/*"`, `file.type.startsWith('image/')`, límite de tamaño en `AvatarUpload`).
*   **Compresión de Imágenes:** Se utiliza la utilidad `compressImage` para optimizar el tamaño y las dimensiones de las imágenes antes de la subida, lo cual es una buena práctica para el rendimiento y la reducción de la carga de almacenamiento.
*   **Almacenamiento Seguro:** Los archivos se suben a Supabase Storage, que es un servicio de almacenamiento de objetos diseñado para la seguridad.
*   **Nombres de Archivo:** Se generan nombres de archivo únicos (basados en `Date.now()`, `Math.random()`, UUIDs) antes de subirlos, lo que ayuda a prevenir ataques de sobrescritura de archivos o "path traversal".
*   **Acceso Público:** Las URLs de los archivos son públicas, como es de esperar para imágenes de perfil, logos o fotos de instalación.

**Recomendaciones:**

*   **1.1. Políticas de Seguridad en Supabase Storage (CRÍTICO):**
    *   **Acción:** Es **esencial** configurar políticas de Row Level Security (RLS) directamente en los buckets de Supabase Storage. Estas políticas deben:
        *   **Restringir tipos de archivo (MIME types):** Permitir solo tipos de imagen (`image/jpeg`, `image/png`, `image/webp`).
        *   **Restringir tamaño máximo:** Establecer un límite de tamaño de archivo en el bucket (ej., 2MB-5MB) para evitar ataques de DoS o la subida de archivos excesivamente grandes.
        *   **Controlar acceso de usuario:** Asegurarse de que solo los usuarios autenticados (o los administradores) puedan cargar y, si es necesario, eliminar archivos de sus respectivos tenants o perfiles.
    *   **Justificación:** La validación frontend es fácilmente eludible. Las políticas de Supabase Storage actúan como una capa de seguridad de backend inquebrantable para el almacenamiento de archivos.

*   **1.2. Sanitización y Servido de Archivos:**
    *   **Acción:** Para archivos que no son imágenes (si se permite su subida en el futuro) y que no están destinados a ser renderizados directamente por el navegador (ej., PDFs, documentos), configurar el servidor para que los sirva con el encabezado `Content-Disposition: attachment`.
    *   **Justificación:** Esto fuerza al navegador a descargar el archivo en lugar de intentar interpretarlo, lo que previene ataques de XSS basados en archivos (ej., subir un HTML con scripts disfrazado de PDF). Para imágenes, asegurar que siempre se sirvan desde dominios separados o un CDN para reducir el riesgo de inferencia de tipo MIME por parte del navegador.

*   **1.3. Escaneo de Malware (Consideración a Futuro):**
    *   **Acción:** Si el proyecto escalara para manejar una gama más amplia de tipos de archivos, especialmente documentos que puedan contener macros o scripts, considerar la integración de un servicio de escaneo de malware en el proceso de carga para escanear archivos en el lado del servidor antes de almacenarlos.
    *   **Justificación:** Añade una capa de defensa contra la subida de archivos infectados o maliciosos.

### 2. Auditoría de Contenido Generado por el Usuario (UGC - Texto)

**Componentes revisados:** `AddLeadModal.tsx`, `AddProposalModal.tsx`, `EditLeadModal.tsx`, `EditProposalModal.tsx`, `InstallerCompanyModal.tsx`, `NewProductionOrderModal.tsx`, `NewWorkOrderModal.tsx`, `InviteMemberModal.tsx`.

**Hallazgos:**
*   **Validación Frontend con Zod:** El proyecto utiliza `react-hook-form` con `Zod` para una validación robusta y tipada en el cliente. Esto cubre requisitos como longitud mínima, formato de email/URL, y tipos de dato.
*   **Protección XSS por Defecto de React:** Al renderizar contenido en los componentes de React, las variables se escapan por defecto. Por ejemplo, `{variable}` se renderiza como texto seguro, previniendo la inyección de la mayoría de los payloads de XSS.
*   **Campos de Texto Enriquecido:** Actualmente, la mayoría de los campos de texto (`Input`, `Textarea`) parecen estar diseñados para texto plano, no para HTML enriquecido. El componente `EditLeadModal` utiliza un `Textarea` para notas, lo que sugiere texto plano.

**Recomendaciones:**

*   **2.1. Validación Backend Robusta:**
    *   **Acción:** Asegurarse de que toda la validación de entrada crítica (longitudes, tipos de datos, formatos, valores permitidos) se replique y se aplique rigurosamente en el backend, idealmente a través de:
        *   **Restricciones de Base de Datos (PostgreSQL):** Utilizar `CHECK` constraints, tipos de datos específicos (ej., `VARCHAR(N)` para limitar longitudes, `INT`, `UUID`), y `NOT NULL` para asegurar la integridad de los datos.
        *   **Políticas de RLS:** Integrar validaciones de datos en las políticas de `INSERT` y `UPDATE` de Row Level Security si es necesario aplicar lógica de negocio compleja que dependa del contenido de los datos.
        *   **Supabase Functions (Edge Functions/Triggers):** Para validaciones que requieren lógica programática más allá de las restricciones de RLS/SQL, implementar Edge Functions o triggers de base de datos para pre-procesar y validar el UGC antes de su persistencia.
    *   **Justificación:** La validación frontend es para la usabilidad; la validación backend es para la seguridad. Un atacante siempre puede omitir la validación del lado del cliente.

*   **2.2. Prevención de XSS para Contenido Enriquecido:**
    *   **Acción:** Si en el futuro se introduce la capacidad de los usuarios para ingresar contenido HTML o Markdown (ej., a través de un editor WYSIWYG), es **CRÍTICO** sanitizar este contenido en el backend antes de almacenarlo y también en el frontend antes de renderizarlo (si se usa `dangerouslySetInnerHTML`).
    *   **Herramienta recomendada:** Utilizar una biblioteca probada como `DOMPurify` (o un equivalente en el servidor si se procesa el HTML) para limpiar el HTML y eliminar cualquier script o atributo potencialmente malicioso.
    *   **Justificación:** Esto evita que un atacante inyecte scripts maliciosos que podrían ejecutarse en el navegador de otros usuarios, comprometiendo sesiones, robando datos o desfigurando la interfaz.

*   **2.3. Prevención de SQL Injection (Reafirmación):**
    *   **Acción:** Continuar utilizando el SDK de Supabase (`supabase-js`) y la API de PostgREST para todas las interacciones con la base de datos.
    *   **Advertencia:** Si se utilizan funciones de base de datos personalizadas o `RAW` queries en Supabase Functions, asegurar que todas las entradas de usuario se traten como parámetros y se escapen correctamente, en lugar de concatenarse directamente en las consultas SQL.
    *   **Justificación:** El SDK de Supabase utiliza sentencias preparadas, lo que inherentemente protege contra la mayoría de los ataques de inyección SQL.

*   **2.4. Rate Limiting en APIs (Reafirmación):**
    *   **Acción:** Asegurarse de que todos los endpoints de la API que aceptan UGC (especialmente los de creación o actualización de recursos) estén protegidos con `rate limiting` para prevenir ataques de spam, fuerza bruta o denegación de servicio. Supabase ofrece `rate limiting` a nivel de API Gateway, pero las Edge Functions personalizadas podrían necesitar su propia implementación.
    *   **Justificación:** Limita el número de solicitudes que un solo usuario o dirección IP puede hacer en un período de tiempo, reduciendo el impacto de ataques automatizados.
