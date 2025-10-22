// src/app/api/auth/check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/config/api';

export async function GET(request: NextRequest) {
  try {
    // Verifica sesión en el backend
    const response = await api.get('/api/auth/verify');
    
    if (response.data?.data) {
      return NextResponse.json({ authenticated: true, user: response.data.data });
    }
    
    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}