# TTask - Sistema de Gestión de Tareas Empresariales

Sistema integral de gestión de tareas, notas y proyectos diseñado para entornos empresariales, desarrollado con Next.js 15, React 19, TypeScript y Firebase.

## 📋 Descripción General

TTask es una aplicación web progresiva (PWA) que permite a equipos de trabajo gestionar tareas, notas y proyectos de manera colaborativa. Implementa autenticación de usuarios, roles, asignación de tareas, sistema de favoritos y visualización de métricas en tiempo real.

### Características Principales

- ✅ **Gestión de Tareas**: Crear, asignar, completar y filtrar tareas
- 📝 **Sistema de Notas**: Notas con colores personalizables y favoritos
- 🏗️ **Gestión de Proyectos**: Sistema completo de proyectos arquitectónicos con plantillas predefinidas
- 👥 **Roles de Usuario**: Sistema de roles multidisciplinario (Director, Administrador, Proyectos, Diseño, etc.)
- 📊 **Dashboards**: Visualización de métricas y gráficos por proyecto
- 🔄 **Tiempo Real**: Sincronización en tiempo real con Firebase
- 📱 **PWA**: Instalable como aplicación móvil/escritorio
- 🔐 **Autenticación**: Sistema completo con Firebase Auth
- 🎨 **UI Moderna**: Componentes con Radix UI y Tailwind CSS

---

## 🚀 Inicio Rápido

### Requisitos Previos

- **Node.js** 18+
- **pnpm** (gestor de paquetes recomendado)

### Instalación

```bash
# Instalar pnpm globalmente
npm install -g pnpm

# Instalar dependencias del proyecto
pnpm install
```

### Configuración de Firebase

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar Authentication (Email/Password)
3. Crear una base de datos Firestore
4. Copiar las credenciales y crear un archivo `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Ejecución

```bash
# Modo desarrollo
pnpm dev

# Compilar para producción
pnpm build

# Iniciar en producción
pnpm start
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🏗️ Arquitectura del Proyecto

### Estructura de Directorios

```
ttask.v_01/
├── src/
│   ├── app/                    # App Router de Next.js 15
│   │   ├── layout.tsx         # Layout raíz con metadata
│   │   ├── page.tsx           # Página principal (redirige a dashboard)
│   │   ├── dashboard/         # Dashboard principal
│   │   ├── login/             # Página de login
│   │   ├── register/          # Registro de usuarios
│   │   ├── notes/             # Vista de notas (standalone)
│   │   └── projects/          # Sistema de gestión de proyectos
│   │       ├── page.tsx       # Lista de proyectos y creación
│   │       └── [id]/          # Vista detallada de proyecto individual
│   │           └── page.tsx   # Detalles y checklist del proyecto
│   ├── components/            # Componentes compartidos
│   │   ├── core/              # Componentes core (Header, DatePicker)
│   │   └── ui/                # Componentes UI (shadcn/ui)
│   ├── modules/               # Módulos funcionales
│   │   ├── auth/              # Autenticación
│   │   ├── tasks/             # Gestión de tareas
│   │   ├── notes/             # Gestión de notas
│   │   ├── dashboard/         # Componentes del dashboard
│   │   ├── charts/            # Gráficos y métricas
│   │   ├── admin/             # Panel de administración
│   │   └── types/             # Definiciones de tipos TypeScript
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Utilidades y configuraciones
│   │   └── firebase/          # Servicios de Firebase
│   │       ├── config.ts      # Configuración de Firebase
│   │       ├── firestore.ts   # Operaciones generales de Firestore
│   │       ├── tasks.ts       # Servicios de tareas
│   │       ├── notes.ts       # Servicios de notas
│   │       └── projects.ts    # Servicios de proyectos (NUEVO)
│   └── hooks/                 # Custom hooks personalizados
├── public/                    # Recursos estáticos
└── firebase.json              # Configuración de Firebase
```

---

## 📚 Documentación de Componentes Esenciales

### 1. Sistema de Autenticación

#### `src/lib/firebase/config.ts`

**Configuración base de Firebase**

```typescript
// Inicialización de Firebase con soporte offline
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// IndexedDB Persistence: almacenamiento local para reducir llamadas de red
enableIndexedDbPersistence(db);

// Persistencia de sesión: mantiene al usuario autenticado
setPersistence(auth, browserLocalPersistence);
```

**Características:**

- Singleton pattern para evitar múltiples instancias
- Persistencia offline con IndexedDB
- Variables de entorno con valores por defecto
- Manejo de errores en persistencia

