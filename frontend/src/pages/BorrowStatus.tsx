import { useState, useEffect } from 'react';
import { BorrowTicket } from '../types';
import createApiClient from '../api/client';
import { useLanguage } from '../context/LanguageContext';

export default function BorrowStatus() {
  const { t } = useLanguage();
  const [tickets, setTickets] = useState<BorrowTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [token] = useState(localStorage.getItem('token') || '');
  const client = createApiClient(token);

  useEffect(() => {
    fetchBorrowStatus();
  }, []);

  const fetchBorrowStatus = async () => {
    try {
      setIsLoading(true);
      const response = await client.get('/borrow/tickets/BORROWING');
      setTickets(response.data.tickets || response.data);
    } catch (error) {
      console.error('Failed to fetch borrow status', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateOverdue = (ticket: BorrowTicket) => {
    const today = new Date();
    const dueDate = new Date(ticket.dueDate);
    if (today > dueDate) {
      const diffTime = today.getTime() - dueDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  const calculateDaysUntilDue = (ticket: BorrowTicket) => {
    const today = new Date();
    const dueDate = new Date(ticket.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">{t('nav.borrowStatus')}</h1>
        <p className="text-gray-600 mt-1">Active borrowing books</p>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">⏳ {t('common.loading')}</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">✅ {t('dashboard.noBorrowing')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map(ticket => {
              const overdue = calculateOverdue(ticket);
              const daysUntilDue = calculateDaysUntilDue(ticket);

              return (
                <div
                  key={ticket.id}
                  className={`p-4 border rounded-lg ${
                    overdue > 0
                      ? 'bg-red-50 border-red-300'
                      : daysUntilDue < 3
                      ? 'bg-yellow-50 border-yellow-300'
                      : 'bg-blue-50 border-blue-300'
                  }`}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">{t('return.ticketCode')}</p>
                      <p className="font-mono font-medium text-teal-700">{ticket.ticketCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('return.book')}</p>
                      <p className="font-medium text-gray-900">{ticket.book?.title || ticket.bookId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('return.borrowDate')}</p>
                      <p className="text-gray-700">{new Date(ticket.borrowedAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('return.dueDate')}</p>
                      <p className="text-gray-700">{new Date(ticket.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-300 flex justify-between items-center">
                    {overdue > 0 ? (
                      <span className="text-sm font-semibold text-red-700">
                        ⚠️ Overdue by {overdue} {t('return.days')}
                      </span>
                    ) : daysUntilDue < 0 ? (
                      <span className="text-sm font-semibold text-green-700">
                        ✅ Already returned
                      </span>
                    ) : (
                      <span className={`text-sm font-semibold ${daysUntilDue < 3 ? 'text-yellow-700' : 'text-blue-700'}`}>
                        📅 {daysUntilDue} {t('return.days')} remaining
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
