// src/app/api/recaptcha/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface RecaptchaVerifyRequest {
  token: string;
}

interface RecaptchaVerifyResponse {
  success: boolean;
  score: number;
  action: string;
  challenge_ts: string;
  hostname: string;
  error_codes?: string[];
}

/**
 * POST /api/recaptcha/verify
 * Verifica el token de reCAPTCHA v3 con Google
 * Este endpoint debe ser llamado desde el servidor (backend)
 */
export async function POST(request: NextRequest) {
  try {
    const body: RecaptchaVerifyRequest = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY is not configured');
      return NextResponse.json(
        { error: 'reCAPTCHA not configured' },
        { status: 500 }
      );
    }

    // Verificar el token con Google
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
      signal: AbortSignal.timeout(10000), // 10 segundos timeout
    });

    if (!response.ok) {
      console.error('Google reCAPTCHA API error:', {
        status: response.status,
        statusText: response.statusText,
      });
      return NextResponse.json(
        { error: 'Error communicating with reCAPTCHA service' },
        { status: 502 }
      );
    }

    const data: RecaptchaVerifyResponse = await response.json();

    // Validar respuesta
    if (!data || typeof data.success !== 'boolean') {
      console.error('Invalid response from Google reCAPTCHA:', data);
      return NextResponse.json(
        { error: 'Invalid response from reCAPTCHA service' },
        { status: 502 }
      );
    }

    // Log para debugging
    console.log('reCAPTCHA verification result:', {
      success: data.success,
      score: data.score || 1.0, // Las claves de prueba no devuelven score
      action: data.action,
      hostname: data.hostname,
    });

    // Para claves de prueba: si success=true, devolver score alto
    // Para claves reales: usar el score devuelto por Google
    const scoreToUse = data.score !== undefined ? data.score : 1.0;

    // Umbral mínimo de score (0.5 por defecto, ajustable según necesidades)
    const threshold = 0.5;
    if (!data.success || scoreToUse < threshold) {
      console.warn('reCAPTCHA verification failed or score too low:', {
        success: data.success,
        score: scoreToUse,
        threshold,
      });
    }

    // Retornar la respuesta completa con score normalizado
    return NextResponse.json({
      ...data,
      score: scoreToUse, // ← Asegurar que siempre hay un score
    }, { status: 200 });
  } catch (error) {
    console.error('Error in reCAPTCHA verification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
