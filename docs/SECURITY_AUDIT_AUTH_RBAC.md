# Auditoría de Seguridad - Autenticación, Registro, Invitaciones y RBAC

**Proyecto:** Sign Flow (SaaS Multitenant)
**Fecha de Auditoría:** 2024-07-31
**Etapa:** 4 de 7 (Análisis de seguridad de autenticación y RBAC)

## Alcance

Esta auditoría se enfoca en la revisión conceptual de los mecanismos de autenticación (inicio de sesión, gestión de sesiones, restablecimiento de contraseña), registro de usuarios, flujos de invitación y control de acceso basado en roles (RBAC) dentro de la arquitectura de Sign Flow, que utiliza Supabase como backend principal.

## Metodología

La auditoría se realiza basándose en las mejores prácticas de seguridad web, las funcionalidades de Supabase Auth, los principios de menor privilegio y la arquitectura multitenant declarada del proyecto. Se presentan hallazgos generales y recomendaciones aplicables a un entorno Supabase. **Nota**: Esta auditoría no incluye la revisión directa del código fuente o la configuración activa, sino que provee una guía para su validación.

## Hallazgos y Recomendaciones

### 1. Flujos de Autenticación (Supabase Auth)

**Hallazgo:** Supabase Auth gestiona la mayoría de los aspectos críticos de la autenticación, pero la implementación frontend y las configuraciones específicas son clave.

**Recomendación:**

*   **Almacenamiento Seguro de Contraseñas:** Validar que no se estén utilizando mecanismos de almacenamiento de contraseñas personalizados y que la gestión de Supabase sea la única fuente para esto. Las contraseñas deben ser hasheadas y salteadas.
*   **Rate Limiting para Intentos de Inicio de Sesión:** Confirmar que la aplicación se beneficia del `rate limiting` integrado de Supabase para prevenir ataques de fuerza bruta. Si hay formularios de inicio de sesión personalizados, asegurarse de que no bypassen estas protecciones o que tengan medidas adicionales (e.g., CAPTCHA) en el frontend después de varios intentos fallidos.
*   **Autenticación Multifactor (MFA/2FA):** Evaluar la implementación o la planificación de MFA, especialmente para roles administrativos o sensibles. Supabase permite la integración de MFA.
*   **Gestión de Sesiones:**
    *   **Expiración de JWT:** Verificar que los JSON Web Tokens (JWT) emitidos por Supabase tengan tiempos de expiración apropiados y cortos para el `access_token`.
    *   **Tokens de Refresco:** Asegurarse de que los `refresh_tokens` se gestionen de forma segura (por ejemplo, mediante almacenamiento en `HTTP-only cookies` si hay un backend que sirve el frontend, o con precauciones adicionales contra XSS si se usa `localStorage`/`sessionStorage` en una SPA pura).
    *   **Revocación de Sesiones:** Confirmar la capacidad de un usuario para cerrar sesión de todos sus dispositivos, invalidando todas las sesiones activas.
*   **Restablecimiento de Contraseña:**
    *   **Tokens Seguros:** Los tokens de restablecimiento de contraseña deben ser únicos, de un solo uso y con un tiempo de vida limitado (Supabase lo maneja).
    *   **Divulgación de Información:** El frontend no debe revelar si un correo electrónico existe o no durante el flujo de 'olvidé mi contraseña' para evitar la enumeración de usuarios.

### 2. Flujos de Registro de Usuarios

**Hallazgo:** El proceso de registro es la puerta de entrada para nuevos usuarios y tenants, por lo que debe ser robusto y seguro.

**Recomendación:**

*   **Verificación de Correo Electrónico:** Es fundamental que todos los nuevos registros de usuario requieran verificación por correo electrónico para confirmar la propiedad del mismo y reducir el spam (Supabase ofrece esta funcionalidad).
*   **Rate Limiting para Registros:** Implementar `rate limiting` en el formulario de registro para prevenir ataques de enumeración de usuarios y la creación masiva de cuentas falsas.
*   **Divulgación de Información Sensible:** Evitar mensajes de error que revelen si un correo electrónico ya está registrado al intentar crear una nueva cuenta.
*   **Creación/Vinculación de Compañías/Tenants:** Cuando un usuario se registra, debe ser correctamente vinculado a una compañía existente o se debe crear una nueva compañía si es el primer usuario en registrarse para ella. Esta vinculación debe asignar un rol inicial (por ejemplo, 'admin') dentro de esa compañía.

### 3. Flujos de Invitación

**Hallazgo:** Las invitaciones permiten a los usuarios existentes añadir nuevos miembros a su compañía, lo que requiere un control estricto para mantener la integridad multitenant.

**Recomendación:**