#### `src/modules/auth/services/authService.ts`

**Servicio de registro de usuarios**

```typescript
export async function registerUser(
  email: string,
  password: string,
  fullName: string,
  role: string = "user"
): Promise<void>;
```

**Funcionalidad:**

1. Crea usuario en Firebase Auth
2. Almacena perfil en Firestore (`users` collection)
3. Campos: email, fullName, role, createdAt, active

#### `src/modules/auth/hooks/useUser.tsx`

**Hook personalizado para gestión de usuario**

```typescript
const { user, profile, loading } = useUser();
```

**Retorna:**

- `user`: Objeto de Firebase Auth
- `profile`: Perfil del usuario desde Firestore
- `loading`: Estado de carga

**Uso:** Se utiliza en toda la app para verificar autenticación y roles.

---

### 2. Sistema de Tareas

#### `src/lib/firebase/tasks.ts`

**Servicio de gestión de tareas**

**Tipo de datos:**

```typescript
type TaskDoc = {
  id: string;
  title: string;
  project: string;
  description?: string;
  assigneeId: string; // Usuario asignado
  assignedBy: string; // Usuario que asigna
  viewed: boolean; // Vista por el asignado
  completed: boolean; // Tarea completada
  favorite: boolean; // Favorito personal
  deleted: boolean; // Eliminación lógica
  favorites?: Record<string, boolean>; // Favoritos por usuario
  createdAt: Timestamp;
};
```

**Funciones principales:**

1. **subscribeToTasksAssignedBy**: Suscripción en tiempo real a tareas asignadas POR el usuario

   - Filtro: `assignedBy == userId`
   - Ordenamiento: Favoritas primero, luego por fecha

2. **subscribeToTasksAssignedTo**: Suscripción a tareas asignadas AL usuario

   - Filtro: `assigneeId == userId`
   - Para columna "Tareas Recibidas"

3. **createTask**: Crear nueva tarea
4. **updateTask**: Actualizar tarea existente
5. **toggleTaskFavorite**: Marcar/desmarcar como favorito

#### `src/modules/tasks/components/Tasks.tsx`

**Componente de visualización de tareas**

**Características:**

- Suscripción en tiempo real vía `useEffect`
- Sistema de filtros (usuario, proyecto, vista)
- Modales para agregar/editar/ver tareas
- Indicadores visuales (favoritos, completadas, no vistas)

**Lógica de favoritos:**

```typescript
favorite: Boolean(d.favorites?.[user!.uid]) || Boolean(d.favorite);
```

Soporta tanto favoritos por usuario como campo legacy.

---

### 3. Sistema de Notas

#### `src/lib/firebase/notes.ts`

**Servicio de gestión de notas**

**Tipo de datos:**

```typescript
type Note = {
  id: string;
  userId: string;
  title: string;
  content: string;
  color: string; // Color de la nota
  completed: boolean;
  favorite: boolean;
  favorites?: Record<string, boolean>;
  project: string;
  createdAt: Timestamp;
};
```

**Funciones principales:**

1. **subscribeToUserNotes**: Suscripción en tiempo real a notas del usuario

   - Ordenamiento: Favoritas primero, luego por fecha
   - Sin índice compuesto (ordenamiento en cliente)

2. **subscribeToUserNotesPage**: Paginación server-side

   - Usa `startAfter` para cursor
   - Límite configurable de documentos

3. **createNote**: Crear nota
4. **updateNote**: Actualizar nota
5. **deleteNote**: Eliminar permanentemente
6. **toggleNoteFavorite**: Favoritos por usuario

#### `src/modules/notes/components/Notes.tsx`

**Componente de notas**

**Características:**

- Grid responsivo de tarjetas
- Colores personalizables (8 opciones)
- Sistema de favoritos individual
- Filtros por proyecto y estado
- Modal de edición inline

---

### 4. Sistema de Gestión de Proyectos

#### `src/lib/firebase/projects.ts`

**Servicio de gestión de proyectos arquitectónicos**

**Tipo de datos:**

