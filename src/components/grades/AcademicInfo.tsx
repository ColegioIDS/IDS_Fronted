// src/components/grades/AcademicInfo.tsx
export default function AcademicInfo() {
    return (
        <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200/50">
            <div className="flex items-center justify-between">
                <div>
                    <h5 className="font-semibold text-gray-800 mb-1">Año Académico</h5>
                    <p className="text-sm text-gray-600">2024-2025</p>
                </div>
                <div className="text-right">
                    <h5 className="font-semibold text-gray-800 mb-1">Total Estudiantes</h5>
                    <p className="text-2xl font-bold text-gray-700">1,248</p>
                </div>
                <div className="text-right">
                    <h5 className="font-semibold text-gray-800 mb-1">Capacidad</h5>
                    <p className="text-sm text-green-600 font-medium">95% ocupada</p>
                </div>
            </div>
        </div>
    )
}