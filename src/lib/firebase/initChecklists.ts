/**
 * Script para inicializar los checklists por defecto en Firestore
 *
 * Para usar este script:
 * 1. Importa esta función en un componente o página
 * 2. Llámala una vez para crear los checklists iniciales
 * 3. Comenta o elimina la llamada después de la primera ejecución
 */

import { createChecklist } from "./checklists";

/**
 * Checklist para Arquitectura
 */
export async function initArquitecturaChecklist(createdBy?: string) {
  const sections = [
    { id: "sec-arq", title: "Proyecto Arquitectónico", order: 1 },
    { id: "sec-eje", title: "Proyecto Ejecutivo Arquitectónico", order: 2 },
    { id: "sec-est", title: "Diseño Estructural", order: 3 },
    { id: "sec-ing", title: "Ingenierías", order: 4 },
    { id: "sec-esp", title: "Instalaciones Especiales", order: 5 },
    { id: "sec-tab", title: "Tablaroca", order: 6 },
  ];

  const tasks = [
    // --- 2. PROYECTO ARQUITECTÓNICO ---
    {
      id: crypto.randomUUID(),
      sectionId: "sec-arq",
      title: "2.1 INFORMACIÓN ARQUITECTÓNICA",
      completed: false,
      favorite: false,
      isHeader: true,
      order: 50,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-arq",
      title: "2.1.1 Planta de conjunto",
      completed: false,
      favorite: false,
      order: 100,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-arq",
      title: "2.1.2 Plantas arquitectónicas",
      completed: false,
      favorite: false,
      order: 200,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-arq",
      title: "2.1.3 Fachadas arquitectónicas",
      completed: false,
      favorite: false,
      order: 300,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-arq",
      title: "2.1.4 Secciones longitudinales",
      completed: false,
      favorite: false,
      order: 400,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-arq",
      title: "2.1.5 Secciones transversales",
      completed: false,
      favorite: false,
      order: 500,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-arq",
      title: "2.2 MATERIAL DE PRESENTACIÓN",
      completed: false,
      favorite: false,
      isHeader: true,
      order: 550,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-arq",
      title: "2.2.1 Visualización digital (Vista exterior e interior)",
      completed: false,
      favorite: false,
      order: 600,
    },
    // --- 3. PROYECTO EJECUTIVO ---
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "3.1 INFORMACIÓN CONSTRUCTIVA",
      completed: false,
      favorite: false,
      isHeader: true,
      order: 50,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "3.1.1 Detalles de cancelería",
      completed: false,
      favorite: false,
      order: 100,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "3.1.2 Detalles de carpintería",
      completed: false,
      favorite: false,
      order: 200,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "3.1.3 Detalles de herrería",
      completed: false,
      favorite: false,
      order: 300,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "3.1.4 Detalles constructivos arquitectónicos",
      completed: false,
      favorite: false,
      order: 400,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "3.1.5 Plano de albañilería",
      completed: false,
      favorite: false,
      order: 500,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "3.2 ACABADOS",
      completed: false,
      favorite: false,
      isHeader: true,
      order: 550,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "3.2.1 Plano de referencias de acabados",
      completed: false,
      favorite: false,
      order: 600,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "3.2.2 Plantas de acabados",
      completed: false,
      favorite: false,
      order: 700,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "3.2.3 Despiece de pisos y lambrines",
      completed: false,
      favorite: false,
      order: 800,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "3.2.4 Accesorios y equipos",
      completed: false,
      favorite: false,
      order: 900,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "3.2.4.1 Detalles accesorios y equipos",
      completed: false,
      favorite: false,
      order: 950,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-eje",
      title: "3.2.5 Plano de mármol",
      completed: false,
      favorite: false,
      order: 1000,
    },
    // --- 4. DISEÑO ESTRUCTURAL ---
    {
      id: crypto.randomUUID(),
      sectionId: "sec-est",
      title: "4.1 Planos de especificaciones generales",
      completed: false,
      favorite: false,
      order: 100,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-est",
      title: "4.2 Planta estructural de cimentación",
      completed: false,
      favorite: false,
      order: 200,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-est",
      title: "4.3 Plantas estructuradas de losas por nivel",
      completed: false,
      favorite: false,
      order: 300,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-est",
      title: "4.4 Secciones estructurales de refuerzo",
      completed: false,
      favorite: false,
      order: 400,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-est",
      title: "4.5 Secciones esquemáticas de niveles",
      completed: false,
      favorite: false,
      order: 500,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-est",
      title: "4.6 Memoria de cálculo",
      completed: false,
      favorite: false,
      order: 600,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-est",
      title: "4.7 Mecánica de suelos",
      completed: false,
      favorite: false,
      order: 700,
    },
    // --- 5. INGENIERÍAS ---
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.1 INGENIERÍA HIDRÁULICA",
      completed: false,
      favorite: false,
      isHeader: true,
      order: 50,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.1.1 Acometida general, cisterna y líneas generales",
      completed: false,
      favorite: false,
      order: 100,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.1.2 Instalación de líneas por nivel",
      completed: false,
      favorite: false,
      order: 200,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.1.3 Isométricos generales de instalación de agua",
      completed: false,
      favorite: false,
      order: 300,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.1.4 Especificaciones y detalles hidráulicos",
      completed: false,
      favorite: false,
      order: 400,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.1.5 Memoria descriptiva",
      completed: false,
      favorite: false,
      order: 500,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.2 INGENIERÍA SANITARIA",
      completed: false,
      favorite: false,
      isHeader: true,
      order: 550,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.2.1 Descargas generales y drenajes residuales",
      completed: false,
      favorite: false,
      order: 600,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.2.2 Sistema de captación pluvial e interconexión a red",
      completed: false,
      favorite: false,
      order: 700,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.2.3 Plantas e isométricos de instalación",
      completed: false,
      favorite: false,
      order: 800,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.2.4 Especificaciones y detalles sanitarios",
      completed: false,
      favorite: false,
      order: 900,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.2.5 Memoria descriptiva",
      completed: false,
      favorite: false,
      order: 1000,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.3 INSTALACIÓN DE GAS",
      completed: false,
      favorite: false,
      isHeader: true,
      order: 1050,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.3.1 Diseño de red de conducción",
      completed: false,
      favorite: false,
      order: 1100,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.3.2 Líneas de alimentación",
      completed: false,
      favorite: false,
      order: 1200,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.3.3 Equipos de consumo",
      completed: false,
      favorite: false,
      order: 1300,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.3.4 Conjunto de abastecimiento, distribución y regulación",
      completed: false,
      favorite: false,
      order: 1400,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.3.5 Memoria descriptiva",
      completed: false,
      favorite: false,
      order: 1500,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.4 INGENIERÍA ELÉCTRICA",
      completed: false,
      favorite: false,
      isHeader: true,
      order: 1550,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.4.1 Iluminación por nivel",
      completed: false,
      favorite: false,
      order: 1600,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.4.2 Contactos por nivel",
      completed: false,
      favorite: false,
      order: 1700,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.4.3 Diagrama unifilar",
      completed: false,
      favorite: false,
      order: 1800,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.4.4 Cuadros y resúmenes de cargas",
      completed: false,
      favorite: false,
      order: 1900,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.4.5 Especificaciones y detalles eléctricos",
      completed: false,
      favorite: false,
      order: 2000,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-ing",
      title: "5.4.6 Memoria descriptiva",
      completed: false,
      favorite: false,
      order: 2100,
    },
    // --- 6. INSTALACIONES ESPECIALES ---
    {
      id: crypto.randomUUID(),
      sectionId: "sec-esp",
      title: "6.1 Domótica",
      completed: false,
      favorite: false,
      order: 100,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-esp",
      title: "6.2 Aire acondicionado",
      completed: false,
      favorite: false,
      order: 200,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-esp",
      title: "6.3 Voz y datos",
      completed: false,
      favorite: false,
      order: 300,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-esp",
      title: "6.4 Sistema de riego",
      completed: false,
      favorite: false,
      order: 400,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-esp",
      title: "6.5 CCTV",
      completed: false,
      favorite: false,
      order: 500,
    },
    // --- 7. TABLAROCA ---
    {
      id: crypto.randomUUID(),
      sectionId: "sec-tab",
      title: "7.1 TABLAROCA",
      completed: false,
      favorite: false,
      isHeader: true,
      order: 50,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-tab",
      title: "7.1.1 Plano de plafones",
      completed: false,
      favorite: false,
      order: 100,
    },
    {
      id: crypto.randomUUID(),
      sectionId: "sec-tab",
      title: "7.1.2 Plano muros de tablaroca",
      completed: false,
      favorite: false,
      order: 200,
    },
  ];

  const checklistId = await createChecklist({
    type: "arquitectura",
    name: "Checklist Arquitectura - Template",
    description:
      "Checklist completo para proyectos arquitectónicos con todas las fases",
    sections,
    tasks,
    createdBy,
  });

  return checklistId;
}

/**
 * Inicializa todos los checklists por defecto
 * Puedes agregar más funciones para otros tipos de checklists aquí
 */
export async function initializeAllChecklists(createdBy?: string) {
  console.log("Inicializando checklist de Arquitectura...");
  const arquitecturaId = await initArquitecturaChecklist(createdBy);
  console.log(`✓ Checklist de Arquitectura creado con ID: ${arquitecturaId}`);

  // TODO: Agregar más checklists aquí
  // await initObraChecklist(createdBy);
  // await initAuxAdminChecklist(createdBy);
  // etc.

  return {
    arquitectura: arquitecturaId,
  };
}