```typescript
export interface ProjectDoc {
  id: string;
  title: string;
  description?: string;
  createdBy: string;
  createdAt: Timestamp;
  members: string[]; // userIds de integrantes
  rolesAllowed: ProjectRole[]; // roles que pueden acceder al proyecto
  sections: ProjectSection[]; // secciones del proyecto (ej: "Proyecto Arquitectónico")
  tasks: ProjectTask[]; // tareas/elementos del checklist
  progress?: number; // porcentaje de avance calculado en cliente
}

export interface ProjectSection {
  id: string;
  title: string; // ej: "Proyecto Arquitectónico", "Diseño Estructural"
  order?: number; // orden de visualización
}

export interface ProjectTask {
  id: string;
  sectionId: string; // referencia a la sección padre
  title: string; // ej: "Plantas arquitectónicas", "Fachadas"
  completed: boolean; // tarea completada
  favorite?: boolean; // marcada como favorita
  na?: boolean; // marcada como "No Aplica"
  order?: number; // orden dentro de la sección
}
```

**Funciones principales:**

1. **createProject**: Crear nuevo proyecto con plantilla predefinida

   ```typescript
   await createProject(userId, {
     title: "Casa Gómez",
     description: "Proyecto residencial unifamiliar",
     members: ["userId1", "userId2"],
     rolesAllowed: ["Diseno"],
     sections: templateSections,
     tasks: templateTasks,
   });
   ```

2. **subscribeToProjectsForUser**: Suscripción en tiempo real a proyectos del usuario

   - **Triple filtrado**: Combina 3 queries de Firestore:
     - `createdBy == userId` (proyectos creados por el usuario)
     - `members array-contains userId` (proyectos donde es miembro)
     - `rolesAllowed array-contains userRole` (proyectos permitidos por rol)
   - **Deduplicación**: Usa Map para evitar duplicados entre queries
   - **Tiempo real**: Suscripción automática a cambios

#### `src/app/projects/page.tsx`

**Página principal de proyectos**

**Características:**

- **Lista de proyectos**: Grid responsivo con tarjetas de proyecto
- **Control de acceso**: Solo usuarios con rol "Director" pueden crear proyectos
- **Modal de creación**: Formulario para nuevos proyectos con:
  - Título y descripción
  - Selector de integrantes (filtrado por rol "Diseno")
  - Aplicación automática de plantilla arquitectónica
- **Plantilla predefinida**: Sistema de checklist arquitectónico con 6 secciones:
  1. **Proyecto Arquitectónico**: Plantas, fachadas, cortes
  2. **Proyecto Ejecutivo**: Detalles de carpintería, herrería
  3. **Diseño Estructural**: Especificaciones generales, cálculos
  4. **Ingenierías**: Hidráulica, sanitaria, eléctrica
  5. **Instalaciones Especiales**: Domótica, seguridad
  6. **Tablaroca**: Plafones, detalles constructivos

**Lógica de permisos:**

```typescript
const canCreate = profile?.role === "Director";
const { projects } = useProjects(user?.uid, profile?.role);
```

#### `src/app/projects/[id]/page.tsx`

**Vista detallada de proyecto individual**

**Características:**

- **Información del proyecto**: Título, descripción, progreso general
- **Barra de progreso**: Cálculo automático basado en tareas completadas
- **Checklist por secciones**: Organizado en tarjetas expandibles
- **Estados de tareas**:
  - ✅ **Completada**: Checkbox marcado
  - ⭐ **Favorita**: Marcada con estrella amarilla
  - 🚫 **No Aplica**: Excluida del cálculo de progreso
- **Interacciones en tiempo real**:
  - Toggle de completado (actualiza progreso)
  - Toggle de favoritos (marcado personal)
  - Toggle de "No Aplica" (excluye de progreso y deshabilita)

**Cálculo de progreso:**

```typescript
const progress = useMemo(() => {
  const tasks = project?.tasks || [];
  const effective = tasks.filter((t) => !t.na); // Excluye "No Aplica"
  if (!effective.length) return 0;
  const done = effective.filter((t) => t.completed).length;
  return Math.round((done / effective.length) * 100);
}, [project]);
```

**Casos de uso del sistema:**

1. **Director crea proyecto**: Define título, descripción e integrantes del equipo de diseño
2. **Aplicación de plantilla**: Se genera automáticamente checklist de 40+ elementos arquitectónicos
3. **Seguimiento de avance**: Equipo marca elementos completados en tiempo real
4. **Gestión de favoritos**: Cada usuario puede marcar elementos importantes
5. **Manejo de excepciones**: Elementos "No Aplica" se excluyen del cálculo de progreso
6. **Visualización de progreso**: Barra de progreso se actualiza automáticamente

**Ventajas del sistema:**

