// src/components/features/erica-evaluations/index.ts

// Main content component (Legacy - has context dependencies, use EvaluationGridV2 instead)
// export { default as EricaEvaluationsContent } from './erica-evaluations-content';

// Selection flow components (Legacy - have broken context dependencies)
// export { default as GradeSelection } from './selection-flow/grade-selection';
// export { default as SectionSelection } from './selection-flow/section-selection';
// export { default as TeacherSelection } from './selection-flow/teacher-selection';
// export { default as CourseSelection } from './selection-flow/course-selection';
// export { default as TopicSelection } from './selection-flow/topic-selection';
// export { default as CycleSelection } from './selection-flow/cycle-selection';
// export { default as SelectionBreadcrumbs } from './selection-flow/selection-breadcrumbs';

// Evaluation grid components (V2 - New dimension/state based)
export { default as EvaluationGridV2 } from './evaluation-grid/evaluation-grid-v2';
export { default as DimensionEvaluationCell } from './evaluation-grid/dimension-evaluation-cell';
export { default as StateSelector } from './evaluation-grid/state-selector';
export { default as StateSelectorDropdown } from './evaluation-grid/state-selector-dropdown';
export { default as GridStatsV2 } from './evaluation-grid/grid-stats-v2';

// Evaluation grid components (Legacy - category/scale based)
export { default as EvaluationGrid } from './evaluation-grid/evaluation-grid';
export { default as EvaluationCell } from './evaluation-grid/evaluation-cell';
export { default as EvaluationDropdown } from './evaluation-grid/evaluation-dropdown';
export { default as CompactTableView } from './evaluation-grid/compact-table-view';
export { default as GridStats } from './evaluation-grid/grid-stats';
export { default as ScaleSelector } from './evaluation-grid/scale-selector';

// Context info components
// (Commented out - files are empty/not implemented)
// export { default as AcademicContextCard } from './context-info/academic-context-card';
// export { default as TeacherCourseInfo } from './context-info/teacher-course-info';
// export { default as TopicInfoCard } from './context-info/topic-info-card';

// Selection grid component
export { SelectionGrid } from './selection-grid';

// Common components
// (Commented out - files are empty/not implemented)
// export { default as LoadingStates } from './common/loading-states';

// Utils
// (Commented out - files are empty/not implemented)
// export * from './utils/data-formatters';
export * from './utils/evaluation-helpers';
// export * from './utils/validation-helpers';