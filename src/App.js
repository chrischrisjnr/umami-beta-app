import React, { useState, useEffect, useCallback } from 'react';
import { Play, Book, Headphones, Tv, Heart, Plus, User, Home, Compass, ExternalLink, Ticket, Palette, Mail, LogOut, Send, ChevronLeft, Copy, Check } from 'lucide-react';

const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code.slice(0, 4) + '-' + code.slice(4);
};

const ADMIN_EMAIL = 'christophercostuna@gmail.com';
const MAX_INVITES = 2;

const getInvites = () => {
  const saved = localStorage.getItem('umamiInvites');
  return saved ? JSON.parse(saved) : [];
};

const saveInvites = (invites) => {
  localStorage.setItem('umamiInvites', JSON.stringify(invites));
};

const getMembers = () => {
  const saved = localStorage.getItem('umamiMembers');
  return saved ? JSON.parse(saved) : [];
};

const saveMembers = (members) => {
  localStorage.setItem('umamiMembers', JSON.stringify(members));
};

const AVATAR_SEEDS = [
  'Felix', 'Aneka', 'Jade', 'Milo', 'Sasha', 'Ravi', 'Luna', 'Kai',
  'Zara', 'Oscar', 'Nyla', 'Theo', 'Iris', 'Leo', 'Dara', 'Nico',
  'Emi', 'Sol', 'Mina', 'Jude', 'Aria', 'Ezra', 'Sage', 'Rio'
];

const getAvatarUrl = (seed) =>
  `https://api.dicebear.com/9.x/open-peeps/svg?seed=${seed}&backgroundColor=ffffff`;

const AvatarPicker = ({ selected, onSelect }) => {
  return (
    <div>
      <p className="text-xs font-bold text-black mb-3 uppercase tracking-wider">Choose your avatar</p>
      <div className="grid grid-cols-6 gap-2">
        {AVATAR_SEEDS.map((seed) => (
          <button
            key={seed}
            onClick={() => onSelect(getAvatarUrl(seed))}
            className={`w-full aspect-square rounded-full border-2 transition-colors overflow-hidden ${
              selected === getAvatarUrl(seed) ? 'border-black' : 'border-black/10 hover:border-black/30'
            }`}
          >
            <img src={getAvatarUrl(seed)} alt={seed} className="w-full h-full" />
          </button>
        ))}
      </div>
    </div>
  );
};

const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('umamiUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const createAccount = ({ name, email, avatar, inviteCode }) => {
    const members = getMembers();
    const isAdmin = members.length === 0 || email.toLowerCase() === ADMIN_EMAIL;

    const newUser = {
      id: Date.now(),
      email,
      name,
      avatar,
      isAdmin,
      invitedBy: inviteCode || null
    };

    // Mark invite as used
    if (inviteCode) {
      const invites = getInvites();
      const idx = invites.findIndex(i => i.code === inviteCode && !i.used);
      if (idx !== -1) {
        invites[idx].used = true;
        invites[idx].usedBy = email;
        saveInvites(invites);
      }
    }

    members.push({ id: newUser.id, email, name, isAdmin });
    saveMembers(members);

    setCurrentUser(newUser);
    localStorage.setItem('umamiUser', JSON.stringify(newUser));
  };

  const updateAvatar = (avatar) => {
    const updated = { ...currentUser, avatar };
    setCurrentUser(updated);
    localStorage.setItem('umamiUser', JSON.stringify(updated));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('umamiUser');
  };

  return { currentUser, createAccount, updateAvatar, logout };
};

