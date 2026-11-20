'use client';
import { useState, type ChangeEvent, type SyntheticEvent } from 'react';
import { clientApi, getErrorMessage } from '@/lib/axios-client';
import { uploadImage } from '@/lib/uploadimage';
import ModalShell from './ModalShell';

export interface ProfileUser {
  name: string;
  username: string;
  email: string;
  profile_picture_url: string | null;
}

interface EditProfileModalProps {
  user: ProfileUser;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
  onChangePassword: () => void;
}

const MAX_PHOTO_SIZE = 5 * 1024 * 1024; 

export default function EditProfileModal({ user, onClose, onSaved, onDeleted, onChangePassword }: EditProfileModalProps) {
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [photo, setPhoto] = useState<{ file: File; preview: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const photoSrc = photo?.preview ?? user.profile_picture_url;

  function handlePhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > MAX_PHOTO_SIZE) {
      setError('Escolha uma imagem de até 5 MB.');
      return;
    }
    setError('');
    if (photo) URL.revokeObjectURL(photo.preview);
    setPhoto({ file, preview: URL.createObjectURL(file) });
  }

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      const profile_picture_url = photo ? await uploadImage(photo.file) : undefined;
      await clientApi.patch('/api/perfil', { name, username, email, profile_picture_url });
      onSaved();
    } catch (error) {
      setError(getErrorMessage(error, 'Não foi possível salvar o perfil. Tente novamente.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      await clientApi.delete('/api/perfil');
      onDeleted();
    } catch (error) {
      setError(getErrorMessage(error, 'Não foi possível deletar a conta. Tente novamente.'));
      setLoading(false);
    }
  }

  return (
    <ModalShell labelledBy="edit-profile-title" onClose={onClose}>
      <h2 id="edit-profile-title" className="profile-modal__sr-only">
        Editar perfil
      </h2>

      <form className="product-modal__form" onSubmit={handleSubmit}>
        <label className="profile-modal__avatar">
          {photoSrc ? (
            <img src={photoSrc} alt="Sua foto de perfil" />
          ) : (
            <span className="profile-modal__avatar-empty" aria-hidden="true">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="profile-modal__camera" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 3 7.2 5H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.2L15 3H9Zm3 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
            </svg>
          </span>
          <input type="file" accept="image/*" className="photo-slot__input" aria-label="Trocar foto de perfil" onChange={handlePhoto} />
        </label>

        <input className="product-modal__field" placeholder="Nome" aria-label="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="product-modal__field" placeholder="Username" aria-label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="email" className="product-modal__field" placeholder="Email" aria-label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        {error && (
          <p className="product-modal__error" role="alert">
            {error}
          </p>
        )}

        <div className="profile-modal__actions">
          {confirmDelete ? (
            <div className="profile-modal__confirm" role="alert">
              <p>Deletar sua conta? Isso não pode ser desfeito.</p>
              <div>
                <button type="button" className="profile-modal__outline" onClick={() => setConfirmDelete(false)} disabled={loading}>
                  Cancelar
                </button>
                <button type="button" className="profile-modal__outline profile-modal__outline--danger" onClick={handleDelete} disabled={loading}>
                  {loading ? 'Deletando...' : 'Deletar'}
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="profile-modal__outline profile-modal__outline--danger" onClick={() => setConfirmDelete(true)} disabled={loading}>
              Deletar conta
            </button>
          )}
          <button type="button" className="profile-modal__outline" onClick={onChangePassword} disabled={loading}>
            Alterar senha
          </button>
          <button type="submit" className="product-modal__submit profile-modal__wide" disabled={loading}>
            {loading && !confirmDelete ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}