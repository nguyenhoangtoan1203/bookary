import { useState, useEffect } from 'react';
import { Reader, Book, BorrowTicket } from '../types';
import createApiClient from '../api/client';
import Alert from '../components/Alert';
import { useLanguage } from '../context/LanguageContext';

type Step = 1 | 2 | 3;

export default function Borrow() {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>(1);
  const [readers, setReaders] = useState<Reader[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedReader, setSelectedReader] = useState<Reader | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [ticket, setTicket] = useState<BorrowTicket | null>(null);
  const [search, setSearch] = useState('');
  const [token] = useState(localStorage.getItem('token') || '');
  const [readerSortBy, setReaderSortBy] = useState<'code' | 'name' | 'email' | 'phone'>('code');
  const [readerSortDirection, setReaderSortDirection] = useState<'asc' | 'desc'>('asc');
  const [bookSortBy, setBookSortBy] = useState<'code' | 'title' | 'author' | 'availableQty'>('code');
  const [bookSortDirection, setBookSortDirection] = useState<'asc' | 'desc'>('asc');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('error');
  const client = createApiClient(token);

  useEffect(() => {
    if (step === 1) {
      const fetchAllReaders = async () => {
        try {
          const res = await client.get('/readers?page=1&sortBy=code');
          const allReaders = res.data.readers || [];
          const totalPages = Math.ceil((res.data.total || 0) / 10);

          for (let page = 2; page <= totalPages; page++) {
            const nextRes = await client.get(`/readers?page=${page}&sortBy=code`);
            allReaders.push(...(nextRes.data.readers || []));
          }

          setReaders(allReaders);
        } catch (error) {
          console.error('Failed to fetch readers', error);
        }
      };
      fetchAllReaders();
    }
    if (step === 2) {
      const fetchAllBooks = async () => {
        try {
          const res = await client.get('/books?page=1&sortBy=code');
          const allBooks = res.data.books || [];
          const totalPages = Math.ceil((res.data.total || 0) / 10);

          for (let page = 2; page <= totalPages; page++) {
            const nextRes = await client.get(`/books?page=${page}&sortBy=code`);
            allBooks.push(...(nextRes.data.books || []));
          }

          setBooks(allBooks);
        } catch (error) {
          console.error('Failed to fetch books', error);
        }
      };
      fetchAllBooks();
    }
  }, [step]);

  const handleBorrow = async (book?: Book) => {
    const reader = selectedReader;
    const bookToUse = book || selectedBook;

    if (!reader || !bookToUse) return;
    try {
      const res = await client.post('/borrow', {
        readerId: reader.id,
        bookId: bookToUse.id,
      });
      setTicket(res.data);
      setStep(3);
    } catch (error) {
      setAlertType('error');
      setAlertMessage(t('borrow.error'));
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=900,height=1200,left=50,top=50');
    if (!printWindow) {
      setAlertType('error');
      setAlertMessage(t('borrow.errorPrint'));
      return;
    }

    const element = document.getElementById('borrowReceipt');
    if (!element) return;

    const htmlContent = element.innerHTML;
    const htmlDocument = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${ticket?.ticketCode || 'borrow-receipt'}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          body {
            font-family: Arial, sans-serif;
            background: white;
            padding: 20px;
            color: #000;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .bg-white { background-color: #ffffff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .bg-gray-50 { background-color: #f9fafb !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .bg-teal-50 { background-color: #f0fdfa !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .bg-teal-100 { background-color: #ccfbf1 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .bg-teal-700 { background-color: #0d9488 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .bg-blue-50 { background-color: #eff6ff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .bg-green-50 { background-color: #f0fdf4 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .bg-green-100 { background-color: #dcfce7 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .bg-yellow-50 { background-color: #fefce8 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .bg-yellow-100 { background-color: #fef08a !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .bg-red-50 { background-color: #fef2f2 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .bg-gradient-to-r { background: linear-gradient(to right, #f0fdfa, #eff6ff) !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

          .border { border: 1px solid #e5e7eb; }
          .border-2 { border: 2px solid #e5e7eb; }
          .border-4 { border: 4px solid #0d3b3b; }
          .border-b { border-bottom: 1px solid #e5e7eb; }
          .border-b-2 { border-bottom: 2px solid #0d3b3b; }
          .border-b-4 { border-bottom: 4px solid #0d3b3b; }
          .border-l-4 { border-left: 4px solid #dc2626; }

          .border-teal-900 { border-color: #134e4a !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .border-teal-200 { border-color: #99f6e4 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .border-gray-300 { border-color: #d1d5db !important; }
          .border-yellow-200 { border-color: #fef08a !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .border-blue-300 { border-color: #93c5fd !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .border-red-400 { border-color: #f87171 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

          .text-teal-700 { color: #0d9488 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .text-teal-900 { color: #134e4a !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .text-gray-600 { color: #4b5563 !important; }
          .text-gray-700 { color: #374151 !important; }
          .text-gray-800 { color: #1f2937 !important; }
          .text-gray-900 { color: #111827 !important; }
          .text-white { color: #ffffff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .text-red-700 { color: #b91c1c !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .text-green-700 { color: #15803d !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .text-yellow-600 { color: #ca8a04 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .text-yellow-900 { color: #713f12 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .text-blue-700 { color: #1d4ed8 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

          .rounded { border-radius: 0.375rem; }
          .rounded-lg { border-radius: 0.5rem; }

          .p-3 { padding: 0.75rem; }
          .p-4 { padding: 1rem; }
          .p-6 { padding: 1.5rem; }
          .p-8 { padding: 2rem; }

          .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
          .px-4 { padding-left: 1rem; padding-right: 1rem; }
          .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }

          .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
          .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
          .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }

          .pb-3 { padding-bottom: 0.75rem; }
          .pb-6 { padding-bottom: 1.5rem; }
          .pt-4 { padding-top: 1rem; }
          .pt-6 { padding-top: 1.5rem; }

          .mt-1 { margin-top: 0.25rem; }
          .mt-2 { margin-top: 0.5rem; }
          .mt-3 { margin-top: 0.75rem; }
          .mt-4 { margin-top: 1rem; }
          .mt-6 { margin-top: 1.5rem; }
          .mt-8 { margin-top: 2rem; }

          .mb-1 { margin-bottom: 0.25rem; }
          .mb-2 { margin-bottom: 0.5rem; }
          .mb-3 { margin-bottom: 0.75rem; }
          .mb-4 { margin-bottom: 1rem; }
          .mb-6 { margin-bottom: 1.5rem; }
          .mb-8 { margin-bottom: 2rem; }

          .space-y-1 > * + * { margin-top: 0.25rem; }
          .space-y-2 > * + * { margin-top: 0.5rem; }
          .space-y-4 > * + * { margin-top: 1rem; }

          .flex { display: flex; }
          .flex-1 { flex: 1 1 0%; }
          .items-start { align-items: flex-start; }
          .items-center { align-items: center; }
          .justify-center { justify-content: center; }
          .justify-between { justify-content: space-between; }
          .mr-3 { margin-right: 0.75rem; }
          .ml-4 { margin-left: 1rem; }

          .grid { display: grid; }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .gap-2 { gap: 0.5rem; }
          .gap-3 { gap: 0.75rem; }
          .gap-4 { gap: 1rem; }
          .gap-8 { gap: 2rem; }

          .max-w-2xl { max-width: 42rem; }
          .mx-auto { margin-left: auto; margin-right: auto; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }

          .border-l { border-left: 1px solid #e5e7eb; }
          .pl-4 { padding-left: 1rem; }
          .pt-2 { padding-top: 0.5rem; }
          .pt-3 { padding-top: 0.75rem; }

          .leading-tight { line-height: 1.25; }
          .letter-spacing-2 { letter-spacing: 0.05em; }

          .font-bold { font-weight: bold; }
          .font-semibold { font-weight: 600; }
          .text-sm { font-size: 0.875rem; }
          .text-xs { font-size: 0.75rem; }
          .text-base { font-size: 1rem; }
          .text-lg { font-size: 1.125rem; }
          .text-2xl { font-size: 1.5rem; }
          .text-3xl { font-size: 1.875rem; }
          .text-5xl { font-size: 3rem; }

          .font-mono { font-family: 'Courier New', monospace; }
          .tracking-wider { letter-spacing: 0.05em; }
          .tracking-widest { letter-spacing: 0.1em; }

          .uppercase { text-transform: uppercase; }

          @page {
            size: A4;
            margin: 0;
          }

          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            body {
              padding: 0;
              margin: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;

    printWindow.document.write(htmlDocument);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  const handleReset = () => {
    setStep(1);
    setSelectedReader(null);
    setSelectedBook(null);
    setTicket(null);
    setSearch('');
  };

  const handleReaderSort = (column: typeof readerSortBy) => {
    if (readerSortBy === column) {
      setReaderSortDirection(readerSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setReaderSortBy(column);
      setReaderSortDirection('asc');
    }
  };

  const handleBookSort = (column: typeof bookSortBy) => {
    if (bookSortBy === column) {
      setBookSortDirection(bookSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setBookSortBy(column);
      setBookSortDirection('asc');
    }
  };

  const filteredReaders = readers.filter(r =>
    search === '' || r.name.includes(search) || r.code.includes(search) || r.email.includes(search)
  );
  const filteredBooks = books.filter(b =>
    search === '' || b.title.includes(search) || b.code.includes(search)
  );

  const sortedReaders = [...filteredReaders].sort((a, b) => {
    let aVal: any = a[readerSortBy];
    let bVal: any = b[readerSortBy];

    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    if (aVal < bVal) return readerSortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return readerSortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    let aVal: any = a[bookSortBy];
    let bVal: any = b[bookSortBy];

    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    if (aVal < bVal) return bookSortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return bookSortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">{t('borrow.title')}</h1>

      {/* Progress Indicator */}
      <div className="flex justify-center gap-4">
        {[1, 2, 3].map(s => (
          <div
            key={s}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              step >= s ? 'bg-teal-700 text-white' : 'bg-gray-200 text-gray-600'
            }`}
          >
            <span className="font-bold">{s}</span>
            <span className="text-sm">
              {s === 1 ? t('borrow.step1') : s === 2 ? t('borrow.step2') : t('borrow.step3')}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold mb-4">{t('borrow.step1')}</h2>
            <input
              type="text"
              placeholder={t('borrow.selectReader')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleReaderSort('code')}>
                      📇 {t('readers.code')} {readerSortBy === 'code' && (readerSortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleReaderSort('name')}>
                      👤 {t('readers.name')} {readerSortBy === 'name' && (readerSortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleReaderSort('email')}>
                      📧 {t('readers.email')} {readerSortBy === 'email' && (readerSortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleReaderSort('phone')}>
                      📞 {t('readers.phone')} {readerSortBy === 'phone' && (readerSortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-2">⚙️ {t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedReaders.map(r => (
                    <tr key={r.id} className="border-b">
                      <td className="px-4 py-2">{r.code}</td>
                      <td className="px-4 py-2">{r.name}</td>
                      <td className="px-4 py-2 text-sm">{r.email}</td>
                      <td className="px-4 py-2">{r.phone}</td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => {
                            setSelectedReader(r);
                            setStep(2);
                          }}
                          className="bg-teal-700 text-white px-3 py-1 rounded text-sm hover:bg-teal-800"
                        >
                          {t('common.select')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold mb-4">{t('borrow.step2')}</h2>
            <p className="mb-4 text-gray-600">
              {t('readers.name')}: <strong>{selectedReader?.name}</strong>
            </p>
            <input
              type="text"
              placeholder={t('borrow.selectBook')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleBookSort('code')}>
                      {t('books.code')} {bookSortBy === 'code' && (bookSortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleBookSort('title')}>
                      {t('books.name')} {bookSortBy === 'title' && (bookSortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleBookSort('author')}>
                      {t('books.author')} {bookSortBy === 'author' && (bookSortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-2 text-center cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleBookSort('availableQty')}>
                      {t('books.available')} {bookSortBy === 'availableQty' && (bookSortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-2">⚙️ {t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedBooks.map(b => (
                    <tr key={b.id} className="border-b">
                      <td className="px-4 py-2">{b.code}</td>
                      <td className="px-4 py-2">{b.title}</td>
                      <td className="px-4 py-2">{b.author}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={b.availableQty > 0 ? 'text-green-600' : 'text-red-600'}>
                          {b.availableQty}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => handleBorrow(b)}
                          disabled={b.availableQty === 0}
                          className="bg-teal-700 text-white px-3 py-1 rounded text-sm hover:bg-teal-800 disabled:opacity-50"
                        >
                          {t('common.select')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => setStep(1)}
              className="mt-4 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              {t('common.cancel')}
            </button>
          </div>
        )}

        {step === 3 && ticket && (
          <div>
            <h2 className="text-xl font-bold mb-6">{t('borrow.step3')}</h2>

            {/* Receipt Container */}
            <div className="mb-6">
              {/* Receipt */}
              <div id="borrowReceipt" className="bg-white p-0 max-w-4xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
              {/* Professional Receipt - Optimized for A4 Page */}
              <div id="borrowReceipt" className="bg-white mx-auto text-sm" style={{ fontFamily: 'Arial, sans-serif', padding: '15mm' }}>

                {/* Header Section */}
                <div className="mb-4 pb-3 border-b-2 border-teal-900">
                  {/* Title Row - Centered */}
                  <div className="text-center mb-3">
                    <div className="flex justify-center items-center gap-4 mb-2">
                      <div>
                        <div className="text-2xl font-bold text-teal-900">📚 BOOKARY</div>
                        <div className="text-xs text-gray-600">Library Management System</div>
                      </div>
                      <div className="text-center border-l border-gray-300 pl-4">
                        <div className="text-lg font-bold text-teal-900">{t('borrow.receipt.title')}</div>
                        <div className="text-xs text-gray-600">{t('borrow.receipt.title')}</div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info - Centered */}
                  <div className="text-center text-xs text-gray-700 font-semibold">
                    📍 HCM City | ☎ (028) 1234 5678
                  </div>
                </div>

                {/* Ticket Code - Prominent */}
                <div className="bg-teal-700 text-white p-3 rounded-lg mb-3 text-center">
                  <div className="text-xs font-semibold mb-1">{t('borrow.receipt.ticketCode')}</div>
                  <div className="text-3xl font-bold font-mono tracking-widest letter-spacing-2">{ticket.ticketCode}</div>
                </div>

                {/* Main Content - Two Columns */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {/* Left Column - Reader Info */}
                  <div>
                    <div className="bg-teal-100 px-3 py-2 font-semibold text-teal-900 text-xs uppercase">👤 {t('borrow.receipt.readerInfo')}</div>
                    <div className="border border-teal-200 px-3 py-3 space-y-2 text-xs">
                      <div>
                        <span className="font-semibold text-gray-700">{t('readers.name')}:</span>
                        <div className="font-bold text-gray-900">{ticket.reader?.name}</div>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">{t('borrow.receipt.readerCode')}:</span>
                        <div className="font-mono font-bold text-teal-700">{ticket.reader?.code}</div>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">{t('readers.email')}:</span>
                        <div className="text-gray-800">{ticket.reader?.email}</div>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">{t('readers.phone')}:</span>
                        <div className="text-gray-800">{ticket.reader?.phone}</div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Book Info */}
                  <div>
                    <div className="bg-teal-100 px-3 py-2 font-semibold text-teal-900 text-xs uppercase">📕 {t('borrow.receipt.bookInfo')}</div>
                    <div className="border border-teal-200 px-3 py-3 space-y-2 text-xs">
                      <div>
                        <span className="font-semibold text-gray-700">{t('books.name')}:</span>
                        <div className="font-bold text-gray-900">{ticket.book?.title}</div>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">{t('books.author')}:</span>
                        <div className="text-gray-800">{ticket.book?.author}</div>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">{t('borrow.receipt.bookCode')}:</span>
                        <div className="font-mono font-bold text-teal-700">{ticket.book?.code}</div>
                      </div>
                      <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-center font-bold">
                        ✓ {t('books.available')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline Section */}
                <div className="mb-3">
                  <div className="bg-teal-100 px-3 py-2 font-semibold text-teal-900 text-xs uppercase">📅 {t('borrow.receipt.borrowInfo')}</div>
                  <div className="border border-teal-200 p-3">
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="text-center border border-teal-200 rounded p-2 bg-teal-50">
                        <div className="font-semibold text-gray-700 mb-1">{t('borrow.receipt.borrowedDate')}</div>
                        <div className="font-bold text-teal-700">{new Date(ticket.borrowedAt).toLocaleDateString('vi-VN')}</div>
                      </div>
                      <div className="text-center border border-blue-300 rounded p-2 bg-blue-50">
                        <div className="font-semibold text-gray-700 mb-1">{t('borrow.receipt.duration')}</div>
                        <div className="text-2xl font-bold text-blue-700">14</div>
                        <div className="text-xs text-gray-600">{t('return.days')}</div>
                      </div>
                      <div className="text-center border-2 border-red-400 rounded p-2 bg-red-50">
                        <div className="font-semibold text-gray-700 mb-1">{t('borrow.receipt.dueDate')}</div>
                        <div className="font-bold text-red-700">{new Date(ticket.dueDate).toLocaleDateString('vi-VN')}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important Notes */}
                <div className="mb-3">
                  <div className="bg-yellow-100 px-3 py-2 font-semibold text-yellow-900 text-xs uppercase border-l-4 border-yellow-600">⚠️ {t('common.requiredTerms')}</div>
                  <div className="border border-yellow-200 px-3 py-2 bg-yellow-50 text-xs text-gray-800">
                    <div className="space-y-1">
                      <div>• {t('borrow.receipt.rules.onTime')}</div>
                      <div>• {t('borrow.receipt.rules.loss')}</div>
                      <div>• {t('borrow.receipt.rules.keep')}</div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center border-t-2 border-teal-900 pt-2 mt-2">
                  <p className="font-semibold text-teal-900 text-sm">{t('borrow.receipt.thankYou')}</p>
                  <p className="text-xs text-gray-600">{t('borrow.receipt.printedDate')} - {new Date().toLocaleDateString('vi-VN')}</p>
                </div>

              </div>
            </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700 font-semibold"
                title={t('borrow.errorPrint')}
              >
                {t('borrow.print')}
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-teal-700 text-white px-4 py-3 rounded hover:bg-teal-800 font-semibold"
              >
                {t('borrow.createNew')}
              </button>
            </div>
          </div>
        )}
      </div>

      {alertMessage && (
        <Alert
          message={alertMessage}
          type={alertType}
          onClose={() => setAlertMessage(null)}
        />
      )}
    </div>
  );
}
