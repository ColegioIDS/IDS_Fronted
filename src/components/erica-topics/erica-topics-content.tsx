// components/erica-topics/erica-topics-content.tsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Filter, RefreshCw, BookOpen, CheckCircle, Clock, Users } from "lucide-react";
import { useEricaTopicsContext, useEricaTopicsList } from "@/context/EricaTopicsContext";
import { EricaTopicsTable } from './erica-topics-table';
import { EricaTopicsForm } from './erica-topics-form';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function EricaTopicsContent() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { state } = useEricaTopicsContext();
  const {
    topics,
    meta,
    loading,
    error,
    handleSearch,
    refetch,
    fetchActiveTopics,
    fetchCompletedTopics,
    fetchPendingTopics
  } = useEricaTopicsList();

  // Cargar datos iniciales
  useEffect(() => {
    refetch();
  }, []);

  // Manejar búsqueda con debounce
  // Manejar búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch(searchTerm);
      } else if (searchTerm === "") {
        refetch();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]); // Solo searchTerm como dependencia

  // Calcular estadísticas rápidas
  const stats = {
    total: meta.total,
    active: topics.filter(t => t.isActive && !t.isCompleted).length,
    completed: topics.filter(t => t.isCompleted).length,
    inactive: topics.filter(t => !t.isActive).length,
  };

  const handleNewTopic = () => {
    setIsFormOpen(true);
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Temas ERICA</h1>
          <p className="text-muted-foreground">
            Gestiona los temas académicos por semana y curso
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>

          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Tema
          </Button>

          <EricaTopicsForm
            open={isFormOpen}
            onClose={() => setIsFormOpen(false)}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              temas registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              en progreso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              finalizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">
              deshabilitados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros y Búsqueda</CardTitle>
          <CardDescription>
            Filtra y busca temas específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, descripción o profesor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchActiveTopics()}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                Activos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchCompletedTopics()}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                Completados
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchPendingTopics()}
                className="text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                Pendientes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Applied Filters */}
      {Object.keys(state.filters).length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Filtros aplicados:</span>
          {state.filters.search && (
            <Badge variant="secondary">
              Búsqueda: {state.filters.search}
            </Badge>
          )}
          {state.filters.isActive !== undefined && (
            <Badge variant="secondary">
              {state.filters.isActive ? 'Activos' : 'Inactivos'}
            </Badge>
          )}
          {state.filters.isCompleted !== undefined && (
            <Badge variant="secondary">
              {state.filters.isCompleted ? 'Completados' : 'Pendientes'}
            </Badge>
          )}
        </div>
      )}

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Lista de Temas</CardTitle>
              <CardDescription>
                {meta.total > 0
                  ? `Mostrando ${topics.length} de ${meta.total} temas`
                  : 'No hay temas para mostrar'
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <EricaTopicsTable />
        </CardContent>
      </Card>
    </div>
  );
}