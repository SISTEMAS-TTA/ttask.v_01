# Sistema de Checklists en Firestore

Este documento explica cómo funciona el sistema de checklists almacenados en Firestore para el proyecto.

## 📋 Descripción General

Los checklists son plantillas de tareas predefinidas que se pueden reutilizar para diferentes proyectos. En lugar de tener el array de tareas hardcodeado en el código, ahora se almacenan en Firestore, lo que permite:

- ✅ Actualizar checklists sin modificar código
- ✅ Crear diferentes tipos de checklists (arquitectura, obra, auxAdmin, etc.)
- ✅ Mantener un único source of truth en la base de datos
- ✅ Reutilizar plantillas fácilmente

## 🗂️ Estructura de la Base de Datos

### Colección: `checklists`

Cada documento en esta colección tiene la siguiente estructura:

```typescript
{
  id: string,                    // ID autogenerado por Firestore
  type: ChecklistType,           // "arquitectura" | "obra" | "auxAdmin" | ...
  name: string,                  // Nombre descriptivo del checklist
  description?: string,          // Descripción opcional
  sections: ChecklistSection[],  // Array de secciones
  tasks: ChecklistTask[],        // Array de tareas
  createdAt: Timestamp,          // Fecha de creación
  updatedAt: Timestamp,          // Fecha de última actualización
  createdBy?: string             // ID del usuario que creó el checklist
}
```

### Tipos de Checklists Disponibles

```typescript
type ChecklistType =
  | "arquitectura"
  | "obra"
  | "auxAdmin"
  | "logistica"
  | "pagos"
  | "sistemas"
  | "direccion"
  | "cliente"
  | "diseno";
```

## 🚀 Inicialización de Checklists

### Primera Vez

Para poblar la base de datos con los checklists iniciales:

1. **Desde la interfaz (Recomendado)**:

   - Ve a la página `/aux-admin`
   - Al crear un nuevo proyecto, si no hay checklists, verás un mensaje amarillo
   - Haz clic en "Inicializar Checklists en Firestore"
   - Los checklists se crearán automáticamente

2. **Desde código** (para desarrollo):

   ```typescript
   import { initializeAllChecklists } from "@/lib/firebase/initChecklists";

   // En un componente o función
   await initializeAllChecklists(userId);
   ```

### Verificar Checklists Existentes

```typescript
import { getChecklistsByType } from "@/lib/firebase/checklists";

const checklists = await getChecklistsByType("arquitectura");
console.log(`Encontrados ${checklists.length} checklists de arquitectura`);
```

## 📚 API de Funciones

### Funciones de Escritura

#### `createChecklist`

Crea un nuevo checklist en Firestore.

```typescript
import { createChecklist } from "@/lib/firebase/checklists";

const checklistId = await createChecklist({
  type: "obra",
  name: "Checklist Obra - Template",
  description: "Checklist para gestión de obra",
  sections: [...],
  tasks: [...],
  createdBy: userId
});
```

#### `updateChecklist`

Actualiza un checklist existente.

```typescript
import { updateChecklist } from "@/lib/firebase/checklists";

await updateChecklist(checklistId, {
  name: "Nuevo nombre",
  tasks: [...nuevasTareas],
});
```

#### `deleteChecklist`

Elimina un checklist.

```typescript
import { deleteChecklist } from "@/lib/firebase/checklists";

await deleteChecklist(checklistId);
```

### Funciones de Lectura

#### `getChecklistById`

Obtiene un checklist específico por su ID.

```typescript
import { getChecklistById } from "@/lib/firebase/checklists";

const checklist = await getChecklistById(checklistId);
```

#### `getChecklistsByType`

Obtiene todos los checklists de un tipo específico.

```typescript
import { getChecklistsByType } from "@/lib/firebase/checklists";

const arquitecturaChecklists = await getChecklistsByType("arquitectura");
```

#### `getAllChecklists`

Obtiene todos los checklists sin filtrar.

```typescript
import { getAllChecklists } from "@/lib/firebase/checklists";

const allChecklists = await getAllChecklists();
```

### Suscripciones en Tiempo Real

#### `subscribeToChecklistsByType`

Suscripción en tiempo real a checklists de un tipo.

```typescript
import { subscribeToChecklistsByType } from "@/lib/firebase/checklists";

const unsubscribe = subscribeToChecklistsByType(
  "arquitectura",
  (checklists) => {
    console.log("Checklists actualizados:", checklists);
    setChecklists(checklists);
  }
);

// Limpiar suscripción cuando el componente se desmonte
return () => unsubscribe();
```