export default function App() {
  const { currentUser, createAccount, updateAvatar, logout } = useAuth();
  const [signUpStep, setSignUpStep] = useState('form'); // 'form' | 'avatar'
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpInviteCode, setSignUpInviteCode] = useState('');
  const [signUpAvatar, setSignUpAvatar] = useState(getAvatarUrl(AVATAR_SEEDS[0]));
  const isFirstUser = getMembers().length === 0;
  const [activeTab, setActiveTab] = useState('feed');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [invites, setInvites] = useState(getInvites);
  const [likedItems, setLikedItems] = useState(() => {
    const saved = localStorage.getItem('umamiLikedItems');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ type: 'music', content: '', category: '', link: '' });
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

  const handleSignUp = () => {
    if (!signUpName || !signUpEmail || !signUpEmail.includes('@')) {
      alert('Please enter your name and a valid email');
      return;
    }
    if (!isFirstUser && signUpEmail.toLowerCase() !== ADMIN_EMAIL) {
      const code = signUpInviteCode.trim().toUpperCase();
      const invites = getInvites();
      const valid = invites.find(i => i.code === code && !i.used);
      if (!valid) {
        alert('Invalid or already used invite code');
        return;
      }
    }
    setSignUpStep('avatar');
  };

  const handleCompleteSignUp = () => {
    createAccount({
      name: signUpName,
      email: signUpEmail,
      avatar: signUpAvatar,
      inviteCode: signUpInviteCode.trim().toUpperCase() || null
    });
    setSignUpStep('form');
    setSignUpName('');
    setSignUpEmail('');
    setSignUpInviteCode('');
  };

  const myInvites = currentUser ? invites.filter(i => i.createdBy === currentUser.id) : [];
  const invitesRemaining = currentUser?.isAdmin ? Infinity : MAX_INVITES - myInvites.length;

  const handleCreateInvite = useCallback(() => {
    if (!currentUser) return;
    if (!currentUser.isAdmin && myInvites.length >= MAX_INVITES) return;
    const code = generateCode();
    const newInvite = { code, createdBy: currentUser.id, used: false, usedBy: null };
    const updated = [...invites, newInvite];
    saveInvites(updated);
    setInvites(updated);
  }, [currentUser, invites, myInvites.length]);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const handleLogout = () => {
    logout();
    setActiveTab('feed');
    setSignUpStep('form');
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
      wikiUrl: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(newItem.content)}`,
      mediaUrl: newItem.link.trim() || null
    };

    setUserItems([item, ...userItems]);
    setShowAddModal(false);
    setNewItem({ type: 'music', content: '', category: '', link: '' });
  };

  const categoryOptions = {
    music: ['Album', 'Single', 'EP', 'Mixtape', 'Soundtrack', 'Live Album', 'DJ Mix', 'Radio Show', 'Artist'],
    book: ['Novel', 'Non-Fiction', 'Poetry', 'Memoir', 'Short Stories', 'Graphic Novel', 'Author'],
    tv: ['TV Series', 'Film', 'Documentary', 'Mini-Series', 'Anime', 'Short Film', 'Actor', 'Director'],
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
            {signUpStep === 'form' ? (
              <>
                <h2 className="text-sm font-bold text-black mb-6 uppercase tracking-wider">
                  {isFirstUser ? 'Create your network' : 'Join umami'}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-black mb-2 uppercase tracking-wider">Name</label>
                    <input
                      type="text"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      placeholder="What should we call you?"
                      className="w-full px-4 py-3 border border-black/20 text-base focus:border-black outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-black mb-2 uppercase tracking-wider">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black/30" />
                      <input
                        type="email"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSignUp()}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 border border-black/20 text-base focus:border-black outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {!isFirstUser && signUpEmail.toLowerCase() !== ADMIN_EMAIL && (
                    <div>
                      <label className="block text-xs font-bold text-black mb-2 uppercase tracking-wider">Invite code</label>
                      <input
                        type="text"
                        value={signUpInviteCode}
                        onChange={(e) => setSignUpInviteCode(e.target.value.toUpperCase())}
                        placeholder="XXXX-XXXX"
                        maxLength={9}
                        className="w-full px-4 py-3 border border-black/20 text-base focus:border-black outline-none transition-colors tracking-widest text-center uppercase"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleSignUp}
                    className="w-full bg-black text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-black/80 transition-colors"
                  >
                    Next
                  </button>
                </div>

                <p className="text-xs text-black/30 mt-6 text-center tracking-wide">
                  {isFirstUser ? 'You\'ll be the admin' : signUpEmail.toLowerCase() === ADMIN_EMAIL ? 'Welcome back, admin' : 'Invite only — no password required'}
                </p>
              </>
            ) : (
              <>
                <button
                  onClick={() => setSignUpStep('form')}
                  className="flex items-center gap-1 text-xs text-black/40 hover:text-black uppercase tracking-wider mb-6"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Back
                </button>

                <AvatarPicker selected={signUpAvatar} onSelect={setSignUpAvatar} />

                <button
                  onClick={handleCompleteSignUp}
                  className="w-full bg-black text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-black/80 transition-colors mt-6"
                >
                  Create account
                </button>
              </>
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
    <div className="bg-white min-h-screen">
    <div className="max-w-2xl mx-auto bg-white min-h-screen relative sm:border-x sm:border-black/5">
      <div className="sticky top-0 bg-white border-b border-black/10 px-4 sm:px-6 py-4 sm:py-5 z-10" style={{paddingTop: 'max(1rem, env(safe-area-inset-top))'}}>
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

              <div className="mb-4 flex items-center gap-3">
                <a
                  href={item.wikiUrl || `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(item.content)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black/30 text-xs tracking-wide uppercase flex items-center gap-1 hover:text-black transition-colors"
                >
                  Wikipedia
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
                {item.mediaUrl && (
                  <a
                    href={item.mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black/30 text-xs tracking-wide uppercase flex items-center gap-1 hover:text-black transition-colors"
                  >
                    {(() => {
                      try {
                        const host = new URL(item.mediaUrl).hostname.replace('www.', '');
                        const name = host.split('.')[0];
                        return name.charAt(0).toUpperCase() + name.slice(1);
                      } catch { return 'Link'; }
                    })()}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
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
              <button
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="text-xs text-black/40 hover:text-black uppercase tracking-wider mt-3"
              >
                {showAvatarPicker ? 'Close' : 'Change avatar'}
              </button>
            </div>

            {showAvatarPicker && (
              <div className="border border-black/10 p-4 mb-6">
                <AvatarPicker
                  selected={currentUser.avatar}
                  onSelect={(avatar) => {
                    updateAvatar(avatar);
                    setShowAvatarPicker(false);
                  }}
                />
              </div>
            )}

            <div className="border border-black/10 p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-bold text-black uppercase tracking-wider">Invites</p>
                  <p className="text-xs text-black/30 mt-0.5">
                    {currentUser.isAdmin ? 'Unlimited (admin)' : `${Math.max(0, invitesRemaining)} remaining`}
                  </p>
                </div>
                {(currentUser.isAdmin || invitesRemaining > 0) && (
                  <button
                    onClick={handleCreateInvite}
                    className="text-xs bg-black text-white px-3 py-1.5 uppercase tracking-wider hover:bg-black/80 transition-colors"
                  >
                    Generate
                  </button>
                )}
              </div>

              {myInvites.length === 0 ? (
                <p className="text-xs text-black/30 text-center py-4">No invite codes yet</p>
              ) : (
                <div className="space-y-2">
                  {myInvites.map((inv) => (
                    <div key={inv.code} className="flex items-center justify-between py-2 border-t border-black/5">
                      <div>
                        <p className={`text-sm tracking-widest ${inv.used ? 'text-black/20 line-through' : 'text-black'}`}>
                          {inv.code}
                        </p>
                        {inv.used && (
                          <p className="text-xs text-black/20 mt-0.5">Used by {inv.usedBy}</p>
                        )}
                      </div>
                      {!inv.used && (
                        <button
                          onClick={() => handleCopyCode(inv.code)}
                          className="text-black/30 hover:text-black transition-colors p-1"
                          title="Copy code"
                        >
                          {copiedCode === inv.code
                            ? <Check className="w-4 h-4" />
                            : <Copy className="w-4 h-4" />
                          }
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
                  className="w-full px-4 py-3 border border-black/20 text-base focus:border-black outline-none transition-colors"
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
                  className="w-full px-4 py-3 border border-black/20 text-base focus:border-black outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-2 uppercase tracking-wider">Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full px-4 py-3 border border-black/20 text-base focus:border-black outline-none transition-colors"
                >
                  <option value="">Select a category</option>
                  {(categoryOptions[newItem.type] || []).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-2 uppercase tracking-wider">Link <span className="font-normal text-black/30">(optional)</span></label>
                <input
                  type="url"
                  value={newItem.link}
                  onChange={(e) => setNewItem({ ...newItem, link: e.target.value })}
                  placeholder="e.g., https://open.spotify.com/..."
                  className="w-full px-4 py-3 border border-black/20 text-base focus:border-black outline-none transition-colors"
                />
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
    </div>
  );
}
