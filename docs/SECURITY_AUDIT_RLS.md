# Auditoría de Seguridad - Supabase RLS y Datos

**Proyecto:** Sign Flow (SaaS Multitenant)
**Fecha de Auditoría:** 2024-07-31
**Etapa:** 3 de 7 (Análisis de seguridad de datos y RLS)

## Alcance

Esta auditoría se centra en la revisión conceptual de la implementación de Row Level Security (RLS) en Supabase y las prácticas de seguridad de datos asociadas al proyecto `Sign Flow`. Dada la naturaleza multitenant del SaaS, la correcta configuración de RLS es crítica para el aislamiento de datos entre inquilinos.

## Metodología

La auditoría se realiza basándose en las mejores prácticas de seguridad de Supabase, los principios de menor privilegio (least privilege) y la arquitectura multitenant declarada del proyecto. Se presentan hallazgos generales y recomendaciones aplicables a un entorno Supabase. **Nota**: Esta auditoría no incluye la revisión directa del esquema de la base de datos o las políticas RLS activas, sino que provee una guía para su validación.

## Hallazgos y Recomendaciones

### 1. Habilitación de RLS en Tablas Relevantes

**Hallazgo:** RLS es una característica fundamental para la seguridad en entornos multitenant en Supabase.
**Recomendación:**

*   **Verificar que RLS esté `ENABLED` (Activado) en *todas* las tablas que almacenan datos específicos del tenant o del usuario.** Esto incluye tablas como `clients`, `leads`, `proposals`, `projects`, `work_orders`, `payments`, `installations`, y `user_profiles` (si los perfiles tienen datos sensibles por tenant).
*   RLS debe ser la primera línea de defensa para el control de acceso a nivel de datos. Deshabilitarlo sin una razón de seguridad extremadamente fuerte y documentada es un riesgo crítico.

### 2. Implementación de Políticas RLS con Principio de Menor Privilegio

**Hallazgo:** Las políticas RLS deben ser granular y restrictivas para asegurar que cada usuario (o tenant) solo pueda acceder a los datos que le corresponden.
**Recomendación:**

*   **Aislamiento Multitenant (`tenant_id`):**
    *   Para todas las tablas que contienen datos de la empresa (tenant), las políticas RLS deben incluir explícitamente una verificación del `tenant_id` del usuario autenticado.
    *   Ejemplo de política para `SELECT`: `(tenant_id = auth.jwt() ->> 'tenant_id')::uuid`
    *   Asegurarse de que el `tenant_id` se propague correctamente desde la autenticación (e.g., a través de claims de JWT personalizados o un `profiles` table link).
