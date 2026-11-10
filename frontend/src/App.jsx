import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  UploadCloud,
  Send,
  Sparkles,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Copy,
  Check,
  RotateCcw,
  Loader2,
  Bot,
  User,
  Trash2
} from 'lucide-react';
import { marked } from 'marked';

const API_BASE = 'http://localhost:5001';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isIndexed, setIsIndexed] = useState(false);
  const [question, setQuestion] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = async (selectedFile) => {
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
      setError('Please select a valid PDF file.');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit.');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setIsUploading(true);
    setMessages([]);

    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);

      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse PDF.');

      setIsIndexed(true);
      setMessages([
        {
          id: Date.now(),
          sender: 'bot',
          text: `👋 Hello! I've read and indexed **${selectedFile.name}** (${data.totalChunks || 'all'} sections).\n\nYou can now ask me any question about this document!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error uploading file.');
      setFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setIsIndexed(false);
    setMessages([]);
    setError(null);
    setQuestion('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async (textToSend) => {
    const query = typeof textToSend === 'string' ? textToSend : question;
    if (!query.trim() || isTyping) return;

    if (!isIndexed) {
      setError('Please upload a PDF document first.');
      return;
    }

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: query.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setError(null);
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch answer.');

      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.answer || "I couldn't find an answer to that question in the document.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: `⚠️ Error: ${err.message || 'Unable to retrieve answer.'}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const suggestions = [
    'Summarize this document in simple points',
    'What are the key points in this PDF?',
    'Explain the most important concepts'
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
      {/* Ambient background glows */}
      <div className="ambient-bg">
        <div className="glow-orb glow-1"></div>
        <div className="glow-orb glow-2"></div>
        <div className="glow-orb glow-3"></div>
      </div>

      <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto', padding: '20px 16px', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
        
        {/* Top Navbar */}
        <header
          className="glass-panel"
          style={{
            borderRadius: '20px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          {/* Logo & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              }}
            >
              <FileText size={20} color="#ffffff" />
            </div>
            <div>
              <h1 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                PDF Q&amp;A Assistant
              </h1>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Ask anything from your PDF document
              </p>
            </div>
          </div>

          {/* Theme Toggle Capsule */}
          <div
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--badge-bg)',
              border: '1px solid var(--badge-border)',
              borderRadius: '30px',
              padding: '3px',
              cursor: 'pointer',
              gap: '3px',
              userSelect: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
            }}
          >
            <div
              style={{
                padding: '4px 7px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                background: theme === 'light' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                color: theme === 'light' ? '#4f46e5' : 'var(--text-muted)',
                transition: 'all 0.2s',
              }}
            >
              <Sun size={14} />
            </div>
            <div
              style={{
                padding: '4px 7px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                background: theme === 'dark' ? '#6366f1' : 'transparent',
                color: theme === 'dark' ? '#ffffff' : 'var(--text-muted)',
                transition: 'all 0.2s',
              }}
            >
              <Moon size={14} />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main
          className="glass-panel"
          style={{
            borderRadius: '24px',
            padding: isIndexed ? '20px 24px 24px 24px' : '36px 32px 32px 32px',
            position: 'relative',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* STATE 1: Upload Dropzone (When no document is ready yet) */}
          {!isIndexed && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Sparkles Icon Badge */}
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(168, 85, 247, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(168, 85, 247, 0.25)',
                  marginBottom: '14px',
                }}
              >
                <Sparkles size={22} color="#a855f7" />
              </div>

              {/* Heading */}
              <div style={{ textAlign: 'center', marginBottom: '26px' }}>
                <h2 style={{ fontSize: '30px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                  Your PDF, Our <span className="gradient-text-ai">AI</span>
                </h2>
                <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  Upload a PDF and chat with it. Get accurate answers powered by Gemini AI.
                </p>
              </div>

              {/* Upload Dropzone Container */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  width: '100%',
                  borderRadius: '18px',
                  border: isDragging
                    ? '2px dashed var(--accent-indigo)'
                    : '1.5px dashed var(--dropzone-border)',
                  background: 'var(--dropzone-bg)',
                  padding: '36px 20px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '36px',
                  transition: 'all 0.2s ease',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                }}
              >
                {/* 3D PDF Graphic with Orbit Ring */}
                <div className="pdf-3d-wrapper">
                  <div className="orbit-ring"></div>
                  <div className="pdf-icon-card">
                    <FileText size={30} color="#ffffff" style={{ marginBottom: '5px' }} />
                    <span className="pdf-badge-label">PDF</span>
                  </div>
                </div>

                {/* Upload Action Area */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: 'rgba(56, 189, 248, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '10px',
                    }}
                  >
                    <UploadCloud size={26} color="#0284c7" />
                  </div>

                  <p style={{ fontSize: '15.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Drag &amp; drop your PDF here
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>or</p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    style={{ display: 'none' }}
                    onChange={handleFileInput}
                  />

                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    style={{
                      background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '11px 24px',
                      fontSize: '14px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: isUploading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 16px rgba(37, 99, 235, 0.35)',
                      transition: 'transform 0.15s',
                    }}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                        Indexing PDF...
                      </>
                    ) : (
                      <>
                        <FileText size={16} />
                        Choose PDF File
                      </>
                    )}
                  </button>

                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '12px' }}>
                    Supported: PDF files only • Max size: 10MB
                  </span>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div
                  style={{
                    width: '100%',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    borderRadius: '12px',
                    padding: '10px 16px',
                    marginTop: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13.5px',
                  }}
                >
                  <AlertCircle size={16} color="#ef4444" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}

          {/* STATE 2: Chatbot Conversation View (When PDF is ready) */}
          {isIndexed && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '520px' }}>
              
              {/* PDF Document Status Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--chip-bg)',
                  border: '1px solid var(--chip-border)',
                  borderRadius: '12px',
                  padding: '9px 16px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {file?.name || 'Document Loaded'}
                  </span>
                  <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.18)', color: '#10b981', padding: '1px 7px', borderRadius: '10px', fontWeight: 600 }}>
                    Active
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '12px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <RotateCcw size={13} /> Change PDF
                </button>
              </div>

              {/* Chat Messages Stream */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  maxHeight: '440px',
                  paddingRight: '6px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                {messages.map((msg, index) => (
                  <div
                    key={msg.id || index}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        maxWidth: '85%',
                        flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                      }}
                    >
                      {/* Avatar */}
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          background:
                            msg.sender === 'user'
                              ? 'linear-gradient(135deg, #6366f1, #3b82f6)'
                              : 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                          color: '#ffffff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        }}
                      >
                        {msg.sender === 'user' ? <User size={15} /> : <Bot size={15} />}
                      </div>

                      {/* Message Bubble */}
                      <div
                        style={{
                          background: msg.sender === 'user' ? 'var(--user-bubble-bg)' : 'var(--bot-bubble-bg)',
                          color: msg.sender === 'user' ? 'var(--user-bubble-text)' : 'var(--text-primary)',
                          border: msg.sender === 'user' ? 'none' : '1px solid var(--bot-bubble-border)',
                          borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          padding: '12px 16px',
                          fontSize: '14px',
                          lineHeight: 1.6,
                          boxShadow: '0 3px 12px rgba(0,0,0,0.06)',
                          position: 'relative',
                        }}
                      >
                        {msg.sender === 'bot' ? (
                          <>
                            <div
                              className="markdown-body"
                              dangerouslySetInnerHTML={{ __html: marked.parse(msg.text || '') }}
                            />
                            {/* Copy button */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(msg.text, index)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: 'var(--text-muted)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '11px',
                                  padding: '2px 4px',
                                }}
                              >
                                {copiedIndex === index ? (
                                  <>
                                    <Check size={12} color="#10b981" />
                                    <span style={{ color: '#10b981' }}>Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={12} />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </>
                        ) : (
                          <div>{msg.text}</div>
                        )}
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '10.5px',
                        color: 'var(--text-muted)',
                        marginTop: '3px',
                        padding: msg.sender === 'user' ? '0 38px 0 0' : '0 0 0 38px',
                      }}
                    >
                      {msg.time}
                    </span>
                  </div>
                ))}

                {/* AI-Bot Typing Indicator */}
                {isTyping && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                        color: '#ffffff',
                      }}
                    >
                      <Bot size={15} />
                    </div>
                    <div
                      style={{
                        background: 'var(--bot-bubble-bg)',
                        border: '1px solid var(--bot-bubble-border)',
                        borderRadius: '16px',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: 'var(--text-secondary)',
                        fontSize: '13px',
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>AI-Bot is typing</span>
                      <div className="typing-dots">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick suggestions when conversation just started */}
              {messages.length <= 1 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(s)}
                      style={{
                        background: 'var(--chip-bg)',
                        border: '1px solid var(--chip-border)',
                        color: 'var(--chip-text)',
                        borderRadius: '20px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'transform 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                      💡 {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                style={{ width: '100%', marginTop: 'auto' }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--input-border)',
                    borderRadius: '35px',
                    padding: '5px 8px 5px 18px',
                    boxShadow: '0 4px 18px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <HelpCircle size={18} color="var(--text-muted)" style={{ marginRight: '10px', flexShrink: 0 }} />
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a question from this document..."
                    disabled={isTyping}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: 'var(--text-primary)',
                      fontSize: '14.5px',
                      fontFamily: 'inherit',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isTyping || !question.trim()}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)',
                      border: 'none',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: isTyping || !question.trim() ? 'not-allowed' : 'pointer',
                      opacity: isTyping || !question.trim() ? 0.5 : 1,
                      boxShadow: '0 3px 12px rgba(99, 102, 241, 0.4)',
                      flexShrink: 0,
                    }}
                  >
                    <Send size={17} />
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
