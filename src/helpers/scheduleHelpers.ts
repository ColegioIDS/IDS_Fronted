// helpers/scheduleHelpers.ts
export const daysOfWeek = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' },
];

export const timeSlots = Array.from({ length: 24 * 2 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? '00' : '30';
  return {
    value: `${hours.toString().padStart(2, '0')}:${minutes}`,
    label: `${hours.toString().padStart(2, '0')}:${minutes}`,
  };
});

export function formatDayOfWeek(day: number): string {
  return daysOfWeek.find(d => d.value === day)?.label || '';
}