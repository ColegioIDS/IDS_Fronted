// src/components/auth/password-reset/PasswordResetBranding.tsx
"use client";

import React from "react";
import { Lock, Mail, Shield, Zap, CheckCircle2, Eye } from "lucide-react";

interface BrandingFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface PasswordResetBrandingProps {
  title: string;
  subtitle: string;
  features: BrandingFeature[];
}

export default function PasswordResetBranding({
  title,
  subtitle,
  features,
}: PasswordResetBrandingProps) {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-650 to-brand-700 dark:from-brand-900 dark:via-brand-800 dark:to-brand-950 p-12 flex-col justify-between relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

      {/* Content */}
      <div className="relative z-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
          <Lock className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
          {title}
        </h2>
        <p className="text-lg text-brand-100 max-w-md">
          {subtitle}
        </p>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 space-y-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center">
              {feature.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm">
                {feature.title}
              </h3>
              <p className="text-brand-100 text-xs mt-1">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer badge */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
          <CheckCircle2 className="w-4 h-4 text-green-300" />
          <span className="text-sm font-medium text-white">
            Protección de nivel enterprise
          </span>
        </div>
      </div>
    </div>
  );
}

export { Shield, Zap, Mail, Eye, CheckCircle2, Lock };
