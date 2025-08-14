import React from "react";
import { ScheduleCalendarView } from "@/components/schedules/ScheduleCalendarView";

// Simulación de datos
const timeSlots = [
  { id: 1, startTime: "08:00", endTime: "09:00" },
  { id: 2, startTime: "09:00", endTime: "10:00" },
  { id: 3, startTime: "10:00", endTime: "11:00" },
];

const schedules = [
  { id: 1, dayOfWeek: "Monday", timeSlotId: 1, teacherId: 1 },
  { id: 2, dayOfWeek: "Wednesday", timeSlotId: 2, teacherId: 2 },
];

export default function ContentSchedules() {
  const handleDropSchedule = (scheduleId: number, newDay: string, newTimeSlotId: number) => {
    console.log(`Schedule ${scheduleId} dropped to ${newDay} at slot ${newTimeSlotId}`);
    // Aquí puedes actualizar el estado o hacer una petición a la API
  };

  return (
    <div className="p-4">
    
   
    <ScheduleCalendarView

/>


    </div>
  );
}
