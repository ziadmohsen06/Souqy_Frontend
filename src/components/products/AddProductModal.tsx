import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { X, Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { productService } from '@/services/product.service';
import { useCategories, productKeys } from '@/features/products/hooks/useProducts';
import { toApiError } from '@/services/api';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const inputClass =
  'w-full px-3 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50';

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const reset = () => {
    setName(''); setDescription(''); setPrice(''); setCategoryId('');
    setError(null);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceNum = Number(price);
    if (!name.trim()) return setError('Name is required.');
    if (!Number.isFinite(priceNum) || priceNum <= 0) return setError('Enter a price greater than 0.');
    if (!categoryId) return setError('Pick a category.');

    setSubmitting(true);
    try {
      const created = await productService.createProduct({
        name: name.trim(),
        description: description.trim() || null,
        price: priceNum,
        categoryId,
      });
      await queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success(`"${created.name}" created`);
      reset();
      onClose();
      navigate(`/products/${created.id}`);
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted disabled:opacity-50"
          disabled={submitting}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-3">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">Add product</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Create a catalog entry. Add colours &amp; sizes afterwards.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p role="alert" className="text-xs font-medium text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="ap-name" className="block text-xs font-semibold text-foreground mb-1">Name</label>
            <input
              id="ap-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Linen Blend Overshirt"
              className={inputClass}
              maxLength={200}
              required
            />
          </div>

          <div>
            <label htmlFor="ap-desc" className="block text-xs font-semibold text-foreground mb-1">
              Description <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="ap-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short product description…"
              rows={3}
              maxLength={2000}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ap-price" className="block text-xs font-semibold text-foreground mb-1">Price (USD)</label>
              <input
                id="ap-price"
                type="number"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="49.00"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="ap-cat" className="block text-xs font-semibold text-foreground mb-1">Category</label>
              <select
                id="ap-cat"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={inputClass}
                disabled={categoriesLoading}
                required
              >
                <option value="" disabled>
                  {categoriesLoading ? 'Loading…' : 'Select…'}
                </option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Create product
          </button>
        </form>
      </div>
    </div>
  );
};
