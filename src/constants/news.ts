/**
 * 📰 Sistema de Noticias
 * Artículos y anuncios importantes sobre la plataforma
 */

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  category: 'feature' | 'improvement' | 'announcement' | 'tutorial';
  date: string;
  author: string;
  readTime?: string;
}

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'news-001',
    title: 'Sistema de Lectura de Notificaciones',
    description: 'Nuevo componente para rastrear la lectura de notificaciones en tiempo real.',
    content: `Hemos implementado un nuevo sistema de rastreo de lectura de notificaciones que te permite:

• Ver quién ha leído cada notificación
• Identificar notificaciones no leídas
• Acceder al historial completo de lectura
• Filtrar por estado de lectura

Este sistema funciona de manera transparente y se integra perfectamente con tu flujo de trabajo actual. El rastreo se realiza automáticamente sin necesidad de acciones adicionales.`,
    category: 'feature',
    date: '2026-02-01',
    author: 'Equipo de Desarrollo',
    readTime: '5 min',
  },
  {
    id: 'news-002',
    title: 'Componentes de Notificaciones Rediseñados',
    description: 'Interfaz mejorada con nueva barra lateral y mejor organización.',
    content: `Los componentes de notificaciones han sido completamente rediseñados para ofrecerte:

• Nueva barra lateral con opciones de filtrado
• Vista mejorada de detalles de notificaciones
• Mejor organización y categorización
• Interfaz más intuitiva y responsiva

Estos cambios hacen que sea más fácil gestionar tus notificaciones y encontrar la información que necesitas rápidamente.`,
    category: 'improvement',
    date: '2026-02-01',
    author: 'Equipo de Diseño',
    readTime: '4 min',
  },
  {
    id: 'news-003',
    title: 'Historial de Versiones Disponible',
    description: 'Rastrear todos los cambios y actualizaciones de la aplicación.',
    content: `El nuevo sistema de changelog permite que veas:

• Todas las versiones de la aplicación
• Funcionalidades nuevas en cada versión
• Correcciones de bugs realizadas
• Mejoras implementadas
• Cambios incompatibles o breaking changes

Accede al historial de versiones desde la sección de Noticias para mantente informado sobre los cambios más recientes de tu aplicación.`,
    category: 'feature',
    date: '2026-02-01',
    author: 'Equipo de Producto',
    readTime: '3 min',
  },
  {
    id: 'news-004',
    title: 'Mejoras en Perfil de Usuario',
    description: 'Manejo optimizado de datos de perfil con mejor rendimiento.',
    content: `Hemos optimizado el sistema de gestión del perfil de usuario:

• Carga más rápida de datos de perfil
• Mejor manejo de errores
• Estados de carga más claros
• Sincronización más eficiente

Estas mejoras garantizan que tu información de perfil se cargue y actualice de manera más fluida y confiable.`,
    category: 'improvement',
    date: '2026-02-01',
    author: 'Equipo Backend',
    readTime: '4 min',
  },
  {
    id: 'news-005',
    title: 'Sistema de Verificación de Email Mejorado',
    description: 'Validación robusta con mejor manejo de errores y estados.',
    content: `El proceso de verificación de correo electrónico ha sido completamente rediseñado:

• Validación más robusta
• Mensajes de error más claros
• Estados de carga visual
• Mejor experiencia de usuario
• Soporte para reintentos

La verificación es ahora más segura y proporciona retroalimentación clara en cada paso del proceso.`,
    category: 'improvement',
    date: '2026-02-01',
    author: 'Equipo de Seguridad',
    readTime: '5 min',
  },
  {
    id: 'news-006',
    title: 'Nuevos Controles de Acceso',
    description: 'Permisos granulares para mejor control de funcionalidades.',
    content: `Se han añadido nuevos permisos para mayor control:

• Permisos para lectura de logs de notificaciones
• Control de acceso a perfil de usuario
• Permisos para verificación de email
• Gestión granular de roles

Estos nuevos controles permiten una administración más precisa de qué puede hacer cada usuario en la plataforma.`,
    category: 'announcement',
    date: '2026-02-01',
    author: 'Equipo de Administración',
    readTime: '3 min',
  },
];

export function getNewsByCategory(category: NewsArticle['category']): NewsArticle[] {
  return NEWS_ARTICLES.filter((article) => article.category === category);
}

export function getRecentNews(limit: number = 5): NewsArticle[] {
  return [...NEWS_ARTICLES].reverse().slice(0, limit);
}

export function getNewsById(id: string): NewsArticle | undefined {
  return NEWS_ARTICLES.find((article) => article.id === id);
}
