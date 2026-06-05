import { useState, useEffect } from 'react';
import { BorrowTicket } from '../types';
import createApiClient from '../api/client';
import ConfirmDialog from '../components/ConfirmDialog';
import { useLanguage } from '../context/LanguageContext';

export default function Return() {
  const { t } = useLanguage();
  const [tickets, setTickets] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [token] = useState(localStorage.getItem('token') || '');
  const [sortBy, setSortBy] = useState<'ticketCode' | 'readerName' | 'bookTitle' | 'dueDate' | 'daysOverdue' | 'estimatedFine'>('ticketCode');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [returnConfirm, setReturnConfirm] = useState<{ id: number; isLost: boolean } | null>(null);
  const client = createApiClient(token);

  const fetchTickets = async () => {
    try {
      const res = await client.get('/return', { params: { search } });
      setTickets(res.data);
    } catch (error) {
      console.error('Failed to fetch tickets', error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [search]);

  const handleReturn = (ticketId: number, isLost: boolean) => {
    setReturnConfirm({ id: ticketId, isLost });
  };

  const confirmReturn = async () => {
    if (returnConfirm === null) return;
    try {
      await client.post(`/return/${returnConfirm.id}`, { isLost: returnConfirm.isLost });
      fetchTickets();
      setReturnConfirm(null);
    } catch (error) {
      console.error('Failed to return ticket', error);
      setReturnConfirm(null);
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
      <h1 className="text-3xl font-bold text-gray-900">{t('return.title')}</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <input
          type="text"
          placeholder={t('return.ticketCode')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-6"
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('ticketCode')}>
                  {t('return.ticketCode')} {sortBy === 'ticketCode' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('readerName')}>
                  {t('return.reader')} {sortBy === 'readerName' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('bookTitle')}>
                  {t('return.book')} {sortBy === 'bookTitle' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('dueDate')}>
                  {t('return.dueDate')} {sortBy === 'dueDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-2 text-center cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('daysOverdue')}>
                  {t('return.overdue')} {sortBy === 'daysOverdue' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-2 text-center cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('estimatedFine')}>
                  {t('return.fine')} {sortBy === 'estimatedFine' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-2 text-center">⚙️ {t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {sortedTickets.map(ticket => (
                <tr key={ticket.id} className={`border-b ${ticket.isOverdue ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-2 font-bold">{ticket.ticketCode}</td>
                  <td className="px-4 py-2">{ticket.reader?.name}</td>
                  <td className="px-4 py-2">{ticket.book?.title}</td>
                  <td className="px-4 py-2">{new Date(ticket.dueDate).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={ticket.isOverdue ? 'text-red-600 font-bold' : ''}>
                      {ticket.daysOverdue} {t('return.days')}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span className={ticket.estimatedFine > 0 ? 'text-red-600 font-bold' : ''}>
                      {ticket.estimatedFine?.toLocaleString('vi-VN')}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center space-x-1">
                    <button
                      onClick={() => handleReturn(ticket.id, false)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                    >
                      {t('return.return')}
                    </button>
                    <button
                      onClick={() => handleReturn(ticket.id, true)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                    >
                      {t('return.markLost')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {returnConfirm !== null && (
        <ConfirmDialog
          title={returnConfirm.isLost ? t('return.confirmLost') : t('return.confirmReturn')}
          message={
            returnConfirm.isLost
              ? t('return.confirmLostMsg')
              : t('return.confirmReturnMsg')
          }
          confirmText={returnConfirm.isLost ? t('return.markLost') : t('common.confirm')}
          cancelText={t('common.cancel')}
          type={returnConfirm.isLost ? 'danger' : 'warning'}
          onConfirm={confirmReturn}
          onCancel={() => setReturnConfirm(null)}
        />
      )}
    </div>
  );
}
