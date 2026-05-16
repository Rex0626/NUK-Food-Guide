import { useState, useEffect, useRef } from 'react';
import { Send, MapPin, Clock, Search, Phone, Globe, Star, Plus, Settings, History, Menu, Trash2 } from 'lucide-react';
import Markdown from 'react-markdown'; 


function App() {
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // 核心資料結構：管理多輪獨立對話
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('nuk_food_chats_v4');
    return saved ? JSON.parse(saved) : [
      {
        id: 'default',
        title: '新對話',
        messages: [{ role: 'assistant', content: '您好！我是高大美食助手 🍴\n今天想在高雄大學附近找什麼好吃的呢？', restaurants: [] }]
      }
    ];
  });
  const [currentChatId, setCurrentChatId] = useState('default');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const currentChat = chats.find(c => c.id === currentChatId) || chats[0];

  useEffect(() => {
    localStorage.setItem('nuk_food_chats_v4', JSON.stringify(chats));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, currentChatId]);

  const sendMessage = async (text) => {
    const messageToSend = text || input;
    if (!messageToSend.trim() || loading) return;

    const userMessage = { role: 'user', content: messageToSend, restaurants: [] };
    const isNewChat = currentChat.title === '新對話' && currentChat.messages.length <= 1;
    const newTitle = isNewChat 
      ? (messageToSend.length > 10 ? messageToSend.substring(0, 10) + '...' : messageToSend)
      : currentChat.title;

    setChats(prevChats => prevChats.map(c => {
      if (c.id === currentChatId) {
        return {
          ...c,
          title: newTitle,
          messages: [...c.messages, userMessage]
        };
      }
      return c;
    }));

    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: messageToSend,
          history: currentChat.messages.map(m => ({ role: m.role, content: m.content }))
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || '網路回應不正確');
      }
      
      const data = await response.json();
      
      setChats(prevChats => prevChats.map(c => {
        if (c.id === currentChatId) {
          return {
            ...c,
            messages: [...c.messages, { role: 'assistant', content: data.reply, restaurants: data.restaurants || [] }]
          };
        }
        return c;
      }));
    } catch (error) {
      setChats(prevChats => prevChats.map(c => {
        if (c.id === currentChatId) {
          return {
            ...c,
            messages: [...c.messages, { role: 'assistant', content: `⚠️ 系統錯誤: ${error.message}`, restaurants: [] }]
          };
        }
        return c;
      }));
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = () => {
    const newId = Date.now().toString();
    const newChatObj = {
      id: newId,
      title: '新對話',
      messages: [{ role: 'assistant', content: '您好！開啟了新的對話。今天想吃點什麼呢？', restaurants: [] }]
    };
    setChats([newChatObj, ...chats]);
    setCurrentChatId(newId);
  };

  const deleteChat = (id, e) => {
    e.stopPropagation();
    if (chats.length === 1) {
      alert('請至少保留一個對話視窗。');
      return;
    }
    if (window.confirm('確定要刪除此對話嗎？')) {
      const remainingChats = chats.filter(c => c.id !== id);
      setChats(remainingChats);
      if (currentChatId === id) {
        setCurrentChatId(remainingChats[0].id);
      }
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#ffffff', color: '#1f1f1f', fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif', overflow: 'hidden' }}>
      
      {/* 1. 左側側邊欄 */}
      <aside style={{ 
        width: isSidebarOpen ? '260px' : '0px', 
        opacity: isSidebarOpen ? 1 : 0,
        backgroundColor: '#f0f4f9', 
        display: 'flex', 
        flexDirection: 'column', 
        padding: isSidebarOpen ? '20px 12px' : '20px 0', 
        transition: 'width 0.25s ease, padding 0.25s ease, opacity 0.2s ease',
        boxSizing: 'border-box',
        overflow: 'hidden',
        flexShrink: 0
      }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', width: '236px' }}>
          <button onClick={createNewChat} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#e3eefc', border: 'none', padding: '12px 16px', borderRadius: '24px', fontSize: '0.9rem', fontWeight: '500', color: '#041e49', cursor: 'pointer', width: '100%' }}>
            <Plus size={20} />
            <span>開啟新對話</span>
          </button>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#444746', paddingLeft: '12px', margin: '10px 0' }}>最近對話</p>
            {chats.map((ch) => (
              <div 
                key={ch.id} 
                onClick={() => setCurrentChatId(ch.id)}
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '10px 12px', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer',
                  backgroundColor: ch.id === currentChatId ? '#e9eef6' : 'transparent',
                  color: '#1f1f1f',
                  fontWeight: ch.id === currentChatId ? '600' : '400'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                  <History size={16} style={{ flexShrink: 0, color: '#444746' }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.title}</span>
                </div>
                {chats.length > 1 && (
                  <button onClick={(e) => deleteChat(ch.id, e)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '20px', fontSize: '0.85rem', color: '#444746', cursor: 'pointer', width: '236px' }}>
          <Settings size={18} />
          <span>設定</span>
        </div>
      </aside>

      {/* 2. 右側主對話區 */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
        
        <header style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#ffffff' }}>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444746', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '50%' }}
          >
            <Menu size={22} />
          </button>
          <span style={{ fontSize: '1.25rem', fontWeight: '400', color: '#56585a' }}>高大美食推薦系統 📍</span>
        </header>

        {/* 對話視窗視窗 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0' }}>
          <div style={{ maxWidth: '850px', margin: '0 auto', padding: '0 24px', boxSizing: 'border-box' }}>
            
            {currentChat.messages.map((msg, i) => {
              const isUser = msg.role === 'user';
              return (
                <div key={i} style={{ 
                  display: 'flex', 
                  flexDirection: isUser ? 'row-reverse' : 'row', // 💡 使用 row-reverse 讓使用者元件排列在右側
                  gap: '16px', 
                  marginBottom: '32px', 
                  alignItems: 'flex-start'
                }}>
                  {/* 頭像 */}
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', 
                    backgroundColor: isUser ? '#c2e7ff' : '#f0f4f9', 
                    flexShrink: 0 
                  }}>
                    {isUser ? '👤' : '✨'}
                  </div>
                  
                  {/* 內文區塊（控寬與對齊） */}
                  <div style={{ 
                    maxWidth: '75%', // 💡 限制最大寬度，防止橫向無限拉長超出右邊
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start', // 使用者靠右、AI靠左
                    textAlign: 'left'
                  }}>
                    {/* 稱謂 */}
                    <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#444746', marginBottom: '6px' }}>
                      {isUser ? '你' : '美食助手'}
                    </div>

                    {/* 對話本文 */}
                    <div style={{ 
                      fontSize: '1rem', lineHeight: '1.7', color: '#1f1f1f', whiteSpace: 'pre-wrap', letterSpacing: '0.3px',
                      backgroundColor: isUser ? '#e9eef6' : 'transparent', // 給使用者加上舒服的膠囊底色
                      padding: isUser ? '12px 18px' : '0px',
                      borderRadius: isUser ? '18px 4px 18px 18px' : '0px'
                    }}>
                      <Markdown>{msg.content}</Markdown>
                    </div>

                    {/* 餐廳卡片橫幅流（僅在 AI 回覆且有資料時顯示） */}
                    {!isUser && msg.restaurants && msg.restaurants.length > 0 && (
                      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', padding: '16px 0', width: '100%', maxWidth: '740px', scrollbarWidth: 'none' }}>
                        {msg.restaurants.map((rest, idx) => {
                          const mapUrl = `http://googleusercontent.com/maps.google.com/maps?q=${encodeURIComponent(rest.name)}&query_place_id=${rest.place_id}`;
                          
                          return (
                            <div key={idx} style={{ flex: '0 0 280px', backgroundColor: '#f8fafd', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <h4 style={{ margin: 0, fontSize: '1.02rem', color: '#041e49', fontWeight: '600' }}>{rest.name}</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#b06000' }}>
                                  <Star size={14} fill="#b06000" style={{ border: 'none' }} />
                                  <span>{rest.rating} 顆星</span>
                                  <span style={{ color: '#727775' }}>• 價格:{'￥'.repeat(rest.price_level || 2)}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.85rem', color: '#444746', marginTop: '4px' }}>
                                  <MapPin size={16} style={{ color: '#ea4335', flexShrink: 0 }} />
                                  <span>{rest.address}</span>
                                </div>
                                {rest.formatted_phone_number && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#444746' }}>
                                    <Phone size={14} />
                                    <span>{rest.formatted_phone_number}</span>
                                  </div>
                                )}
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: rest.website ? '1fr 1fr' : '1fr', backgroundColor: '#f0f4f9' }}>
                                <a href={mapUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', padding: '12px', textAlign: 'center', color: '#0b57d0', fontSize: '0.85rem', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                  <MapPin size={14} /> 開啟地圖
                                </a>
                                {rest.website && (
                                  <a href={rest.website} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', padding: '12px', textAlign: 'center', color: '#0b57d0', fontSize: '0.85rem', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                    <Globe size={14} /> 前往網站
                                  </a>
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
            })}

            {loading && (
              <div style={{ display: 'flex', gap: '20px', color: '#444746', fontSize: '0.9rem', alignItems: 'center', paddingLeft: '56px' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: '#0b57d0', borderRadius: '50%' }}></span>
                <span>助理正在搜尋高大精選美食並整理導航資訊...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 3. 底部中央懸浮式輸入區 */}
        <div style={{ width: '100%', padding: '0 24px 24px 24px', boxSizing: 'border-box', backgroundColor: '#ffffff' }}>
          <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', scrollbarWidth: 'none' }}>
              {[
                { label: '約會浪漫餐廳', icon: <Search size={14} />, query: '推薦高大附近適合求婚或約會的浪漫餐廳' },
                { label: '高分熱門美食', icon: <Star size={14} />, query: '推薦高雄大學附近評價高的美食' },
                { label: '現在營業中', icon: <Clock size={14} />, query: '高雄大學附近現在有開的餐廳有哪些' }
              ].map((item) => (
                <button key={item.label} onClick={() => sendMessage(item.query)} style={{ background: '#f0f4f9', border: 'none', padding: '10px 20px', borderRadius: '20px', display: 'flex', alignItems: 'center', fontSize: '0.85rem', cursor: 'pointer', gap: '8px', color: '#444746', whiteSpace: 'nowrap' }}>
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f0f4f9', borderRadius: '32px', padding: '8px 24px' }}>
              <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="輸入餐廳類型、菜色關鍵字..."
                style={{ flex: 1, border: 'none', background: 'transparent', padding: '12px 0', outline: 'none', fontSize: '1rem', color: '#1f1f1f' }}
              />
              <button onClick={() => sendMessage()} style={{ color: input.trim() ? '#0b57d0' : '#c4c7c5', border: 'none', background: 'none', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center' }}>
                <Send size={24} />
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.7rem', color: '#444746', marginTop: '8px', marginBottom: '0' }}>
              美食助手產生的內容僅供參考，請以店家現場公告資訊為準。
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;