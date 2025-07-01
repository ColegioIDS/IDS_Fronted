"use client";
import React from "react";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbHeaderProps {
  pageTitle: string;
  items: BreadcrumbItem[];
  icon?: React.ReactNode; // Icono opcional
}

const BreadcrumbHeader: React.FC<BreadcrumbHeaderProps> = ({ pageTitle, items, icon }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      {/* Título a la izquierda */}
      <h1 className="flex items-center text-2xl font-semibold text-gray-800 dark:text-white/90">
        {icon && <span className="mr-2 text-gray-800 dark:text-white/90">{icon}</span>}
        {pageTitle}
      </h1>
      {/* Breadcrumb a la derecha */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
        {items.map((item, index) => (
            <li key={index} className="inline-flex items-center">
              {index !== 0 && (
                <svg
                  className="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 9 L5 5 L1 1"
                  />
                </svg>
              )}

              {index < items.length - 1 ? (
                <Link
                  href={item.href}
                  className={`${
                    index === 0
                      ? "inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
                      : "ms-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ms-2 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  {index === 0 && (
                    <svg
                      className="w-3 h-3 me-2.5"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
                    </svg>
                  )}
                  {item.label}
                </Link>
              ) : (
                <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};

export default BreadcrumbHeader;
