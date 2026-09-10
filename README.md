# 🎓 Aula Libre - Backend API

**Aula Libre** es una plataforma backend para que estudiantes universitarios puedan evaluar asignaturas y profesores de forma **completamente anónima, transparente y segura**. Utiliza un mecanismo de cifrado en sentido único para proteger la identidad de los estudiantes y caché distribuida para ofrecer respuestas de alta velocidad.

---

## 💡 El Problema y la Solución

* **El Problema:** La recomendación de profesores y asignaturas suele depender de grupos de chat temporales o recomendaciones de boca en boca. La información se pierde semestre a semestre, es difícil de buscar y carece de estructura.
* **La Solución:** Una plataforma centralizada con búsqueda por facultad y materia, donde los estudiantes pueden calificar, consultar y publicar opiniones sin comprometer su privacidad ni saturar canales informales.

---
## 🛠️ Arquitectura y Decisiones de Ingeniería

El desarrollo de la plataforma se centró en la **simplicidad, el rendimiento de base de datos y la privacidad del usuario**, evitando optimizaciones prematuras o capas de complejidad innecesarias.

### 🔒 1. Anonimato Criptográfico (Hash SHA-256)
Para proteger la identidad del estudiante manteniendo la posibilidad de editar o eliminar sus propias publicaciones:
* La base de datos **no almacena una relación directa** `userId -> commentId`.
* Al crear una reseña, se genera un hash seguro utilizando `SHA-256(userId + courseId + secret)`.
* Durante las consultas (`findAll`), el servidor genera el hash del usuario autenticado en tiempo de ejecución y lo compara con los registros para inyectar un flag booleano `isOwner`. De esta forma, el frontend determina los permisos de edición/eliminación sin revelar la identidad del usuario en la base de datos.

### ⚡ 2. Optimización de Consultas SQL y Conteo Eficiente
* **Agregaciones ligeras:** Para mostrar el total de reseñas por materia en la lista general, se utiliza una subconsulta SQL (`COUNT(comment.id)`) mapeada a un atributo virtual, evitando el *overfetching* de objetos de comentarios completos.
* **Indexación compuesta:** Índices en PostgreSQL sobre `(courseId, createdAt DESC)` para acelerar la paginación y el ordenamiento cronológico a nivel de disco.
* **Diseño pragmático sin sobreingeniería:** Se descartó el uso de caché agresiva en Redis para entidades con mutaciones frecuentes y contexto individualizado (`isOwner`), delegando el rendimiento a consultas PostgreSQL optimizadas que responden en milisegundos.

### 🔄 3. Sincronización Reactiva Frontend / Backend
* **Full-Stack Type Safety:** Validación de esquemas en ambos lados de la aplicación utilizando **Zod** en el cliente y **DTOs con Class-Validator** en NestJS.
* **Next.js App Router & Server Actions:** Integración de Server Actions combinados con invalidación controlada (`revalidatePath`) y callbacks de refetch localizado en Client Components para actualizar la interfaz al instante sin recargas completas del navegador.

---

## 🛠️ Tecnologías Utilizadas


### Backend
* **Framework:** NestJS
* **ORM:** TypeORM
* **Base de Datos:** PostgreSQL
* **Autenticación & Seguridad:** Passport JWT, Bcrypt, Crypto (SHA-256),Helmet HTTP Headers, Rate Limiting.
* **Contenedores:** Docker / Docker Compose

### Frontend
* **Framework:** Next.js (App Router, Server Actions)
* **Lenguaje:** TypeScript
* **Estilos & Componentes:** Tailwind CSS, Shadcn UI / Radix Primitives, Lucide Icons
* **Formularios & Validación:** React Hook Form, Zod
* **Notificaciones:** React Hot Toast

---

## ✨ Características Principales (Fase 1 - Actual)

* 🔐 **Autenticación y Autorización:**
  * Registro e inicio de sesión con contraseñas encriptadas.
  * Estrategia JWT con control de acceso basado en roles (`STUDENT`, `ADMIN`).
* **Catálogo de Asignaturas:** Búsqueda en tiempo real y paginación de cursos por facultad con indicadores de cantidad de reseñas.
* 🛡️ **Evaluaciones y Comentarios Anónimos:**
  * Generación de claves de anonimización (**SHA-256**) para proteger la identidad real del estudiante al publicar opiniones.
* 🛡️ **Seguridad e Infraestructura:**
  * **Helmet:** Configuración de cabeceras HTTP de seguridad para prevenir ataques XSS, Clickjacking y Sniffing.
  * **Rate Limiting:** Protección contra ataques de fuerza bruta y saturación de peticiones por IP.
  * **Detalle y Feedback de Cursos:** Cálculo de valoraciones con estrellas, desglose por docente y estimación de tiempo transcurrido (*time ago*).
  * **Panel de Administración:** Gestión centralizada de asignaturas y facultades para roles administrativos.

---

## 🔮 Próximas Funcionalidades (Fase 2)

En la **Fase 2**, Aula Libre ofrecerá una experiencia de usuario personalizada según el avance académico del estudiante:

* 📌 **Personalización Académica:**
  * El estudiante podrá registrar su **carrera universitaria** y su **semestre actual** en su perfil.
* 🎯 **Dashboard Personalizado:**
  * El panel de usuario mostrará automáticamente las materias correspondientes a su semestre activo con sus respectivas recomendaciones y valoraciones destacadas.
* 🔍 **Catálogo General:**
  * Aunque la vista principal priorice las materias del semestre activo, el estudiante mantendrá acceso total para buscar y revisar las opiniones de **todas las asignaturas** de la universidad.

---

## 🚀 Instalación y Configuración Local

### Prerrequisitos
* Node.js (v18 o superior)
* Docker y Docker Compose (opcional para PostgreSQL y Redis)

### Pasos

1. **Clonar el repositorio:**
   ```bash
    git clone https://github.com/samucarrillo17/AulaLibre.git
    cd aula-libre

2. **Instalar dependencias:**
    ``yarn install``

3. Cambiar variables de entorno ``.env.template``

4. **Levantar servidor con Docker:**
    ``docker-compose up -d``

5. **Iniciar servidor de desarrollo:**
    ``yarn start:dev``


|Metodo |Endpoint   | Descripcion  |
| ------------ | ------------ | ------------ |
|POST   | /auth/register  |Registro de nuevos estudiantes   |
| POST  |/auth/login   |Autenticación y obtención del Token JWT   |
|GET   |/comments/:courseId   |Obtener comentarios de una materia (Con Caché en Redis)   |
|POST   |/comments  |Crear un comentario anónimo cifrado en SHA-256|
|PATCH|/comments/:idComment|Actualizar un comentario|