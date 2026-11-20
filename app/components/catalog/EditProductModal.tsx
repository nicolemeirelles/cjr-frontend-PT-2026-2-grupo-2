'use client';
import { useState, useEffect, ChangeEvent, SyntheticEvent } from 'react';
import { clientApi, getErrorMessage } from '@/lib/axios-client';
import { uploadImage } from '@/lib/uploadimage';
import './ModalProduct.css';
import './EditProductModal.css';

export interface CategoryOption {
  id: number;
  name: string;
  group?: string; 
}

export interface EditableProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number | null;
  images: { id: number; url: string }[]; 
}

interface EditProductModalProps {
  product: EditableProduct;
  categories: CategoryOption[];
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}

type Photo =
  | { kind: 'existing'; id: number; url: string }
  | { kind: 'new'; file: File; preview: string };

const SLOTS = 4;
const MIN_STOCK = 0;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5 MB

const photoUrl = (photo: Photo) => (photo.kind === 'existing' ? photo.url : photo.preview);

export default function EditProductModal({
  product,
  categories,
  onClose,
  onSaved,
  onDeleted,
}: EditProductModalProps) {
  const [photos, setPhotos] = useState<(Photo | null)[]>(() =>
    Array.from({ length: SLOTS }, (_, index) => {
      const image = product.images[index];
      return image ? { kind: 'existing' as const, id: image.id, url: image.url } : null;
    }),
  );
  const [name, setName] = useState(product.name);
  const [categoryId, setCategoryId] = useState(() =>
    categories.some((category) => category.id === product.categoryId) ? String(product.categoryId) : '',
  );
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(product.stock);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');
  const busy = saving || deleting;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  function releasePreview(photo: Photo | null) {
    if (photo?.kind === 'new') URL.revokeObjectURL(photo.preview);
  }

  function handlePhotoChange(index: number, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; 
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Escolha um arquivo de imagem (JPG, PNG, WebP...).');
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setError('Cada foto pode ter no máximo 5 MB.');
      return;
    }
    setError('');
    releasePreview(photos[index]);
    const newPhoto: Photo = { kind: 'new', file, preview: URL.createObjectURL(file) };
    setPhotos((prev) => prev.map((photo, i) => (i === index ? newPhoto : photo)));
  }

  function handleRemovePhoto(index: number) {
    releasePreview(photos[index]);
    setPhotos((prev) => prev.map((photo, i) => (i === index ? null : photo)));
  }

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setError('');

    if (!photos[0]) {
      setError('Adicione pelo menos a foto principal do produto.');
      return;
    }

    setSaving(true);
    try {
      const filled = photos.filter((photo): photo is Photo => photo !== null);
      const images = await Promise.all(
        filled.map(async (photo) =>
          photo.kind === 'existing' ? { id: photo.id, url: photo.url } : { url: await uploadImage(photo.file) },
        ),
      );

      await clientApi.patch(`/api/produtos/${product.id}`, {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        stock,
        category_id: Number(categoryId),
        images,
      });

      filled.forEach(releasePreview);
      onSaved();
    } catch (error) {
      setError(getErrorMessage(error, 'Não foi possível salvar o produto. Tente novamente.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (busy) return;
    setError('');
    setDeleting(true);
    try {
      await clientApi.delete(`/api/produtos/${product.id}`);
      photos.forEach(releasePreview);
      onDeleted();
    } catch (error) {
      setError(getErrorMessage(error, 'Não foi possível deletar o produto. Tente novamente.'));
      setDeleting(false);
    }
  }

  return (
    <div
      className="product-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div className="product-modal" role="dialog" aria-modal="true" aria-labelledby="edit-product-title">
        <button type="button" className="product-modal__close" aria-label="Fechar" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>

        <h2 id="edit-product-title" className="product-modal__title">
          Editar Produto
        </h2>

        <form className="product-modal__form" onSubmit={handleSubmit}>
          <div className="product-modal__photos">
            {photos.map((photo, index) => (
              <PhotoSlot
                key={index}
                preview={photo ? photoUrl(photo) : null}
                large={index === 0}
                label={index === 0 ? 'Foto principal do produto' : `Foto ${index + 1} do produto`}
                onSelect={(e) => handlePhotoChange(index, e)}
                onRemove={() => handleRemovePhoto(index)}
              />
            ))}
          </div>

          <input
            type="text"
            className="product-modal__field"
            placeholder="Nome do produto"
            aria-label="Nome do produto"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <select
            className="product-modal__field product-modal__select"
            aria-label="Subcategoria"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={categories.length === 0}
            required
          >
            <option value="" disabled>
              Subcategoria
            </option>
            {groupCategories(categories).map(([group, options]) =>
              group ? (
                <optgroup key={group} label={group}>
                  {options.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </optgroup>
              ) : (
                options.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              ),
            )}
          </select>

          <textarea
            className="product-modal__field product-modal__textarea"
            placeholder="Descrição do produto"
            aria-label="Descrição do produto"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            type="number"
            className="product-modal__field"
            placeholder="Preço do produto"
            aria-label="Preço do produto"
            min="0.01"
            max="999999.99"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          {confirmDelete ? (
            <div className="product-modal__confirm" role="alert">
              <p>Deletar este produto? As fotos e as avaliações também serão apagadas. Não dá para desfazer.</p>
              <div className="product-modal__confirm-actions">
                <button
                  type="button"
                  className="product-modal__cancel"
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                >
                  Cancelar
                </button>
                <button type="button" className="product-modal__delete" onClick={handleDelete} disabled={busy}>
                  {deleting ? 'Deletando...' : 'Deletar produto'}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="product-modal__delete"
              onClick={() => setConfirmDelete(true)}
              disabled={busy}
            >
              DELETAR
            </button>
          )}

          <div className="product-modal__quantity" role="group" aria-label="Quantidade em estoque">
            <button
              type="button"
              className="product-modal__quantity-btn"
              aria-label="Diminuir estoque"
              disabled={stock <= MIN_STOCK}
              onClick={() => setStock((s) => Math.max(MIN_STOCK, s - 1))}
            >
              −
            </button>
            <span className="product-modal__quantity-value" aria-live="polite">
              {stock}
            </span>
            <button
              type="button"
              className="product-modal__quantity-btn"
              aria-label="Aumentar estoque"
              onClick={() => setStock((s) => s + 1)}
            >
              +
            </button>
          </div>

          {error && (
            <p className="product-modal__error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="product-modal__submit" disabled={busy}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </div>
    </div>
  );
}
  function groupCategories(categories: CategoryOption[]): [string, CategoryOption[]][] {
  const groups = new Map<string, CategoryOption[]>();
  for (const category of categories) {
    const key = category.group ?? '';
    groups.set(key, [...(groups.get(key) ?? []), category]);
  }
  return [...groups.entries()];
}

  interface PhotoSlotProps {
  preview: string | null;
  large: boolean;
  label: string;
  onSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

  function PhotoSlot({ preview, large, label, onSelect, onRemove }: PhotoSlotProps) {
  return (
    <div className={`photo-slot${large ? ' photo-slot--large' : ''}`}>
      <label className="photo-slot__label">
        {preview ? (
          <img src={preview} alt="Foto do produto" className="photo-slot__img" />
        ) : (
          <>
            <CameraPlusIcon />
            {large && <span>Anexe as fotos do seu produto</span>}
          </>
        )}
        <input type="file" accept="image/*" className="photo-slot__input" aria-label={label} onChange={onSelect} />
      </label>

      {preview && (
        <button type="button" className="photo-slot__remove" aria-label="Remover foto" onClick={onRemove}>
          ×
        </button>
      )}
    </div>
  );
}

  function CameraPlusIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17 8l-2.6 4H9a4 4 0 0 0-4 4v18a4 4 0 0 0 4 4h30a4 4 0 0 0 4-4V16a4 4 0 0 0-4-4h-5.4L31 8H17z"
      />
      <circle cx="24" cy="25" r="8" fill="#fff" />
      <circle cx="24" cy="25" r="5" fill="currentColor" />
      <circle cx="38" cy="37" r="8" fill="#fff" />
      <path d="M38 33v8M34 37h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}