- ✅ **Estandarización**: Plantilla consistente para todos los proyectos arquitectónicos
- ✅ **Colaboración**: Múltiples usuarios trabajando en tiempo real
- ✅ **Trazabilidad**: Historial de cambios y estados
- ✅ **Flexibilidad**: Sistema de "No Aplica" para elementos no requeridos
- ✅ **Escalabilidad**: Estructura preparada para múltiples tipos de proyecto

---

### 5. Dashboard Principal

#### `src/app/dashboard/page.tsx`

**Página principal del dashboard**

**Estructura:**

```tsx
<DashboardHeader />           // Logo y navegación
<SidebarProvider>
  <AppSidebar />             // Navegación lateral
  <SidebarInset>
    <ProjectCharts />        // Métricas
    <TasksColumn />          // Tareas asignadas
    <ReceivedTasksColumn />  // Tareas recibidas
    <CompletedTasksColumn /> // Tareas completadas
    <NotesColumn />          // Notas rápidas
  </SidebarInset>
</SidebarProvider>
```

**Layout responsivo:**

- Mobile: 1 columna
- Tablet: 2 columnas
- Desktop: 3-4 columnas
- Ultrawide: 5 columnas

#### `src/modules/dashboard/components/AppSideBar.tsx`

**Barra lateral de navegación**

**Características:**

- Menú dinámico basado en roles
- Secciones colapsables
- Indicador de página activa
- Componente de usuario (avatar, email, logout)

**Configuración de menú:**

```typescript
const navMain: NavItem[] = [
  {
    title: "Area de Trabajo",
    items: [
      { title: "Dashboard", url: "/" },
      { title: "Notas", url: "/notes" },
    ]
  },
  {
    title: "Administración",
    adminOnly: true,  // Solo visible para admins
    items: [...]
  }
]
```

---

### 6. Sistema de Roles y Permisos

#### `src/hooks/useAdmin.tsx`

**Hook para verificación de rol admin**

```typescript
const { isAdmin, isAuthenticated } = useAdmin();
```

**Uso:**

```tsx
{
  isAdmin && <AdminPanel />;
}
```

#### `src/components/AuthGuard.tsx`

**Componente de protección de rutas**

```typescript
<AuthGuard requireAuth={true} requiredRole={["Administrador"]}>
  <AdminPage />
</AuthGuard>
```

**Funcionalidad:**

1. Verifica autenticación
2. Verifica rol requerido
3. Redirige si no cumple requisitos
4. Muestra loading mientras valida

**Flujo:**

```
Usuario no autenticado → /login
Usuario sin rol requerido → /dashboard
Usuario válido → Renderiza contenido
```

---

### 7. Hooks Personalizados

#### `src/hooks/useUsersMap.tsx`

**Hook para mapeo de usuarios**

```typescript
const { usersMap, getUserName, loading } = useUsersMap();
```

**Funcionalidad:**

- Carga todos los usuarios de Firestore
- Mantiene un mapa: `userId → { fullName, email, role }`
- Función helper `getUserName(userId)` para mostrar nombres

**Uso común:**

```tsx
<span>{getUserName(task.assigneeId)}</span>
```

#### `src/hooks/useRequireAuth.ts`

**Hook de protección de rutas**

```typescript
const { user, loading } = useRequireAuth();
```

**Comportamiento:**

- Redirige a `/login` si no hay usuario
- Retorna usuario y estado de carga
- Uso en páginas protegidas

---

### 8. Componentes de UI (shadcn/ui)

La aplicación utiliza componentes de **shadcn/ui** basados en **Radix UI**:

#### Componentes principales:

- **Button**: Botones con variantes (default, destructive, outline, ghost)
- **Card**: Contenedores con header, content, footer
- **Dialog/Modal**: Ventanas modales accesibles
- **Input/Textarea**: Campos de formulario
- **Select**: Selectores dropdown
- **Calendar**: Selector de fechas con date-fns
- **Avatar**: Avatares de usuario con fallback
- **Sidebar**: Navegación lateral con colapsado
- **Tooltip**: Información contextual
- **DropdownMenu**: Menús contextuales
- **Sheet**: Paneles laterales (mobile)

#### `src/lib/utils.ts`

**Utilidades de estilo**

