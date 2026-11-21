"use client";
import { useState, type ChangeEvent, type SyntheticEvent } from "react";
import { clientApi, getErrorMessage } from "@/lib/axios-client";
import { uploadImage } from "@/lib/uploadimage";
import ModalShell from "@/app/components/perfil/ModalShell";
import "./store-modal.css";

export type StoreCategory = { id: number; name: string };

export type EditableStore = {
  id: number;
  name: string;
  categoryId: number;
  stickerUrl: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
};

type ImageField = "sticker" | "logo" | "banner";
type SelectedImage = { file: File; preview: string };

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const IMAGE_FIELDS: { key: ImageField; label: string }[] = [
  { key: "sticker", label: "Anexe a foto de perfil de sua loja" },
  { key: "logo", label: "Anexe a logo em SVG de sua loja" },
  { key: "banner", label: "Anexe o banner de sua loja" },
];

type StoreModalProps = {
  categories: StoreCategory[];
  store?: EditableStore;
  onClose: () => void;
  onSaved: (storeId: number) => void;
  onDeleted?: () => void;
};

export default function StoreModal({
  categories,
  store,
  onClose,
  onSaved,
  onDeleted,
}: StoreModalProps) {
  const editing = store !== undefined;
  const [name, setName] = useState(store?.name ?? "");
  const [categoryId, setCategoryId] = useState(store ? String(store.categoryId) : "");
  const [images, setImages] = useState<Record<ImageField, SelectedImage | null>>({
    sticker: null,
    logo: null,
    banner: null,
  });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const savedUrls: Record<ImageField, string | null> = {
    sticker: store?.stickerUrl ?? null,
    logo: store?.logoUrl ?? null,
    banner: store?.bannerUrl ?? null,
  };

  function handleImage(field: ImageField, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > MAX_IMAGE_SIZE) {
      setError("Escolha uma imagem de até 5 MB.");
      return;
    }
    setError("");
    const previous = images[field];
    if (previous) URL.revokeObjectURL(previous.preview);
    setImages((current) => ({
      ...current,
      [field]: { file, preview: URL.createObjectURL(file) },
    }));
  }

  async function imageUrl(field: ImageField) {
    const selected = images[field];
    return selected ? uploadImage(selected.file) : savedUrls[field];
  }

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    const missing = IMAGE_FIELDS.some(({ key }) => !images[key] && !savedUrls[key]);
    if (missing) {
      setError("Anexe a foto de perfil, a logo e o banner da loja.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const [sticker_url, logo_url, banner_url] = await Promise.all(
        IMAGE_FIELDS.map(({ key }) => imageUrl(key)),
      );
      const body = {
        name: name.trim(),
        category_id: Number(categoryId),
        sticker_url,
        logo_url,
        banner_url,
      };
      if (store) {
        await clientApi.patch(`/api/lojas/${store.id}`, body);
        onSaved(store.id);
      } else {
        const { data } = await clientApi.post<{ id: number }>("/api/lojas", body);
        onSaved(data.id);
      }
    } catch (error) {
      setError(getErrorMessage(error, "Não foi possível salvar a loja. Tente novamente."));
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!store || loading) return;
    setError("");
    setLoading(true);
    try {
      await clientApi.delete(`/api/lojas/${store.id}`);
      onDeleted?.();
    } catch (error) {
      setError(getErrorMessage(error, "Não foi possível deletar a loja. Tente novamente."));
      setLoading(false);
    }
  }

  const saving = loading && !confirmDelete;
  const submitLabel = editing
    ? saving ? "Salvando..." : "Salvar"
    : saving ? "Adicionando..." : "Adicionar";

  return (
    <ModalShell labelledBy="store-modal-title" onClose={onClose}>
      <h2 id="store-modal-title" className="product-modal__title">
        {editing ? "Editar loja" : "Adicionar loja"}
      </h2>

      <form className="product-modal__form" onSubmit={handleSubmit}>
        <input
          className="product-modal__field"
          placeholder="Nome da loja"
          aria-label="Nome da loja"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          required
        />

        <select
          className="product-modal__field product-modal__select"
          aria-label="Categoria"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={categories.length === 0}
          required
        >
          <option value="" disabled>
            Categoria
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {IMAGE_FIELDS.map(({ key, label }) => {
          const preview = images[key]?.preview ?? savedUrls[key];
          return (
            <label key={key} className={`store-upload store-upload--${key}`}>
              {preview ? (
                <img src={preview} alt="" className="store-upload__preview" />
              ) : (
                <UploadIcon />
              )}
              <span>{preview ? `${label} (trocar imagem)` : label}</span>
              <input
                type="file"
                accept="image/*"
                className="photo-slot__input"
                onChange={(e) => handleImage(key, e)}
              />
            </label>
          );
        })}

        {error && (
          <p className="product-modal__error" role="alert">
            {error}
          </p>
        )}

        {editing &&
          (confirmDelete ? (
            <div className="profile-modal__confirm" role="alert">
              <p>Deletar esta loja e todos os produtos dela? Isso não pode ser desfeito.</p>
              <div>
                <button
                  type="button"
                  className="profile-modal__outline"
                  onClick={() => setConfirmDelete(false)}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="profile-modal__outline profile-modal__outline--danger"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? "Deletando..." : "Deletar"}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="store-delete"
              onClick={() => setConfirmDelete(true)}
              disabled={loading}
            >
              DELETAR
            </button>
          ))}

        <button type="submit" className="product-modal__submit" disabled={loading}>
          {submitLabel}
        </button>
      </form>
    </ModalShell>
  );
}

function UploadIcon() {
  return (
    <svg width="26" height="32" viewBox="0 0 24 30" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3 0h12l9 9v18a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3Z"
      />
      <path
        d="M12 23v-9m-4 4 4-4 4 4"
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
