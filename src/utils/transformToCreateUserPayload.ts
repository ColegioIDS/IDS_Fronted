  import { CreateUserPayload } from "@/types/user";
  import { UserFormSchema } from "@/schemas/user-form.schema";

  
export function transformToCreateUserPayload(
  formData: UserFormSchema,
  pictureData?: { url: string; publicId: string }
): CreateUserPayload { 

    const isTeacher = formData.roleId === 2;
    const isParent = formData.roleId === 1;

    const payload: CreateUserPayload = {
      username: formData.username,
      email: formData.email,
      password: formData.password ?? "",
      givenNames: formData.givenNames,
      lastNames: formData.lastNames,
      dpi: formData.dpi,
      nit: formData.nit,
      phone: formData.phone,
      gender: formData.gender,
      birthDate: formData.birthDate.toISOString(),
      canAccessPlatform: formData.canAccessPlatform,
      roleId: formData.roleId ?? null,
     // accountType: formData.accountType,
      isActive: true,
      accountVerified: false,
      address: formData.address,
    };


    if (pictureData) {
    payload.pictures = [{
      kind: 'profile',
      url: pictureData.url,
      publicId: pictureData.publicId,
      description: 'Foto de perfil',
    }];
  }

    if (isParent && formData.parentDetails) {
      payload.parentDetails = formData.parentDetails;
    }

    if (isTeacher && formData.teacherDetails) {
      payload.teacherDetails = {
        hiredDate: formData.teacherDetails.hiredDate?.toISOString() ?? "",
        isHomeroomTeacher: formData.teacherDetails.isHomeroomTeacher,
        academicDegree: formData.teacherDetails.academicDegree,
      };
    }

    return payload;
  }
