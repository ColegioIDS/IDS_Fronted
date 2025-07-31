//src\components\loading\AllLoading.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Loading from "./loading"

export default function LoadingExamples() {
  const [showOverlay, setShowOverlay] = useState(false)

  const handleShowOverlay = () => {
    setShowOverlay(true)
    setTimeout(() => setShowOverlay(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Componentes de Loading</h1>
          <p className="text-lg text-gray-600">Diferentes variantes y tamaños de componentes de carga</p>
        </div>

        {/* Variantes */}
        <Card>
          <CardHeader>
            <CardTitle>Variantes de Loading</CardTitle>
            <CardDescription>Diferentes estilos de animación disponibles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center space-y-4">
                <h3 className="font-semibold">Spinner</h3>
                <Loading variant="spinner" size="lg" />
              </div>
              <div className="text-center space-y-4">
                <h3 className="font-semibold">Dots</h3>
                <Loading variant="dots" size="lg" />
              </div>
              <div className="text-center space-y-4">
                <h3 className="font-semibold">Pulse</h3>
                <Loading variant="pulse" size="lg" />
              </div>
              <div className="text-center space-y-4">
                <h3 className="font-semibold">Bars</h3>
                <Loading variant="bars" size="lg" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tamaños */}
        <Card>
          <CardHeader>
            <CardTitle>Diferentes Tamaños</CardTitle>
            <CardDescription>El componente soporta múltiples tamaños</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center space-y-4">
                <h3 className="font-semibold">Small</h3>
                <Loading size="sm" text="Cargando..." />
              </div>
              <div className="text-center space-y-4">
                <h3 className="font-semibold">Medium</h3>
                <Loading size="md" text="Cargando..." />
              </div>
              <div className="text-center space-y-4">
                <h3 className="font-semibold">Large</h3>
                <Loading size="lg" text="Cargando..." />
              </div>
              <div className="text-center space-y-4">
                <h3 className="font-semibold">Extra Large</h3>
                <Loading size="xl" text="Cargando..." />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Con texto */}
        <Card>
          <CardHeader>
            <CardTitle>Con Texto Personalizado</CardTitle>
            <CardDescription>Puedes agregar texto descriptivo al loading</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center">
                <Loading variant="spinner" size="lg" text="Procesando datos..." />
              </div>
              <div className="text-center">
                <Loading variant="dots" size="lg" text="Subiendo archivos..." />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overlay */}
        <Card>
          <CardHeader>
            <CardTitle>Loading Overlay</CardTitle>
            <CardDescription>Modo overlay para cubrir toda la pantalla</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleShowOverlay} className="w-full">
              Mostrar Loading Overlay (3 segundos)
            </Button>
          </CardContent>
        </Card>

        {/* Casos de uso */}
        <Card>
          <CardHeader>
            <CardTitle>Casos de Uso Comunes</CardTitle>
            <CardDescription>Ejemplos de implementación en diferentes contextos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Cargando página</h4>
                <Loading variant="spinner" text="Cargando contenido..." />
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Enviando formulario</h4>
                <Loading variant="dots" text="Enviando datos..." />
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Procesando</h4>
                <Loading variant="bars" text="Procesando solicitud..." />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overlay Loading */}
      {showOverlay && <Loading overlay variant="spinner" size="xl" text="Cargando..." />}
    </div>
  )
}
