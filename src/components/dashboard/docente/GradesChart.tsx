'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function GradesChart() {
  // Datos placeholder
  const data = [
    { week: 'Semana 1', average: 7.5, trend: 7.4 },
    { week: 'Semana 2', average: 7.8, trend: 7.6 },
    { week: 'Semana 3', average: 8.1, trend: 7.8 },
    { week: 'Semana 4', average: 8.0, trend: 7.9 },
    { week: 'Semana 5', average: 8.2, trend: 8.0 },
    { week: 'Semana 6', average: 8.4, trend: 8.1 },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Calificaciones - Tendencia
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Evolución de calificaciones por semana
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="week"
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
            domain={[0, 10]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#f1f5f9' }}
            cursor={{ stroke: 'rgba(59, 130, 246, 0.2)' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="average"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
            name="Promedio General"
          />
          <Line
            type="monotone"
            dataKey="trend"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
            name="Tendencia"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
