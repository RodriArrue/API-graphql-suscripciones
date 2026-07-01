# 🚀 API GraphQL con Suscripciones en Tiempo Real

API completa de sistema de posts con comentarios y notificaciones en tiempo real, construida con NestJS y GraphQL (code-first).

## 📋 Stack Tecnológico

- **NestJS** con Apollo Driver (code-first, NO schema-first)
- **GraphQL** con Queries, Mutations y Subscriptions
- **TypeORM** + **PostgreSQL**
- **JWT** para autenticación
- **DataLoader** para evitar el problema N+1
- **PubSub** con `graphql-subscriptions` (in-memory)
- **class-validator** para validación de inputs

## 📁 Estructura del Proyecto

```
src/
├── auth/                    # Autenticación
│   ├── decorators/          # @CurrentUser
│   ├── dto/                 # LoginInput, RegisterInput, AuthResponse
│   ├── guards/              # GqlAuthGuard
│   ├── strategies/          # JwtStrategy
│   ├── auth.module.ts
│   ├── auth.resolver.ts
│   └── auth.service.ts
├── users/                   # Usuarios
│   ├── entities/            # User entity
│   ├── users.module.ts
│   ├── users.resolver.ts
│   └── users.service.ts
├── posts/                   # Posts
│   ├── dto/                 # CreatePostInput, UpdatePostInput
│   ├── entities/            # Post entity
│   ├── loaders/             # UsersLoader (DataLoader)
│   ├── posts.module.ts
│   ├── posts.resolver.ts
│   └── posts.service.ts
├── comments/                # Comentarios (con Subscriptions)
│   ├── dto/                 # CreateCommentInput
│   ├── entities/            # Comment entity
│   ├── comments.module.ts
│   ├── comments.resolver.ts
│   └── comments.service.ts
├── common/                  # Compartido
│   └── constants.ts         # Tokens de inyección
├── app.module.ts
└── main.ts
```

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd api-graphql-sub
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Levantar PostgreSQL con Docker

```bash
docker compose up -d
```

### 4. Configurar variables de entorno

Copiar `.env.example` a `.env` (ya viene con valores por defecto para desarrollo):

```bash
cp .env.example .env
```

### 5. Iniciar la aplicación

```bash
npm run start:dev
```

La aplicación estará disponible en: **http://localhost:3000/graphql**

## 🔑 Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `DB_HOST` | Host de PostgreSQL | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_USERNAME` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `postgres` |
| `DB_NAME` | Nombre de la base de datos | `graphql_blog` |
| `JWT_SECRET` | Secreto para firmar tokens JWT | hardcodeado |

## 📖 Ejemplos para Apollo Playground

### 🔐 Autenticación

#### Registrar usuario
```graphql
mutation Register {
  register(registerInput: {
    email: "usuario@test.com"
    username: "usuario1"
    password: "password123"
  }) {
    accessToken
  }
}
```

#### Iniciar sesión
```graphql
mutation Login {
  login(loginInput: {
    email: "usuario@test.com"
    password: "password123"
  }) {
    accessToken
  }
}
```

> **Nota:** Después de obtener el `accessToken`, configurarlo en los headers de Apollo Playground:
> ```json
> {
>   "Authorization": "Bearer <tu-token-aquí>"
> }
> ```

### 📝 Posts

#### Crear un post (requiere autenticación)
```graphql
mutation CreatePost {
  createPost(createPostInput: {
    title: "Mi primer post"
    content: "Este es el contenido de mi primer post en el blog."
  }) {
    id
    title
    content
    createdAt
    author {
      id
      username
    }
  }
}
```

#### Listar posts con paginación
```graphql
query GetPosts {
  posts(limit: 10, offset: 0) {
    id
    title
    content
    createdAt
    author {
      id
      username
    }
  }
}
```

#### Obtener un post por ID
```graphql
query GetPost {
  post(id: 1) {
    id
    title
    content
    createdAt
    author {
      id
      username
      email
    }
    comments {
      id
      content
      author {
        username
      }
    }
  }
}
```

#### Actualizar un post (requiere autenticación + ser el autor)
```graphql
mutation UpdatePost {
  updatePost(
    id: 1
    updatePostInput: {
      title: "Título actualizado"
      content: "Contenido actualizado del post."
    }
  ) {
    id
    title
    content
  }
}
```

#### Eliminar un post (requiere autenticación + ser el autor)
```graphql
mutation RemovePost {
  removePost(id: 1) {
    id
    title
  }
}
```

### 💬 Comentarios

#### Crear un comentario (requiere autenticación)
```graphql
mutation CreateComment {
  createComment(createCommentInput: {
    content: "¡Excelente post! Muy interesante."
    postId: 1
  }) {
    id
    content
    createdAt
    author {
      id
      username
    }
    post {
      id
      title
    }
  }
}
```

#### Obtener comentarios de un post
```graphql
query GetCommentsByPost {
  commentsByPost(postId: 1) {
    id
    content
    createdAt
    author {
      id
      username
    }
  }
}
```

### 🔔 Subscriptions (Tiempo Real)

#### Suscribirse a nuevos comentarios de un post
```graphql
subscription OnCommentAdded {
  commentAdded(postId: 1) {
    id
    content
    createdAt
    author {
      id
      username
    }
    post {
      id
      title
    }
  }
}
```

> **Cómo probar Subscriptions:**
> 1. Abrir una pestaña en Apollo Playground y ejecutar la subscription `commentAdded(postId: 1)`
> 2. En otra pestaña, crear un comentario con la mutation `createComment` en el post con ID 1
> 3. La primera pestaña recibirá el comentario en tiempo real

### 👤 Usuarios

#### Listar usuarios (requiere autenticación)
```graphql
query GetUsers {
  users {
    id
    email
    username
    createdAt
  }
}
```

#### Obtener usuario por ID (requiere autenticación)
```graphql
query GetUser {
  user(id: 1) {
    id
    email
    username
    createdAt
    posts {
      id
      title
    }
    comments {
      id
      content
    }
  }
}
```

## 🧪 Características Principales

- **Code-First**: El schema GraphQL se genera automáticamente desde los decoradores TypeScript
- **Autenticación JWT**: Protección de mutations con `@UseGuards(GqlAuthGuard)`
- **DataLoader**: Resuelve el problema N+1 al cargar autores de posts
- **Subscriptions**: Notificaciones en tiempo real con `graphql-ws` cuando se crean comentarios
- **Validación**: Todos los inputs validados con `class-validator`
- **Manejo de errores**: `NotFoundException` y `UnauthorizedException` para respuestas consistentes

## 📜 Licencia

MIT
