'use client';
import { useState, type SyntheticEvent } from 'react';
import { clientApi, getErrorMessage } from '@/lib/axios-client';
import ModalShell from './ModalShell';

interface ChangePasswordModalProps {
  onClose: () => void;
  onBack: () => void;
}

const MIN_LENGTH = 6;

export default function ChangePasswordModal({ onClose, onBack }: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (newPassword.length < MIN_LENGTH) {
      setError(`A nova senha deve ter pelo menos ${MIN_LENGTH} caracteres.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('A confirmação não é igual à nova senha.');
      return;
    }

    setLoading(true);
    try {
      await clientApi.patch('/api/perfil/senha', { oldPassword, newPassword, confirmPassword });
      setDone(true);
    } catch (error) {
      setError(getErrorMessage(error, 'Não foi possível alterar a senha. Tente novamente.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell labelledBy="change-password-title" onClose={onClose} onBack={onBack}>
      <h2 id="change-password-title" className="profile-modal__sr-only">
        Alterar senha
      </h2>

      <svg className="profile-modal__key" width="110" height="110" viewBox="0 0 110 110" aria-hidden="true">
        <circle cx="80" cy="30" r="27" fill="#a98ef5" />
        <circle cx="87" cy="22" r="5" fill="#fff" />
        <path d="M62 48 12 98M24 86l10 10M34 76l8 8" stroke="#6b3cf0" strokeWidth="9" strokeLinecap="round" />
      </svg>

      {done ? (
        <div className="profile-modal__done" role="status">
          <p>Senha alterada com sucesso.</p>
          <button type="button" className="product-modal__submit profile-modal__wide" onClick={onClose}>
            Fechar
          </button>
        </div>
      ) : (
        <form className="product-modal__form" onSubmit={handleSubmit}>
          <input type="password" autoComplete="current-password" className="product-modal__field" placeholder="Senha Antiga" aria-label="Senha antiga" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
          <input type="password" autoComplete="new-password" className="product-modal__field" placeholder="Nova Senha" aria-label="Nova senha" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <input type="password" autoComplete="new-password" className="product-modal__field" placeholder="Confirmar Senha" aria-label="Confirmar nova senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />

          {error && (
            <p className="product-modal__error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="product-modal__submit profile-modal__wide profile-modal__save-password" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Senha'}
          </button>
        </form>
      )}
    </ModalShell>
  );
}