```typescript
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Uso:** Combina clases de Tailwind dinámicamente

```tsx
<div className={cn("base-class", isActive && "active-class")} />
```

---

### 9. Gráficos y Métricas

#### `src/modules/charts/components/ProjectCharts.tsx`

**Visualización de métricas por proyecto**

**Métricas mostradas:**

1. **Total de tareas** por proyecto
2. **Tareas completadas** vs pendientes
3. **Tareas asignadas** vs recibidas
4. **Distribución por estado**

**Cálculo:**

- Suscripción en tiempo real a tareas
- Agrupación por proyecto
- Cálculo de porcentajes
- Visualización con componentes `Progress`

---

### 10. Gestión de Estados

#### Estado Local (useState)

```typescript
const [tasks, setTasks] = useState<TaskDoc[]>([]);
const [isModalOpen, setIsModalOpen] = useState(false);
```

#### Suscripciones en Tiempo Real (useEffect)

```typescript
useEffect(() => {
  const unsubscribe = subscribeToTasks(userId, setTasks);
  return () => unsubscribe(); // Cleanup
}, [userId]);
```

#### Persistencia

- **Firebase Firestore**: Datos persistentes
- **IndexedDB**: Cache local offline
- **Local Storage**: Preferencias de usuario (futuro)

---

### 11. Tipos TypeScript

#### `src/modules/types/index.tsx`

**Definiciones centralizadas**

```typescript
// Roles de usuario del sistema
export type UserRole =
  | "Director" // Puede crear proyectos y gestionar equipos
  | "Administrador" // Acceso completo al sistema
  | "Proyectos" // Gestión de proyectos y coordinación
  | "Diseno" // Miembro del equipo de diseño
  | "Gerencia" // Gestión y supervisión
  | "Obra" // Supervisión de construcción
  | "Sistemas" // Administración técnica
  | "Practicante" // Usuario en formación
  | "Usuario"; // Usuario básico

export interface UserProfile {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  role: UserRole;
  createdAt: Timestamp;
  lastLogin?: Date;
  active?: boolean;
}

// Tipos del sistema de proyectos
export type ProjectRole = UserRole;

export interface ProjectTask {
  id: string;
  sectionId: string;
  title: string;
  completed: boolean;
  favorite?: boolean;
  na?: boolean; // "No aplica" - excluido del cálculo de progreso
  order?: number;
}

export interface ProjectSection {
  id: string;
  title: string;
  order?: number;
}

export interface ProjectDoc {
  id: string;
  title: string;
  description?: string;
  createdBy: string;
  createdAt: Timestamp;
  members: string[]; // IDs de usuarios miembros
  rolesAllowed: ProjectRole[];
  sections: ProjectSection[];
  tasks: ProjectTask[];
  progress?: number; // Calculado en cliente
}

// Tipos del sistema de tareas
export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  deleted: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  status?: "pending" | "in-progress" | "completed";
}

// Tipos del sistema de notas
export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  color: string;
  completed: boolean;
  favorite: boolean;
  favorites?: Record<string, boolean>; // Favoritos por usuario
  project: string;
  createdAt: Timestamp;
  order?: number; // Para drag & drop
}
```

**Beneficios:**

- **Type safety** completo en toda la aplicación
- **Autocompletado** inteligente en IDE
- **Detección temprana** de errores de tipo
- **Documentación implícita** del modelo de datos
- **Refactoring seguro** y escalable
- **Integración perfecta** con TypeScript y Firebase

---

## 🔒 Reglas de Seguridad

### Firestore Security Rules (`firestore.rules`)

```javascript
// Tareas: el asignador y el asignado pueden leer/escribir
match /tasks/{taskId} {
  allow read: if request.auth.uid == resource.data.assignedBy
              || request.auth.uid == resource.data.assigneeId;
  allow create: if request.auth.uid == request.resource.data.assignedBy;
  allow update, delete: if request.auth.uid == resource.data.assignedBy;
}

// Notas: solo el propietario
match /notes/{noteId} {
  allow read, write: if request.auth.uid == resource.data.userId;
}

// Proyectos: acceso basado en creador, miembros y roles
match /projects/{projectId} {
  allow read: if request.auth.uid == resource.data.createdBy
              || request.auth.uid in resource.data.members
              || getUserRole(request.auth.uid) in resource.data.rolesAllowed;
  allow create: if request.auth.uid == request.resource.data.createdBy
                && getUserRole(request.auth.uid) == "Director";
  allow update: if request.auth.uid == resource.data.createdBy
                || request.auth.uid in resource.data.members;
  allow delete: if request.auth.uid == resource.data.createdBy;
}

// Usuarios: lectura para autenticados, escritura solo admin
match /users/{userId} {
  allow read: if request.auth != null;
  allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid))
                  .data.role == "Administrador";
}

