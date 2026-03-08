import React, { useEffect, useRef, useState } from 'react';

function App() {
  // Controlled input state for the cloud term.
  const [term, setTerm] = useState('');
  // Definition returned by the simulated API lookup.
  const [definition, setDefinition] = useState('Search for a cloud term to see its definition.');
  // UI states for loading and request errors.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Optional UX enhancement: keep a list of recent searches.
  const [recentSearches, setRecentSearches] = useState([]);
  // Ref for auto-focus on page load.
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Future-ready function that can be swapped with AWS API Gateway call.
  const fetchDefinition = async (searchTerm) => {
  try {
    const response = await fetch(`https://yke7af3i43.execute-api.us-east-1.amazonaws.com/get-definition?term=${encodeURIComponent(searchTerm)}`);
    const data = await response.json();

    if (response.ok) {
      return data.definition; // DynamoDB field returned by Lambda
    } else {
      return null; // Term not found or error
    }
  } catch (err) {
    console.error(err);
    return null;
  }
 };

  const handleSearch = async () => {
    const sanitizedTerm = term.trim();

    if (!sanitizedTerm) {
      setError('Please enter a cloud term.');
      setDefinition('');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await fetchDefinition(sanitizedTerm);

      if (result) {
        setDefinition(result);
      } else {
        setDefinition('Term not found.');
      }

      setRecentSearches((prev) => {
        const updated = [sanitizedTerm, ...prev.filter((item) => item.toLowerCase() !== sanitizedTerm.toLowerCase())];
        return updated.slice(0, 5);
      });
    } catch (requestError) {
      setDefinition('');
      setError('Failed to fetch definition. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const styles = {
    page: {
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: '40px 20px',
      boxSizing: 'border-box',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      background: 'linear-gradient(160deg, #f8fafc 0%, #eef2ff 45%, #f1f5f9 100%)'
    },
    container: {
      width: '100%',
      maxWidth: '760px',
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      padding: '28px',
      boxSizing: 'border-box',
      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)'
    },
    header: {
      textAlign: 'center',
      marginBottom: '20px'
    },
    title: {
      marginTop: 0,
      marginBottom: '8px',
      fontSize: '2rem',
      color: '#0f172a'
    },
    subtitle: {
      margin: 0,
      color: '#64748b',
      fontSize: '0.98rem'
    },
    controls: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
      marginTop: '14px'
    },
    input: {
      flex: 1,
      minWidth: 0,
      padding: '12px 14px',
      border: '1px solid #cbd5e1',
      borderRadius: '10px',
      fontSize: '15px',
      outline: 'none',
      backgroundColor: '#ffffff'
    },
    button: {
      padding: '12px 18px',
      border: 'none',
      borderRadius: '10px',
      cursor: loading ? 'not-allowed' : 'pointer',
      background: loading ? '#94a3b8' : 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
      color: '#ffffff',
      fontWeight: 600,
      letterSpacing: '0.2px',
      minWidth: '110px',
      boxShadow: loading ? 'none' : '0 6px 14px rgba(37, 99, 235, 0.25)'
    },
    resultBox: {
      marginTop: '22px',
      padding: '16px',
      border: '1px solid #dbeafe',
      borderRadius: '10px',
      lineHeight: 1.6,
      backgroundColor: '#f8fbff',
      color: '#1e293b'
    },
    loading: {
      marginTop: '14px',
      color: '#1d4ed8',
      fontWeight: 600,
      backgroundColor: '#eff6ff',
      border: '1px solid #bfdbfe',
      borderRadius: '8px',
      padding: '10px 12px'
    },
    error: {
      marginTop: '14px',
      color: '#b91c1c',
      fontWeight: 600,
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      padding: '10px 12px'
    },
    recentWrapper: {
      marginTop: '20px',
      borderTop: '1px solid #e2e8f0',
      paddingTop: '14px'
    },
    recentTitle: {
      margin: '0 0 10px',
      color: '#334155'
    },
    recentList: {
      margin: 0,
      paddingLeft: '18px',
      color: '#475569',
      lineHeight: 1.7
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Cloud Dictionary</h1>
          <p style={styles.subtitle}>Quick definitions for common cloud concepts</p>
        </div>

        <div style={styles.controls}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter cloud term (e.g., Lambda, S3, EC2)"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            onKeyDown={handleKeyDown}
            style={styles.input}
            aria-label="Cloud term input"
          />
          <button
            type="button"
            onClick={handleSearch}
            style={styles.button}
            disabled={loading}
          >
            Search
          </button>
        </div>

        {loading && <div style={styles.loading}>Loading...</div>}
        {error && <div style={styles.error}>{error}</div>}

        {!loading && !error && (
          <div style={styles.resultBox}>
            {definition}
          </div>
        )}

        {recentSearches.length > 0 && (
          <div style={styles.recentWrapper}>
            <h3 style={styles.recentTitle}>Recent Searches</h3>
            <ul style={styles.recentList}>
              {recentSearches.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;