"use client";
import { useState, type ChangeEvent, type SyntheticEvent } from "react";
import { clientApi, getErrorMessage } from "@/lib/axios-client";
import { uploadImage } from "@/lib/uploadimage";
import ModalShell from "@/app/components/perfil/ModalShell";
import "./store-modal.css";

export type StoreCategory = { id: number; name: string };

type ImageField = "sticker" | "logo" | "banner";
type SelectedImage = { file: File; preview: string };

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const IMAGE_FIELDS: { key: ImageField; label: string }[] = [
  { key: "sticker", label: "Anexe a foto de perfil de sua loja" },
  { key: "logo", label: "Anexe a logo em SVG de sua loja" },
  { key: "banner", label: "Anexe o banner de sua loja" },
];

type CreateStoreModalProps = {
  categories: StoreCategory[];
  onClose: () => void;
  onCreated: (storeId: number) => void;
};

export default function CreateStoreModal({
  categories,
  onClose,
  onCreated,
}: CreateStoreModalProps) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [images, setImages] = useState<Record<ImageField, SelectedImage | null>>({
    sticker: null,
    logo: null,
    banner: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    const { sticker, logo, banner } = images;
    if (!sticker || !logo || !banner) {
      setError("Anexe a foto de perfil, a logo e o banner da loja.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const [sticker_url, logo_url, banner_url] = await Promise.all(
        [sticker, logo, banner].map((image) => uploadImage(image.file)),
      );
      const { data } = await clientApi.post<{ id: number }>("/api/lojas", {
        name: name.trim(),
        category_id: Number(categoryId),
        sticker_url,
        logo_url,
        banner_url,
      });
      onCreated(data.id);
    } catch (error) {
      setError(
        getErrorMessage(error, "Não foi possível criar a loja. Tente novamente."),
      );
      setLoading(false);
    }
  }

  return (
    <ModalShell labelledBy="create-store-title" onClose={onClose}>
      <h2 id="create-store-title" className="product-modal__title">
        Adicionar loja
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

        {IMAGE_FIELDS.map(({ key, label }) => (
          <label
            key={key}
            className={`store-upload store-upload--${key}`}
          >
            {images[key] ? (
              <img src={images[key].preview} alt="" className="store-upload__preview" />
            ) : (
              <UploadIcon />
            )}
            <span>{images[key] ? `${label} (trocar imagem)` : label}</span>
            <input
              type="file"
              accept="image/*"
              className="photo-slot__input"
              onChange={(e) => handleImage(key, e)}
            />
          </label>
        ))}

        {error && (
          <p className="product-modal__error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="product-modal__submit" disabled={loading}>
          {loading ? "Adicionando..." : "Adicionar"}
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
