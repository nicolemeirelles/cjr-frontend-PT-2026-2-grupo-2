'use client';
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { clientApi, getErrorMessage } from '@/lib/axios-client';
import { uploadImage } from '@/lib/uploadimage';
import './ModalProduct.css';

export interface Category {
  id: number;
  name: string;
  group?: string;
}

interface CreateModalProductProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  storeId: number;
  categories: Category[];
}

interface Photo {
  file: File;
  preview: string;
}

const MIN_STOCK = 0;
const INITIAL_STOCK = 1;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

export default function CreateProductModal({
  isOpen,
  onClose,
  onSuccess,
  storeId,
  categories,
}: CreateModalProductProps) {
  const [photos, setPhotos] = useState<(Photo | null)[]>([null, null, null, null]);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState(INITIAL_STOCK);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen, onClose]);

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

    const oldPhoto = photos[index];
    if (oldPhoto) URL.revokeObjectURL(oldPhoto.preview);

    const preview = URL.createObjectURL(file);
    setPhotos((prev) => prev.map((photo, i) => (i === index ? { file, preview } : photo)));
  }

  function handleRemovePhoto(index: number) {
    const photo = photos[index];
    if (photo) URL.revokeObjectURL(photo.preview);
    setPhotos((prev) => prev.map((p, i) => (i === index ? null : p)));
  }

  function resetForm() {
    photos.forEach((photo) => {
      if (photo) URL.revokeObjectURL(photo.preview);
    });
    setPhotos([null, null, null, null]);
    setName('');
    setCategoryId('');
    setDescription('');
    setPrice('');
    setStock(INITIAL_STOCK);
    setError('');
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (!photos[0]) {
      setError('Adicione pelo menos a foto principal do produto.');
      return;
    }

    const files = photos
      .filter((photo): photo is Photo => photo !== null)
      .map((photo) => photo.file);

    setLoading(true);
    try {
      const imageUrls = await Promise.all(files.map((file) => uploadImage(file)));

      await clientApi.post('/api/produtos', {
        name: name.trim(),
        description: description.trim() || undefined,
        price: Number(price),
        stock,
        category_id: Number(categoryId),
        store_id: storeId,
        image_urls: imageUrls,
      });

      resetForm();
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível adicionar o produto. Tente novamente.'));
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const fontFamily = getComputedStyle(
    document.querySelector('.catalog-page') ?? document.body,
  ).fontFamily;

  return createPortal(
    <div
      className="product-modal-overlay"
      style={{ fontFamily }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        <button type="button" className="product-modal__close" aria-label="Fechar" onClick={onClose}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h2 id="product-modal-title" className="product-modal__title">
          Adicionar Produto
        </h2>

        <form className="product-modal__form" onSubmit={handleSubmit}>
          <div className="product-modal__photos">
            {photos.map((photo, index) => (
              <PhotoSlot
                key={index}
                photo={photo}
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
            <option value="" disabled hidden>
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

          <div className="product-modal__quantity" role="group" aria-label="Quantidade em estoque">
            <button
              type="button"
              className="product-modal__quantity-btn"
              aria-label="Diminuir estoque"
              disabled={stock <= MIN_STOCK}
              onClick={() => setStock((s) => Math.max(MIN_STOCK, s - 1))}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
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
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          {error && (
            <p className="product-modal__error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="product-modal__submit" disabled={loading}>
            {loading ? 'Adicionando...' : 'Adicionar'}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}

function groupCategories(categories: Category[]): [string, Category[]][] {
  const groups = new Map<string, Category[]>();
  for (const category of categories) {
    const key = category.group ?? '';
    groups.set(key, [...(groups.get(key) ?? []), category]);
  }
  return [...groups.entries()];
}

interface PhotoSlotProps {
  photo: Photo | null;
  large: boolean;
  label: string;
  onSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

function PhotoSlot({ photo, large, label, onSelect, onRemove }: PhotoSlotProps) {
  return (
    <div className={`photo-slot${large ? ' photo-slot--large' : ''}`}>
      <label className="photo-slot__label">
        {photo ? (
          <img src={photo.preview} alt="Prévia da foto do produto" className="photo-slot__img" />
        ) : (
          <>
            <CameraPlusIcon />
            {large && <span className="photo-slot__text">Anexe as fotos do seu produto</span>}
          </>
        )}
        <input
          type="file"
          accept="image/*"
          className="photo-slot__input"
          aria-label={label}
          onChange={onSelect}
        />
      </label>

      {photo && (
        <button type="button" className="photo-slot__remove" aria-label="Remover foto" onClick={onRemove}>
          ×
        </button>
      )}
    </div>
  );
}

function CameraPlusIcon() {
  return (
    <svg width="34" height="30" viewBox="0 0 36 32" fill="none" aria-hidden="true">
      <path
        d="M12 4L9.5 7.5H5C3.34315 7.5 2 8.84315 2 10.5V25.5C2 27.1569 3.34315 28.5 5 28.5H27C28.6569 28.5 30 27.1569 30 25.5V10.5C30 8.84315 28.6569 7.5 27 7.5H22.5L20 4H12Z"
        fill="#7547F5"
      />
      <circle cx="16" cy="18" r="6" fill="#FFFFFF" />
      <circle cx="16" cy="18" r="3.5" fill="#7547F5" />
      <circle cx="27" cy="22" r="5" fill="#FFFFFF" />
      <path d="M27 19.5V24.5M24.5 22H29.5" stroke="#7547F5" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}