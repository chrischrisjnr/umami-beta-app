import React, { useState, useEffect } from 'react';
import { Play, Book, Headphones, Tv, Heart, Plus, User, Home, Compass, ExternalLink, Ticket, Palette, Mail, LogOut, Send } from 'lucide-react';

const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('umamiUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const sendSignInLink = async (email) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('emailForSignIn', email);
      setEmailSent(true);
      alert(`Sign-in link sent to ${email}!\n\nFor demo: Click "Complete Sign In" below`);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const completeEmailSignIn = async () => {
    const email = localStorage.getItem('emailForSignIn');
    if (!email) {
      alert('No pending sign-in found');
      return;
    }

    const name = prompt('Welcome! What should we call you?');
    if (!name) return;

    const newUser = {
      id: Date.now(),
      email,
      name,
      avatar: `https://api.dicebear.com/9.x/open-peeps/svg?seed=${name}&backgroundColor=ffffff`,
      authMethod: 'email'
    };

    setCurrentUser(newUser);
    localStorage.setItem('umamiUser', JSON.stringify(newUser));
    localStorage.removeItem('emailForSignIn');
    setEmailSent(false);
  };

  const signInWithGoogle = async () => {
    const name = prompt('Welcome! What should we call you?');
    if (!name) return;
    const email = prompt('And your email?');
    if (!email) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const newUser = {
        id: Date.now(),
        email,
        name,
        avatar: `https://api.dicebear.com/9.x/open-peeps/svg?seed=${name}&backgroundColor=ffffff`,
        authMethod: 'google'
      };

      setCurrentUser(newUser);
      localStorage.setItem('umamiUser', JSON.stringify(newUser));
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setCurrentUser(null);
    localStorage.removeItem('umamiUser');
    setEmailSent(false);
  };

  return { currentUser, loading, emailSent, setEmailSent, sendSignInLink, completeEmailSignIn, signInWithGoogle, logout };
};

