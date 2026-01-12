// hooks/useDragManager.ts
import { useCallback, useRef } from 'react';
import type { DragState, DragItem } from '../types/schedules.types';

// Estado global para drag & drop
let dragState: DragState = {
  isDragging: false,
  dragItem: null,
  dragElement: null,
  startPosition: { x: 0, y: 0 }
};

let autoScrollAnimationId: number | null = null;

export function useDragManager() {
  const elementRef = useRef<HTMLDivElement>(null);

  const startDrag = useCallback((e: React.MouseEvent, item: DragItem) => {
    e.preventDefault();
    const element = elementRef.current;
    if (!element) return;

    dragState.isDragging = true;
    dragState.dragItem = item;
    dragState.dragElement = element;
    dragState.startPosition = { x: e.clientX, y: e.clientY };
    
    // Aplicar estilos de arrastre
    element.style.opacity = '0.5';
    element.style.transform = 'rotate(3deg) scale(1.05)';
    element.style.zIndex = '1000';
    element.style.pointerEvents = 'none';
    
    // Agregar listeners globales
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.dragElement) return;
    
    // Actualizar posición de arrastre
    dragState.startPosition = { x: e.clientX, y: e.clientY };
    
    const deltaX = e.clientX - dragState.startPosition.x;
    const deltaY = e.clientY - dragState.startPosition.y;
    
    dragState.dragElement.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(3deg) scale(1.05)`;
    
    // Auto-scroll suave del contenedor
    handleSmoothScroll(e);
  }, []);

  const handleSmoothScroll = (e: MouseEvent) => {
    // Encontrar el scroll area más cercano (sidebard con los cursos)
    const scrollArea = document.querySelector('[class*="scroll"]');
    
    if (!scrollArea) return;
    
    const rect = scrollArea.getBoundingClientRect();
    const tolerance = 80; // píxeles desde el borde para activar scroll
    const maxScrollSpeed = 8; // velocidad máxima de scroll
    
    let scrollSpeedY = 0;
    let scrollSpeedX = 0;
    
    // Calcular velocidad de scroll vertical
    if (e.clientY > rect.bottom - tolerance) {
      // Cursor cerca del borde inferior
      const proximity = rect.bottom - e.clientY;
      scrollSpeedY = Math.max(2, maxScrollSpeed * (1 - proximity / tolerance));
    } else if (e.clientY < rect.top + tolerance) {
      // Cursor cerca del borde superior
      const proximity = e.clientY - rect.top;
      scrollSpeedY = -Math.max(2, maxScrollSpeed * (1 - proximity / tolerance));
    }
    
    // Calcular velocidad de scroll horizontal
    if (e.clientX > rect.right - tolerance) {
      const proximity = rect.right - e.clientX;
      scrollSpeedX = Math.max(2, maxScrollSpeed * (1 - proximity / tolerance));
    } else if (e.clientX < rect.left + tolerance) {
      const proximity = e.clientX - rect.left;
      scrollSpeedX = -Math.max(2, maxScrollSpeed * (1 - proximity / tolerance));
    }
    
    // Aplicar scroll si es necesario
    if (scrollSpeedY !== 0 || scrollSpeedX !== 0) {
      scrollArea.scrollBy(scrollSpeedX, scrollSpeedY);
    }
  };

  const handleMouseUp = useCallback(() => {
    if (dragState.dragElement) {
      // Restaurar estilos
      dragState.dragElement.style.opacity = '';
      dragState.dragElement.style.transform = '';
      dragState.dragElement.style.zIndex = '';
      dragState.dragElement.style.pointerEvents = '';
    }
    
    // Limpiar estado
    dragState.isDragging = false;
    dragState.dragItem = null;
    dragState.dragElement = null;
    
    // Remover listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    // Detener auto-scroll
    if (autoScrollAnimationId) {
      cancelAnimationFrame(autoScrollAnimationId);
      autoScrollAnimationId = null;
    }
  }, []);

  const getDragState = () => dragState;

  return {
    elementRef,
    startDrag,
    getDragState
  };
}