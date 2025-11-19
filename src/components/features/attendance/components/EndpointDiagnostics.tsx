'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Componente de diagnóstico para verificar el endpoint directamente
 * Úsalo para debuguear problemas con GET /api/attendance/enrollment/section/:sectionId/students
 */
export function EndpointDiagnostics() {
  const [sectionId, setSectionId] = useState('1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testEndpoint = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const url = `${apiBaseUrl}/api/attendance/enrollment/section/${sectionId}/students`;

      console.log('[Diagnostics] Testing:', url);

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('[Diagnostics] Response status:', response.status);

      const data = await response.json();
      console.log('[Diagnostics] Response data:', data);

      if (!response.ok) {
        setError(`Error ${response.status}: ${data.message || 'Unknown error'}`);
      } else {
        setResult(data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Diagnostics] Error:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
      <CardHeader>
        <CardTitle>🔍 Endpoint Diagnostics</CardTitle>
        <CardDescription>Test the section students endpoint</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="number"
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            placeholder="Section ID"
            min="1"
          />
          <Button onClick={testEndpoint} disabled={loading}>
            {loading ? 'Testing...' : 'Test'}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-2">
            <Alert className="bg-green-50 border-green-200 dark:bg-green-950/20">
              <AlertDescription>✅ Response received successfully</AlertDescription>
            </Alert>
            <details className="text-xs">
              <summary className="cursor-pointer font-semibold">Full Response (click to expand)</summary>
              <pre className="mt-2 overflow-auto rounded bg-gray-900 p-2 text-gray-100">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="font-semibold">Success:</p>
                <p className="text-gray-600">{result.success ? '✅ true' : '❌ false'}</p>
              </div>
              <div>
                <p className="font-semibold">Count:</p>
                <p className="text-gray-600">{result.count || 0} students</p>
              </div>
              <div>
                <p className="font-semibold">Message:</p>
                <p className="text-gray-600">{result.message}</p>
              </div>
              <div>
                <p className="font-semibold">Data Type:</p>
                <p className="text-gray-600">{Array.isArray(result.data) ? 'Array' : typeof result.data}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
