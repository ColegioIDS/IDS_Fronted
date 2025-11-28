// src/app/auth/password-recovery/page.tsx
import React from "react";
import PasswordRecoveryForm from "@/components/auth/password-reset/PasswordRecoveryForm";
import PasswordResetBranding, {
  Shield,
  Zap,
  Mail,
  CheckCircle2,
} from "@/components/auth/password-reset/PasswordResetBranding";

export const metadata = {
  title: "Recuperar Contraseña | IDS",
  description: "Restablece tu contraseña de forma segura",
};

export default function PasswordRecoveryPage() {
  const features = [
    {
      icon: <Shield className="w-5 h-5 text-white" />,
      title: "Encriptación de Nivel Enterprise",
      description: "Tus datos están protegidos con encriptación de grado militar",
    },
    {
      icon: <Zap className="w-5 h-5 text-white" />,
      title: "Recuperación Instantánea",
      description: "Recibirás un enlace seguro por email en segundos",
    },
    {
      icon: <Mail className="w-5 h-5 text-white" />,
      title: "Verificación por Email",
      description: "Solo tú tienes acceso al enlace de recuperación",
    },
    {
      icon: <CheckCircle2 className="w-5 h-5 text-white" />,
      title: "Tokens Únicos y Seguros",
      description: "Cada enlace es único y expira en 1 hora",
    },
  ];

  return (
    <div className="flex h-screen bg-white dark:bg-gray-950">
      <PasswordResetBranding
        title="Recupera tu Acceso"
        subtitle="Restablece tu contraseña de forma segura y vuelve a acceder a tu cuenta en segundos"
        features={features}
      />

      {/* Right Side - Form */}
      <PasswordRecoveryForm />
    </div>
  );
}
