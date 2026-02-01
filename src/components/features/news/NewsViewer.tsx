/**
 * 📰 Componente de Visor de Noticias
 * Muestra artículos y anuncios
 */

'use client';

import React from 'react';
import { NEWS_ARTICLES, NewsArticle } from '@/constants/news';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Newspaper, Zap, AlertCircle, BookOpen, Calendar, User, Clock } from 'lucide-react';

const categoryConfig = {
  feature: {
    icon: BookOpen,
    label: 'Nueva Función',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
  },
  improvement: {
    icon: Zap,
    label: 'Mejora',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
  },
  announcement: {
    icon: AlertCircle,
    label: 'Anuncio',
    color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
    bgColor: 'bg-rose-50 dark:bg-rose-950/20',
  },
  tutorial: {
    icon: BookOpen,
    label: 'Tutorial',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
  },
};

interface NewsViewerProps {
  expandedArticle?: string | null;
  onArticleClick?: (id: string) => void;
}

export function NewsViewer({ expandedArticle, onArticleClick }: NewsViewerProps) {
  const [expanded, setExpanded] = React.useState<string | null>(expandedArticle || null);

  const toggleArticle = (id: string) => {
    setExpanded(expanded === id ? null : id);
    onArticleClick?.(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg">
          <Newspaper className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Noticias</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Entérate de las últimas actualizaciones y cambios</p>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid gap-4">
        {NEWS_ARTICLES.map((article) => {
          const config = categoryConfig[article.category];
          const Icon = config.icon;
          const isExpanded = expanded === article.id;

          return (
            <Card
              key={article.id}
              className={`cursor-pointer transition-all duration-300 overflow-hidden ${
                isExpanded
                  ? 'border-indigo-300 dark:border-indigo-700 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md'
              }`}
              onClick={() => toggleArticle(article.id)}
            >
              <CardHeader className={`${config.bgColor}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${config.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <Badge className={config.color}>{config.label}</Badge>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {article.description}
                    </p>
                  </div>
                  <div className={`transition-transform duration-300 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>

                {/* Meta información */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(article.date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {article.author}
                  </div>
                  {article.readTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {article.readTime}
                    </div>
                  )}
                </div>
              </CardHeader>

              {/* Expanded Content */}
              {isExpanded && (
                <CardContent className="pt-6 pb-6">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {article.content.split('\n\n').map((paragraph, idx) => {
                      if (paragraph.startsWith('•')) {
                        return (
                          <ul key={idx} className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                            {paragraph.split('\n').map((item, itemIdx) => (
                              <li key={itemIdx} className="text-sm">
                                {item.replace('• ', '')}
                              </li>
                            ))}
                          </ul>
                        );
                      }
                      return (
                        <p key={idx} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {paragraph}
                        </p>
                      );
                    })}
                  </div>

                  {/* Call to action - Hidden for now */}
                  {/* <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors">
                      Aprender Más
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div> */}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 border border-indigo-200 dark:border-indigo-800/50 p-5">
        <div className="flex gap-3">
          <div className="flex-shrink-0 pt-0.5">
            <Newspaper className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-sm text-indigo-900 dark:text-indigo-200">
            <strong className="font-semibold">Mantente informado:</strong> Haz clic en cualquier artículo para leer el contenido completo y obtener más detalles sobre las actualizaciones.
          </p>
        </div>
      </div>
    </div>
  );
}
