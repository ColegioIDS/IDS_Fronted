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
    
    const deltaX = e.clientX - dragState.startPosition.x;
    const deltaY = e.clientY - dragState.startPosition.y;
    
    dragState.dragElement.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(3deg) scale(1.05)`;
  }, []);

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
  }, []);

  const getDragState = () => dragState;

  return {
    elementRef,
    startDrag,
    getDragState
  };
}