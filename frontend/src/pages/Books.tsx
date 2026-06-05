import { useState, useEffect } from 'react';
import { Book, PaginatedResponse } from '../types';
import createApiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Books() {
  const { token, user } = useAuth();
  const { t } = useLanguage();
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'code' | 'title' | 'author' | 'totalQuantity' | 'availableQty'>('code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [formData, setFormData] = useState({ code: '', title: '', author: '', totalQuantity: 0 });
  const [errors, setErrors] = useState<{
    code?: string;
    title?: string;
    author?: string;
    totalQuantity?: string;
    general?: string;
  }>({});
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const client = createApiClient(token || '');
  const pageSize = 10;

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      const response = await client.get<PaginatedResponse<Book>>('/books', {
        params: { search, page, sortBy, sortDirection },
      });
      setBooks(response.data.books || []);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Failed to fetch books', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [search, page, sortBy, sortDirection]);

  const generateBookCode = async () => {
    try {
      const response = await client.get<{ code: string }>('/books/next-code');
      setFormData({ ...formData, code: response.data.code });
    } catch (error) {
      console.error('Failed to generate book code', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    // Client-side validation
    const newErrors: typeof errors = {};

    if (!formData.code.trim()) {
      newErrors.code = t('books.validation.codeRequired');
    }
    if (!formData.title.trim()) {
      newErrors.title = t('books.validation.titleRequired');
    }
    if (!formData.author.trim()) {
      newErrors.author = t('books.validation.authorRequired');
    }
    if (!formData.totalQuantity || formData.totalQuantity <= 0) {
      newErrors.totalQuantity = t('books.validation.quantityRequired');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingId) {
        await client.put(`/books/${editingId}`, formData);
      } else {
        await client.post('/books', formData);
      }
      setShowModal(false);
      setFormData({ code: '', title: '', author: '', totalQuantity: 0 });
      setEditingId(null);
      setErrors({});
      fetchBooks();
    } catch (error: any) {
      console.error('Failed to save book', error);

      // Handle server-side validation errors
      if (error.response?.data?.error) {
        const errorMsg = error.response.data.error;
        if (errorMsg.includes('code') || errorMsg.includes('already exists')) {
          setErrors({ code: t('books.validation.codeExists') });
        } else {
          setErrors({ general: errorMsg });
        }
      } else {
        setErrors({ general: t('books.error') });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirm === null) return;
    try {
      await client.delete(`/books/${deleteConfirm}`);
      fetchBooks();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete book', error);
      setDeleteConfirm(null);
    }
  };

  const pages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">{t(user?.role === 'ADMIN' ? 'books.title' : 'books.titleList')}</h1>
          <p className="text-gray-600 mt-1">{t('books.total')}: <span className="font-semibold text-teal-700">{total}</span></p>
        </div>
        {user?.role === 'ADMIN' && (
          <button
            onClick={async () => {
              setEditingId(null);
              try {
                const response = await client.get<{ code: string }>('/books/next-code');
                setFormData({ code: response.data.code, title: '', author: '', totalQuantity: 0 });
              } catch (error) {
                console.error('Failed to generate book code', error);
                setFormData({ code: '', title: '', author: '', totalQuantity: 0 });
              }
              setShowModal(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            {t('books.addNew')}
          </button>
        )}
      </div>

      <div className="card">
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">{t('books.search')}</label>
          <input
            type="text"
            placeholder={t('books.search')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="input-field"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">⏳ {t('common.loading')}</p>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">❌ {t('books.noBooks')}</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th className="cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('code')}>
                      {t('books.code')} {sortBy === 'code' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('title')}>
                      {t('books.name')} {sortBy === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('author')}>
                      {t('books.author')} {sortBy === 'author' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-center cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('totalQuantity')}>
                      {t('books.quantity')} {sortBy === 'totalQuantity' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-center cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('availableQty')}>
                      {t('books.available')} {sortBy === 'availableQty' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    {user?.role === 'ADMIN' && <th className="text-center">⚙️ {t('common.actions')}</th>}
                  </tr>
                </thead>
                <tbody>
                  {books.map(book => (
                    <tr key={book.id}>
                      <td className="font-mono font-medium text-teal-700">{book.code}</td>
                      <td className="font-medium text-gray-900">{book.title}</td>
                      <td className="text-gray-700">{book.author}</td>
                      <td className="text-center text-gray-700">{book.totalQuantity}</td>
                      <td className="text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full font-semibold ${
                          book.availableQty === 0
                            ? 'bg-red-100 text-red-700'
                            : book.availableQty <= 2
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {book.availableQty}
                        </span>
                      </td>
                      {user?.role === 'ADMIN' && (
                        <td className="text-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingId(book.id);
                              setFormData({
                                code: book.code,
                                title: book.title,
                                author: book.author,
                                totalQuantity: book.totalQuantity,
                              });
                              setShowModal(true);
                            }}
                            className="btn-sm bg-blue-100 text-blue-600 hover:bg-blue-200"
                          >
                            ✏️ {t('common.edit')}
                          </button>
                          <button
                            onClick={() => handleDelete(book.id)}
                            className="btn-sm bg-red-100 text-red-600 hover:bg-red-200"
                          >
                            🗑️ {t('common.delete')}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: pages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`btn-sm px-4 ${
                      page === i + 1
                        ? 'btn-primary'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {editingId ? t('books.editTitle') : t('books.addTitle')}
            </h2>
            {errors.general && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                <p className="font-medium">{t('common.error')}</p>
                <p>{errors.general}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t('books.code')} <span className="text-red-600">*</span>
                  {!editingId && <span className="text-gray-500 text-xs font-normal">{t('common.auto')}</span>}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="VD: S00000000001"
                    value={formData.code}
                    onChange={(e) => {
                      if (!editingId) {
                        setFormData({ ...formData, code: e.target.value });
                        if (errors.code) setErrors({ ...errors, code: '' });
                      }
                    }}
                    readOnly={editingId !== null}
                    className={`input-field flex-1 ${editingId !== null ? 'bg-gray-100 cursor-not-allowed' : ''} ${errors.code ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {!editingId && (
                    <button
                      type="button"
                      onClick={generateBookCode}
                      className="btn-secondary px-3"
                      title={t('books.generateCodeTitle')}
                    >
                      🔄
                    </button>
                  )}
                </div>
                {errors.code && <p className="text-red-600 text-sm mt-1">❌ {errors.code}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t('books.name')} <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder={t('books.placeholders.name')}
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (errors.title) setErrors({ ...errors, title: '' });
                  }}
                  className={`input-field ${errors.title ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.title && <p className="text-red-600 text-sm mt-1">❌ {errors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t('books.author')} <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder={t('books.placeholders.author')}
                  value={formData.author}
                  onChange={(e) => {
                    setFormData({ ...formData, author: e.target.value });
                    if (errors.author) setErrors({ ...errors, author: '' });
                  }}
                  className={`input-field ${errors.author ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.author && <p className="text-red-600 text-sm mt-1">❌ {errors.author}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t('books.quantity')} <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  placeholder={t('books.placeholders.quantity')}
                  value={formData.totalQuantity || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, totalQuantity: parseInt(e.target.value) || 0 });
                    if (errors.totalQuantity) setErrors({ ...errors, totalQuantity: '' });
                  }}
                  className={`input-field ${errors.totalQuantity ? 'border-red-500 focus:ring-red-500' : ''}`}
                  min="1"
                />
                {errors.totalQuantity && <p className="text-red-600 text-sm mt-1">❌ {errors.totalQuantity}</p>}
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setErrors({});
                  }}
                  className="btn-secondary"
                  disabled={isSubmitting}
                >
                  ❌ {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? `⏳ ${t('common.saving')}` : `💾 ${t('common.save')}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm !== null && (
        <ConfirmDialog
          title={t('books.deleteConfirm')}
          message={t('books.deleteConfirmMsg')}
          confirmText={t('confirmDialog.delete')}
          cancelText={t('confirmDialog.cancel')}
          type="danger"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
