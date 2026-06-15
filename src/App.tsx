import React, { useState, useEffect } from 'react';
import { 
  Search, ChevronDown, Ticket, Wallet, Plus, Star, Heart, 
  Sparkles, Filter, X, Calendar, MapPin, Play, Tv, Gamepad, 
  Music, User, ArrowUpRight, Award, Trash2, ShieldCheck, Clock, LogOut
} from 'lucide-react';
import { Movie, LiveEvent, Booking, City, UserAccount } from './types';
import { CITIES, MOVIES, LIVE_EVENTS } from './data/mockData';
import BannerSlider from './components/BannerSlider';
import BookingFlowModal from './components/BookingFlowModal';
import MyBookingsView from './components/MyBookingsView';
import AuthModal from './components/AuthModal';

export default function App() {
  // Navigation categories
  const categories = [
    { id: 'movies', label: 'Movies', icon: Tv },
    { id: 'events', label: 'Live Events', icon: Sparkles },
    { id: 'music', label: 'Your Music Studio', icon: Music },
    { id: 'bookings', label: 'My Bookings', icon: Ticket },
  ];

  const [activeCategory, setActiveCategory] = useState<string>('movies');
  const [selectedCity, setSelectedCity] = useState<City>(CITIES[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Currently authenticated user state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('BMT_CURRENT_USER');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Auth modal open flag
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Quick state flags for profile dropdown
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);

  // Wallet state (starts with ₹1500 mock funding, synced to logged in user balance if authenticated)
  const [userWallet, setUserWallet] = useState<number>(() => {
    const savedUser = localStorage.getItem('BMT_CURRENT_USER');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return parsed.balance;
      } catch (e) {
        // fall back
      }
    }
    const saved = localStorage.getItem('BMT_WALLET');
    return saved ? parseInt(saved, 10) : 1500;
  });

  // Booking history log
  const [bookingsList, setBookingsList] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('BMT_BOOKINGS');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Active booking flow modal triggers
  const [selectedMovieForBooking, setSelectedMovieForBooking] = useState<Movie | null>(null);
  const [selectedEventForBooking, setSelectedEventForBooking] = useState<LiveEvent | null>(null);
  
  // Selected single item to inspect details in overlay panel
  const [previewMovie, setPreviewMovie] = useState<Movie | null>(null);
  const [previewEvent, setPreviewEvent] = useState<LiveEvent | null>(null);

  // Filter systems
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');

  // Synchronize localStorage
  useEffect(() => {
    localStorage.setItem('BMT_WALLET', userWallet.toString());
    
    if (currentUser) {
      const updatedUser = { ...currentUser, balance: userWallet };
      localStorage.setItem('BMT_CURRENT_USER', JSON.stringify(updatedUser));
      
      // Also update inside registered users database list
      const storedUsersJson = localStorage.getItem('BMT_REGISTERED_USERS');
      if (storedUsersJson) {
        try {
          const registeredUsers: UserAccount[] = JSON.parse(storedUsersJson);
          const index = registeredUsers.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
          if (index !== -1) {
            registeredUsers[index].balance = userWallet;
            localStorage.setItem('BMT_REGISTERED_USERS', JSON.stringify(registeredUsers));
          }
        } catch (err) {
          // ignore
        }
      }
    }
  }, [userWallet, currentUser?.email]);

  useEffect(() => {
    localStorage.setItem('BMT_BOOKINGS', JSON.stringify(bookingsList));
  }, [bookingsList]);

  // Handle Authentication Callbacks
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setUserWallet(user.balance);
    localStorage.setItem('BMT_CURRENT_USER', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserWallet(1500); // Reset guest default allocation
    localStorage.removeItem('BMT_CURRENT_USER');
    setShowProfileDropdown(false);
  };

  // Handle transaction success
  const handleAddNewBooking = (newBooking: Booking) => {
    setBookingsList(prev => [newBooking, ...prev]);
    // Deduct from wallet happens inside BookingFlowModal, which updates the state via props!
  };

  // Perform virtual cancellation refunding full amount
  const handleCancelBooking = (bookingId: string) => {
    setBookingsList(prev => 
      prev.map(b => {
        if (b.id === bookingId && b.ticketStatus !== 'Cancelled') {
          // Refund user the total ticket amount
          setUserWallet(wallet => wallet + b.totalPrice);
          return { ...b, ticketStatus: 'Cancelled' as const };
        }
        return b;
      })
    );
  };

  // Quick top-up for play money checkout
  const handleQuickAddCash = () => {
    setUserWallet(prev => prev + 500);
  };

  // Extract unique genres & languages for filters sidebar
  const genresList = React.useMemo(() => {
    const genres = new Set<string>();
    MOVIES.forEach(m => m.genre.forEach(g => genres.add(g)));
    return ['All', ...Array.from(genres)];
  }, []);

  const languagesList = React.useMemo(() => {
    const languages = new Set<string>();
    MOVIES.forEach(m => m.language.forEach(l => languages.add(l)));
    return ['All', ...Array.from(languages)];
  }, []);

  // Filter logic on Movies with extensive search matching
  const filteredMovies = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return MOVIES.filter(movie => {
      const matchesSearch = !query || 
                            movie.title.toLowerCase().includes(query) || 
                            movie.genre.some(g => g.toLowerCase().includes(query)) ||
                            movie.language.some(l => l.toLowerCase().includes(query)) ||
                            movie.description.toLowerCase().includes(query) ||
                            movie.certificate.toLowerCase().includes(query) ||
                            movie.releaseDate.toLowerCase().includes(query);
      const matchesGenre = selectedGenre === 'All' || movie.genre.includes(selectedGenre);
      const matchesLanguage = selectedLanguage === 'All' || movie.language.includes(selectedLanguage);
      return matchesSearch && matchesGenre && matchesLanguage;
    });
  }, [searchQuery, selectedGenre, selectedLanguage]);

  // Filter logic on Live Events with extensive search matching
  const filteredEvents = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return LIVE_EVENTS.filter(ev => {
      const matchesSearch = !query ||
                            ev.title.toLowerCase().includes(query) ||
                            ev.venue.toLowerCase().includes(query) ||
                            ev.category.toLowerCase().includes(query) ||
                            ev.date.toLowerCase().includes(query);
      
      const categoryMatch = activeCategory === 'events' 
        ? ev.category !== 'Music Shows' // comedy, parks, kids
        : ev.category === 'Music Shows'; // "Your Music Studio" category
      
      return matchesSearch && categoryMatch;
    });
  }, [searchQuery, activeCategory]);

  // Calculate search counts for alternative categories to support cross-tab search helper
  const searchCounts = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return { movies: 0, events: 0, music: 0 };

    const moviesCount = MOVIES.filter(movie => 
      movie.title.toLowerCase().includes(query) || 
      movie.genre.some(g => g.toLowerCase().includes(query)) ||
      movie.language.some(l => l.toLowerCase().includes(query)) ||
      movie.description.toLowerCase().includes(query)
    ).length;

    const eventsCount = LIVE_EVENTS.filter(ev => 
      ev.category !== 'Music Shows' && (
        ev.title.toLowerCase().includes(query) ||
        ev.venue.toLowerCase().includes(query) ||
        ev.category.toLowerCase().includes(query)
      )
    ).length;

    const musicCount = LIVE_EVENTS.filter(ev => 
      ev.category === 'Music Shows' && (
        ev.title.toLowerCase().includes(query) ||
        ev.venue.toLowerCase().includes(query) ||
        ev.category.toLowerCase().includes(query)
      )
    ).length;

    return { movies: moviesCount, events: eventsCount, music: musicCount };
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col justify-between">
      
      {/* 1. APP NAVBAR HEADER */}
      <header className="bg-slate-950 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            
            {/* Logo brand */}
            <div className="flex items-center gap-7">
              <div 
                onClick={() => {
                  setActiveCategory('movies');
                  setSearchQuery('');
                }}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <div className="bg-rose-500 text-white p-2 rounded-xl font-black font-display text-sm tracking-widest uppercase shadow-md shadow-rose-500/20 group-hover:bg-rose-600 transition-colors">
                  BMT
                </div>
                <div>
                  <span className="font-extrabold text-base sm:text-xl tracking-tight text-white flex items-center">
                    BookMy<span className="text-rose-500 font-black">Theatre</span>
                  </span>
                  <p className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase">Premium Entertainment</p>
                </div>
              </div>

              {/* Dynamic location selector */}
              <div className="hidden md:flex items-center gap-1 cursor-pointer bg-slate-900 py-1.5 px-3 rounded-lg border border-slate-800 hover:border-slate-700 transition-all text-xs text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span className="font-bold">{selectedCity.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                
                {/* Embedded dynamic list picker inside custom hover or trigger */}
                <select 
                  id="city-selector-native"
                  value={selectedCity.id}
                  onChange={(e) => {
                    const found = CITIES.find(c => c.id === e.target.value);
                    if (found) setSelectedCity(found);
                  }}
                  className="opacity-0 absolute w-[80px] cursor-pointer"
                >
                  {CITIES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dynamic Real-Time Interactive Search Bar */}
            <div className="flex-1 max-w-md relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                id="search-bar"
                type="text"
                placeholder="Search for Movies, Plays, Comedy events, Live concerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 text-white placeholder-slate-500 border border-slate-800 focus:border-rose-500/50 py-2 pl-9 pr-4 rounded-xl text-xs transition-colors focus:outline-none"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Wallet & My Bookings Shortcut indicators */}
            <div className="flex items-center gap-3 relative">
              {/* Wallet Indicator widget */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-2">
                <div className="text-left">
                  <p className="text-[8px] uppercase text-slate-400 tracking-wider font-bold">BMT Wallet Balance</p>
                  <p className="text-xs sm:text-sm font-extrabold text-emerald-400 font-mono">₹{userWallet}</p>
                </div>
                <button
                  id="top-up-navbar-button"
                  onClick={handleQuickAddCash}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg p-1 transition-colors relative cursor-pointer"
                  title="Add Mock Funds (+₹500)"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Auth Segment */}
              {currentUser ? (
                /* Logged In segment with dropdown card on click */
                <div className="relative">
                  <button
                    id="profile-dropdown-trigger"
                    onClick={() => setShowProfileDropdown(prev => !prev)}
                    className="w-9 h-9 rounded-full bg-rose-500 text-white font-extrabold text-xs flex items-center justify-center hover:bg-rose-600 transition-all border-2 border-white/25 active:scale-95 shadow-md cursor-pointer uppercase"
                    title={`View profile details. Logged in as ${currentUser.name}`}
                  >
                    {currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </button>

                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2.5 w-64 bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-100">
                      <div className="bg-slate-950 p-4 text-white">
                        <p className="text-[10px] uppercase font-bold text-rose-400 tracking-widest">Active Member Profile</p>
                        <h4 className="font-extrabold text-sm truncate mt-1">{currentUser.name}</h4>
                        <p className="text-xs text-slate-450 truncate font-medium">{currentUser.email}</p>
                      </div>
                      
                      <div className="p-3.5 space-y-2.5 text-xs text-slate-600 font-medium">
                        <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-150">
                          <span>India Mobile:</span>
                          <span className="font-bold text-slate-900">{currentUser.phoneNumber}</span>
                        </div>
                        <div className="flex justify-between items-center px-2">
                          <span>Allowance:</span>
                          <span className="font-bold text-emerald-500 font-mono">₹{userWallet} Play Cash</span>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 p-2 bg-slate-50">
                        <button
                          id="logout-dropdown-button"
                          onClick={handleLogout}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-red-650 hover:bg-red-50 font-bold rounded-xl transition-colors text-xs cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out of BMT
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Logged out: clean button click triggers login */
                <button
                  id="navbar-sign-in-button"
                  onClick={() => setShowAuthModal(true)}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold px-3.5 py-1.5 sm:py-2 rounded-xl transition-all shadow-md text-xs cursor-pointer active:scale-95 animate-pulse"
                >
                  Sign In
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Categories Tab Bar Sub-Header */}
        <div className="bg-slate-900 border-t border-slate-800/60 text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-11 flex-wrap overflow-x-auto scrollbar-none">
            <div className="flex gap-4 sm:gap-7 py-2">
              {categories.map((cat) => {
                const IconComp = cat.icon;
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    id={`category-${cat.id}`}
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                    }}
                    className={`flex items-center gap-1.5 pb-2 font-bold transition-all relative border-b-2 ${
                      isSelected 
                        ? 'text-rose-500 border-rose-500 font-extrabold' 
                        : 'text-slate-400 border-transparent hover:text-slate-200'
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                    
                    {cat.id === 'bookings' && bookingsList.length > 0 && (
                      <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full absolute -top-1 -right-4 font-mono font-bold scale-90">
                        {bookingsList.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="hidden lg:flex items-center gap-4 text-slate-400 font-semibold tracking-wide text-[11px]">
              <span className="hover:text-white cursor-pointer">ListYourShow</span>
              <span className="hover:text-white cursor-pointer">Corporates</span>
              <span className="hover:text-white cursor-pointer">Offers & Gift Cards</span>
              <span className="text-rose-400 uppercase font-bold flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> Pop Cash Back Active
              </span>
            </div>
          </div>
        </div>

      </header>

      {/* 2. DYNAMIC MOBILE BOTTOM BAR LOCATION SWITCHER */}
      <div className="md:hidden bg-slate-900 text-white flex items-center justify-between px-4 py-2 text-xs border-b border-slate-800">
        <span className="text-slate-400 font-medium">City Location:</span>
        <div className="flex items-center gap-1 font-bold text-rose-400 relative">
          <MapPin className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
          <span>{selectedCity.name}</span>
          <ChevronDown className="w-3 h-3" />
          <select 
            id="mobile-city-picker"
            value={selectedCity.id}
            onChange={(e) => {
              const found = CITIES.find(c => c.id === e.target.value);
              if (found) setSelectedCity(found);
            }}
            className="opacity-0 absolute inset-0 w-full cursor-pointer"
          >
            {CITIES.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. PRIMARY PAGE MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8 space-y-8">
        
        {/* Banner slider promotion header carousel (except when viewing user bookings history tab) */}
        {activeCategory !== 'bookings' && (
          <BannerSlider onPromoClick={() => {
            // Pick a reasonable random premiere movie or show to launch booking process
            setSelectedMovieForBooking(MOVIES[1]); 
          }} />
        )}

        {/* Dynamic global search notification context card */}
        {searchQuery.trim() && (
          <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in slide-in-from-top-3 duration-150">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-rose-450 font-extrabold uppercase tracking-wider">
                <Search className="w-3.5 h-3.5" />
                Active App-wide Search Filter
              </div>
              <h4 className="text-base sm:text-lg font-black leading-tight">
                Showing results for "<span className="text-rose-500 font-extrabold">{searchQuery}</span>"
              </h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                We've filtered movies, events, and performance studios to match your keywords.
              </p>
            </div>

            {/* Smart cross-category suggestion switches */}
            <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-500 w-full md:w-auto md:mr-2 block">Quick Category Switch:</span>
              
              <button
                type="button"
                onClick={() => setActiveCategory('movies')}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer select-none ${
                  activeCategory === 'movies'
                    ? 'bg-rose-500 text-white font-extrabold shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <span>Movies</span>
                <span className="text-[10px] bg-black/35 px-1.5 py-0.2 rounded-md font-mono font-bold leading-none shrink-0 text-white">{searchCounts.movies}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('events')}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer select-none ${
                  activeCategory === 'events'
                    ? 'bg-rose-500 text-white font-extrabold shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <span>Live Events</span>
                <span className="text-[10px] bg-black/35 px-1.5 py-0.2 rounded-md font-mono font-bold leading-none shrink-0 text-white">{searchCounts.events}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('music')}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer select-none ${
                  activeCategory === 'music'
                    ? 'bg-rose-500 text-white font-extrabold shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <span>Music Studio</span>
                <span className="text-[10px] bg-black/35 px-1.5 py-0.2 rounded-md font-mono font-bold leading-none shrink-0 text-white">{searchCounts.music}</span>
              </button>

              {/* Reset Search Button */}
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[10px] bg-slate-950 hover:bg-red-500 hover:text-white border border-slate-800 font-extrabold px-3 py-2 rounded-xl text-slate-400 uppercase tracking-widest cursor-pointer transition-all ml-1"
                title="Clear current query"
              >
                Clear Search
              </button>
            </div>
          </div>
        )}

        {/* SWITCH CATEGORIES CONTENT VIEWER */}
        {activeCategory === 'bookings' ? (
          /* USER BOOKINGS HISTORY TAB */
          <MyBookingsView 
            bookings={bookingsList} 
            onCancelBooking={handleCancelBooking}
            onNavigateHome={() => setActiveCategory('movies')}
          />
        ) : activeCategory === 'movies' ? (
          /* MOVIES INTERFACE */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            
            {/* Filter sidebar controls (Desktop-First optimization screen representation) */}
            <div className="lg:col-span-1 bg-white border border-slate-150 rounded-2xl p-4 space-y-5 shadow-sm lg:sticky lg:top-20">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 uppercase tracking-wide">
                  <Filter className="w-4 h-4 text-rose-500" /> Filter Options
                </h3>
                {(selectedGenre !== 'All' || selectedLanguage !== 'All') && (
                  <button
                    onClick={() => {
                      setSelectedGenre('All');
                      setSelectedLanguage('All');
                    }}
                    className="text-[10px] font-bold text-rose-500 hover:underline hover:text-rose-600 cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Genre filter list */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-[10px]">Select Genre</p>
                <div className="flex flex-wrap lg:flex-col gap-1.5">
                  {genresList.map(genre => (
                    <button
                      id={`genre-filter-${genre}`}
                      key={genre}
                      onClick={() => setSelectedGenre(genre)}
                      className={`text-xs px-3 py-1.5 lg:py-2 lg:px-3 text-left rounded-xl font-bold transition-all ${
                        selectedGenre === genre 
                          ? 'bg-rose-500 text-white shadow-sm' 
                          : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language filter list */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-[10px]">Language Filter</p>
                <div className="flex flex-wrap lg:flex-col gap-1.5">
                  {languagesList.map(lang => (
                    <button
                      id={`lang-filter-${lang}`}
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`text-xs px-3 py-1.5 lg:py-2 lg:px-3 text-left rounded-xl font-bold transition-all ${
                        selectedLanguage === lang 
                          ? 'bg-rose-500 text-white shadow-sm' 
                          : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick info advisory */}
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-100 space-y-1">
                <p className="text-[10px] font-bold text-rose-950 uppercase tracking-wider">🛎️ BMT Quick Booking Tip</p>
                <p className="text-[10px] text-slate-600 leading-normal">
                  You can purchase up to 8 tickets per theater screen. Get free snacks on recliners seating reservations!
                </p>
              </div>
            </div>

            {/* Movies list list container */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5 font-display uppercase">
                  Recommended Movies in <span className="text-rose-500 font-extrabold">{selectedCity.name}</span>
                </h2>
                <span className="text-xs text-slate-400 font-semibold font-mono">
                  Showing {filteredMovies.length} blockbusters
                </span>
              </div>

              {filteredMovies.length === 0 ? (
                <div className="bg-white border rounded-2xl p-10 text-center space-y-3">
                  <p className="text-sm font-semibold text-slate-500">No Movies found matching current filters.</p>
                  <button 
                    onClick={() => {
                      setSelectedGenre('All');
                      setSelectedLanguage('All');
                      setSearchQuery('');
                    }}
                    className="bg-rose-500 text-white font-extrabold px-4 py-2 rounded-xl text-xs"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMovies.map((movie) => (
                    <div 
                      key={movie.id}
                      className="group bg-white rounded-2xl overflow-hidden border border-slate-150 hover:shadow-lg transition-all flex flex-col cursor-pointer"
                      onClick={() => setPreviewMovie(movie)}
                    >
                      {/* Movie Poster Image with likes trigger */}
                      <div className="relative aspect-[3/4] overflow-hidden bg-slate-900">
                        <img 
                          src={movie.poster} 
                          alt={movie.title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* Rating block overlay inside poster bottom */}
                        <div className="absolute bottom-0 inset-x-0 bg-slate-950/90 text-white flex items-center justify-between px-3 py-2 font-semibold text-xs border-t border-white/5">
                          <span className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-4.5 h-4.5 fill-yellow-400" /> {movie.rating}/10
                          </span>
                          <span className="text-slate-400 font-mono text-[10px]">{movie.votes} votes</span>
                        </div>

                        {/* Language tags overlay inside poster top */}
                        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                          {movie.language.map((lang, idx) => (
                            <span key={idx} className="bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase backdrop-blur-xs">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Movie descriptive content */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-slate-950 group-hover:text-rose-600 transition-colors text-base leading-snug">
                            {movie.title}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium truncate">{movie.genre.join(' • ')}</p>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-semibold uppercase">
                          <span>{movie.duration}</span>
                          <span className="bg-rose-50 text-rose-500 px-2 py-0.5 rounded border border-rose-100">{movie.certificate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : (
          /* LIVE MUSIC OR EVENTS LIST */
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 font-display uppercase">
                  {activeCategory === 'events' ? '🎟️ The Best Of Live Shows & Festivals' : '🎸 Your Music Studio Concerts'}
                </h2>
                <p className="text-xs text-slate-500">Hand-curated local events under top production partners across {selectedCity.name}.</p>
              </div>
              <span className="text-xs text-slate-400 font-semibold font-mono">
                Showing {filteredEvents.length} events
              </span>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="bg-white border rounded-2xl p-10 text-center">
                <p className="text-sm font-semibold text-slate-500">No events found matching current search queries.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredEvents.map((ev) => (
                  <div 
                    key={ev.id}
                    className="group bg-white rounded-2xl overflow-hidden border border-slate-150 hover:shadow-lg transition-all flex flex-col cursor-pointer"
                    onClick={() => setPreviewEvent(ev)}
                  >
                    {/* Event image */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-slate-900">
                      <img 
                        src={ev.image} 
                        alt={ev.title} 
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300" 
                      />
                      {ev.promoted && (
                        <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.8 rounded-full shadow-sm animate-pulse">
                          🔥 Promoted
                        </span>
                      )}
                      
                      {ev.likes && (
                        <div className="absolute bottom-2.5 left-2.5 bg-slate-950/80 text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1.5 backdrop-blur-xs">
                          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" /> {ev.likes}
                        </div>
                      )}
                    </div>

                    {/* Event info details */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-2.5">
                      <div className="space-y-1.5">
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-rose-500 bg-rose-50/70 border border-rose-100 px-2 py-0.5 rounded-full">
                          {ev.category}
                        </span>
                        <h4 className="font-extrabold text-slate-950 group-hover:text-rose-600 transition-colors text-sm sm:text-base leading-tight pt-1">
                          {ev.title}
                        </h4>
                        <p className="text-xs text-slate-500 truncate">{ev.venue}</p>
                      </div>

                      <div className="border-t border-slate-100 pt-2.5 flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-500 font-medium">{ev.date}</span>
                        <span className="font-bold text-slate-900">₹{ev.price} Onwards</span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* 4. SEPARATE SCREEN: INTERACTIVE PREVIEW OVERLAY DETAILS SHEET */}
      {previewMovie && (
        <div id="movie-preview-overlay" className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Banner block overlay */}
            <div className="relative h-44 sm:h-56 bg-slate-900">
              <img src={previewMovie.banner} alt={previewMovie.title} className="w-full h-full object-cover object-center opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
              
              <button 
                onClick={() => setPreviewMovie(null)}
                className="absolute top-3.5 right-3.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-5 text-white pr-4">
                <span className="bg-rose-500 text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full">
                  Now Showing
                </span>
                <h3 className="text-lg sm:text-2xl font-black tracking-tight mt-1">{previewMovie.title}</h3>
                <p className="text-xs text-slate-300 font-medium">{previewMovie.genre.join(', ')} • {previewMovie.duration}</p>
              </div>
            </div>

            {/* Movie detail descriptions text */}
            <div className="p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap gap-4 items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-150">
                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border shadow-xs font-semibold">
                  <span>⭐</span> Rating: <strong className="text-slate-900">{previewMovie.rating}/10</strong> ({previewMovie.votes} votes)
                </div>
                <div>
                  Certificate: <strong className="text-slate-900">{previewMovie.certificate}</strong>
                </div>
                <div>
                  Release Date: <strong className="text-slate-900">{previewMovie.releaseDate}</strong>
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide">About Movie Plot</h4>
                <p className="text-xs sm:text-sm text-slate-650 leading-relaxed font-normal">{previewMovie.description}</p>
              </div>

              {/* Supported ticket formats */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Available Formats:</span>
                {previewMovie.format.map((f, i) => (
                  <span key={i} className="bg-rose-50 text-rose-600 border border-rose-100 font-bold text-[10px] px-2.5 py-0.5 rounded uppercase">
                    {f}
                  </span>
                ))}
              </div>

              {/* Core interactive booking action */}
              <div className="flex gap-3 justify-end pt-3 border-t">
                <button
                  onClick={() => setPreviewMovie(null)}
                  className="px-5 py-2.5 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel Preview
                </button>
                <button
                  id="book-tickets-from-preview"
                  onClick={() => {
                    setSelectedMovieForBooking(previewMovie);
                    setPreviewMovie(null);
                  }}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-md text-xs transition-all cursor-pointer flex items-center gap-1 active:scale-97"
                >
                  Book Movie Tickets <ChevronDown className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. SEPARATE SCREEN: INTERACTIVE EVENTS DETAILS PREVIEW SHEET */}
      {previewEvent && (
        <div id="event-preview-overlay" className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
            
            {/* Banner overlay sheet */}
            <div className="relative h-44 sm:h-56 bg-slate-900">
              <img src={previewEvent.image} alt={previewEvent.title} className="w-full h-full object-cover object-center opacity-40 blur-[1px]" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
              
              <button 
                onClick={() => setPreviewEvent(null)}
                className="absolute top-3.5 right-3.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-5 text-white pr-4">
                <span className="bg-amber-500 text-white text-[90px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-full text-[9px]">
                  {previewEvent.category} Passed Premium
                </span>
                <h3 className="text-lg sm:text-2xl font-black tracking-tight mt-1.5">{previewEvent.title}</h3>
                <p className="text-xs text-slate-300 font-medium">{previewEvent.venue}</p>
              </div>
            </div>

            {/* Info detail content lists */}
            <div className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-150">
                <div>
                  Show Date Timings: <strong className="text-slate-900 block mt-0.5">{previewEvent.date}</strong>
                </div>
                <div>
                  Pass Entry Ticket Fee: <strong className="text-slate-900 block mt-0.5">₹{previewEvent.price} / admission pass</strong>
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide">Live Performance Details</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Experience stellar, award-winning live performances and regional shows under world class arrangements at the prominent Tagore Exhibition Grounds. Admissions grant comfortable standing access tickets with automated entrance check. 
                </p>
              </div>

              {/* Core interactive booking action */}
              <div className="flex gap-3 justify-end pt-3 border-t">
                <button
                  onClick={() => setPreviewEvent(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-705 bg-white hover:bg-slate-50 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel Preview
                </button>
                <button
                  id="book-event-from-preview"
                  onClick={() => {
                    setSelectedEventForBooking(previewEvent);
                    setPreviewEvent(null);
                  }}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md text-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-97"
                >
                  Book Dynamic Admission Pass <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 6. PRIMARY WORKSPACE BOOKING FLOW REGISTRATION SYSTEM */}
      {(selectedMovieForBooking || selectedEventForBooking) && (
        <BookingFlowModal
          movie={selectedMovieForBooking}
          liveEvent={selectedEventForBooking}
          onClose={() => {
            setSelectedMovieForBooking(null);
            setSelectedEventForBooking(null);
          }}
          userWallet={userWallet}
          onUpdateWallet={setUserWallet}
          onConfirmBooking={handleAddNewBooking}
          userCity={selectedCity.name}
          currentUser={currentUser}
          onTriggerLogin={() => setShowAuthModal(true)}
        />
      )}

      {/* 6.5 BOOKMYTHEATRE USER AUTHENTICATION SYSTEM BACKGROUND */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* 7. APP ELEMENTAL FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800/80 text-xs text-center mt-12">
        <div className="max-w-7xl mx-auto px-4 space-y-6">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-5 text-left">
            <div className="space-y-1">
              <h4 className="text-white font-extrabold text-sm sm:text-base tracking-tight flex items-center gap-2">
                <span className="bg-rose-500 text-white p-1 rounded font-bold text-xs">BMT</span> BookMyTheatre Rewards club
              </h4>
              <p className="text-slate-450 leading-relaxed max-w-lg text-[11px]">
                Got an active play-theatre, independent comedy club, or live music showcase experience? Partner with us & register events to get featured on India's top cinema network!
              </p>
            </div>
            <button
              onClick={() => alert("Partner signup console: Dynamic developer registry active! Contact support@bookmytheatre.localhost to list shows.")}
              className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold px-4 sm:px-5 py-2.5 rounded-xl transition-all shadow text-xs shrink-0 cursor-pointer"
            >
              Contact & Partner Today
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-slate-400 font-medium py-3">
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg hover:bg-slate-850 transition-colors">
              <span className="text-2xl animate-pulse">📞</span>
              <p className="text-white font-bold uppercase text-[10px] tracking-wider pt-1">24/7 CUSTOMER CARE CHECK</p>
              <p className="text-[10px] text-slate-500">Live web experts ready to support booking errors instantly.</p>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg hover:bg-slate-850 transition-colors">
              <span className="text-2xl">🎫</span>
              <p className="text-white font-bold uppercase text-[10px] tracking-wider pt-1">RESEND CONFIRMATION CODES</p>
              <p className="text-[10px] text-slate-500">Send lost ticket barcodes with interactive invoice histories.</p>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg hover:bg-slate-850 transition-colors">
              <span className="text-2xl">✉️</span>
              <p className="text-white font-bold uppercase text-[10px] tracking-wider pt-1">SUBSCRIBE TO CULTURAL NEWS</p>
              <p className="text-[10px] text-slate-500">No promo spam policy. Get weekend theatre lists only.</p>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-800/60 pt-5">
            <p className="font-extrabold text-slate-200">BookMyTheatre • India's Premiere Theatre Hub</p>
            <p className="text-[10px] text-slate-500 leading-normal max-w-2xl mx-auto">
              Copyright © 2026 BookMyTheatre Entertainment Private Limited. Standard ticketing terms including convenience fees applied. High contrast browser theme optimized for dynamic iframe controls.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}
