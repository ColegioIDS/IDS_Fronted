import React from 'react';
import { CourseGradeManager } from '@/components/course-grades/CourseGradeManager';

const CourseGradesContent: React.FC = () => {
     return (
    <div className="container mx-auto py-6">
      <CourseGradeManager />
    </div>
  );
};

export default CourseGradesContent;