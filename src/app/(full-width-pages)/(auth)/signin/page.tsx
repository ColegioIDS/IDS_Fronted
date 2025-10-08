// src/app/(full-width-pages)/(auth)/signin/page.tsx
'use client';

import SignInForm from "@/components/auth/SignInForm";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignIn() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);



  useEffect(() => {
    setIsMounted(true);
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (!isMounted || isLoading || isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return <SignInForm />;
}