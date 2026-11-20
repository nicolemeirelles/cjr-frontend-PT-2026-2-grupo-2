'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EditProfileModal, { type ProfileUser } from './EditProfileModal';
import ChangePasswordModal from './ChangePasswordModal';

type OpenModal = 'none' | 'profile' | 'password';

export default function EditProfileButton({ user }: { user: ProfileUser }) {
  const [open, setOpen] = useState<OpenModal>('none');
  const router = useRouter();
  const close = () => setOpen('none');

  return (
      <button type="button" className="profile-edit" onClick={() => setOpen('profile')}>
        Editar Perfil
      </button>

      {open === 'profile' && (
        <EditProfileModal
          user={user}
          onClose={close}
          onChangePassword={() => setOpen('password')}
          onSaved={() => {
            close();
            router.refresh();
          }}
          onDeleted={() => {
            router.push('/'); 
            router.refresh();
          }}
        />
      )}

      {open === 'password' && <ChangePasswordModal onClose={close} onBack={() => setOpen('profile')} />}
    </>
  );
}
