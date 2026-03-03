import React, { useState, useEffect, useRef } from 'react';
import { Send, ChevronUp, User, MapPin, Clock, Info } from 'lucide-react';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '您好！我是高大美食助手 🍴\n今天想在高雄大學附近找什麼好吃的呢？' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text) => {
    const messageToSend = text || input;
    if (!messageToSend.trim() || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: messageToSend }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSend }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error("詳細錯誤資訊:", error); 
      setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ 連線失敗，請確認後端已啟動。" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#7494C0', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
      
      {/* 頂部標題列 */}
      <header style={{ backgroundColor: '#ffffff', padding: '15px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <div style={{ width: '10px', height: '100%', backgroundColor: '#06C755', position: 'absolute', left: 0 }}></div>
        高大美食推薦系統 📍
      </header>

      {/* 聊天內容區 */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '15px' }}>
            {msg.role === 'assistant' && (
              <div style={{ width: '35px', height: '35px', backgroundColor: '#fff', borderRadius: '50%', marginRight: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd' }}>
                🍜
              </div>
            )}
            <div style={{ 
              maxWidth: '70%', 
              padding: '10px 14px', 
              borderRadius: '15px', 
              fontSize: '0.95rem',
              lineHeight: '1.4',
              whiteSpace: 'pre-wrap',
              backgroundColor: msg.role === 'user' ? '#06C755' : '#ffffff',
              color: msg.role === 'user' ? '#ffffff' : '#000000',
              position: 'relative',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <div style={{ color: '#fff', fontSize: '0.8rem', marginLeft: '43px' }}>讀取中...</div>}
      </div>

      {/* 底部功能區 (Rich Menu 模擬) */}
      <div style={{ backgroundColor: '#f4f4f4' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid #ddd' }}>
          {[
            { label: '隨機美食', icon: <Search size={18} />, query: '隨機推薦高大附近的店' },
            { label: '熱門評分', icon: <MapPin size={18} />, query: '推薦高大評分最高的餐廳' },
            { label: '營業時間', icon: <Clock size={18} />, query: '現在有開的店有哪些？' }
          ].map((item) => (
            <button key={item.label} onClick={() => sendMessage(item.query)} style={{ background: '#fff', border: '1px solid #eee', padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.75rem', cursor: 'pointer', gap: '5px' }}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* 文字輸入列 */}
        <div style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fff' }}>
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="請輸入訊息"
            style={{ flex: 1, border: '1px solid #ddd', borderRadius: '20px', padding: '8px 15px', outline: 'none', backgroundColor: '#f9f9f9' }}
          />
          <button onClick={() => sendMessage()} style={{ color: '#06C755', border: 'none', background: 'none', cursor: 'pointer' }}>
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;