import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const systemMessage = { sender: 'system', text: data.reply || '' };
      setMessages((prev) => [...prev, systemMessage]);
    } catch (error) {
      const errorMessage = { sender: 'system', text: 'System is in Offline' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div style={styles.page}>
      <motion.div
        style={styles.terminal}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div style={styles.header}>TARS / COMMAND</div>

        <div style={styles.messages}>
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                style={{
                  ...styles.message,
                  color: msg.sender === 'user' ? '#00FF88' : '#00FF00',
                }}
              >
                {msg.sender === 'user' ? `> ${msg.text}` : <TypeWriter text={msg.text} />}
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <motion.div
              key="typing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ color: '#00FF00', marginTop: 5 }}
            >
              vectorizing inputs<span className="dots">...</span>
            </motion.div>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <span style={styles.prompt}>&gt;</span>
          <input
            style={styles.input}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
        </form>
      </motion.div>
    </div>
  );
};

// Typing effect
const TypeWriter = ({ text }) => {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 18);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayed}</span>;
};

const styles = {
  page: {
    backgroundColor: '#000',
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'monospace',
  },
  terminal: {
    background: '#000',
    color: '#00FF00',
    width: '90%',
    maxWidth: '1000px',
    height: '90vh',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    border: '2px solid rgba(0, 0, 0, 0.93)',
boxShadow: '0 0 20px rgba(142, 142, 142, 0.8)',

    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative',
  },
  header: {
    fontSize: '1rem',
    color: '#00FF00',
    marginBottom: '10px',
    letterSpacing: '1px',
    textShadow: '0 0 6px #00FF00',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    marginBottom: '15px',
  },
  message: {
    marginBottom: '10px',
    whiteSpace: 'pre-wrap',
    fontSize: '0.95rem',
    transition: 'all 0.3s ease',
  },
  form: {
    display: 'flex',
    alignItems: 'center',
  },
  prompt: {
    color: '#00FF00',
    fontWeight: 'bold',
    fontSize: '1rem',
    marginRight: '8px',
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#00FF00',
    fontSize: '1rem',
    caretColor: '#00FF00',
  },
};

export default Home;