#### `subscribeToChecklist`

Suscripción en tiempo real a un checklist específico.

```typescript
import { subscribeToChecklist } from "@/lib/firebase/checklists";

const unsubscribe = subscribeToChecklist(checklistId, (checklist) => {
  if (checklist) {
    console.log("Checklist actualizado:", checklist);
  }
});

return () => unsubscribe();
```

## 🔧 Cómo Usar en un Componente

Ejemplo de uso en una página:

```typescript
"use client";

import { useState, useEffect } from "react";
import {
  getChecklistsByType,
  type ChecklistDoc,
} from "@/lib/firebase/checklists";

export default function MyPage() {
  const [checklists, setChecklists] = useState<ChecklistDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getChecklistsByType("arquitectura");
        setChecklists(data);
      } catch (error) {
        console.error("Error cargando checklists:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      {checklists.map((checklist) => (
        <div key={checklist.id}>
          <h2>{checklist.name}</h2>
          <p>Secciones: {checklist.sections.length}</p>
          <p>Tareas: {checklist.tasks.length}</p>
        </div>
      ))}
    </div>
  );
}
```

## 📝 Agregar Nuevos Tipos de Checklists

Para agregar un nuevo tipo de checklist:

1. **Crear la función de inicialización** en `src/lib/firebase/initChecklists.ts`:

```typescript
export async function initObraChecklist(createdBy?: string) {
  const sections = [
    { id: "sec-1", title: "Preparación de Obra", order: 1 },
    // ... más secciones
  ];

  const tasks = [
    {
      id: crypto.randomUUID(),
      sectionId: "sec-1",
      title: "Verificar permisos",
      completed: false,
      favorite: false,
      order: 100,
    },
    // ... más tareas
  ];

  const checklistId = await createChecklist({
    type: "obra",
    name: "Checklist Obra - Template",
    description: "Checklist para gestión de obra",
    sections,
    tasks,
    createdBy,
  });

  return checklistId;
}
```

2. **Actualizar la función `initializeAllChecklists`**:

```typescript
export async function initializeAllChecklists(createdBy?: string) {
  const arquitecturaId = await initArquitecturaChecklist(createdBy);
  const obraId = await initObraChecklist(createdBy); // ← Agregar aquí

  return {
    arquitectura: arquitecturaId,
    obra: obraId, // ← Agregar aquí
  };
}
```

3. **Usar en tu componente**:

```typescript
const obraChecklists = await getChecklistsByType("obra");
```

## 🔍 Debugging

### Ver todos los checklists en la consola

```typescript
import { getAllChecklists } from "@/lib/firebase/checklists";

const all = await getAllChecklists();
console.table(
  all.map((c) => ({
    id: c.id,
    type: c.type,
    name: c.name,
    sections: c.sections.length,
    tasks: c.tasks.length,
  }))
);
```

### Verificar estructura de un checklist

```typescript
import { getChecklistById } from "@/lib/firebase/checklists";

const checklist = await getChecklistById("YOUR_CHECKLIST_ID");
console.log("Sections:", checklist?.sections);
console.log("Tasks:", checklist?.tasks);
```

## ⚠️ Notas Importantes

1. **Fallback automático**: Si no hay checklists en Firestore, el sistema usa automáticamente el template hardcodeado en el código como respaldo.

2. **Una vez inicializado**: Los checklists se crean una sola vez. Las modificaciones posteriores deben hacerse mediante la API de actualización.

3. **Permisos de Firestore**: Asegúrate de que las reglas de Firestore permitan leer/escribir en la colección `checklists`.

## 📄 Archivos Importantes

- `src/lib/firebase/checklists.ts` - Funciones CRUD para checklists
- `src/lib/firebase/initChecklists.ts` - Scripts de inicialización
- `src/app/aux-admin/page.tsx` - Ejemplo de uso en componente
- `firestore.rules` - Reglas de seguridad (recuerda actualizar)

## 🔐 Reglas de Firestore Sugeridas

Agrega estas reglas a tu `firestore.rules`:

```javascript
match /checklists/{checklistId} {
  // Permitir lectura a usuarios autenticados
  allow read: if request.auth != null;

  // Permitir escritura solo a admins
  allow write: if request.auth != null &&
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Administrador';
}
```

---

¿Preguntas? Revisa los archivos de código o contacta al equipo de desarrollo.
