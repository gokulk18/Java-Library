import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Book, Users, BookOpen, Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

// API Configuration
const BO_API = 'http://localhost:8081/api/books';
const ME_API = 'http://localhost:8082/api/members';
const BR_API = 'http://localhost:8083/api/borrows';

function App() {
  const [activeTab, setActiveTab] = useState('books');
  
  // State
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [borrows, setBorrows] = useState([]);
  
  // Form States
  const [bookForm, setBookForm] = useState({ title: '', author: '', genre: '', totalCopies: 1, availableCopies: 1 });
  const [memberForm, setMemberForm] = useState({ name: '', email: '', phone: '', membershipDate: '' });
  const [borrowForm, setBorrowForm] = useState({ bookId: '', memberId: '' });
  
  // Loading & Error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch Data
  const fetchBooks = async () => {
    try { const res = await axios.get(BO_API); setBooks(res.data); } catch (err) { }
  };
  const fetchMembers = async () => {
    try { const res = await axios.get(ME_API); setMembers(res.data); } catch (err) { }
  };
  const fetchBorrows = async () => {
    try { const res = await axios.get(BR_API); setBorrows(res.data); } catch (err) { }
  };

  useEffect(() => {
    fetchBooks();
    fetchMembers();
    fetchBorrows();
  }, []);

  // Book Handlers
  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      await axios.post(BO_API, { ...bookForm, availableCopies: bookForm.totalCopies });
      fetchBooks();
      setBookForm({ title: '', author: '', genre: '', totalCopies: 1, availableCopies: 1 });
    } catch (err) { setError('Failed to add book'); }
  };

  const handleDeleteBook = async (id) => {
    try {
      await axios.delete(`${BO_API}/${id}`);
      fetchBooks();
    } catch (err) { setError('Failed to delete book'); }
  };

  // Member Handlers
  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const today = new Date().toISOString().split('T')[0];
      await axios.post(ME_API, { ...memberForm, membershipDate: memberForm.membershipDate || today });
      fetchMembers();
      setMemberForm({ name: '', email: '', phone: '', membershipDate: '' });
    } catch (err) { setError('Failed to add member'); }
  };

  const handleDeleteMember = async (id) => {
    try {
      await axios.delete(`${ME_API}/${id}`);
      fetchMembers();
    } catch (err) { setError('Failed to delete member'); }
  };

  // Borrow Handlers
  const handleBorrow = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BR_API}/borrow`, borrowForm);
      fetchBorrows();
      fetchBooks();
      setBorrowForm({ bookId: '', memberId: '' });
    } catch (err) { alert('Failed to borrow book: ' + (err.response?.data || err.message)); }
  };

  const handleReturn = async (id) => {
    try {
      await axios.put(`${BR_API}/return/${id}`);
      fetchBorrows();
      fetchBooks();
    } catch (err) { alert('Failed to return book'); }
  };

  // Render Functions
  const renderBooks = () => (
    <div className="content-area">
      <div className="glass-panel">
        <div className="panel-header">
          <h2>Add New Book</h2>
        </div>
        <form onSubmit={handleAddBook} className="grid-2">
          <div className="form-group">
            <label>Title</label>
            <input required className="form-control" type="text" value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Author</label>
            <input required className="form-control" type="text" value={bookForm.author} onChange={e => setBookForm({...bookForm, author: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Genre</label>
            <input className="form-control" type="text" value={bookForm.genre} onChange={e => setBookForm({...bookForm, genre: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Total Copies</label>
            <input required className="form-control" type="number" min="1" value={bookForm.totalCopies} onChange={e => setBookForm({...bookForm, totalCopies: parseInt(e.target.value)})} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn btn-primary"><Plus size={18} /> Add Book</button>
          </div>
        </form>
      </div>

      <div className="glass-panel">
        <div className="panel-header">
          <h2>Book Catalog</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Genre</th>
                <th>Copies</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map(book => (
                <tr key={book.id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.genre}</td>
                  <td>{book.availableCopies} / {book.totalCopies}</td>
                  <td>
                    {book.availableCopies > 0 
                      ? <span className="badge badge-success"><CheckCircle size={14}/> Available</span>
                      : <span className="badge badge-danger"><XCircle size={14}/> Unavailable</span>}
                  </td>
                  <td className="action-buttons">
                    <button className="btn btn-danger" onClick={() => handleDeleteBook(book.id)}><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderMembers = () => (
    <div className="content-area">
      <div className="glass-panel">
        <div className="panel-header">
          <h2>Add New Member</h2>
        </div>
        <form onSubmit={handleAddMember} className="grid-2">
          <div className="form-group">
            <label>Full Name</label>
            <input required className="form-control" type="text" value={memberForm.name} onChange={e => setMemberForm({...memberForm, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input required className="form-control" type="email" value={memberForm.email} onChange={e => setMemberForm({...memberForm, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input className="form-control" type="text" value={memberForm.phone} onChange={e => setMemberForm({...memberForm, phone: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Membership Date</label>
            <input className="form-control" type="date" value={memberForm.membershipDate} onChange={e => setMemberForm({...memberForm, membershipDate: e.target.value})} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn btn-primary"><Plus size={18} /> Register Member</button>
          </div>
        </form>
      </div>

      <div className="glass-panel">
        <div className="panel-header">
          <h2>Library Members</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Member Since</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map(member => (
                <tr key={member.id}>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td>{member.phone}</td>
                  <td>{member.membershipDate}</td>
                  <td className="action-buttons">
                    <button className="btn btn-danger" onClick={() => handleDeleteMember(member.id)}><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderBorrows = () => {
    const activeBorrows = borrows.filter(b => b.status === 'BORROWED');
    const returnedBorrows = borrows.filter(b => b.status === 'RETURNED');

    return (
      <div className="content-area">
        <div className="glass-panel">
          <div className="panel-header">
            <h2>Issue Book</h2>
          </div>
          <form onSubmit={handleBorrow} className="grid-2">
            <div className="form-group">
              <label>Select Member</label>
              <select required className="form-control" value={borrowForm.memberId} onChange={e => setBorrowForm({...borrowForm, memberId: e.target.value})}>
                <option value="">-- Select Member --</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.email})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Select Book</label>
              <select required className="form-control" value={borrowForm.bookId} onChange={e => setBorrowForm({...borrowForm, bookId: e.target.value})}>
                <option value="">-- Select Book --</option>
                {books.filter(b => b.availableCopies > 0).map(b => (
                  <option key={b.id} value={b.id}>{b.title} by {b.author}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <button type="submit" className="btn btn-primary"><BookOpen size={18} /> Issue Book</button>
            </div>
          </form>
        </div>

        <div className="glass-panel">
          <div className="panel-header">
            <h2>Active Borrows</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Book</th>
                  <th>Borrow Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeBorrows.map(borrow => {
                  const member = members.find(m => m.id === borrow.memberId);
                  const book = books.find(b => b.id === borrow.bookId);
                  return (
                    <tr key={borrow.id}>
                      <td>{member ? member.name : borrow.memberId}</td>
                      <td>{book ? book.title : borrow.bookId}</td>
                      <td>{borrow.borrowDate}</td>
                      <td><span className="badge badge-warning">Active</span></td>
                      <td>
                        <button className="btn btn-secondary" onClick={() => handleReturn(borrow.id)}>Return Book</button>
                      </td>
                    </tr>
                  )
                })}
                {activeBorrows.length === 0 && (
                  <tr><td colSpan="5" style={{textAlign: 'center', color: 'var(--text-secondary)'}}>No active borrows</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="glass-panel">
          <div className="panel-header">
            <h2>Borrow History</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Book</th>
                  <th>Borrow Date</th>
                  <th>Return Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {returnedBorrows.map(borrow => {
                  const member = members.find(m => m.id === borrow.memberId);
                  const book = books.find(b => b.id === borrow.bookId);
                  return (
                    <tr key={borrow.id}>
                      <td>{member ? member.name : borrow.memberId}</td>
                      <td>{book ? book.title : borrow.bookId}</td>
                      <td>{borrow.borrowDate}</td>
                      <td>{borrow.returnDate}</td>
                      <td><span className="badge badge-success">Returned</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <header>
        <div className="logo">Nexus Library</div>
        <div className="tabs">
          <button className={`tab-btn ${activeTab === 'books' ? 'active' : ''}`} onClick={() => setActiveTab('books')}>
            <Book size={20} /> Books
          </button>
          <button className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}>
            <Users size={20} /> Members
          </button>
          <button className={`tab-btn ${activeTab === 'borrows' ? 'active' : ''}`} onClick={() => setActiveTab('borrows')}>
            <BookOpen size={20} /> Circulation
          </button>
        </div>
      </header>

      <main>
        {activeTab === 'books' && renderBooks()}
        {activeTab === 'members' && renderMembers()}
        {activeTab === 'borrows' && renderBorrows()}
      </main>
    </div>
  );
}

export default App;
