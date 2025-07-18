// src/hooks/useUser.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
// Añade esta importación al inicio del archivo
import { z } from "zod";
import { 
  UserFormSchema, 
  userCreateSchema, 
  userUpdateSchema,
  getUserFormSchema 
} from '@/schemas/user-form.schema';
import { createUser, getUsers, changeUserStatus, getUserById, updateUser } from '@/services/useUser';
import { User } from '@/types/user';
import { transformToCreateUserPayload } from '@/utils/transformToCreateUserPayload';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { deleteImageFromCloudinary } from '@/services/useCloudinary';

export function useUser(isEditMode: boolean = false) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  const [userLoaded, setUserLoaded] = useState(false);
  const router = useRouter();
const schema = useMemo(() => getUserFormSchema(isEditMode), [isEditMode]);

  console.log("isEditMode:", isEditMode);
  console.log("Usando schema:", schema === userUpdateSchema ? 'UPDATE' : 'CREATE');
  const form = useForm<UserFormSchema>({
  resolver: zodResolver(schema),
    defaultValues: {
      username: '',
      email: '',
      password: isEditMode ? '' : undefined, // Manejo diferente según el modo
      dpi: '',
      nit: '',
      givenNames: '',
      lastNames: '',
      phone: '',
      birthDate: new Date(),
      gender: 'Masculino',
      canAccessPlatform: false,
      profileImage: undefined,
      picture: undefined,
      roleId: undefined,
      parentDetails: { occupation: '', workplace: '' },
      teacherDetails: {
        hiredDate: new Date(),
        isHomeroomTeacher: false,
        academicDegree: '',
      },
      address: {
        street: '',
        zone: '',
        municipality: '',
        department: 'Guatemala',
      },
    },
  });

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setUsersError(null);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err: any) {
      setUsersError(err.message || 'Error al obtener los usuarios');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onSubmit = async (values: UserFormSchema) => {
    let pictureData: { url: string; publicId: string } | undefined = undefined;

    try {
      if (values.profileImage instanceof File) {
        pictureData = await uploadImageToCloudinary(values.profileImage);
      }

      // Aquí podemos hacer type assertion ya que sabemos que en creación el password es requerido
      const payload = transformToCreateUserPayload(values as z.infer<typeof userCreateSchema>, pictureData);
      await createUser(payload);

      toast.success("Usuario creado exitosamente 🎉");
      form.reset();
      await fetchUsers();
    } catch (error: any) {
      console.error(error);

      if (pictureData?.publicId) {
        try {
          await deleteImageFromCloudinary(pictureData.publicId);
        } catch (deleteError) {
          console.warn("No se pudo eliminar la imagen de Cloudinary:", deleteError);
        }
      }

      setErrorMessage(error.message || "Ocurrió un error");
      setErrorDetails(error.details ?? []);
      toast.error(error.message || "Ocurrió un error");
    }
  };

  const toggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const updatedUser = await changeUserStatus(userId, !currentStatus);
      toast.success(`Usuario ${updatedUser.isActive ? 'activado' : 'desactivado'} correctamente`);
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Ocurrió un error al cambiar el estado del usuario');
    }
  };

  const loadUserById = async (userId: number) => {
    try {
      const user = await getUserById(userId);
      if (user) {
        form.reset({
          ...user,
          password: '', // Password vacío en modo edición
          gender: normalizarGenero(user.gender),
         profileImage: user.pictures?.[0]?.url ?? null,
          birthDate: user.birthDate ? new Date(user.birthDate) : new Date(),
          teacherDetails: user.teacherDetails
            ? {
                ...user.teacherDetails,
                hiredDate: new Date(user.teacherDetails.hiredDate),
              }
            : {
                hiredDate: new Date(),
                isHomeroomTeacher: false,
                academicDegree: '',
              },
          parentDetails: user.parentDetails ?? {
            occupation: '',
            workplace: '',
          },
          address: user.address ?? {
            street: '',
            zone: '',
            municipality: '',
            department: '',
          },
        });
        setUserLoaded(true);
      }
    } catch (error) {
      console.error("Error al cargar el usuario:", error);
    }
  };

  // En la función onUpdate
const onUpdate = async (userId: number, values: UserFormSchema) => {
  try {
    // Transforma el payload antes de enviarlo
    const updateValues = {
      ...values,
      password: values.password === '' ? undefined : values.password
    };

    let pictureData;
    if (values.profileImage instanceof File) {
      pictureData = await uploadImageToCloudinary(values.profileImage);
    }

    const payload = transformToCreateUserPayload(
      updateValues as z.infer<typeof userUpdateSchema>,
      pictureData
    );
    
    await updateUser(userId, payload);
    toast.success("Usuario actualizado exitosamente 🎉");
    router.push('/users/list');
  } catch (error: any) {
    // Manejo de errores...
  }
};

  return {
    form,
    onSubmit,
    errorDetails,
    errorMessage,
    users,
    isLoadingUsers,
    usersError,
    refetchUsers: fetchUsers,
    toggleUserStatus,
    loadUserById,
    onUpdate,
    userLoaded
  };
}

function normalizarGenero(g: string | undefined): "Masculino" | "Femenino" | "Otro" | undefined {
  if (!g) return undefined;
  const normalizado = g.trim().toLowerCase();
  if (normalizado === "masculino") return "Masculino";
  if (normalizado === "femenino") return "Femenino";
  if (normalizado === "otro") return "Otro";
  return undefined;
}