*   **Seguridad de Tokens de Invitación:**
    *   Los tokens deben ser únicos y criptográficamente seguros (no predecibles).
    *   Deben tener un tiempo de expiración limitado.
    *   Deben ser de un solo uso para evitar reincidencias.
*   **Asignación de Roles:** Asegurarse de que el rol especificado por el invitador se asigne correctamente al usuario invitado una vez que acepta la invitación y completa su registro. Este rol debe estar directamente ligado a la compañía a la que fue invitado.
*   **Aislamiento de Datos Multitenant:** Un usuario invitado debe unirse *exclusivamente* a la compañía para la que fue invitado, sin posibilidad de acceder o unirse a otras compañías.
*   **Privilegios del Invitador:** Solo los usuarios autorizados (e.g., administradores o roles con permiso de gestión de equipo) deben poder enviar invitaciones.
*   **Manejo Frontend del Enlace de Invitación:** La ruta `/invite` debe validar el token de invitación, guiar al usuario a través de un proceso de registro o inicio de sesión si ya tiene una cuenta, y asegurar que se una a la compañía correcta.

### 4. Control de Acceso Basado en Roles (RBAC)

**Hallazgo:** Una implementación efectiva de RBAC es fundamental para un SaaS multitenant, garantizando que los usuarios solo accedan a los recursos y funcionalidades permitidos por su rol y tenant.

**Recomendación:**

*   **Definición Clara de Roles:** Establecer y documentar roles bien definidos (por ejemplo, `admin`, `sales`, `operations`, `member`, `viewer`, `superadmin`) y los permisos asociados a cada uno.
*   **Niveles de Aplicación (Enforcement Levels):**
    *   **Frontend (UI):** Deshabilitar u ocultar elementos de la interfaz de usuario basados en el rol del usuario. Esto mejora la experiencia de usuario y previene acciones accidentales, pero **no** debe considerarse una medida de seguridad definitiva.
    *   **Backend (Supabase RLS):** Esta es la capa de seguridad **crítica**. Las políticas de Row Level Security (RLS) deben validar el rol del usuario (generalmente a través de `auth.jwt() ->> 'user_role'`) además del `tenant_id` para cada operación de lectura/escritura en las tablas de la base de datos.
    *   **Backend (Supabase Functions/Edge Functions/API):** Si se utilizan funciones personalizadas o endpoints de API, deben incluir validaciones explícitas del rol del usuario y el `tenant_id` para todas las solicitudes entrantes.
*   **Principio de Menor Privilegio:** Cada usuario y cada rol debe tener solo los permisos mínimos necesarios para realizar sus tareas. Se debe evitar otorgar permisos amplios sin justificación.
*   **Actualizaciones de Roles:** Asegurarse de que los cambios en el rol de un usuario sean una acción administrativa controlada y que estos cambios se reflejen de manera efectiva (e.g., mediante la emisión de un nuevo JWT al iniciar sesión nuevamente, o mecanismos de actualización de políticas en tiempo real si el sistema lo permite).
*   **Acceso de Superadmin:** El rol de `superadmin` debe ser distinto y gestionado de forma independiente del RBAC a nivel de tenant. Debe tener acceso total a todos los tenants y configuraciones de la plataforma, pero su uso debe ser auditado y restringido a personal de confianza.

### 5. Consideraciones Frontend para Autenticación/RBAC

**Hallazgo:** Aunque la lógica de seguridad principal reside en el backend, el frontend tiene un papel importante en la protección contra ataques comunes.

**Recomendación:**

*   **Llamadas Seguras a la API:** El frontend debe interactuar con el backend (Supabase) utilizando las API designadas y no intentar enviar datos sensibles directamente o eludir la autorización del backend.
*   **Almacenamiento de Tokens del Lado del Cliente:** Si se utiliza `localStorage` o `sessionStorage` para almacenar JWTs (como es común en SPAs con Supabase JS SDK), es crucial implementar medidas robustas de prevención de XSS. Si se usa `HTTP-only cookies` con un backend que sirve la SPA, se debe implementar protección CSRF.
*   **Validación Exhaustiva de Entradas:** Realizar validaciones de entrada en el lado del cliente para todos los formularios de autenticación y registro (email, contraseña, etc.) para mejorar la experiencia de usuario y reducir la carga del servidor, pero siempre replicar estas validaciones en el backend.
*   **Mensajes de Error Genéricos:** Proporcionar mensajes de error genéricos para fallos de autenticación o registro (`Usuario o contraseña incorrectos` en lugar de `Usuario no encontrado` o `Contraseña incorrecta`) para evitar la enumeración de usuarios.

---
*Fin del Reporte de Auditoría de Seguridad de Autenticación y RBAC*
