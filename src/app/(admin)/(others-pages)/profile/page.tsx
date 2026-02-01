import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';
import { UserProfilePageContent } from '@/components/features/user-profile';
import { USER_PROFILE_PERMISSIONS } from '@/constants/modules-permissions/user-profile/user-profile.permissions';

export const metadata = {
  title: 'Mi Perfil - Sistema Escolar',
  description: 'Gestiona tu perfil personal y configuración de cuenta',
};

export default function UserProfilePage() {
  return (
    <ProtectedPage {...USER_PROFILE_PERMISSIONS.READ}>
      <main className="p-6 space-y-6">
        <UserProfilePageContent />
      </main>
    </ProtectedPage>
  );
}
