import React, { useState, useEffect } from 'react';
import { Play, Book, Headphones, Tv, Heart, Plus, User, Home, Compass, ExternalLink, Ticket, Palette, Mail, LogOut, Send } from 'lucide-react';

const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('umamiUser');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  const sendSignInLink = async (email) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    localStorage.setItem('emailForSignIn', email);
    setEmailSent(true);
    setLoading(false);
  };

  const completeEmailSignIn = async () => {
    const email = localStorage.getItem('emailForSignIn');
    if (!email) return;
    const name = prompt('Welcome! What should we call you?');
    if (!name) return;
    const newUser = {
      id: Date.now(),
      email,
      name,
      avatar: `https://api.dicebear.com/9.x/open-peeps/svg?seed=${name}&backgroundColor=ffd5dc`
    };
    setCurrentUser(newUser);
    localStorage.setItem('umamiUser', JSON.stringify(newUser));
    localStorage.removeItem('emailForSignIn');
    setEmailSent(false);
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    const name = prompt('Welcome! What should we call you?');
    if (!name) { setLoading(false); return; }
    const email = prompt('Your email?');
    if (!email) { setLoading(false); return; }
    const newUser = {
      id: Date.now(),
      email,
      name,
      avatar: `https://api.dicebear.com/9.x/open-peeps/svg?seed=${name}&backgroundColor=c0aede`
    };
    setCurrentUser(newUser);
    localStorage.setItem('umamiUser', JSON.stringify(newUser));
    setLoading(false);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('umamiUser');
    setEmailSent(false);
  };

  return { currentUser, loading, emailSent, sendSignInLink, completeEmailSignIn, signInWithGoogle, logout };
};

