import React, { useState } from 'react';
import { Play, Book, Headphones, Tv, Heart, Plus, User, Home, Compass, ExternalLink, Theater, Palette } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('feed');
  const [likedItems, setLikedItems] = useState(new Set());
  const [following, setFollowing] = useState(new Set([1, 2, 3, 4, 5, 6]));

  const feedItems = [
    {
      id: 1,
      userId: 1,
      user: 'Sarah Chen',
      avatar: 'https://api.dicebear.com/9.x/open-peeps/svg?seed=Sarah&backgroundColor=ffd5dc',
      type: 'music',
      content: 'Blonde - Frank Ocean',
      category: 'Album',
      time: '2m ago',
      color: 'bg-gradient-to-br from-purple-50 to-pink-50',
      links: [
        { service: 'Spotify', url: '#' },
        { service: 'Apple Music', url: '#' }
      ]
    },
    {
      id: 2,
      userId: 2,
      user: 'Marcus Reid',
      avatar: 'https://api.dicebear.com/9.x/open-peeps/svg?seed=Marcus&backgroundColor=c0aede',
      type: 'book',
      content: 'Tomorrow, and Tomorrow, and Tomorrow',
      category: 'Novel',
      time: '15m ago',
      color: 'bg-gradient-to-br from-amber-50 to-yellow-50',
      links: [
        { service: 'Audible', url: '#' },
        { service: 'Kindle', url: '#' }
      ]
    },
    {
      id: 3,
      userId: 3,
      user: 'Emma Walsh',
      avatar: 'https://api.dicebear.com/9.x/open-peeps/svg?seed=Emma&backgroundColor=ffdfbf',
      type: 'theatre',
      content: 'Merrily We Roll Along',
      category: 'Broadway Musical',
      time: '45m ago',
      color: 'bg-gradient-to-br from-rose-50 to-red-50',
      links: [
        { service: 'Telecharge', url: '#' },
        { service: 'TodayTix', url: '#' }
      ]
    },
    {
      id: 4,
      userId: 3,
      user: 'Emma Walsh',
      avatar: 'https://api.dicebear.com/9.x/open-peeps/svg?seed=Emma&backgroundColor=ffdfbf',
      type: 'tv',
      content: 'The Bear - Season 2',
      category: 'TV Series',
      time: '1h ago',
      color: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      links: [
        { service: 'Hulu', url: '#' }
      ]
    },
    {
      id: 5,
      userId: 4,
      user: 'James Park',
      avatar: 'https://api.dicebear.com/9.x/open-peeps/svg?seed=James&backgroundColor=b6e3f4',
      type: 'podcast',
      content: 'Hardcore History: Supernova in the East',
      category: 'Podcast',
      time: '2h ago',
      color: 'bg-gradient-to-br from-green-50 to-emerald-50',
      links: [
        { service: 'Spotify', url: '#' },
        { service: 'Apple Podcasts', url: '#' }
      ]
    },
    {
      id: 6,
      userId: 5,
      user: 'Aisha Mohammed',
      avatar: 'https://api.dicebear.com/9.x/open-peeps/svg?seed=Aisha&backgroundColor=ffd5dc',
      type: 'exhibition',
      content: 'Yayoi Kusama: Infinity Mirrors',
      category: 'Art Exhibition',
      time: '3h ago',
      color: 'bg-gradient-to-br from-indigo-50 to-violet-50',
      links: [
        { service: 'Museum Tickets', url: '#' },
        { service: 'Google Arts', url: '#' }
      ]
    },
    {
      id: 7,
      userId: 5,
      user: 'Aisha Mohammed',
      avatar: 'https://api.dicebear.com/9.x/open-peeps/svg?seed=Aisha&backgroundColor=ffd5dc',
      type: 'music',
      content: 'A Love Supreme - John Coltrane',
      category: 'Album',
      time: '4h ago',
      color: 'bg-gradient-to-br from-purple-50 to-pink-50',
      links: [
        { service: 'Spotify', url: '#' },
        { service: 'Apple Music', url: '#' },
        { service: 'Tidal', url: '#' }
      ]
    },
    {
      id: 8,
      userId: 6,
      user: 'Tom Stevens',
      avatar: 'https://api.dicebear.com/9.x/open-peeps/svg?seed=Tom&backgroundColor=d1d4f9',
      type: 'book',
      content: 'The Creative Act - Rick Rubin',
      category: 'Non-Fiction',
      time: '5h ago',
      color: 'bg-gradient-to-br from-amber-50 to-orange-50',
      links: [
        { service: 'Audible', url: '#' },
        { service: 'Kindle', url: '#' },
        { service: 'Google Books', url: '#' }
      ]
    }
  ];

  const tasteMakers = [
    { id: 7, name: 'Dev Patel', avatar: 'https://api.dicebear.com/9.x/open-peeps/svg?seed=Dev&backgroundColor=ffdfbf', specialty: 'Film & Music', items: 234 },
    { id: 8, name: 'Zoe Martinez', avatar: 'https://api.dicebear.com/9.x/open-peeps/svg?seed=Zoe&backgroundColor=c0aede', specialty: 'Books & Podcasts', items: 189 },
    { id: 9, name: 'Kai Nakamura', avatar: 'https://api.dicebear.com/9.x/open-peeps/svg?seed=Kai&backgroundColor=b6e3f4', specialty: 'Music', items: 412 },
    { id: 10, name: 'Nina Okafor', avatar: 'https://api.dicebear.com/9.x/open-peeps/svg?seed=Nina&backgroundColor=ffd5dc', specialty: 'TV & Film', items: 156 },
    { id: 11, name: 'Sophie Laurent', avatar: 'https://api.dicebear.com/9.x/open-peeps/svg?seed=Sophie&backgroundColor=d1d4f9', specialty: 'Theatre & Art', items: 203 }
  ];

  const getIcon = (type) => {
    const iconClass = "w-4 h-4";
    switch(type) {
      case 'music': return <Headphones className={iconClass} />;
      case 'book': return <Book className={iconClass} />;
      case 'tv': return <Tv className={iconClass} />;
      case 'podcast': return <Play className={iconClass} />;
      case 'theatre': return <Theater className={iconClass} />;
      case 'exhibition': return <Palette className={iconClass} />;
      default: return null;
    }
  };

  const toggleLike = (id) => {
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleFollow = (userId) => {
    setFollowing(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-5 z-10">
        <h1 className="text-2xl font-light tracking-wide text-gray-900">umami</h1>
        <p className="text-xs text-gray-500 mt-1 font-light">what your friends are into right now</p>
      </div>

      {/* Feed */}
      <div className="pb-20">
        {activeTab === 'feed' && feedItems.map((item) => (
          <div key={item.id} className={`${item.color} border-b border-gray-50 p-6`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <img 
                  src={item.avatar} 
                  alt={item.user}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium text-gray-900 text-sm">{item.user}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                </div>
              </div>
              <div className="text-gray-400">
                {getIcon(item.type)}
              </div>
            </div>
            
            <div className="ml-13">
              <p className="text-base font-medium text-gray-900 mb-0.5 leading-snug">{item.content}</p>
              <p className="text-xs text-gray-500 mb-4 font-light">{item.category}</p>
              
              {/* Streaming Links */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {item.links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    className="text-gray-500 text-xs px-2 py-1 rounded flex items-center gap-1 hover:text-gray-700 hover:bg-white/50 transition-colors"
                  >
                    {link.service}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ))}
              </div>
              
              <button
                onClick={() => toggleLike(item.id)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors"
              >
                <Heart 
                  className={`w-3.5 h-3.5 ${likedItems.has(item.id) ? 'fill-red-400 text-red-400' : ''}`}
                />
                <span className={likedItems.has(item.id) ? 'text-red-400' : ''}>
                  {likedItems.has(item.id) ? 'Saved' : 'Save'}
                </span>
              </button>
            </div>
          </div>
        ))}

        {activeTab === 'discover' && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-1">Taste Makers</h2>
            <p className="text-xs text-gray-500 mb-6 font-light">people with consistently great taste</p>
            
            <div className="space-y-3">
              {tasteMakers.map((maker) => (
                <div key={maker.id} className="bg-gray-50/50 rounded-xl p-4 flex items-center justify-between border border-gray-100">
                  <div className="flex items-center gap-3">
                    <img 
                      src={maker.avatar} 
                      alt={maker.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{maker.name}</p>
                      <p className="text-xs text-gray-600 font-light">{maker.specialty}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{maker.items} items</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFollow(maker.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      following.has(maker.id)
                        ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {following.has(maker.id) ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-md border-t border-gray-100">
        <div className="flex justify-around items-center px-6 py-3">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'feed' ? 'text-gray-900' : 'text-gray-400'}`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs font-light">Feed</span>
          </button>
          
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'discover' ? 'text-gray-900' : 'text-gray-400'}`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-xs font-light">Discover</span>
          </button>
          
          <button className="bg-gray-900 text-white rounded-full p-3 -mt-6 shadow-lg hover:bg-gray-800 transition-colors">
            <Plus className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'saved' ? 'text-gray-900' : 'text-gray-400'}`}
          >
            <Heart className="w-5 h-5" />
            <span className="text-xs font-light">Saved</span>
          </button>
          
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-gray-900' : 'text-gray-400'}`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs font-light">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}