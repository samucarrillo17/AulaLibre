# 🎓 Aula Libre - Backend API

**Aula Libre** es una plataforma backend para que estudiantes universitarios puedan evaluar asignaturas y profesores de forma **completamente anónima, transparente y segura**. Utiliza un mecanismo de cifrado en sentido único para proteger la identidad de los estudiantes y caché distribuida para ofrecer respuestas de alta velocidad.

---

## 🛠️ Tecnologías Utilizadas

* **Framework:** [NestJS](https://nestjs.com/) (Node.js & TypeScript)
* **Base de Datos Relacional:** PostgreSQL
* **ORM:** TypeORM
* **Caché y Rendimiento:** Redis
* **Contenedores:** Docker / Docker Compose
* **Seguridad:** JWT (JSON Web Tokens), Passport, Cifrado SHA-256, Helmet HTTP Headers, Rate Limiting.

---

## ✨ Características Principales (Fase 1 - Actual)

* 🔐 **Autenticación y Autorización:**
  * Registro e inicio de sesión con contraseñas encriptadas.
  * Estrategia JWT con control de acceso basado en roles (`STUDENT`, `ADMIN`).
* 👤 **Gestión de Perfil de Usuario:**
  * Actualización de datos personales en el módulo de usuarios mediante la reutilización global de Guards de autenticación.
* 🛡️ **Evaluaciones y Comentarios Anónimos:**
  * Generación de claves de anonimización (**SHA-256**) para proteger la identidad real del estudiante al publicar opiniones.
* ⚡ **Optimización de Consultas con Redis:**
  * Estrategia de caché distribuida para consultas masivas de comentarios organizados por el identificador del curso (`courseId`).
* 🛡️ **Seguridad e Infraestructura:**
  * **Helmet:** Configuración de cabeceras HTTP de seguridad para prevenir ataques XSS, Clickjacking y Sniffing.
  * **Rate Limiting:** Protección contra ataques de fuerza bruta y saturación de peticiones por IP.

---

## 🔮 Próximas Funcionalidades (Fase 2 - En desarrollo)

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
   git clone [https://github.com/tu-usuario/aula-libre.git](https://github.com/tu-usuario/aula-libre.git)
   cd aula-libre

2. **Instalar dependencias:**
    ``yarn install``

3. Cambiar variables de entorno ``.env.template``

4. **Levantar servidor con Docker:**
    ``docker-compose up -d``

5. **Iniciar servidor de desarrollo:**
    ``yarn start:dev``