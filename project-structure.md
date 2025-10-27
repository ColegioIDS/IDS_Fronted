└── ids-fronted
    ├── .claude
    ├── .env
    ├── .eslintrc.json
    ├── .gitignore
    ├── .idea
    │   ├── .gitignore
    │   ├── free-nextjs-admin-dashboard.iml
    │   ├── modules.xml
    │   ├── prettier.xml
    │   └── vcs.xml
    ├── banner.png
    ├── components.json
    ├── eslint.config.mjs
    ├── generate-project-structure.js
    ├── jsvectormap.d.ts
    ├── LICENSE
    ├── next-env.d.ts
    ├── next.config.ts
    ├── package-lock.json
    ├── package.json
    ├── postcss.config.js
    ├── prettier.config.js
    ├── project-structure.json
    ├── project-structure.md
    ├── README.md
    ├── src
    │   ├── actions
    │   │   └── schedule-actions.ts
    │   ├── api
    │   │   └── auth
    │   │       └── check
    │   │           └── route.ts
    │   ├── app
    │   │   ├── (admin)
    │   │   │   ├── (Roles-Permisos)
    │   │   │   │   ├── permissions
    │   │   │   │   │   └── page.tsx
    │   │   │   │   └── roles
    │   │   │   │       └── page.tsx
    │   │   │   ├── (ui-elements)
    │   │   │   │   ├── alerts
    │   │   │   │   │   └── page.tsx
    │   │   │   │   ├── avatars
    │   │   │   │   │   └── page.tsx
    │   │   │   │   ├── badge
    │   │   │   │   │   └── page.tsx
    │   │   │   │   ├── buttons
    │   │   │   │   │   └── page.tsx
    │   │   │   │   ├── images
    │   │   │   │   │   └── page.tsx
    │   │   │   │   ├── modals
    │   │   │   │   │   └── page.tsx
    │   │   │   │   └── videos
    │   │   │   │       └── page.tsx
    │   │   │   ├── academic-weeks
    │   │   │   │   └── page.tsx
    │   │   │   ├── attendance
    │   │   │   │   └── page.tsx
    │   │   │   ├── attendance-config
    │   │   │   │   └── page.tsx
    │   │   │   ├── bimesters
    │   │   │   │   └── page.tsx
    │   │   │   ├── course-grades
    │   │   │   │   ├── assign
    │   │   │   │   │   └── [gradeId]
    │   │   │   │   │       └── page.tsx
    │   │   │   │   └── page.tsx
    │   │   │   ├── course-teachers
    │   │   │   │   └── page.tsx
    │   │   │   ├── courses
    │   │   │   │   └── page.tsx
    │   │   │   ├── cycle
    │   │   │   │   └── page.tsx
    │   │   │   ├── dashboard
    │   │   │   │   └── page.tsx
    │   │   │   ├── enrollments
    │   │   │   │   └── page.tsx
    │   │   │   ├── erica
    │   │   │   │   └── page.tsx
    │   │   │   ├── erica-history
    │   │   │   │   └── page.tsx
    │   │   │   ├── erica-topics
    │   │   │   │   └── page.tsx
    │   │   │   ├── grade-cycle
    │   │   │   │   └── page.tsx
    │   │   │   ├── grades
    │   │   │   │   └── page.tsx
    │   │   │   ├── holiday
    │   │   │   │   ├── layout.tsx
    │   │   │   │   └── page.tsx
    │   │   │   ├── layout.tsx
    │   │   │   ├── schedules
    │   │   │   │   └── page.tsx
    │   │   │   ├── sections
    │   │   │   │   └── page.tsx
    │   │   │   ├── students
    │   │   │   │   ├── create
    │   │   │   │   │   └── page.tsx
    │   │   │   │   ├── edit
    │   │   │   │   ├── list
    │   │   │   │   │   └── page.tsx
    │   │   │   │   └── profile
    │   │   │   │       └── [id]
    │   │   │   │           └── page.tsx
    │   │   │   └── users
    │   │   │       ├── create
    │   │   │       │   └── page.tsx
    │   │   │       ├── edit
    │   │   │       │   └── [id]
    │   │   │       │       └── page.tsx
    │   │   │       └── list
    │   │   │           ├── page.tsx
    │   │   │           └── UserListContent.tsx
    │   │   ├── (full-width-pages)
    │   │   │   ├── (auth)
    │   │   │   │   ├── layout.tsx
    │   │   │   │   ├── signin
    │   │   │   │   │   └── page.tsx
    │   │   │   │   └── signup
    │   │   │   │       └── page.tsx
    │   │   │   ├── (error-pages)
    │   │   │   │   └── error-404
    │   │   │   │       └── page.tsx
    │   │   │   └── layout.tsx
    │   │   ├── favicon.ico
    │   │   ├── globals.css
    │   │   ├── layout.tsx
    │   │   ├── not-found.tsx
    │   │   └── page.tsx
    │   ├── components
    │   │   ├── academic-weeks
    │   │   │   ├── academic-week-card.tsx
    │   │   │   ├── academic-weeks.tsx
    │   │   │   ├── create-week-dialog.tsx
    │   │   │   ├── current-week-card.tsx
    │   │   │   ├── delete-week-dialog.tsx
    │   │   │   ├── edit-week-dialog.tsx
    │   │   │   ├── week-filters.tsx
    │   │   │   └── week-stats.tsx
    │   │   ├── Alerts
    │   │   │   └── ErrorAlert.tsx
    │   │   ├── attendance
    │   │   │   ├── AttendanceManager.tsx
    │   │   │   ├── AttendanceManagerWrapper.tsx
    │   │   │   ├── courses
    │   │   │   │   └── CourseSelector.tsx
    │   │   │   ├── header
    │   │   │   │   └── AttendanceHeader.tsx
    │   │   │   ├── save
    │   │   │   │   └── SaveButton.tsx
    │   │   │   ├── section
    │   │   │   │   └── SectionCard.tsx
    │   │   │   ├── states
    │   │   │   │   └── EmptyAndLoadingStates.tsx
    │   │   │   └── table
    │   │   │       └── AttendanceTable.tsx
    │   │   ├── attendance-config
    │   │   │   ├── AttendanceConfigCard.tsx
    │   │   │   ├── AttendanceConfigDialogs.tsx
    │   │   │   └── AttendanceConfigWrapper.tsx
    │   │   ├── auth
    │   │   │   ├── SignInForm.tsx
    │   │   │   └── SignUpForm.tsx
    │   │   ├── bimester
    │   │   │   ├── BimesterDialog.tsx
    │   │   │   ├── bimesters-table.tsx
    │   │   │   └── content.tsx
    │   │   ├── calendar
    │   │   │   └── Calendar.tsx
    │   │   ├── charts
    │   │   │   ├── bar
    │   │   │   │   └── BarChartOne.tsx
    │   │   │   └── line
    │   │   │       └── LineChartOne.tsx
    │   │   ├── common
    │   │   │   ├── Breadcrumb.tsx
    │   │   │   ├── ChartTab.tsx
    │   │   │   ├── ComponentCard.tsx
    │   │   │   ├── GridShape.tsx
    │   │   │   ├── LoadingSpinner.tsx
    │   │   │   ├── PageBreadCrumb.tsx
    │   │   │   ├── ProtectedContent.tsx
    │   │   │   ├── ThemeToggleButton.tsx
    │   │   │   ├── ThemeTogglerTwo.tsx
    │   │   │   └── Toaster.tsx
    │   │   ├── course-assignments
    │   │   │   ├── components
    │   │   │   │   ├── assignment-summary.tsx
    │   │   │   │   ├── bulk-save-actions.tsx
    │   │   │   │   ├── course-teacher-table.tsx
    │   │   │   │   └── grade-section-selector.tsx
    │   │   │   ├── course-assignments-content.tsx
    │   │   │   └── forms
    │   │   │       ├── assignment-form.tsx
    │   │   │       └── bulk-assignment-form.tsx
    │   │   ├── course-grades
    │   │   │   ├── BatchActionsBar.tsx
    │   │   │   ├── CourseAssignmentTable.tsx
    │   │   │   ├── CourseGradeFilters.tsx
    │   │   │   ├── CourseGradeForm.tsx
    │   │   │   ├── CourseGradeManager.tsx
    │   │   │   └── CourseGradeTable.tsx
    │   │   ├── courses
    │   │   │   ├── CourseCard.tsx
    │   │   │   ├── CourseForm.tsx
    │   │   │   ├── CoursesContent.tsx
    │   │   │   ├── CoursesList.tsx
    │   │   │   └── CourseTableRow.tsx
    │   │   ├── custom
    │   │   ├── cycles
    │   │   │   ├── CycleForm.tsx
    │   │   │   ├── datatable.tsx
    │   │   │   └── SchoolCycleTable.tsx
    │   │   ├── ecommerce
    │   │   │   ├── CountryMap.tsx
    │   │   │   ├── DemographicCard.tsx
    │   │   │   ├── EcommerceMetrics.tsx
    │   │   │   ├── MonthlySalesChart.tsx
    │   │   │   ├── MonthlyTarget.tsx
    │   │   │   ├── RecentOrders.tsx
    │   │   │   └── StatisticsChart.tsx
    │   │   ├── enrollments
    │   │   │   └── EnrollmentsContent.tsx
    │   │   ├── erica-evaluations
    │   │   │   ├── common
    │   │   │   │   └── loading-states.tsx
    │   │   │   ├── context-info
    │   │   │   │   ├── academic-context-card.tsx
    │   │   │   │   ├── teacher-course-info.tsx
    │   │   │   │   └── topic-info-card.tsx
    │   │   │   ├── erica-evaluations-content.tsx
    │   │   │   ├── evaluation-grid
    │   │   │   │   ├── compact-table-view.tsx
    │   │   │   │   ├── evaluation-cell.tsx
    │   │   │   │   ├── evaluation-copy-tool.tsx
    │   │   │   │   ├── evaluation-dropdown.tsx
    │   │   │   │   ├── evaluation-grid-header.tsx
    │   │   │   │   ├── evaluation-grid-row.tsx
    │   │   │   │   ├── evaluation-grid.tsx
    │   │   │   │   ├── evaluation-patterns.tsx
    │   │   │   │   ├── grid-stats.tsx
    │   │   │   │   └── scale-selector.tsx
    │   │   │   ├── selection-flow
    │   │   │   │   ├── course-selection.tsx
    │   │   │   │   ├── cycle-selection.tsx
    │   │   │   │   ├── grade-selection.tsx
    │   │   │   │   ├── section-selection.tsx
    │   │   │   │   ├── selection-breadcrumbs.tsx
    │   │   │   │   ├── teacher-selection.tsx
    │   │   │   │   └── topic-selection.tsx
    │   │   │   └── utils
    │   │   │       ├── data-formatters.ts
    │   │   │       ├── evaluation-helpers.ts
    │   │   │       └── validation-helpers.ts
    │   │   ├── erica-history
    │   │   │   ├── erica-content.tsx
    │   │   │   ├── qna-grid
    │   │   │   │   ├── qna-grid-headers.tsx
    │   │   │   │   ├── qna-grid-main.tsx
    │   │   │   │   ├── qna-grid-stats.tsx
    │   │   │   │   ├── qna-grid-student-row.tsx
    │   │   │   │   └── qna-grid.tsx
    │   │   │   ├── selection-flow
    │   │   │   │   ├── bimester-selection.tsx
    │   │   │   │   ├── course-selection.tsx
    │   │   │   │   ├── grade-selection.tsx
    │   │   │   │   ├── section-selection.tsx
    │   │   │   │   └── teacher-selection.tsx
    │   │   │   └── shared
    │   │   │       └── academic-context-info.tsx
    │   │   ├── erica-topics
    │   │   │   ├── columns.tsx
    │   │   │   ├── erica-topics-content.tsx
    │   │   │   ├── erica-topics-form.tsx
    │   │   │   └── erica-topics-table.tsx
    │   │   ├── errors
    │   │   │   └── ErrorManager.tsx
    │   │   ├── example
    │   │   │   └── ModalExample
    │   │   │       ├── DefaultModal.tsx
    │   │   │       ├── FormInModal.tsx
    │   │   │       ├── FullScreenModal.tsx
    │   │   │       ├── ModalBasedAlerts.tsx
    │   │   │       └── VerticallyCenteredModal.tsx
    │   │   ├── form
    │   │   │   ├── AvatarUploader
    │   │   │   │   └── AvatarUploader.tsx
    │   │   │   ├── date-picker.tsx
    │   │   │   ├── form-elements
    │   │   │   │   ├── CheckboxComponents.tsx
    │   │   │   │   ├── DefaultInputs.tsx
    │   │   │   │   ├── DropZone.tsx
    │   │   │   │   ├── FileInputExample.tsx
    │   │   │   │   ├── InputGroup.tsx
    │   │   │   │   ├── InputStates.tsx
    │   │   │   │   ├── RadioButtons.tsx
    │   │   │   │   ├── SelectInputs.tsx
    │   │   │   │   ├── TextAreaInput.tsx
    │   │   │   │   └── ToggleSwitch.tsx
    │   │   │   ├── Form.tsx
    │   │   │   ├── group-input
    │   │   │   │   └── PhoneInput.tsx
    │   │   │   ├── input
    │   │   │   │   ├── Checkbox.tsx
    │   │   │   │   ├── FileInput.tsx
    │   │   │   │   ├── IconInput.tsx
    │   │   │   │   ├── InputField.tsx
    │   │   │   │   ├── Radio.tsx
    │   │   │   │   ├── RadioSm.tsx
    │   │   │   │   └── TextArea.tsx
    │   │   │   ├── Label.tsx
    │   │   │   ├── MultiSelect.tsx
    │   │   │   ├── Select.tsx
    │   │   │   ├── switch
    │   │   │   │   └── Switch.tsx
    │   │   │   └── UploadImage
    │   │   │       └── image-upload.tsx
    │   │   ├── grade-cycle
    │   │   │   ├── components
    │   │   │   │   ├── configuration-summary.tsx
    │   │   │   │   ├── cycle-info-card.tsx
    │   │   │   │   ├── cycle-selection-list.tsx
    │   │   │   │   ├── empty-state.tsx
    │   │   │   │   ├── grade-selection-card.tsx
    │   │   │   │   ├── grade-summary-card.tsx
    │   │   │   │   ├── loading-skeleton.tsx
    │   │   │   │   └── step-indicator.tsx
    │   │   │   ├── forms
    │   │   │   │   └── create-grade-form.tsx
    │   │   │   ├── grade-cycle-content.tsx
    │   │   │   ├── grade-cycle-dashboard.tsx
    │   │   │   ├── steps
    │   │   │   │   ├── configure-grades-step.tsx
    │   │   │   │   ├── create-cycle-step.tsx
    │   │   │   │   └── link-grade-cycles-step.tsx
    │   │   │   └── wizard-summary.tsx
    │   │   ├── grades
    │   │   │   ├── GradeFilters.tsx
    │   │   │   ├── GradeForm.tsx
    │   │   │   ├── GradeFormDialog.tsx
    │   │   │   ├── GradesContent.tsx
    │   │   │   ├── GradeStats.tsx
    │   │   │   └── GradeTable.tsx
    │   │   ├── header
    │   │   │   ├── NotificationDropdown.tsx
    │   │   │   └── UserDropdown.tsx
    │   │   ├── holidays
    │   │   │   ├── ContentModalForm.tsx
    │   │   │   ├── ContentPage.tsx
    │   │   │   ├── holiday-calendar.tsx
    │   │   │   ├── holiday-filters.tsx
    │   │   │   ├── HolidayForm.tsx
    │   │   │   └── HolidayTable.tsx
    │   │   ├── loading
    │   │   │   ├── AllLoading.tsx
    │   │   │   └── loading.tsx
    │   │   ├── navigation
    │   │   │   └── ProtectedNavItem.tsx
    │   │   ├── noresult
    │   │   │   └── NoData.tsx
    │   │   ├── permissions
    │   │   │   ├── PermissionCard.tsx
    │   │   │   ├── PermissionDetailDialog.tsx
    │   │   │   ├── PermissionModuleCard.tsx
    │   │   │   ├── PermissionModuleDetailDialog.tsx
    │   │   │   └── PermissionsContent.tsx
    │   │   ├── roles
    │   │   │   ├── RoleCardImproved.tsx
    │   │   │   ├── RoleDetailDialog.tsx
    │   │   │   ├── RoleForm.tsx
    │   │   │   ├── RolesContent.tsx
    │   │   │   ├── RolesList.tsx
    │   │   │   └── RolesTable.tsx
    │   │   ├── schedules
    │   │   │   ├── calendar
    │   │   │   │   ├── DroppableTimeSlot.tsx
    │   │   │   │   ├── ScheduleConfigModal.tsx
    │   │   │   │   ├── ScheduleGrid.tsx
    │   │   │   │   ├── ScheduleHeader.tsx
    │   │   │   │   └── ScheduleSidebar.tsx
    │   │   │   ├── ContentSchedules.tsx
    │   │   │   ├── draggable
    │   │   │   │   ├── DraggableCourse.tsx
    │   │   │   │   ├── DraggableSchedule.tsx
    │   │   │   │   └── DraggableTeacher.tsx
    │   │   │   └── ScheduleCalendarView.tsx
    │   │   ├── sections
    │   │   │   ├── SectionFormDialog.tsx
    │   │   │   ├── SectionsContent.tsx
    │   │   │   ├── SectionsDataTable.tsx
    │   │   │   ├── SectionsFilter.tsx
    │   │   │   └── SectionsHeader.tsx
    │   │   ├── skeletons
    │   │   │   └── ProfileSkeleton.tsx
    │   │   ├── students
    │   │   │   ├── sections
    │   │   │   │   ├── AcademicDataSection.tsx
    │   │   │   │   ├── AuthorizedPersonsSection.tsx
    │   │   │   │   ├── BusServiceSection.tsx
    │   │   │   │   ├── EmergencyInfoSection.tsx
    │   │   │   │   ├── EnrollmentSection.tsx
    │   │   │   │   ├── MedicalInfoSection.tsx
    │   │   │   │   ├── ParentsDataSection.tsx
    │   │   │   │   ├── PersonalDataSection.tsx
    │   │   │   │   ├── SiblingsSection.tsx
    │   │   │   │   └── SponsorshipPreferencesSection.tsx
    │   │   │   ├── StudentCard.tsx
    │   │   │   ├── StudentDataTable.tsx
    │   │   │   ├── StudentForm.tsx
    │   │   │   ├── StudentList.tsx
    │   │   │   └── StudentProfile.tsx
    │   │   ├── tables
    │   │   │   ├── BasicTableOne.tsx
    │   │   │   └── Pagination.tsx
    │   │   ├── ui
    │   │   │   ├── alert
    │   │   │   │   └── Alert.tsx
    │   │   │   ├── alert-dialog.tsx
    │   │   │   ├── alert.tsx
    │   │   │   ├── avatar
    │   │   │   │   ├── Avatar.tsx
    │   │   │   │   └── AvatarText.tsx
    │   │   │   ├── avatar.tsx
    │   │   │   ├── avatardicebear
    │   │   │   │   ├── Avatar.tsx
    │   │   │   │   └── index.ts
    │   │   │   ├── badge
    │   │   │   │   └── Badge.tsx
    │   │   │   ├── badge.tsx
    │   │   │   ├── button
    │   │   │   │   └── Button.tsx
    │   │   │   ├── button.tsx
    │   │   │   ├── calendar.tsx
    │   │   │   ├── card.tsx
    │   │   │   ├── checkbox.tsx
    │   │   │   ├── collapsible.tsx
    │   │   │   ├── command.tsx
    │   │   │   ├── dialog.tsx
    │   │   │   ├── drawer
    │   │   │   │   ├── drawer-modal.tsx
    │   │   │   │   └── side-modal.tsx
    │   │   │   ├── dropdown
    │   │   │   │   ├── Dropdown.tsx
    │   │   │   │   └── DropdownItem.tsx
    │   │   │   ├── dropdown-menu.tsx
    │   │   │   ├── form.tsx
    │   │   │   ├── images
    │   │   │   │   ├── ResponsiveImage.tsx
    │   │   │   │   ├── ThreeColumnImageGrid.tsx
    │   │   │   │   └── TwoColumnImageGrid.tsx
    │   │   │   ├── input.tsx
    │   │   │   ├── label.tsx
    │   │   │   ├── modal
    │   │   │   │   ├── index.tsx
    │   │   │   │   ├── Modal.tsx
    │   │   │   │   └── ModalWarningConfirm.tsx
    │   │   │   ├── popover.tsx
    │   │   │   ├── progress.tsx
    │   │   │   ├── scroll-area.tsx
    │   │   │   ├── select.tsx
    │   │   │   ├── separator.tsx
    │   │   │   ├── sheet.tsx
    │   │   │   ├── skeleton.tsx
    │   │   │   ├── slider.tsx
    │   │   │   ├── sonner.tsx
    │   │   │   ├── switch.tsx
    │   │   │   ├── table
    │   │   │   │   └── index.tsx
    │   │   │   ├── table.tsx
    │   │   │   ├── tableCustom.tsx
    │   │   │   ├── tabs.tsx
    │   │   │   ├── textarea.tsx
    │   │   │   ├── toggle-group.tsx
    │   │   │   ├── toggle.tsx
    │   │   │   ├── tooltip.tsx
    │   │   │   └── video
    │   │   │       ├── VideosExample.tsx
    │   │   │       └── YouTubeEmbed.tsx
    │   │   ├── user-profile
    │   │   │   ├── UserAddressCard.tsx
    │   │   │   ├── UserInfoCard.tsx
    │   │   │   └── UserMetaCard.tsx
    │   │   ├── users
    │   │   │   ├── NoResultsFound.tsx
    │   │   │   ├── UserForm.tsx
    │   │   │   └── UserList.tsx
    │   │   └── videos
    │   │       ├── FourIsToThree.tsx
    │   │       ├── OneIsToOne.tsx
    │   │       ├── SixteenIsToNine.tsx
    │   │       └── TwentyOneIsToNine.tsx
    │   ├── config
    │   │   └── api.ts
    │   ├── constants
    │   │   ├── attendanceStatuses.ts
    │   │   └── rolesTable.ts
    │   ├── context
    │   │   ├── AcademicWeeksContext.tsx
    │   │   ├── AuthContext.tsx
    │   │   ├── BimesterContext.tsx
    │   │   ├── CourseAssignmentContext.tsx
    │   │   ├── CourseContext.tsx
    │   │   ├── CyclesContext.tsx
    │   │   ├── EricaEvaluationContext.tsx
    │   │   ├── EricaTopicsContext.tsx
    │   │   ├── GradeContext.tsx
    │   │   ├── GradeCycleContext.tsx
    │   │   ├── HolidayContext.tsx
    │   │   ├── HolidaysContext.tsx
    │   │   ├── newBimesterContext.tsx
    │   │   ├── newTeachersContext.tsx
    │   │   ├── QnaContext.tsx
    │   │   ├── RoleContext.tsx
    │   │   ├── ScheduleConfigContext.tsx
    │   │   ├── ScheduleContext.tsx
    │   │   ├── SchoolCycleContext.tsx
    │   │   ├── SectionsContext.tsx
    │   │   ├── SidebarContext.tsx
    │   │   ├── StudentContext.tsx
    │   │   ├── TeacherContext.tsx
    │   │   ├── ThemeContext.tsx
    │   │   └── UserContext.tsx
    │   ├── helpers
    │   │   └── scheduleHelpers.ts
    │   ├── hooks
    │   │   ├── newuseGrade.ts
    │   │   ├── useAcademicWeeks.ts
    │   │   ├── useAttendance.ts
    │   │   ├── useAttendanceActions.tsx
    │   │   ├── useAttendanceConfig.ts
    │   │   ├── useAttendanceFilters.tsx
    │   │   ├── useAttendanceLogic.tsx
    │   │   ├── useAttendanceManager.ts
    │   │   ├── useAttendanceSystem.ts
    │   │   ├── useAuth.ts
    │   │   ├── useAutoClearError.ts
    │   │   ├── useBimester.ts
    │   │   ├── useBimesters.ts
    │   │   ├── useCourse.ts
    │   │   ├── useCourseAssignment.ts
    │   │   ├── useCourseGrade.ts
    │   │   ├── useDebounce.ts
    │   │   ├── useDragManager.ts
    │   │   ├── useEnrollment.ts
    │   │   ├── useGlobal.ts
    │   │   ├── useGoBack.ts
    │   │   ├── useGrade.ts
    │   │   ├── useHoliday.ts
    │   │   ├── useHolidayValidation.tsx
    │   │   ├── useJustifications.ts
    │   │   ├── useLoginForm.ts
    │   │   ├── useModal.ts
    │   │   ├── usePagination.ts
    │   │   ├── usePermissions.ts
    │   │   ├── useReports.ts
    │   │   ├── useRoles.ts
    │   │   ├── useSchedule.ts
    │   │   ├── useScheduleConfig.ts
    │   │   ├── useScheduleIntegration.ts
    │   │   ├── useSchoolCycle.ts
    │   │   ├── useSchoolCycles.ts
    │   │   ├── useSections.ts
    │   │   ├── useStudent.ts
    │   │   ├── useTeachers.ts
    │   │   └── useUser.ts
    │   ├── icons
    │   │   ├── alert.svg
    │   │   ├── angle-down.svg
    │   │   ├── angle-left.svg
    │   │   ├── angle-right.svg
    │   │   ├── angle-up.svg
    │   │   ├── arrow-down.svg
    │   │   ├── arrow-right.svg
    │   │   ├── arrow-up.svg
    │   │   ├── audio.svg
    │   │   ├── bell.svg
    │   │   ├── bolt.svg
    │   │   ├── box-cube.svg
    │   │   ├── box-line.svg
    │   │   ├── box.svg
    │   │   ├── calendar.svg
    │   │   ├── calender-line.svg
    │   │   ├── chat.svg
    │   │   ├── check-circle.svg
    │   │   ├── check-line.svg
    │   │   ├── chevron-down.svg
    │   │   ├── chevron-left.svg
    │   │   ├── chevron-up.svg
    │   │   ├── close-line.svg
    │   │   ├── close.svg
    │   │   ├── copy.svg
    │   │   ├── docs.svg
    │   │   ├── dollar-line.svg
    │   │   ├── download.svg
    │   │   ├── envelope.svg
    │   │   ├── eye-close.svg
    │   │   ├── eye.svg
    │   │   ├── file.svg
    │   │   ├── folder.svg
    │   │   ├── grid.svg
    │   │   ├── group.svg
    │   │   ├── horizontal-dots.svg
    │   │   ├── index.tsx
    │   │   ├── info-hexa.svg
    │   │   ├── info.svg
    │   │   ├── list.svg
    │   │   ├── lock.svg
    │   │   ├── mail-line.svg
    │   │   ├── more-dot.svg
    │   │   ├── page.svg
    │   │   ├── paper-plane.svg
    │   │   ├── pencil.svg
    │   │   ├── pie-chart.svg
    │   │   ├── plug-in.svg
    │   │   ├── plus.svg
    │   │   ├── shooting-star.svg
    │   │   ├── table.svg
    │   │   ├── task-icon.svg
    │   │   ├── task.svg
    │   │   ├── time.svg
    │   │   ├── trash.svg
    │   │   ├── user-circle.svg
    │   │   ├── user-line.svg
    │   │   ├── users.svg
    │   │   └── videos.svg
    │   ├── layout
    │   │   ├── AppHeader.tsx
    │   │   ├── AppSidebar.tsx
    │   │   ├── Backdrop.tsx
    │   │   └── SidebarWidget.tsx
    │   ├── lib
    │   │   ├── cloudinary.ts
    │   │   ├── utils.ts
    │   │   └── utils2.ts
    │   ├── middleware.ts
    │   ├── providers
    │   │   └── Providers.tsx
    │   ├── schemas
    │   │   ├── academic-week.schemas.ts
    │   │   ├── attendance.schemas.ts
    │   │   ├── bimester.schema.ts
    │   │   ├── course-assignment.schema.ts
    │   │   ├── courseGradeSchema.ts
    │   │   ├── courses.ts
    │   │   ├── enrollment.ts
    │   │   ├── erica-evaluations.ts
    │   │   ├── erica-topics.ts
    │   │   ├── grade.ts
    │   │   ├── gradeCycle.ts
    │   │   ├── holiday.schema.ts
    │   │   ├── permissions.ts
    │   │   ├── qna.ts
    │   │   ├── roles.ts
    │   │   ├── schedule-config.ts
    │   │   ├── schedule.ts
    │   │   ├── SchoolCycle.ts
    │   │   ├── section.ts
    │   │   ├── signin-schema.ts
    │   │   ├── Students.ts
    │   │   └── user-form.schema.ts
    │   ├── services
    │   │   ├── academic-weeks.ts
    │   │   ├── api.ts
    │   │   ├── attendanceConfigService.ts
    │   │   ├── attendanceService.ts
    │   │   ├── authService.ts
    │   │   ├── course-assignments.ts
    │   │   ├── course-grade.ts
    │   │   ├── enrollment.service.ts
    │   │   ├── erica-topics.ts
    │   │   ├── ericaEvaluationService.ts
    │   │   ├── globalService.ts
    │   │   ├── gradeCycles.ts
    │   │   ├── gradeCycleService.ts
    │   │   ├── gradeService.ts
    │   │   ├── justificationService.ts
    │   │   ├── permissionsService.ts
    │   │   ├── qnaService.ts
    │   │   ├── reportService.ts
    │   │   ├── rolesService.ts
    │   │   ├── schedule.ts
    │   │   ├── ScheduleConfig.ts
    │   │   ├── sectionService.ts
    │   │   ├── teacherService.ts
    │   │   ├── useCloudinary.ts
    │   │   ├── useCourses.ts
    │   │   ├── useHoliday.ts
    │   │   ├── usePermission.ts
    │   │   ├── useRole.ts
    │   │   ├── useSchoolBimester.ts
    │   │   ├── useSchoolCycles.ts
    │   │   ├── useStudents.ts
    │   │   └── useUser.ts
    │   ├── svg.d.ts
    │   ├── theme
    │   │   └── attendanceConfigTheme.ts
    │   ├── types
    │   │   ├── academic-week.types.ts
    │   │   ├── api.ts
    │   │   ├── attendance.ts
    │   │   ├── attendanceConfig.ts
    │   │   ├── attendanceTypes.ts
    │   │   ├── auth.ts
    │   │   ├── course-assignments.ts
    │   │   ├── course-grade.types.ts
    │   │   ├── courses.ts
    │   │   ├── enrollment.types.ts
    │   │   ├── erica-evaluations.ts
    │   │   ├── erica-topics.ts
    │   │   ├── global.ts
    │   │   ├── gradeCycles.ts
    │   │   ├── grades.ts
    │   │   ├── holiday.ts
    │   │   ├── justification.ts
    │   │   ├── permission.ts
    │   │   ├── permissions.ts
    │   │   ├── qna.ts
    │   │   ├── report.ts
    │   │   ├── role.ts
    │   │   ├── roles.ts
    │   │   ├── schedule-config.d.ts
    │   │   ├── schedules.ts
    │   │   ├── schedules.types.ts
    │   │   ├── SchoolBimesters.ts
    │   │   ├── SchoolCycle.ts
    │   │   ├── sections.ts
    │   │   ├── signin.ts
    │   │   ├── student.ts
    │   │   ├── teacher.types.ts
    │   │   └── user.ts
    │   └── utils
    │       ├── attendanceHelpers.ts
    │       ├── cleanNulls.ts
    │       ├── date-helpers.ts
    │       ├── date.ts
    │       ├── dateUtils.ts
    │       ├── exportUtils.ts
    │       ├── getInitials.ts
    │       ├── RoleBadgeColor.tsx
    │       └── transformToCreateUserPayload.ts
    └── tsconfig.json
