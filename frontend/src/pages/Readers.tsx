import { useState, useEffect } from 'react';
import { Reader, PaginatedResponse } from '../types';
import createApiClient from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Readers() {
  const { t } = useLanguage();
  const [readers, setReaders] = useState<Reader[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState<'code' | 'name' | 'email' | 'phone' | 'membershipExpiry'>('code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    email: '',
    phone: '',
    membershipExpiry: '',
  });
  const [errors, setErrors] = useState<{
    code?: string;
    email?: string;
    name?: string;
    phone?: string;
    membershipExpiry?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [token] = useState(localStorage.getItem('token') || '');
  const client = createApiClient(token);

  const fetchReaders = async () => {
    try {
      const response = await client.get<PaginatedResponse<Reader>>('/readers', { params: { search, page, sortBy, sortDirection } });
      setReaders(response.data.readers || []);
      setTotal(response.data.total);
      setPages(response.data.pages);
    } catch (error) {
      console.error('Failed to fetch readers', error);
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
    fetchReaders();
  }, [search, page, sortBy, sortDirection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    // Client-side validation
    const newErrors: typeof errors = {};

    if (!formData.code.trim()) {
      newErrors.code = t('readers.validation.codeRequired');
    }
    if (!formData.name.trim()) {
      newErrors.name = t('readers.validation.nameRequired');
    }
    if (!formData.email.trim()) {
      newErrors.email = t('readers.validation.emailRequired');
    } else if (!formData.email.includes('@')) {
      newErrors.email = t('readers.validation.emailInvalid');
    }
    if (!formData.phone.trim()) {
      newErrors.phone = t('readers.validation.phoneRequired');
    }
    if (!formData.membershipExpiry) {
      newErrors.membershipExpiry = t('readers.validation.membershipRequired');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingId) {
        await client.put(`/readers/${editingId}`, formData);
      } else {
        await client.post('/readers', formData);
      }
      setShowModal(false);
      setFormData({ code: '', name: '', email: '', phone: '', membershipExpiry: '' });
      setEditingId(null);
      setErrors({});
      fetchReaders();
    } catch (error: any) {
      console.error('Failed to save reader', error);

      // Handle server-side validation errors
      if (error.response?.data?.error) {
        const errorMsg = error.response.data.error;
        if (errorMsg.includes('code') || errorMsg.includes('already exists')) {
          setErrors({ code: t('readers.validation.codeUnique') });
        } else if (errorMsg.includes('email') || errorMsg.includes('Email')) {
          setErrors({ email: t('readers.validation.emailExists') });
        } else {
          setErrors({ general: errorMsg });
        }
      } else {
        setErrors({ general: t('readers.error') });
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
      await client.delete(`/readers/${deleteConfirm}`);
      fetchReaders();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete reader', error);
      setDeleteConfirm(null);
    }
  };

  const generateReaderCode = async () => {
    try {
      const response = await client.get<{ code: string }>('/readers/next-code');
      setFormData({ ...formData, code: response.data.code });
    } catch (error) {
      console.error('Failed to generate reader code', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">{t('readers.title')}</h1>
          <p className="text-gray-600 mt-1">{t('readers.total')}: <span className="font-semibold text-teal-700">{total}</span></p>
        </div>
        <button
          onClick={async () => {
            setEditingId(null);
            try {
              const response = await client.get<{ code: string }>('/readers/next-code');
              setFormData({ code: response.data.code, name: '', email: '', phone: '', membershipExpiry: '' });
            } catch (error) {
              console.error('Failed to generate reader code', error);
              setFormData({ code: '', name: '', email: '', phone: '', membershipExpiry: '' });
            }
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          {t('readers.addNew')}
        </button>
      </div>

      <div className="card">
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">{t('readers.search')}</label>
          <input
            type="text"
            placeholder={t('readers.search')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="input-field"
          />
        </div>

        <div className="table-container">
          <table className="table text-sm">
            <thead>
              <tr>
                <th className="cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('code')}>
                  📇 {t('readers.code')} {sortBy === 'code' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('name')}>
                  👤 {t('readers.name')} {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('email')}>
                  📧 {t('readers.email')} {sortBy === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('phone')}>
                  📞 {t('readers.phone')} {sortBy === 'phone' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('membershipExpiry')}>
                  📅 {t('readers.membership')} {sortBy === 'membershipExpiry' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-center">⚙️ {t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {readers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    ❌ {t('readers.noReaders')}
                  </td>
                </tr>
              ) : (
                readers.map(reader => (
                  <tr key={reader.id}>
                    <td className="font-mono font-medium text-teal-700">{reader.code}</td>
                    <td className="font-medium text-gray-900">{reader.name}</td>
                    <td className="text-gray-700">{reader.email}</td>
                    <td className="text-gray-700">{reader.phone}</td>
                    <td>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        new Date(reader.membershipExpiry) < new Date()
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {new Date(reader.membershipExpiry).toLocaleDateString('vi-VN')}
                      </span>
                    </td>
                    <td className="text-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingId(reader.id);
                          setFormData({
                            code: reader.code,
                            name: reader.name,
                            email: reader.email,
                            phone: reader.phone,
                            membershipExpiry: reader.membershipExpiry.split('T')[0],
                          });
                          setShowModal(true);
                        }}
                        className="btn-sm bg-blue-100 text-blue-600 hover:bg-blue-200"
                      >
                        ✏️ {t('common.edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(reader.id)}
                        className="btn-sm bg-red-100 text-red-600 hover:bg-red-200"
                      >
                        🗑️ {t('common.delete')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
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
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {editingId ? t('readers.editTitle') : t('readers.addTitle')}
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
                  {t('readers.code')} <span className="text-red-600">*</span>
                  {!editingId && <span className="text-gray-500 text-xs font-normal">{t('common.auto')}</span>}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="VD: DG0000000001"
                    value={formData.code}
                    onChange={(e) => {
                      if (!editingId) {
                        setFormData({ ...formData, code: e.target.value });
                        if (errors.code) {
                          setErrors({ ...errors, code: '' });
                        }
                      }
                    }}
                    readOnly={editingId !== null}
                    className={`input-field flex-1 ${editingId !== null ? 'bg-gray-100 cursor-not-allowed' : ''} ${errors.code ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {!editingId && (
                    <button
                      type="button"
                      onClick={generateReaderCode}
                      className="btn-secondary px-3"
                      title={t('readers.generateCodeTitle')}
                    >
                      🔄
                    </button>
                  )}
                </div>
                {errors.code && <p className="text-red-600 text-sm mt-1">❌ {errors.code}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t('readers.name')} <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder={t('readers.placeholders.name')}
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) {
                      setErrors({ ...errors, name: '' });
                    }
                  }}
                  className={`input-field ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">❌ {errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t('readers.email')} <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  placeholder={t('readers.placeholders.email')}
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) {
                      setErrors({ ...errors, email: '' });
                    }
                  }}
                  className={`input-field ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">❌ {errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t('readers.phone')} <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  placeholder={t('readers.placeholders.phone')}
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (errors.phone) {
                      setErrors({ ...errors, phone: '' });
                    }
                  }}
                  className={`input-field ${errors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.phone && <p className="text-red-600 text-sm mt-1">❌ {errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t('readers.membership')} <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  value={formData.membershipExpiry}
                  onChange={(e) => {
                    setFormData({ ...formData, membershipExpiry: e.target.value });
                    if (errors.membershipExpiry) {
                      setErrors({ ...errors, membershipExpiry: '' });
                    }
                  }}
                  className={`input-field ${errors.membershipExpiry ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.membershipExpiry && <p className="text-red-600 text-sm mt-1">❌ {errors.membershipExpiry}</p>}
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
          title={t('readers.deleteConfirm')}
          message={t('readers.deleteConfirmMsg')}
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
