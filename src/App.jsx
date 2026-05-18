import { useState, useEffect } from 'react';
import PassageInputPage from './pages/PassageInputPage';
import ClassFollowModePage from './pages/ClassFollowModePage';
import './index.css'; // Make sure styles are imported

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [theme, setTheme] = useState('light');
  const [passages, setPassages] = useState([]);

  // Load theme and passages from local storage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('lingo-theme') || 'light';
    const savedPassages = JSON.parse(localStorage.getItem('lingo-passages') || '[]');
    setTheme(savedTheme);
    setPassages(savedPassages);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('lingo-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleSavePassages = (newPassages) => {
    setPassages(newPassages);
    localStorage.setItem('lingo-passages', JSON.stringify(newPassages));
    setCurrentPage('follow');
  };

  return (
    <div className="app-container">
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px' }}>LingoStar Vision Reader</h1>
        <select 
          value={theme} 
          onChange={(e) => handleThemeChange(e.target.value)}
          style={{ fontSize: '24px', padding: '8px 16px', borderRadius: '8px' }}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="yellow">Yellow</option>
          <option value="blue-soft">Blue Soft</option>
          <option value="high-contrast">High Contrast</option>
        </select>
      </header>

      {currentPage === 'home' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, justifyContent: 'center' }}>
          <button onClick={() => setCurrentPage('input')}>새 지문 입력하기</button>
          {passages.length > 0 && (
            <button onClick={() => setCurrentPage('follow')}>이전 지문 이어서 읽기</button>
          )}
        </div>
      )}

      {currentPage === 'input' && (
        <PassageInputPage 
          onSave={handleSavePassages} 
          onCancel={() => setCurrentPage('home')} 
        />
      )}

      {currentPage === 'follow' && (
        <ClassFollowModePage 
          passages={passages} 
          onBack={() => setCurrentPage('home')} 
        />
      )}
    </div>
  );
}

export default App;