// Función auxiliar para obtener rol del usuario
function getUserRole(uid) {
  return get(/databases/$(database)/documents/users/$(uid)).data.role;
}
```

---

## 🎨 Estilos y Tema

### Tailwind CSS

- **Configuración**: `tailwind.config.ts`
- **Variables CSS**: `src/app/globals.css`
- **Tema personalizado**: Colores de TT Arquitectos

### Colores de notas:

```typescript
const noteColors = [
  "bg-yellow-200",
  "bg-blue-200",
  "bg-green-200",
  "bg-red-200",
  "bg-purple-200",
  "bg-pink-200",
  "bg-orange-200",
  "bg-gray-200",
];
```

---

## 📱 PWA (Progressive Web App)

### Configuración (`public/manifest.json`)

```json
{
  "name": "TTask - Sistema de Gestión",
  "short_name": "TTask",
  "start_url": "/",
  "display": "standalone",
  "icons": [...]
}
```

**Características PWA:**

- Instalable en dispositivos móviles
- Funciona offline (cache de IndexedDB)
- Ícono personalizado en home screen
- Experiencia de app nativa

---

## 🧪 Testing y Calidad

### Linting

```bash
pnpm lint
```

### Scripts disponibles:

- `pnpm dev`: Desarrollo con Turbopack
- `pnpm build`: Compilación optimizada
- `pnpm start`: Servidor de producción
- `pnpm lint`: Análisis de código

---

## 🚢 Despliegue

### Vercel (Recomendado)

1. Conectar repositorio en [Vercel](https://vercel.com)
2. Configurar variables de entorno (Firebase)
3. Deploy automático en cada push

### Firebase Hosting

```bash
pnpm build
firebase deploy
```

### Variables de entorno requeridas:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

---

## 📖 Recursos Adicionales

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

---

## 👥 Equipo

Desarrollado por **TT Arquitectos**

## 📄 Licencia

Este proyecto es privado y confidencial.

---

## Auditoría de Notas y Drag & Drop

- Código no utilizado

  - `src/modules/notes/components/DraggableNoteCard.tsx`: componente basado en `@dnd-kit` no está referenciado. Además, `@dnd-kit/*` no figura en `package.json`.
  - `src/app/migrate-notes/page.tsx`: página de migración completamente comentada; no interviene en el flujo.
  - `src/lib/firebase/migrateNotesOrder.ts`: utilidad invocada por la página anterior; sin uso actual.
  - `subscribeToUserNotesPage` y `getNotesPage` en `src/lib/firebase/notes.ts`: funciones de paginación no referenciadas por la UI.
  - Tipos duplicados: `UserProfile` aparece definido dos veces en `src/modules/types/index.tsx`.

- Oportunidades de mejora

  - Unificar el ordenamiento: hoy se ordena en cliente en la suscripción (`src/lib/firebase/notes.ts`) y nuevamente en la UI (`src/modules/notes/components/Notes.tsx`). Centralizar para evitar inconsistencias y trabajo duplicado.
  - Definir precedencia entre `order` y favoritos: si se desea que favoritas siempre queden arriba, aplicar `order` dentro de cada grupo (favoritas/no favoritas) en vez de que `order` las sobrepase.
  - Optimizar reordenamiento: `updateNotesOrder` reescribe el `order` de todo el subconjunto. Actualizar sólo los documentos que cambian de posición para reducir escrituras.
  - UX de arrastre: añadir placeholder/línea de inserción y zonas de drop al inicio/fin de lista. Ahora sólo se puede soltar sobre otra tarjeta.
  - Accesibilidad: incluir manija de arrastre accesible y soporte por teclado/ARIA. Librerías como `@dnd-kit` facilitan esto.
  - Modelo de favoritos: migrar completamente a `favorites: Record<userId, boolean>` y limpiar el booleano legacy `favorite` tras backfill.
  - Migración `order`: exponer la utilidad de migración como script/acción admin y remover la página comentada cuando no se use.
  - Reglas/Índices: actual no requiere índices extra. Si se usa `orderBy('order')` con `where('userId','==', uid)`, crear índice compuesto correspondiente.
  - Tipos: consolidar una única definición de `UserProfile` en `src/modules/types/index.tsx`.

- Alternativa técnica recomendada (opcional)
  - Adoptar `@dnd-kit` con `SortableContext` y un `DraggableNoteCard` reutilizable para mejorar accesibilidad, placeholders e inserción al inicio/fin, reduciendo lógica ad-hoc en la lista.
