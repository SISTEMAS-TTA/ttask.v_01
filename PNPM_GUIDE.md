# Guía de uso de pnpm en el proyecto

## Introducción

Este proyecto utiliza exclusivamente [pnpm](https://pnpm.io/) como gestor de paquetes. Esta guía explica cómo usar pnpm correctamente y evitar colisiones con npm o npx.

## Instalación de pnpm

Si aún no tienes pnpm instalado, puedes instalarlo globalmente con:

```bash
npm install -g pnpm
```

## Comandos básicos

### Instalar dependencias

```bash
pnpm install
```

### Añadir nuevas dependencias

```bash
# Dependencia de producción
pnpm add nombre-del-paquete

# Dependencia de desarrollo
pnpm add -D nombre-del-paquete
```

### Ejecutar scripts

```bash
pnpm dev     # Iniciar servidor de desarrollo
pnpm build    # Construir para producción
pnpm start    # Iniciar en modo producción
pnpm lint     # Ejecutar linter
```

## Usar pnpm dlx en lugar de npx

En lugar de usar `npx` para ejecutar paquetes sin instalarlos, usa `pnpm dlx`:

```bash
# En lugar de: npx create-next-app
pnpm dlx create-next-app

# O usando el script definido en package.json
pnpm dlx create-next-app
```

## Evitar colisiones

Para evitar colisiones entre gestores de paquetes:

1. **No mezcles gestores de paquetes**: Usa exclusivamente pnpm en este proyecto.
2. **No uses npm o yarn**: Esto puede causar inconsistencias en el árbol de dependencias.
3. **Usa siempre pnpm dlx**: En lugar de npx para ejecutar comandos de paquetes no instalados.
4. **Actualiza el lock file**: Asegúrate de que pnpm-lock.yaml esté siempre actualizado y commiteado.

## Ventajas de pnpm

- **Eficiencia en espacio**: Usa almacenamiento de contenido direccionable para ahorrar espacio.
- **Instalaciones más rápidas**: Enlaza paquetes desde un almacén global en lugar de copiarlos.
- **Estructura de node_modules más segura**: Previene el acceso a dependencias no declaradas.
- **Soporte para monorepos**: Excelente para proyectos con múltiples paquetes.

## Solución de problemas

Si encuentras algún problema:

1. Elimina node_modules: `rm -rf node_modules`
2. Elimina el caché de pnpm: `pnpm store prune`
3. Reinstala las dependencias: `pnpm install`

## Recursos adicionales

- [Documentación oficial de pnpm](https://pnpm.io/)
- [Comparación con otros gestores de paquetes](https://pnpm.io/comparison)
- [Guía de migración desde npm/yarn](https://pnpm.io/migration)