import { useState, useEffect } from 'react';
import { BorrowTicket } from '../types';
import createApiClient from '../api/client';
import { useLanguage } from '../context/LanguageContext';

export default function BorrowHistory() {
  const { t } = useLanguage();
  const [tickets, setTickets] = useState<BorrowTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [token] = useState(localStorage.getItem('token') || '');
  const client = createApiClient(token);

  useEffect(() => {
    fetchBorrowHistory();
  }, []);

  const fetchBorrowHistory = async () => {
    try {
      setIsLoading(true);
      const response = await client.get('/borrow/tickets');
      setTickets(response.data.tickets || response.data);
    } catch (error) {
      console.error('Failed to fetch borrow history', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">{t('nav.borrowHistory')}</h1>
        <p className="text-gray-600 mt-1">{t('common.noData')}</p>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">⏳ {t('common.loading')}</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">📭 {t('return.noTickets')}</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('return.ticketCode')}</th>
                  <th>{t('return.book')}</th>
                  <th>{t('return.borrowDate')}</th>
                  <th>{t('return.dueDate')}</th>
                  <th>{t('return.status')}</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => (
                  <tr key={ticket.id}>
                    <td className="font-mono font-medium text-teal-700">{ticket.ticketCode}</td>
                    <td className="text-gray-700">{ticket.book?.title || ticket.bookId}</td>
                    <td className="text-gray-700">{new Date(ticket.borrowedAt).toLocaleDateString()}</td>
                    <td className="text-gray-700">{new Date(ticket.dueDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full font-semibold text-sm ${
                        ticket.status === 'RETURNED'
                          ? 'bg-green-100 text-green-700'
                          : ticket.status === 'LOST'
                          ? 'bg-red-100 text-red-700'
                          : ticket.status === 'BORROWING'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {t(`return.status.${ticket.status.toLowerCase()}`) || ticket.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
