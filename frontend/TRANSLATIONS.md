# Translation Keys Guide

## How to Use Translations

```typescript
import { useLanguage } from '../context/LanguageContext';

export default function MyComponent() {
  const { t } = useLanguage();
  
  return (
    <h1>{t('books.title')}</h1>
    <p>{t('common.loading')}</p>
  );
}
```

## Available Translation Keys

### Common (common.*)
- `add` - Add
- `edit` - Edit
- `delete` - Delete
- `cancel` - Cancel
- `confirm` - Confirm
- `save` - Save
- `search` - Search
- `loading` - Loading...
- `noData` - No data
- `error` - Error
- `success` - Success
- `saving` - Saving...
- `required` - Required

### Navigation (nav.*)
- `bookManagement` - Book Management
- `readerManagement` - Reader Management
- `borrowBook` - Borrow Book
- `return` - Return
- `renew` - Renew
- `report` - Report
- `logout` - Logout

### Books (books.*)
- `title` - Page title
- `total` - Total Books
- `code` - Book Code
- `name` - Title
- `author` - Author
- `quantity` - Total
- `available` - Available
- `addNew` - Add Book button
- `addTitle` - Add New Book (modal)
- `editTitle` - Edit Book Info (modal)
- `delete` - Delete button
- `deleteConfirm` - Delete confirmation title
- `deleteConfirmMsg` - Delete confirmation message
- `search` - Search placeholder
- `noBooks` - No books data
- `validation.codeRequired` - Code validation
- `validation.titleRequired` - Title validation
- `validation.authorRequired` - Author validation
- `validation.quantityRequired` - Quantity validation
- `validation.codeExists` - Code exists error
- `error` - Generic error
- `errorDelete` - Delete error
- `errorGenerate` - Code generation error

### Readers (readers.*)
- `title` - Page title
- `total` - Total Readers
- `code` - Reader Code
- `name` - Name
- `email` - Email
- `phone` - Phone
- `membership` - Membership
- `addNew` - Add Reader button
- `addTitle` - Add New Reader (modal)
- `editTitle` - Edit Reader Info (modal)
- `delete` - Delete button
- `deleteConfirm` - Delete confirmation title
- `deleteConfirmMsg` - Delete confirmation message
- `search` - Search placeholder
- `noReaders` - No readers data
- `validation.*` - Various validation messages
- `error`, `errorDelete`, `errorGenerate` - Error messages

### Borrow (borrow.*)
- `title` - Page title
- `step1`, `step2`, `step3` - Step labels
- `selectReader` - Select reader prompt
- `selectBook` - Select book prompt
- `borrowDate` - Borrow Date label
- `dueDate` - Due Date label
- `print` - Print / Save PDF button
- `createNew` - Create New button
- `noBooks` - No books available
- `error` - Generic error
- `errorPrint` - Pop-up blocking error
- `receipt.*` - Receipt labels:
  - `title` - Receipt title
  - `ticketCode`, `readerInfo`, `bookInfo`, `borrowInfo`
  - `readerCode`, `readerName`, `readerEmail`
  - `bookCode`, `bookTitle`, `bookAuthor`
  - `borrowedDate`, `dueDate`, `duration`

### Return (return.*)
- `title` - Page title
- `ticketCode`, `reader`, `book` - Column headers
- `borrowDate`, `dueDate` - Labels
- `overdue`, `fine` - Status labels
- `return`, `markLost` - Buttons
- `confirmReturn`, `confirmReturnMsg` - Confirmation texts
- `confirmLost`, `confirmLostMsg` - Lost confirmation texts
- `days` - Days unit
- `noTickets` - No tickets message
- `error` - Error message
- `status.*` - Status values:
  - `returned`, `lost`, `overdue`, `borrowing`

### Renew (renew.*)
- `title` - Page title
- `ticketCode`, `reader`, `book` - Column headers
- `currentDue` - Current Due Date label
- `renew` - Renew button
- `confirmRenew` - Confirmation title
- `confirmRenewMsg` - Confirmation message
- `noTickets` - No tickets message
- `error` - Error message

### Dashboard (dashboard.*)
- `title` - Page title
- `totalBooks`, `totalReaders` - Stat labels
- `borrowing`, `overdue`, `lost` - Stat labels
- `recentBorrow`, `recentLost` - Tab titles
- `ticketCode`, `reader`, `book` - Column headers
- `borrowDate`, `lostDate` - Column headers
- `status` - Status column header
- `noBorrowing`, `noLost` - Empty state messages
- `status.*` - Status values:
  - `returned`, `lost`, `overdue`, `borrowing`
- `yes`, `no` - Boolean values

### Login (login.*)
- `title` - Page title
- `email` - Email field label
- `password` - Password field label
- `login` - Login button
- `invalidCredentials` - Invalid credentials error
- `error` - Generic error

### Confirm Dialog (confirmDialog.*)
- `cancel` - Cancel button
- `delete` - Delete button
- `confirm` - Confirm button
- `renew` - Renew button
- `return` - Return button

## Supported Languages
- `vi` - Vietnamese (default)
- `en` - English

## Language Switcher
Located in the sidebar footer, users can toggle between VI and EN. The selection is automatically saved to localStorage.
