// Declaraciones globales para importaciones de assets (CSS, SCSS, imágenes)
// Evita errores de TypeScript al importar archivos como './globals.css' desde componentes

declare module "*.css";
declare module "*.scss";
declare module "*.sass";

declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";
