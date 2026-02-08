import React, { useState, useEffect, useCallback } from 'react';
import { Headphones, Heart, Plus, ExternalLink, Mail, LogOut, Send, ChevronLeft, Copy, Check, X } from 'lucide-react';

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

const MUSIC_CATEGORIES = ['Album', 'Single', 'EP', 'Mixtape', 'Soundtrack', 'Live Album', 'DJ Mix', 'Radio Show', 'Artist'];

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
  const { currentUser, createAccount, logout } = useAuth();
  const [signUpStep, setSignUpStep] = useState('form');
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpInviteCode, setSignUpInviteCode] = useState('');
  const [signUpAvatar, setSignUpAvatar] = useState(getAvatarUrl(AVATAR_SEEDS[0]));
  const isFirstUser = getMembers().length === 0;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [invites, setInvites] = useState(getInvites);

  const [likedItems, setLikedItems] = useState(() => {
    const saved = localStorage.getItem('umamiLikedItems');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [newItem, setNewItem] = useState({ content: '', category: '', link: '' });
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

  const handleAddItem = () => {
    if (!newItem.content || !newItem.category) {
      alert('Please fill in title and category');
      return;
    }

    const item = {
      id: Date.now(),
      userId: currentUser.id,
      user: currentUser.name,
      avatar: currentUser.avatar,
      content: newItem.content,
      category: newItem.category,
      time: 'Just now',
      wikiUrl: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(newItem.content)}`,
      mediaUrl: newItem.link.trim() || null
    };

    setUserItems([item, ...userItems]);
    setShowAddModal(false);
    setNewItem({ content: '', category: '', link: '' });
    setCurrentIndex(0);
  };

  const toggleLike = (id) => {
    setLikedItems(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const goNext = () => {
    if (currentIndex < userItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Sign up screen (unchanged)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <h1 className="text-4xl tracking-wider text-black mb-2 uppercase">umami</h1>
            <p className="text-xs text-black/50 tracking-wide">share the music you love</p>
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

  const currentItem = userItems[currentIndex];

  // Stories-style main view
  return (
    <div className="h-screen bg-black flex flex-col" style={{paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)'}}>

      {/* Progress bars */}
      {userItems.length > 0 && (
        <div className="flex gap-1 px-3 pt-2 pb-3">
          {userItems.map((_, idx) => (
            <div key={idx} className="flex-1 h-0.5 rounded-full overflow-hidden bg-white/20">
              <div
                className={`h-full bg-white transition-all duration-300 ${idx < currentIndex ? 'w-full' : idx === currentIndex ? 'w-full' : 'w-0'}`}
              />
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowProfile(true)}>
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full border-2 border-white/50"
            />
          </button>
          <div>
            <p className="text-white text-sm font-bold uppercase tracking-wider">umami</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-white text-black rounded-full p-2"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={logout}
            className="text-white/50 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 relative">
        {userItems.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-8">
              <Headphones className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white text-lg font-bold uppercase tracking-wider mb-2">No music yet</p>
              <p className="text-white/50 text-sm mb-6">Share what you're listening to</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-white text-black px-6 py-3 text-xs font-bold uppercase tracking-wider"
              >
                Add your first pick
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Tap zones for navigation */}
            <div className="absolute inset-0 flex">
              <button
                className="w-1/3 h-full"
                onClick={goPrev}
                aria-label="Previous"
              />
              <div className="w-1/3 h-full" />
              <button
                className="w-1/3 h-full"
                onClick={goNext}
                aria-label="Next"
              />
            </div>

            {/* Current item display */}
            {currentItem && (
              <div className="absolute inset-0 flex flex-col items-center justify-center px-8 pointer-events-none">
                <img
                  src={currentItem.avatar}
                  alt={currentItem.user}
                  className="w-16 h-16 rounded-full border-2 border-white/30 mb-4"
                />
                <p className="text-white/60 text-xs uppercase tracking-wider mb-1">{currentItem.user}</p>
                <p className="text-white/40 text-xs mb-8">{currentItem.time}</p>

                <p className="text-white text-2xl font-bold text-center mb-2 uppercase tracking-wide">{currentItem.content}</p>
                <p className="text-white/50 text-sm tracking-wider mb-8">{currentItem.category}</p>

                {/* Links */}
                <div className="flex flex-wrap justify-center gap-4 pointer-events-auto">
                  <a
                    href={currentItem.wikiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/40 text-xs tracking-wide uppercase flex items-center gap-1 hover:text-white transition-colors"
                  >
                    Wikipedia
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  <a
                    href={`https://open.spotify.com/search/${encodeURIComponent(currentItem.content)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/40 text-xs tracking-wide uppercase flex items-center gap-1 hover:text-white transition-colors"
                  >
                    Spotify
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  <a
                    href={`https://music.apple.com/search?term=${encodeURIComponent(currentItem.content)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/40 text-xs tracking-wide uppercase flex items-center gap-1 hover:text-white transition-colors"
                  >
                    Apple Music
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                {/* Like button */}
                <button
                  onClick={() => toggleLike(currentItem.id)}
                  className="mt-8 flex items-center gap-2 pointer-events-auto"
                >
                  <Heart
                    className={`w-6 h-6 transition-colors ${likedItems.has(currentItem.id) ? 'fill-white text-white' : 'text-white/40'}`}
                  />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Navigation hint */}
      {userItems.length > 1 && (
        <div className="text-center pb-4">
          <p className="text-white/30 text-xs tracking-wider">TAP TO NAVIGATE</p>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col" style={{paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)'}}>
          <div className="flex items-center justify-between px-4 py-4 border-b border-black/10">
            <h3 className="text-sm font-bold uppercase tracking-wider">Share music</h3>
            <button onClick={() => setShowAddModal(false)} className="text-black/30 hover:text-black">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-4 space-y-4">
            <div>
              <label className="block text-xs font-bold text-black mb-2 uppercase tracking-wider">Title / Artist</label>
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
                {MUSIC_CATEGORIES.map((cat) => (
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
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col" style={{paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)'}}>
          <div className="flex items-center justify-between px-4 py-4 border-b border-black/10">
            <h3 className="text-sm font-bold uppercase tracking-wider">Profile</h3>
            <button onClick={() => setShowProfile(false)} className="text-black/30 hover:text-black">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <div className="text-center mb-8">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-20 h-20 rounded-full mx-auto mb-4 border border-black/10"
              />
              <h2 className="text-sm font-bold text-black uppercase tracking-wider">{currentUser.name}</h2>
              <p className="text-xs text-black/30 mt-1">{currentUser.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="border border-black/5 p-4 text-center">
                <p className="text-2xl font-bold text-black">{userItems.length}</p>
                <p className="text-xs text-black/30 mt-1 uppercase tracking-wider">Shared</p>
              </div>
              <div className="border border-black/5 p-4 text-center">
                <p className="text-2xl font-bold text-black">{likedItems.size}</p>
                <p className="text-xs text-black/30 mt-1 uppercase tracking-wider">Saved</p>
              </div>
            </div>

            <div className="border border-black/10 p-4">
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
          </div>
        </div>
      )}
    </div>
  );
}
