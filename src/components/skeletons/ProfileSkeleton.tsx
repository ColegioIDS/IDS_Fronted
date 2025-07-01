// components/skeletons/ProfileSkeleton.tsx
import React from "react";

type SkeletonType = 'meta' | 'info' | 'address' | 'full';

export default function ProfileSkeleton({ type }: { type: SkeletonType }) {
  const commonClasses = "bg-gray-200 dark:bg-gray-700 rounded animate-pulse";
  
  return (
    <div className="space-y-6">
      {(type === 'meta' || type === 'full') && (
        <div className={`h-40 ${commonClasses}`}></div>
      )}
      {(type === 'info' || type === 'full') && (
        <div className={`h-60 ${commonClasses}`}></div>
      )}
      {(type === 'address' || type === 'full') && (
        <div className={`h-80 ${commonClasses}`}></div>
      )}
    </div>
  );
}