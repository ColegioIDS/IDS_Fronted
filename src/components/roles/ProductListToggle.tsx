import React, { useState } from "react";
import { Modal } from "@/components/ui/modal"; // Ajusta la ruta según corresponda

const ModalExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenModal = () => setIsOpen(true);
  const handleCloseModal = () => setIsOpen(false);

  const roles = [
    {
      id: 1,
      name: "Support2",
      description: "Soporte técnico",
      isActive: true,
      permissions: [
        {
          id: 1,
          module: "test",
          action: "test",
          description: null,
          isActive: true,
          isSystem: false,
          createdAt: "2025-06-24T18:13:44.614Z",
          updatedAt: "2025-06-24T18:13:44.614Z",
        },
      ],
      createdBy: null,
    },
    {
      id: 5,
      name: "Support22",
      description: "Soporte técnico",
      isActive: true,
      permissions: [
        {
          id: 1,
          module: "test",
          action: "test",
          description: null,
          isActive: true,
          isSystem: false,
          createdAt: "2025-06-24T18:13:44.614Z",
          updatedAt: "2025-06-24T18:13:44.614Z",
        },
      ],
      createdBy: {
        id: 5,
        fullName: "Juan Carlos Perez Sanchez",
      },
    },
  ];



  return (
    <div>
      <button
        onClick={handleOpenModal}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Abrir Modal
      </button>

      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        className="max-w-4xl p-6"
        showCloseButton={true}
        isFullscreen={false}
        disableBackdropClose={false}
      >
        <h2 className="text-2xl font-bold mb-4">Permisos por Rol</h2>

        <div className="space-y-6">
          {roles.map((role) => (
            <div key={role.id} className="border p-4 rounded-lg bg-gray-50">
              <h3 className="text-xl font-semibold">{role.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{role.description}</p>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Módulo</th>
                      <th className="px-4 py-2 text-left">Acción</th>
                      <th className="px-4 py-2 text-left">Descripción</th>
                      <th className="px-4 py-2 text-left">Activo</th>
                      <th className="px-4 py-2 text-left">Sistema</th>
                    </tr>
                  </thead>
                  <tbody>
                    {role.permissions.map((perm) => (
                      <tr key={perm.id} className="border-t border-gray-200">
                        <td className="px-4 py-2">{perm.module}</td>
                        <td className="px-4 py-2">{perm.action}</td>
                        <td className="px-4 py-2">
                          {perm.description ?? (
                            <span className="italic text-gray-400">Sin descripción</span>
                          )}
                        </td>
                        <td className="px-4 py-2">{perm.isActive ? "✅" : "❌"}</td>
                        <td className="px-4 py-2">{perm.isSystem ? "✅" : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button
            onClick={handleCloseModal}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Cerrar
          </button>
        </div>
      </Modal>



    </div>
  );
};

export default ModalExample;