*   **Acceso a Nivel de Usuario (`auth.uid()`):**
    *   Para datos que son estrictamente personales del usuario (ej. un borrador privado, notificaciones personales), usar `(user_id = auth.uid())`.
    *   Combinar `tenant_id` y `auth.uid()` cuando un usuario solo debe ver *sus propios* datos dentro de *su tenant`.
*   **Políticas de Escritura (`INSERT`, `UPDATE`, `DELETE`):**
    *   Implementar `USING` para definir qué filas puede *leer* el usuario/tenant.
    *   Implementar `WITH CHECK` para definir qué filas puede *crear* o *modificar* el usuario/tenant. Es crucial que `WITH CHECK` valide la misma lógica que `USING` (o una más restrictiva) para evitar inyección de datos foráneos.
    *   Ejemplo de política `FOR INSERT`: `(tenant_id = auth.jwt() ->> 'tenant_id')::uuid AND (user_id = auth.uid())`
*   **Roles y Permisos:**
    *   Aprovechar los roles de usuario (admin, sales, operations, member, viewer) para crear políticas RLS más sofisticadas que ajusten el acceso según el rol dentro del tenant.
    *   Ejemplo: Un `viewer` solo tiene políticas `SELECT`, mientras que un `admin` puede tener `INSERT`, `UPDATE`, `DELETE`.
*   **Esquema `public`:**
    *   Revisar cuidadosamente las tablas que residen en el esquema `public`. Por defecto, las tablas en `public` son accesibles por el rol `anon`. Si estas tablas contienen datos sensibles o específicos del tenant, deben tener RLS habilitado y políticas adecuadas.

### 3. Exposición y Protección de Datos Sensibles

**Hallazgo:** Los datos sensibles deben ser identificados y protegidos con las políticas RLS más estrictas posibles.
**Recomendación:**

*   **Identificación:** Realizar un inventario de todas las columnas que contienen información de identificación personal (PII), datos financieros, credenciales u otra información confidencial.
*   **Restricción Granular:** Asegurar que las políticas RLS impidan el acceso a estas columnas por parte de usuarios o roles no autorizados, incluso dentro del mismo tenant, si la lógica de negocio lo requiere.
*   **Anonimización/Pseudonimización:** Para datos analíticos o de reporting, considerar la anonimización o pseudonimización antes de ser expuestos, incluso con RLS.

### 4. Interacción de RLS con Claves Foráneas y Vistas

**Hallazgo:** Las relaciones entre tablas y el uso de vistas pueden afectar cómo RLS aplica las restricciones.
**Recomendación:**

*   **Consistencia RLS:** Asegurar que las políticas RLS sean coherentes en todo el modelo de datos. Si una tabla `A` está relacionada con una tabla `B` mediante una clave foránea, las políticas de ambas tablas deben complementarse para evitar bypasses de RLS a través de `JOIN`s o consultas anidadas.
*   **Vistas (`VIEWS`):** Si se utilizan vistas, evaluar si son `SECURITY INVOKER` (aplican RLS del usuario que las consulta) o `SECURITY DEFINER` (se ejecutan con los permisos del creador). Priorizar `SECURITY INVOKER` para mantener el aislamiento de datos.

### 5. Uso de Funciones `SECURITY DEFINER`

**Hallazgo:** Las funciones `SECURITY DEFINER` se ejecutan con los permisos del usuario que las creó, ignorando potencialmente las políticas RLS del usuario que las invoca.
**Recomendación:**

*   **Extrema Precaución:** Limitar el uso de funciones `SECURITY DEFINER` a casos muy específicos y críticos donde se necesita elevar temporalmente los privilegios para realizar una operación atómica.
*   **Revisión Rigurosa:** Auditar el código de cada función `SECURITY DEFINER` para asegurar que no introducen vulnerabilidades, por ejemplo, permitiendo a un usuario manipular datos fuera de su `tenant_id` o `user_id`. Siempre incluir verificaciones explícitas de `tenant_id` o `auth.uid()` dentro de la lógica de la función si es necesario.

### 6. Gestión de API Keys de Supabase

**Hallazgo:** La correcta gestión de las claves de API es crucial para la seguridad general del backend.
**Recomendación:**

*   **`anon` key:** El frontend (aplicación React/Vite) debe utilizar *únicamente* la `anon` key de Supabase. Esta clave tiene permisos restringidos y está diseñada para interactuar con RLS.
*   **`service_role` key:** La `service_role` key (o cualquier clave con privilegios elevados) NUNCA debe ser expuesta en el código del frontend, variables de entorno del cliente, o en repositorios públicos. Su uso debe limitarse a entornos de backend seguros (ej. Supabase Functions, servidores propios) donde pueda ser gestionada de forma segura.

### 7. Auditoría y Monitorización de Logs

**Hallazgo:** La monitorización activa de la base de datos es una práctica esencial para detectar anomalías y posibles brechas de seguridad.
**Recomendación:**

*   **Habilitar Logs:** Asegurarse de que los logs de PostgreSQL en Supabase estén habilitados y configurados para capturar eventos de seguridad relevantes.
*   **Revisión Regular:** Establecer un proceso para revisar regularmente los logs de Supabase (PostgreSQL logs, Auth logs) en busca de:
    *   Intentos de acceso fallidos repetidos.
    *   Patrones de consulta inusuales o sospechosos (ej. consultas a gran escala o desde IPs no esperadas).
    *   Cambios inesperados en las políticas RLS o el esquema de la base de datos.
    *   Actividad de la `service_role` key (si se usa en funciones).

---
*Fin del Reporte de Auditoría de Seguridad RLS*
