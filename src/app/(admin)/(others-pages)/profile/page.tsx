import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';
import { UserProfilePageContent } from '@/components/features/user-profile';

export const metadata = {
  title: 'Mi Perfil - Sistema Escolar',
  description: 'Gestiona tu perfil personal y configuración de cuenta',
};

export default function UserProfilePage() {
  return (
    <ProtectedPage module="user-profile" action="read">
      <main className="p-6 space-y-6">
        <UserProfilePageContent />
      </main>
    </ProtectedPage>
  );
}
