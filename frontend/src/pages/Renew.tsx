import { useState, useEffect } from 'react';
import createApiClient from '../api/client';
import ConfirmDialog from '../components/ConfirmDialog';
import { useLanguage } from '../context/LanguageContext';

export default function Renew() {
  const { t } = useLanguage();
  const [tickets, setTickets] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [token] = useState(localStorage.getItem('token') || '');
  const [sortBy, setSortBy] = useState<'ticketCode' | 'readerName' | 'bookTitle' | 'dueDate'>('ticketCode');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [renewConfirm, setRenewConfirm] = useState<number | null>(null);
  const client = createApiClient(token);

  const fetchTickets = async () => {
    try {
      const res = await client.get('/renew', { params: { search } });
      setTickets(res.data);
    } catch (error) {
      console.error('Failed to fetch tickets', error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [search]);

  const handleRenew = (ticketId: number) => {
    setRenewConfirm(ticketId);
  };

  const confirmRenew = async () => {
    if (renewConfirm === null) return;
    try {
      await client.post(`/renew/${renewConfirm}`);
      fetchTickets();
      setRenewConfirm(null);
    } catch (error) {
      console.error('Failed to renew', error);
      setRenewConfirm(null);
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

  const sortedTickets = [...tickets].sort((a, b) => {
    let aVal: any = a[sortBy];
    let bVal: any = b[sortBy];

    if (sortBy === 'readerName') aVal = a.reader?.name;
    if (sortBy === 'readerName') bVal = b.reader?.name;
    if (sortBy === 'bookTitle') aVal = a.book?.title;
    if (sortBy === 'bookTitle') bVal = b.book?.title;

    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">{t('renew.title')}</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <input
          type="text"
          placeholder={t('renew.ticketCode')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-6"
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('ticketCode')}>
                  {t('renew.ticketCode')} {sortBy === 'ticketCode' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('readerName')}>
                  {t('renew.reader')} {sortBy === 'readerName' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('bookTitle')}>
                  {t('renew.book')} {sortBy === 'bookTitle' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('dueDate')}>
                  {t('renew.currentDue')} {sortBy === 'dueDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-2 text-center">⚙️ {t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {sortedTickets.map(ticket => (
                <tr key={ticket.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-bold">{ticket.ticketCode}</td>
                  <td className="px-4 py-2">{ticket.reader?.name}</td>
                  <td className="px-4 py-2">{ticket.book?.title}</td>
                  <td className="px-4 py-2">{new Date(ticket.dueDate).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleRenew(ticket.id)}
                      className="bg-teal-700 text-white px-4 py-1 rounded text-sm hover:bg-teal-800"
                    >
                      {t('renew.renew')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {renewConfirm !== null && (
        <ConfirmDialog
          title={t('renew.confirmRenew')}
          message={t('renew.confirmRenewMsg')}
          confirmText={t('renew.renew')}
          cancelText={t('common.cancel')}
          type="info"
          onConfirm={confirmRenew}
          onCancel={() => setRenewConfirm(null)}
        />
      )}
    </div>
  );
}