export default function App() {
  const { currentUser, loading, emailSent, sendSignInLink, completeEmailSignIn, signInWithGoogle, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [activeTab, setActiveTab] = useState('feed');
  const [likedItems, setLikedItems] = useState(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ type: 'music', content: '', category: '' });
  const [feedItems, setFeedItems] = useState(() => {
    const saved = localStorage.getItem('umamiFeed');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('umamiFeed', JSON.stringify(feedItems));
  }, [feedItems]);

  const getColorForType = (t) => {
    const c = { music: 'from-purple-50 to-pink-50', book: 'from-amber-50 to-yellow-50', tv: 'from-blue-50 to-cyan-50', podcast: 'from-green-50 to-emerald-50', theatre: 'from-rose-50 to-red-50', exhibition: 'from-indigo-50 to-violet-50' };
    return `bg-gradient-to-br ${c[t] || 'from-gray-50 to-gray-100'}`;
  };

  const getLinksForType = (t) => {
    const l = {
      music: [{ service: 'Spotify', url: 'https://open.spotify.com' }, { service: 'Apple Music', url: 'https://music.apple.com' }],
      book: [{ service: 'Audible', url: 'https://audible.com' }, { service: 'Kindle', url: 'https://amazon.com/kindle' }],
      tv: [{ service: 'Netflix', url: 'https://netflix.com' }, { service: 'Hulu', url: 'https://hulu.com' }],
      podcast: [{ service: 'Spotify', url: 'https://open.spotify.com' }, { service: 'Apple Podcasts', url: 'https://podcasts.apple.com' }],
      theatre: [{ service: 'TodayTix', url: 'https://todaytix.com' }],
      exhibition: [{ service: 'Website', url: '#' }]
    };
    return l[t] || [];
  };

  const handleAddItem = () => {
    if (!newItem.content || !newItem.category) return alert('Please fill in all fields');
    const item = {
      id: Date.now(),
      user: currentUser.name,
      avatar: currentUser.avatar,
      type: newItem.type,
      content: newItem.content,
      category: newItem.category,
      time: new Date().toLocaleString(),
      color: getColorForType(newItem.type),
      links: getLinksForType(newItem.type)
    };
    setFeedItems([item, ...feedItems]);
    setShowAddModal(false);
    setNewItem({ type: 'music', content: '', category: '' });
  };

  const getIcon = (t) => {
    const cls = "w-4 h-4";
    const icons = { music: <Headphones className={cls}/>, book: <Book className={cls}/>, tv: <Tv className={cls}/>, podcast: <Play className={cls}/>, theatre: <Ticket className={cls}/>, exhibition: <Palette className={cls}/> };
    return icons[t] || null;
  };

  const toggleLike = (id) => setLikedItems(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-light tracking-wide text-gray-900 mb-2">umami</h1>
            <p className="text-sm text-gray-600 font-light">social media for taste, not takes</p>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8 border border-gray-100">
            {!emailSent ? (
              <>
                <h2 className="text-lg font-medium text-gray-900 mb-6">Sign in to umami</h2>
                <button onClick={signInWithGoogle} disabled={loading} className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-3 mb-4">
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Continue with Google
                </button>
                <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div><div className="relative flex justify-center text-sm"><span className="px-4 bg-white/80 text-gray-500">or</span></div></div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendSignInLink(email)} placeholder="you@example.com" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg outline-none" />
                    </div>
                  </div>
                  <button onClick={() => sendSignInLink(email)} disabled={loading} className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800">{loading ? 'Sending...' : 'Send me a sign-in link'}</button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><Mail className="w-8 h-8 text-green-600" /></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Check your email</h3>
                <p className="text-sm text-gray-600 mb-6">We sent a sign-in link to <strong>{localStorage.getItem('emailForSignIn')}</strong></p>
                <button onClick={completeEmailSignIn} className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 mb-4">Complete Sign In (Demo)</button>
                <button onClick={() => setEmailSent(false)} className="text-sm text-gray-600 hover:text-gray-900">Use a different email</button>
              </div>
            )}
          </div>
          <p className="text-center text-xs text-gray-500 mt-6">Beta v1.0</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="sticky top-0 bg-white/80 backdrop-blur border-b border-gray-100 px-6 py-5 z-10">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-light tracking-wide text-gray-900">umami</h1><p className="text-xs text-gray-500 mt-1 font-light">what your friends are into</p></div>
          <button onClick={logout} className="text-gray-400 hover:text-gray-600"><LogOut className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="pb-20">
        {activeTab === 'feed' && (feedItems.length === 0 ? (
          <div className="text-center py-16 px-6">
            <Plus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-sm text-gray-500 mb-6">Be the first to share what you're into!</p>
            <button onClick={() => setShowAddModal(true)} className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium">Share something</button>
          </div>
        ) : feedItems.map(item => (
          <div key={item.id} className={`${item.color} border-b border-gray-50 p-6`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <img src={item.avatar} alt={item.user} className="w-10 h-10 rounded-full" />
                <div><p className="font-medium text-gray-900 text-sm">{item.user}</p><p className="text-xs text-gray-400">{item.time}</p></div>
              </div>
              <div className="text-gray-400">{getIcon(item.type)}</div>
            </div>
            <div>
              <p className="text-base font-medium text-gray-900 mb-0.5">{item.content}</p>
              <p className="text-xs text-gray-500 mb-4 font-light">{item.category}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {item.links.map((l, i) => <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="text-gray-500 text-xs px-2 py-1 rounded flex items-center gap-1 hover:bg-white/50">{l.service}<ExternalLink className="w-2.5 h-2.5" /></a>)}
              </div>
              <button onClick={() => toggleLike(item.id)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400">
                <Heart className={`w-3.5 h-3.5 ${likedItems.has(item.id) ? 'fill-red-400 text-red-400' : ''}`} />
                <span className={likedItems.has(item.id) ? 'text-red-400' : ''}>{likedItems.has(item.id) ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>
        )))}

        {activeTab === 'saved' && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-1">Saved Items</h2>
            <p className="text-xs text-gray-500 mb-6 font-light">things you want to check out</p>
            {likedItems.size === 0 ? (
              <div className="text-center py-12"><Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No saved items yet</p></div>
            ) : (
              <div className="space-y-2">{feedItems.filter(i => likedItems.has(i.id)).map(i => <div key={i.id} className="bg-gray-50 rounded-lg p-4"><p className="font-medium text-sm">{i.content}</p><p className="text-xs text-gray-500 mt-1">{i.category}</p></div>)}</div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="p-6">
            <div className="text-center mb-8">
              <img src={currentUser.avatar} alt={currentUser.name} className="w-24 h-24 rounded-full mx-auto mb-4" />
              <h2 className="text-xl font-medium text-gray-900">{currentUser.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{currentUser.email}</p>
            </div>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-4"><p className="text-sm text-gray-600">Items shared</p><p className="text-2xl font-medium text-gray-900 mt-1">{feedItems.filter(i => i.user === currentUser.name).length}</p></div>
              <div className="bg-gray-50 rounded-lg p-4"><p className="text-sm text-gray-600">Saved items</p><p className="text-2xl font-medium text-gray-900 mt-1">{likedItems.size}</p></div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur border-t border-gray-100">
        <div className="flex justify-around items-center px-6 py-3">
          <button onClick={() => setActiveTab('feed')} className={`flex flex-col items-center gap-1 ${activeTab === 'feed' ? 'text-gray-900' : 'text-gray-400'}`}><Home className="w-5 h-5" /><span className="text-xs font-light">Feed</span></button>
          <button onClick={() => setShowAddModal(true)} className="bg-gray-900 text-white rounded-full p-3 -mt-6 shadow-lg hover:bg-gray-800"><Plus className="w-5 h-5" /></button>
          <button onClick={() => setActiveTab('saved')} className={`flex flex-col items-center gap-1 ${activeTab === 'saved' ? 'text-gray-900' : 'text-gray-400'}`}><Heart className="w-5 h-5" /><span className="text-xs font-light">Saved</span></button>
          <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-gray-900' : 'text-gray-400'}`}><User className="w-5 h-5" /><span className="text-xs font-light">Profile</span></button>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">Share what you're into</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><Plus className="w-6 h-6 rotate-45" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none">
                  <option value="music">Music</option><option value="book">Book</option><option value="tv">TV/Film</option><option value="podcast">Podcast</option><option value="theatre">Theatre</option><option value="exhibition">Exhibition</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input type="text" value={newItem.content} onChange={e => setNewItem({...newItem, content: e.target.value})} placeholder="e.g., Blonde - Frank Ocean" className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input type="text" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} placeholder="e.g., Album, Novel, TV Series" className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none" />
              </div>
              <button onClick={handleAddItem} className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 flex items-center justify-center gap-2"><Send className="w-4 h-4" />Share</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
