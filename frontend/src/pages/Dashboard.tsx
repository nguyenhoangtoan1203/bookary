import { useState, useEffect } from 'react';
import createApiClient from '../api/client';
import { useLanguage } from '../context/LanguageContext';

export default function Dashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [lostTickets, setLostTickets] = useState<any[]>([]);
  const [token] = useState(localStorage.getItem('token') || '');
  const [sortBy, setSortBy] = useState<'ticketCode' | 'readerName' | 'bookTitle' | 'borrowedAt' | 'dueDate' | 'isOverdue'>('borrowedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState<'borrowing' | 'lost'>('borrowing');
  const client = createApiClient(token);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await client.get('/dashboard');
        console.log('Dashboard data:', res.data);
        setStats(res.data.stats);
        setTickets(res.data.recentTickets || []);
        setLostTickets(res.data.recentLostTickets || []);
      } catch (error) {
        console.error('Failed to fetch dashboard', error);
      }
    };
    if (token) {
      fetchDashboard();
    }
  }, [token]);

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

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-gray-900">{t('dashboard.title')}</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">{t('dashboard.totalBooks')}</p>
          <p className="text-3xl font-bold text-teal-700">{stats.totalBooks}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">{t('dashboard.totalReaders')}</p>
          <p className="text-3xl font-bold text-teal-700">{stats.totalReaders}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">{t('dashboard.borrowing')}</p>
          <p className="text-3xl font-bold text-blue-600">{stats.borrowing}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">{t('dashboard.overdue')}</p>
          <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">{t('dashboard.lost')}</p>
          <p className="text-3xl font-bold text-orange-600">{stats.lost}</p>
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setActiveTab('borrowing')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'borrowing'
                ? 'bg-teal-700 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('dashboard.recentBorrow')} ({tickets.length})
          </button>
          <button
            onClick={() => setActiveTab('lost')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'lost'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('dashboard.recentLost')} ({lostTickets.length})
          </button>
        </div>

        {activeTab === 'borrowing' && sortedTickets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">{t('dashboard.noBorrowing')}</p>
          </div>
        ) : activeTab === 'lost' && lostTickets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">{t('dashboard.noLost')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('ticketCode')}>
                    {t('dashboard.ticketCode')} {sortBy === 'ticketCode' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('readerName')}>
                    {t('dashboard.reader')} {sortBy === 'readerName' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('bookTitle')}>
                    {t('dashboard.book')} {sortBy === 'bookTitle' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  {activeTab === 'borrowing' ? (
                    <>
                      <th className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('borrowedAt')}>
                        {t('dashboard.borrowDate')} {sortBy === 'borrowedAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('dueDate')}>
                        {t('return.dueDate')} {sortBy === 'dueDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-2 text-center cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('isOverdue')}>
                        {t('dashboard.overdue')} {sortBy === 'isOverdue' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-2 text-left">{t('dashboard.borrowDate')}</th>
                      <th className="px-4 py-2 text-left">{t('dashboard.lostDate')}</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {activeTab === 'borrowing' ? (
                  sortedTickets.map(ticket => (
                    <tr
                      key={ticket.id}
                      className={`border-b ${
                        ticket.isOverdue && ticket.status === 'BORROWING' ? 'bg-red-50' : ''
                      }`}
                    >
                      <td className="px-4 py-2 font-bold">{ticket.ticketCode}</td>
                      <td className="px-4 py-2">{ticket.reader?.name}</td>
                      <td className="px-4 py-2">{ticket.book?.title}</td>
                      <td className="px-4 py-2">
                        {new Date(ticket.borrowedAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-2">
                        <span className={ticket.isOverdue && ticket.status === 'BORROWING' ? 'text-red-600 font-bold' : ''}>
                          {new Date(ticket.dueDate).toLocaleDateString('vi-VN')}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className={ticket.isOverdue && ticket.status === 'BORROWING' ? 'text-red-600 font-bold' : ''}>
                          {ticket.isOverdue && ticket.status === 'BORROWING' ? t('dashboard.yes') : t('dashboard.no')}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  lostTickets.map(ticket => (
                    <tr key={ticket.id} className="border-b bg-orange-50">
                      <td className="px-4 py-2 font-bold">{ticket.ticketCode}</td>
                      <td className="px-4 py-2">{ticket.reader?.name}</td>
                      <td className="px-4 py-2">{ticket.book?.title}</td>
                      <td className="px-4 py-2">
                        {ticket.borrowedAt ? new Date(ticket.borrowedAt).toLocaleDateString('vi-VN') : '-'}
                      </td>
                      <td className="px-4 py-2 text-orange-600 font-bold">
                        {ticket.returnedAt ? new Date(ticket.returnedAt).toLocaleDateString('vi-VN') : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