export default function App() {
  const { currentUser, loading, emailSent, setEmailSent, sendSignInLink, completeEmailSignIn, signInWithGoogle, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [activeTab, setActiveTab] = useState('feed');
  const [likedItems, setLikedItems] = useState(() => {
    const saved = localStorage.getItem('umamiLikedItems');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ type: 'music', content: '', category: '' });
  const [userItems, setUserItems] = useState(() => {
    const saved = localStorage.getItem('umamiItems');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('umamiItems', JSON.stringify(userItems));
  }, [userItems]);

  useEffect(() => {
    localStorage.setItem('umamiLikedItems', JSON.stringify([...likedItems]));
  }, [likedItems]);

  const handleEmailSignIn = async () => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email');
      return;
    }
    await sendSignInLink(email);
  };

  const handleLogout = async () => {
    await logout();
    setActiveTab('feed');
  };

  const handleAddItem = () => {
    if (!newItem.content || !newItem.category) {
      alert('Please fill in content and category');
      return;
    }

    const item = {
      id: Date.now(),
      userId: currentUser.id,
      user: currentUser.name,
      avatar: currentUser.avatar,
      type: newItem.type,
      content: newItem.content,
      category: newItem.category,
      time: 'Just now',
      wikiUrl: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(newItem.content)}`
    };

    setUserItems([item, ...userItems]);
    setShowAddModal(false);
    setNewItem({ type: 'music', content: '', category: '' });
  };

  const categoryOptions = {
    music: ['Album', 'Single', 'EP', 'Mixtape', 'Soundtrack', 'Live Album'],
    book: ['Novel', 'Non-Fiction', 'Poetry', 'Memoir', 'Short Stories', 'Graphic Novel'],
    tv: ['TV Series', 'Film', 'Documentary', 'Mini-Series', 'Anime', 'Short Film'],
    podcast: ['Interview', 'Narrative', 'Comedy', 'True Crime', 'Educational', 'News'],
    theatre: ['Musical', 'Play', 'Opera', 'Ballet', 'Comedy', 'One-Person Show'],
    exhibition: ['Art', 'Photography', 'History', 'Science', 'Design', 'Mixed Media']
  };

  const allFeedItems = userItems;

  const getIcon = (type) => {
    const iconClass = "w-4 h-4";
    switch(type) {
      case 'music': return <Headphones className={iconClass} />;
      case 'book': return <Book className={iconClass} />;
      case 'tv': return <Tv className={iconClass} />;
      case 'podcast': return <Play className={iconClass} />;
      case 'theatre': return <Ticket className={iconClass} />;
      case 'exhibition': return <Palette className={iconClass} />;
      default: return null;
    }
  };

  const toggleLike = (id) => {
    setLikedItems(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <h1 className="text-4xl tracking-wider text-black mb-2 uppercase">umami</h1>
            <p className="text-xs text-black/50 tracking-wide">taste, not takes</p>
          </div>

          <div className="border border-black/10 p-8">
            {!emailSent ? (
              <>
                <h2 className="text-sm font-bold text-black mb-6 uppercase tracking-wider">Sign in</h2>

                <button
                  onClick={signInWithGoogle}
                  disabled={loading}
                  className="w-full border border-black text-black py-3 px-4 text-xs tracking-wider uppercase hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-3 mb-4"
                >
                  Continue with Google
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-black/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-4 bg-white text-black/40 uppercase tracking-wider">or</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-black mb-2 uppercase tracking-wider">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black/30" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleEmailSignIn()}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 border border-black/20 text-sm focus:border-black outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleEmailSignIn}
                    disabled={loading}
                    className="w-full bg-black text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-black/80 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send sign-in link'}
                  </button>
                </div>

                <p className="text-xs text-black/30 mt-6 text-center tracking-wide">
                  No password required
                </p>
              </>
            ) : (
              <div className="text-center">
                <Mail className="w-8 h-8 text-black mx-auto mb-4" />
                <h3 className="text-sm font-bold text-black mb-2 uppercase tracking-wider">Check your email</h3>
                <p className="text-xs text-black/50 mb-6">
                  Link sent to <strong className="text-black">{localStorage.getItem('emailForSignIn')}</strong>
                </p>

                <div className="border border-black/10 p-4 mb-6">
                  <p className="text-xs text-black/40 mb-3 uppercase tracking-wider">Demo mode</p>
                  <button
                    onClick={completeEmailSignIn}
                    className="w-full bg-black text-white py-2 px-4 text-xs font-bold uppercase tracking-wider hover:bg-black/80 transition-colors"
                  >
                    Complete Sign In
                  </button>
                </div>

                <button
                  onClick={() => setEmailSent(false)}
                  className="text-xs text-black/40 hover:text-black tracking-wide uppercase"
                >
                  Use different email
                </button>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-black/20 mt-8 tracking-wider uppercase">
            Beta v1.0
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white min-h-screen relative sm:border-x sm:border-black/5">
      <div className="sticky top-0 bg-white border-b border-black/10 px-4 sm:px-6 py-4 sm:py-5 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg tracking-widest text-black uppercase">umami</h1>
            <p className="text-xs text-black/30 mt-0.5 tracking-wide">what you're into right now</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-black/30 hover:text-black transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="pb-24">
        {activeTab === 'feed' && allFeedItems.length === 0 && (
          <div className="text-center py-20 px-4 sm:px-6">
            <Plus className="w-8 h-8 text-black/20 mx-auto mb-4" />
            <p className="text-sm text-black font-bold uppercase tracking-wider mb-1">Empty</p>
            <p className="text-xs text-black/40 mb-8 tracking-wide">Share what you're into</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-black/80 transition-colors"
            >
              Add your first pick
            </button>
          </div>
        )}
        {activeTab === 'feed' && allFeedItems.map((item) => (
          <div key={item.id} className="border-b border-black/5 p-4 sm:p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <img
                  src={item.avatar}
                  alt={item.user}
                  className="w-8 h-8 rounded-full border border-black/10"
                />
                <div>
                  <p className="text-xs font-bold text-black uppercase tracking-wider">{item.user}</p>
                  <p className="text-xs text-black/30 mt-0.5">{item.time}</p>
                </div>
              </div>
              <div className="text-black/20">
                {getIcon(item.type)}
              </div>
            </div>

            <div className="ml-11">
              <p className="text-sm text-black mb-0.5">{item.content}</p>
              <p className="text-xs text-black/40 mb-4 tracking-wide">{item.category}</p>

              <div className="mb-4">
                <a
                  href={item.wikiUrl || `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(item.content)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black/30 text-xs tracking-wide uppercase flex items-center gap-1 hover:text-black transition-colors"
                >
                  Wikipedia
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              <button
                onClick={() => toggleLike(item.id)}
                className="flex items-center gap-1.5 text-xs text-black/30 hover:text-black transition-colors"
              >
                <Heart
                  className={`w-3.5 h-3.5 ${likedItems.has(item.id) ? 'fill-black text-black' : ''}`}
                />
                <span className={likedItems.has(item.id) ? 'text-black' : ''}>
                  {likedItems.has(item.id) ? 'Saved' : 'Save'}
                </span>
              </button>
            </div>
          </div>
        ))}

        {activeTab === 'discover' && (
          <div className="p-4 sm:p-6">
            <h2 className="text-sm font-bold text-black uppercase tracking-wider mb-1">Discover</h2>
            <p className="text-xs text-black/30 mb-8 tracking-wide">find people with great taste</p>
            <div className="text-center py-12">
              <Compass className="w-8 h-8 text-black/15 mx-auto mb-4" />
              <p className="text-xs text-black/30 uppercase tracking-wider">Coming soon</p>
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="p-4 sm:p-6">
            <h2 className="text-sm font-bold text-black uppercase tracking-wider mb-1">Saved</h2>
            <p className="text-xs text-black/30 mb-8 tracking-wide">things to check out</p>
            {likedItems.size === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-8 h-8 text-black/15 mx-auto mb-4" />
                <p className="text-xs text-black/30 uppercase tracking-wider">Nothing saved yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {allFeedItems.filter(item => likedItems.has(item.id)).map(item => (
                  <div key={item.id} className="border border-black/5 p-4">
                    <p className="text-sm text-black">{item.content}</p>
                    <p className="text-xs text-black/30 mt-1 tracking-wide">{item.category}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="p-4 sm:p-6">
            <div className="text-center mb-10">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-20 h-20 rounded-full mx-auto mb-4 border border-black/10"
              />
              <h2 className="text-sm font-bold text-black uppercase tracking-wider">{currentUser.name}</h2>
              <p className="text-xs text-black/30 mt-1">{currentUser.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="border border-black/5 p-4 text-center">
                <p className="text-2xl font-bold text-black">{userItems.length}</p>
                <p className="text-xs text-black/30 mt-1 uppercase tracking-wider">Shared</p>
              </div>
              <div className="border border-black/5 p-4 text-center">
                <p className="text-2xl font-bold text-black">{likedItems.size}</p>
                <p className="text-xs text-black/30 mt-1 uppercase tracking-wider">Saved</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white border-t border-black/10">
        <div className="flex justify-around items-center px-4 sm:px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'feed' ? 'text-black' : 'text-black/20'}`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs tracking-wider uppercase">Feed</span>
          </button>

          <button
            onClick={() => setActiveTab('discover')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'discover' ? 'text-black' : 'text-black/20'}`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-xs tracking-wider uppercase">Discover</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-black text-white rounded-full p-3 -mt-6 shadow-lg hover:bg-black/80 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'saved' ? 'text-black' : 'text-black/20'}`}
          >
            <Heart className="w-5 h-5" />
            <span className="text-xs tracking-wider uppercase">Saved</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-black' : 'text-black/20'}`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs tracking-wider uppercase">Profile</span>
          </button>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-lg w-full max-w-lg p-4 sm:p-6 sm:mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider">Share a pick</h3>
              <button onClick={() => setShowAddModal(false)} className="text-black/30 hover:text-black">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-black mb-2 uppercase tracking-wider">Type</label>
                <select
                  value={newItem.type}
                  onChange={(e) => setNewItem({ ...newItem, type: e.target.value, category: '' })}
                  className="w-full px-4 py-3 border border-black/20 text-sm focus:border-black outline-none transition-colors"
                >
                  <option value="music">Music</option>
                  <option value="book">Book</option>
                  <option value="tv">TV/Film</option>
                  <option value="podcast">Podcast</option>
                  <option value="theatre">Theatre</option>
                  <option value="exhibition">Exhibition</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-2 uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  value={newItem.content}
                  onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                  placeholder="e.g., Blonde - Frank Ocean"
                  className="w-full px-4 py-3 border border-black/20 text-sm focus:border-black outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-2 uppercase tracking-wider">Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full px-4 py-3 border border-black/20 text-sm focus:border-black outline-none transition-colors"
                >
                  <option value="">Select a category</option>
                  {(categoryOptions[newItem.type] || []).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAddItem}
                className="w-full bg-black text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-black/80 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
