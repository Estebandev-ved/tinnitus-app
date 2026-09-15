import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, MapPin, Calendar, Clock, Star, Camera, Sparkles, Heart,
  Filter, Search, TrendingUp, Zap, Wind, Mountain, Music, Utensils,
  ChevronRight, ChevronLeft, Plus, X, Check, Sun, Moon, Compass,
  Navigation, Play, Pause, RotateCcw, Grid, List, BookOpen, Award,
  Flame, Target, BarChart3, PieChart, Activity, Map, Eye, Smile,
  Meh, Frown, ThumbsUp, Download, Share2, MoreHorizontal, ArrowUpRight,
  Layers, Palette, Camera as CameraIcon, Video, Mic, Image, FileText,
  Lock, Unlock, Globe2, Plane, Train, Bus, Car, Bike, Footprints, Ship
} from 'lucide-react';
import './VibeTripLogger.css';

const VIBES = [
  { id: 'relaxed', label: 'Relaxed', icon: Wind, color: '#4ade80', gradient: 'linear-gradient(135deg, #4ade80, #22d3ee)' },
  { id: 'energetic', label: 'Energetic', icon: Zap, color: '#facc15', gradient: 'linear-gradient(135deg, #facc15, #fb923c)' },
  { id: 'adrenaline', label: 'Adrenaline', icon: Mountain, color: '#f87171', gradient: 'linear-gradient(135deg, #f87171, #c084fc)' },
  { id: 'cultural', label: 'Cultural', icon: Music, color: '#a78bfa', gradient: 'linear-gradient(135deg, #a78bfa, #818cf8)' },
  { id: 'culinary', label: 'Culinary', icon: Utensils, color: '#fb923c', gradient: 'linear-gradient(135deg, #fb923c, #f472b6)' },
];

const MOODS = ['✨ Magical', '😊 Happy', '🧘 Peaceful', '🔥 Excited', '😮 Awestruck', '💡 Inspired', '😴 Tired', '🌙 Mystical'];

const TRIP_TYPES = [
  { id: 'plane', icon: Plane, label: 'Flight' },
  { id: 'train', icon: Train, label: 'Train' },
  { id: 'bus', icon: Bus, label: 'Bus' },
  { id: 'car', icon: Car, label: 'Road Trip' },
  { id: 'bike', icon: Bike, label: 'Bike' },
  { id: 'walk', icon: Footprints, label: 'Walking' },
  { id: 'boat', icon: Ship, label: 'Boat' },
];

const SAMPLE_TRIPS = [
  {
    id: 1,
    name: 'Tokyo Cherry Blossoms',
    location: 'Tokyo, Japan',
    date: '2026-03-15',
    duration: '7 days',
    rating: 5,
    vibe: 'cultural',
    moods: ['✨ Magical', '😮 Awestruck'],
    special: 'Walking through Ueno Park with pink petals falling like snow',
    coords: { lat: 35.6762, lng: 139.6503 },
    favorite: true,
  },
  {
    id: 2,
    name: 'Iceland Northern Lights',
    location: 'Reykjavik, Iceland',
    date: '2026-01-20',
    duration: '5 days',
    rating: 5,
    vibe: 'adrenaline',
    moods: ['✨ Magical', '💡 Inspired'],
    special: 'Standing under the aurora in complete silence at 2am',
    coords: { lat: 64.1466, lng: -21.9426 },
    favorite: true,
  },
  {
    id: 3,
    name: 'Barcelona Food Tour',
    location: 'Barcelona, Spain',
    date: '2026-02-10',
    duration: '4 days',
    rating: 4,
    vibe: 'culinary',
    moods: ['😊 Happy', '🔥 Excited'],
    special: 'The perfect paella at a hidden beach restaurant',
    coords: { lat: 41.3874, lng: 2.1686 },
    favorite: false,
  },
  {
    id: 4,
    name: 'Swiss Alps Adventure',
    location: 'Interlaken, Switzerland',
    date: '2025-12-05',
    duration: '6 days',
    rating: 5,
    vibe: 'adrenaline',
    moods: ['🔥 Excited', '😮 Awestruck'],
    special: 'Paragliding over Lake Thun with mountain views',
    coords: { lat: 46.6863, lng: 7.8632 },
    favorite: true,
  },
  {
    id: 5,
    name: 'Morocco Desert Camp',
    location: 'Sahara, Morocco',
    date: '2025-11-18',
    duration: '3 days',
    rating: 4,
    vibe: 'relaxed',
    moods: ['🧘 Peaceful', '🌙 Mystical'],
    special: 'Stargazing from a Berber camp with zero light pollution',
    coords: { lat: 31.7917, lng: -7.0926 },
    favorite: false,
  },
];

const VibeTripLogger = ({ onClose, onBack }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [tripType, setTripType] = useState('plane');
  const [selectedVibe, setSelectedVibe] = useState(null);
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [tripName, setTripName] = useState('');
  const [tripLocation, setTripLocation] = useState('');
  const [specialNote, setSpecialNote] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 280, damping: 24 }
    }
  };

  const toggleMood = (mood) => {
    setSelectedMoods(prev =>
      prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]
    );
  };

  const toggleFavorite = (id) => {
    const trip = SAMPLE_TRIPS.find(t => t.id === id);
    if (trip) trip.favorite = !trip.favorite;
  };

  const filteredTrips = SAMPLE_TRIPS.filter(trip => {
    if (filter === 'favorites') return trip.favorite;
    if (filter === 'recent') {
      const tripDate = new Date(trip.date);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return tripDate >= threeMonthsAgo;
    }
    return true;
  }).filter(trip =>
    trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalTrips: SAMPLE_TRIPS.length,
    totalCountries: new Set(SAMPLE_TRIPS.map(t => t.location.split(', ')[1])).size,
    avgRating: (SAMPLE_TRIPS.reduce((a, t) => a + t.rating, 0) / SAMPLE_TRIPS.length).toFixed(1),
    favoriteVibe: 'adrenaline',
    streak: 12,
  };

  const renderStar = (index) => {
    const filled = index < (hoverRating || rating);
    return (
      <motion.button
        key={index}
        className={`star-btn ${filled ? 'star-filled' : ''}`}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        onMouseEnter={() => setHoverRating(index + 1)}
        onMouseLeave={() => setHoverRating(0)}
        onClick={() => setRating(index + 1)}
      >
        <Star size={24} fill={filled ? '#facc15' : 'none'} color={filled ? '#facc15' : '#4a5568'} />
      </motion.button>
    );
  };

  // ─── DASHBOARD VIEW ───
  const renderDashboard = () => (
    <motion.div className="vtl-container" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <motion.header className="vtl-header" variants={itemVariants}>
        <div className="vtl-header-left">
          <motion.button className="vtl-back-btn" onClick={onClose} whileTap={{ scale: 0.9 }}>
            <ChevronLeft size={20} />
          </motion.button>
          <div>
            <h1 className="vtl-title">VibeTrip Logger</h1>
            <p className="vtl-subtitle">Your Journey, Your Vibe</p>
          </div>
        </div>
        <div className="vtl-header-actions">
          <motion.button
            className="vtl-icon-btn"
            onClick={() => setActiveView('ar')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Camera size={20} />
          </motion.button>
          <motion.button
            className="vtl-icon-btn"
            onClick={() => setActiveView('stats')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BarChart3 size={20} />
          </motion.button>
        </div>
      </motion.header>

      {/* 3D Globe Visualization */}
      <motion.section className="vtl-globe-section" variants={itemVariants}>
        <div className="vtl-globe-container">
          <div className="vtl-globe">
            <div className="vtl-globe-ring vtl-ring-1" />
            <div className="vtl-globe-ring vtl-ring-2" />
            <div className="vtl-globe-ring vtl-ring-3" />
            <div className="vtl-globe-core">
              <Globe size={48} className="vtl-globe-icon" />
            </div>
            {/* Trip markers */}
            {SAMPLE_TRIPS.slice(0, 3).map((trip, i) => (
              <motion.div
                key={trip.id}
                className="vtl-trip-marker"
                style={{
                  top: `${30 + i * 18}%`,
                  left: `${20 + i * 25}%`,
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3
                }}
              >
                <MapPin size={16} />
              </motion.div>
            ))}
          </div>
          <div className="vtl-globe-stats">
            <div className="vtl-globe-stat">
              <span className="vtl-stat-num">{stats.totalTrips}</span>
              <span className="vtl-stat-label">Trips</span>
            </div>
            <div className="vtl-globe-stat-divider" />
            <div className="vtl-globe-stat">
              <span className="vtl-stat-num">{stats.totalCountries}</span>
              <span className="vtl-stat-label">Countries</span>
            </div>
            <div className="vtl-globe-stat-divider" />
            <div className="vtl-globe-stat">
              <span className="vtl-stat-num">{stats.avgRating}</span>
              <span className="vtl-stat-label">Avg Vibe</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Quick Log Button */}
      <motion.section className="vtl-quick-log" variants={itemVariants}>
        <motion.button
          className="vtl-log-btn"
          onClick={() => setActiveView('log')}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="vtl-log-btn-icon">
            <Plus size={28} />
          </div>
          <div className="vtl-log-btn-text">
            <span className="vtl-log-btn-title">Log New Trip</span>
            <span className="vtl-log-btn-sub">Capture the moment</span>
          </div>
          <ChevronRight size={20} className="vtl-log-btn-arrow" />
        </motion.button>
      </motion.section>

      {/* Recent Trip Memories Carousel */}
      <motion.section className="vtl-section" variants={itemVariants}>
        <div className="vtl-section-header">
          <h3 className="vtl-section-title">
            <Sparkles size={18} className="vtl-section-icon" />
            Recent Memories
          </h3>
          <button className="vtl-see-all" onClick={() => setActiveView('journal')}>
            View All <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="vtl-carousel">
          {SAMPLE_TRIPS.slice(0, 4).map((trip, i) => (
            <motion.div
              key={trip.id}
              className="vtl-memory-card"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setSelectedTrip(trip); setActiveView('detail'); }}
            >
              <div className="vtl-memory-gradient" style={{ background: VIBES.find(v => v.id === trip.vibe)?.gradient }} />
              <div className="vtl-memory-content">
                <div className="vtl-memory-top">
                  <span className="vtl-memory-vibe">{VIBES.find(v => v.id === trip.vibe)?.label}</span>
                  <motion.button
                    className={`vtl-fav-btn ${trip.favorite ? 'vtl-fav-active' : ''}`}
                    whileTap={{ scale: 0.8 }}
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(trip.id); }}
                  >
                    <Heart size={14} fill={trip.favorite ? '#f43f5e' : 'none'} />
                  </motion.button>
                </div>
                <h4 className="vtl-memory-name">{trip.name}</h4>
                <p className="vtl-memory-location">
                  <MapPin size={12} /> {trip.location}
                </p>
                <div className="vtl-memory-rating">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={10} fill={i < trip.rating ? '#facc15' : 'none'} color={i < trip.rating ? '#facc15' : '#4a5568'} />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Streak Banner */}
      <motion.section className="vtl-streak-section" variants={itemVariants}>
        <div className="vtl-streak-card">
          <div className="vtl-streak-glow" />
          <div className="vtl-streak-icon">
            <Flame size={24} />
          </div>
          <div className="vtl-streak-info">
            <span className="vtl-streak-count">{stats.streak}</span>
            <span className="vtl-streak-label">Day Logging Streak</span>
          </div>
          <div className="vtl-streak-badge">
            <Award size={14} />
          </div>
        </div>
      </motion.section>

      {/* Vibe Distribution Preview */}
      <motion.section className="vtl-section" variants={itemVariants}>
        <div className="vtl-section-header">
          <h3 className="vtl-section-title">
            <PieChart size={18} className="vtl-section-icon" />
            Your Vibe Mix
          </h3>
        </div>
        <div className="vtl-vibe-bars">
          {VIBES.map((vibe, i) => {
            const percentage = [35, 25, 20, 15, 5][i];
            return (
              <div key={vibe.id} className="vtl-vibe-bar-row">
                <div className="vtl-vibe-bar-label">
                  <vibe.icon size={14} style={{ color: vibe.color }} />
                  <span>{vibe.label}</span>
                </div>
                <div className="vtl-vibe-bar-track">
                  <motion.div
                    className="vtl-vibe-bar-fill"
                    style={{ background: vibe.gradient }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: i * 0.15 }}
                  />
                </div>
                <span className="vtl-vibe-bar-pct">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </motion.section>
    </motion.div>
  );

  // ─── TRIP LOGGING VIEW ───
  const renderLogView = () => (
    <motion.div className="vtl-container" variants={containerVariants} initial="hidden" animate="show">
      <motion.header className="vtl-header" variants={itemVariants}>
        <div className="vtl-header-left">
          <motion.button className="vtl-back-btn" onClick={() => setActiveView('dashboard')} whileTap={{ scale: 0.9 }}>
            <ChevronLeft size={20} />
          </motion.button>
          <h1 className="vtl-title">Log Trip</h1>
        </div>
      </motion.header>

      {/* Trip Name & Location */}
      <motion.section className="vtl-form-section" variants={itemVariants}>
        <label className="vtl-label">Trip Name</label>
        <input
          type="text"
          className="vtl-input"
          placeholder="e.g., Tokyo Cherry Blossoms"
          value={tripName}
          onChange={(e) => setTripName(e.target.value)}
        />

        <label className="vtl-label">Location</label>
        <div className="vtl-input-with-icon">
          <MapPin size={16} className="vtl-input-icon" />
          <input
            type="text"
            className="vtl-input vtl-input-icon-field"
            placeholder="City, Country"
            value={tripLocation}
            onChange={(e) => setTripLocation(e.target.value)}
          />
        </div>
      </motion.section>

      {/* Trip Type Selector */}
      <motion.section className="vtl-form-section" variants={itemVariants}>
        <label className="vtl-label">How did you get there?</label>
        <div className="vtl-trip-type-grid">
          {TRIP_TYPES.map((type) => (
            <motion.button
              key={type.id}
              className={`vtl-trip-type-btn ${tripType === type.id ? 'vtl-trip-type-active' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTripType(type.id)}
            >
              <type.icon size={20} />
              <span>{type.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Duration */}
      <motion.section className="vtl-form-section" variants={itemVariants}>
        <label className="vtl-label">Duration</label>
        <div className="vtl-duration-display">
          <Clock size={18} className="vtl-duration-icon" />
          <span className="vtl-duration-text">Tap to set trip duration</span>
        </div>
      </motion.section>

      {/* Rating */}
      <motion.section className="vtl-form-section" variants={itemVariants}>
        <label className="vtl-label">Trip Rating</label>
        <div className="vtl-rating-row">
          {[1, 2, 3, 4, 5].map((_, i) => renderStar(i))}
          <span className="vtl-rating-text">
            {hoverRating || rating ? `${hoverRating || rating}/5` : 'Rate your trip'}
          </span>
        </div>
      </motion.section>

      {/* Vibe Selector */}
      <motion.section className="vtl-form-section" variants={itemVariants}>
        <label className="vtl-label">What was the vibe?</label>
        <div className="vtl-vibe-selector">
          {VIBES.map((vibe) => (
            <motion.button
              key={vibe.id}
              className={`vtl-vibe-btn ${selectedVibe === vibe.id ? 'vtl-vibe-active' : ''}`}
              style={{
                borderColor: selectedVibe === vibe.id ? vibe.color : 'transparent',
                background: selectedVibe === vibe.id ? `${vibe.color}15` : 'rgba(255,255,255,0.04)'
              }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedVibe(vibe.id)}
            >
              <div className="vtl-vibe-btn-icon" style={{ background: vibe.gradient }}>
                <vibe.icon size={20} color="#fff" />
              </div>
              <span>{vibe.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Mood Chips */}
      <motion.section className="vtl-form-section" variants={itemVariants}>
        <label className="vtl-label">How did you feel?</label>
        <div className="vtl-mood-grid">
          {MOODS.map((mood) => (
            <motion.button
              key={mood}
              className={`vtl-mood-chip ${selectedMoods.includes(mood) ? 'vtl-mood-active' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleMood(mood)}
            >
              {mood}
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Special Note */}
      <motion.section className="vtl-form-section" variants={itemVariants}>
        <label className="vtl-label">What made it special?</label>
        <textarea
          className="vtl-textarea"
          placeholder="Describe that unforgettable moment..."
          rows={4}
          value={specialNote}
          onChange={(e) => setSpecialNote(e.target.value)}
        />
      </motion.section>

      {/* Photo Grid Placeholder */}
      <motion.section className="vtl-form-section" variants={itemVariants}>
        <label className="vtl-label">Add Photos</label>
        <div className="vtl-photo-grid">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="vtl-photo-slot"
              whileHover={{ scale: 1.05, borderColor: 'rgba(0, 180, 216, 0.5)' }}
              whileTap={{ scale: 0.95 }}
            >
              {i === 1 ? (
                <>
                  <CameraIcon size={24} className="vtl-photo-icon" />
                  <span>Add Photo</span>
                </>
              ) : (
                <div className="vtl-photo-placeholder">
                  <Image size={16} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Save Button */}
      <motion.section className="vtl-form-section" variants={itemVariants}>
        <motion.button
          className="vtl-save-btn"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setActiveView('dashboard');
            setTripName('');
            setTripLocation('');
            setSpecialNote('');
            setRating(0);
            setSelectedVibe(null);
            setSelectedMoods([]);
          }}
        >
          <Check size={20} />
          Save Trip Memory
        </motion.button>
      </motion.section>
    </motion.div>
  );

  // ─── JOURNAL VIEW ───
  const renderJournal = () => (
    <motion.div className="vtl-container" variants={containerVariants} initial="hidden" animate="show">
      <motion.header className="vtl-header" variants={itemVariants}>
        <div className="vtl-header-left">
          <motion.button className="vtl-back-btn" onClick={() => setActiveView('dashboard')} whileTap={{ scale: 0.9 }}>
            <ChevronLeft size={20} />
          </motion.button>
          <h1 className="vtl-title">Travel Journal</h1>
        </div>
      </motion.header>

      {/* Filter Bar */}
      <motion.section className="vtl-filter-section" variants={itemVariants}>
        <div className="vtl-filter-bar">
          {['all', 'recent', 'favorites'].map((f) => (
            <motion.button
              key={f}
              className={`vtl-filter-btn ${filter === f ? 'vtl-filter-active' : ''}`}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(f)}
            >
              {f === 'all' && <Globe size={14} />}
              {f === 'recent' && <Clock size={14} />}
              {f === 'favorites' && <Heart size={14} />}
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </motion.button>
          ))}
        </div>
        <div className="vtl-search-bar">
          <Search size={16} className="vtl-search-icon" />
          <input
            type="text"
            className="vtl-search-input"
            placeholder="Search trips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </motion.section>

      {/* Trip Cards */}
      <motion.section className="vtl-journal-list" variants={containerVariants}>
        {filteredTrips.map((trip, i) => {
          const vibe = VIBES.find(v => v.id === trip.vibe);
          return (
            <motion.div
              key={trip.id}
              className="vtl-journal-card"
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setSelectedTrip(trip); setActiveView('detail'); }}
            >
              <div className="vtl-journal-card-bg" style={{ background: vibe?.gradient }} />
              <div className="vtl-journal-card-content">
                <div className="vtl-journal-card-top">
                  <span className="vtl-journal-vibe-badge" style={{ background: `${vibe?.color}25`, color: vibe?.color, borderColor: `${vibe?.color}40` }}>
                    <vibe.icon size={12} /> {vibe?.label}
                  </span>
                  <div className="vtl-journal-rating">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={10} fill={j < trip.rating ? '#facc15' : 'none'} color={j < trip.rating ? '#facc15' : '#4a5568'} />
                    ))}
                  </div>
                </div>
                <h3 className="vtl-journal-name">{trip.name}</h3>
                <p className="vtl-journal-location"><MapPin size={12} /> {trip.location}</p>
                <div className="vtl-journal-meta">
                  <span><Calendar size={12} /> {new Date(trip.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span><Clock size={12} /> {trip.duration}</span>
                </div>
                <p className="vtl-journal-special">"{trip.special}"</p>
                <div className="vtl-journal-moods">
                  {trip.moods.map((mood) => (
                    <span key={mood} className="vtl-journal-mood-tag">{mood}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.section>
    </motion.div>
  );

  // ─── TRIP DETAIL VIEW ───
  const renderDetail = () => {
    if (!selectedTrip) return null;
    const vibe = VIBES.find(v => v.id === selectedTrip.vibe);
    return (
      <motion.div className="vtl-container" variants={containerVariants} initial="hidden" animate="show">
        <motion.header className="vtl-header" variants={itemVariants}>
          <div className="vtl-header-left">
            <motion.button className="vtl-back-btn" onClick={() => setActiveView('journal')} whileTap={{ scale: 0.9 }}>
              <ChevronLeft size={20} />
            </motion.button>
            <h1 className="vtl-title">Trip Details</h1>
          </div>
          <div className="vtl-header-actions">
            <motion.button className="vtl-icon-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Share2 size={20} />
            </motion.button>
            <motion.button className="vtl-icon-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Download size={20} />
            </motion.button>
          </div>
        </motion.header>

        {/* Hero Section */}
        <motion.section className="vtl-detail-hero" variants={itemVariants}>
          <div className="vtl-detail-hero-bg" style={{ background: vibe?.gradient }} />
          <div className="vtl-detail-hero-content">
            <span className="vtl-detail-vibe-badge" style={{ background: `${vibe?.color}30`, color: '#fff' }}>
              <vibe.icon size={16} /> {vibe?.label}
            </span>
            <h2 className="vtl-detail-name">{selectedTrip.name}</h2>
            <p className="vtl-detail-location"><MapPin size={16} /> {selectedTrip.location}</p>
            <div className="vtl-detail-rating">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill={i < selectedTrip.rating ? '#facc15' : 'none'} color={i < selectedTrip.rating ? '#facc15' : 'rgba(255,255,255,0.4)'} />
              ))}
            </div>
          </div>
        </motion.section>

        {/* Info Cards */}
        <motion.section className="vtl-detail-info" variants={itemVariants}>
          <div className="vtl-detail-info-card">
            <Calendar size={18} />
            <span className="vtl-detail-info-label">Date</span>
            <span className="vtl-detail-info-value">{new Date(selectedTrip.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="vtl-detail-info-card">
            <Clock size={18} />
            <span className="vtl-detail-info-label">Duration</span>
            <span className="vtl-detail-info-value">{selectedTrip.duration}</span>
          </div>
        </motion.section>

        {/* Special Note */}
        <motion.section className="vtl-detail-section" variants={itemVariants}>
          <h3 className="vtl-detail-section-title"><Sparkles size={18} /> What Made It Special</h3>
          <p className="vtl-detail-special">"{selectedTrip.special}"</p>
        </motion.section>

        {/* Moods */}
        <motion.section className="vtl-detail-section" variants={itemVariants}>
          <h3 className="vtl-detail-section-title"><Smile size={18} /> Moods</h3>
          <div className="vtl-detail-moods">
            {selectedTrip.moods.map((mood) => (
              <span key={mood} className="vtl-detail-mood-tag">{mood}</span>
            ))}
          </div>
        </motion.section>

        {/* Photo Gallery Placeholder */}
        <motion.section className="vtl-detail-section" variants={itemVariants}>
          <h3 className="vtl-detail-section-title"><Camera size={18} /> Photos</h3>
          <div className="vtl-detail-photos">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="vtl-detail-photo-slot">
                <Image size={20} />
              </div>
            ))}
          </div>
        </motion.section>

        {/* Map Placeholder */}
        <motion.section className="vtl-detail-section" variants={itemVariants}>
          <h3 className="vtl-detail-section-title"><Map size={18} /> Location</h3>
          <div className="vtl-detail-map">
            <Globe size={32} className="vtl-detail-map-icon" />
            <span>{selectedTrip.location}</span>
          </div>
        </motion.section>
      </motion.div>
    );
  };

  // ─── AR LENS VIEW ───
  const renderARView = () => (
    <motion.div className="vtl-container vtl-ar-container" variants={containerVariants} initial="hidden" animate="show">
      <motion.header className="vtl-header vtl-ar-header" variants={itemVariants}>
        <div className="vtl-header-left">
          <motion.button className="vtl-back-btn" onClick={() => setActiveView('dashboard')} whileTap={{ scale: 0.9 }}>
            <ChevronLeft size={20} />
          </motion.button>
          <h1 className="vtl-title">AR Vibe Lens</h1>
        </div>
      </motion.header>

      {/* AR Viewfinder */}
      <motion.section className="vtl-ar-viewfinder" variants={itemVariants}>
        <div className="vtl-ar-frame">
          {/* Animated Pulsing Circle */}
          <motion.div
            className="vtl-ar-pulse"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.6, 0.2, 0.6]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="vtl-ar-pulse vtl-ar-pulse-2"
            animate={{
              scale: [1.2, 1.6, 1.2],
              opacity: [0.4, 0.1, 0.4]
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />

          {/* Crosshair */}
          <div className="vtl-ar-crosshair">
            <div className="vtl-ar-crosshair-line vtl-cross-top" />
            <div className="vtl-ar-crosshair-line vtl-cross-right" />
            <div className="vtl-ar-crosshair-line vtl-cross-bottom" />
            <div className="vtl-ar-crosshair-line vtl-cross-left" />
            <div className="vtl-ar-crosshair-center" />
          </div>

          {/* Vibe Detection Text */}
          <motion.div
            className="vtl-ar-detect-text"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Eye size={16} />
            Scanning Vibe...
          </motion.div>
        </div>
      </motion.section>

      {/* Quick Capture Buttons */}
      <motion.section className="vtl-ar-controls" variants={itemVariants}>
        <motion.button
          className="vtl-ar-capture-btn"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsRecording(!isRecording)}
        >
          <div className={`vtl-ar-capture-ring ${isRecording ? 'vtl-recording' : ''}`} />
          <div className="vtl-ar-capture-inner">
            {isRecording ? <Pause size={24} /> : <Play size={24} />}
          </div>
        </motion.button>
      </motion.section>

      {/* Quick Action Buttons */}
      <motion.section className="vtl-ar-quick-actions" variants={itemVariants}>
        <motion.button className="vtl-ar-quick-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Smile size={20} />
          <span>Mood</span>
        </motion.button>
        <motion.button className="vtl-ar-quick-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Zap size={20} />
          <span>Vibe</span>
        </motion.button>
        <motion.button className="vtl-ar-quick-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Camera size={20} />
          <span>Photo</span>
        </motion.button>
      </motion.section>

      {/* AR Effects Carousel */}
      <motion.section className="vtl-ar-effects" variants={itemVariants}>
        <div className="vtl-ar-effects-scroll">
          {['Vintage Film', 'Neon Glow', 'Dreamy Haze', 'Golden Hour', 'Cool Blues'].map((effect, i) => (
            <motion.div
              key={effect}
              className={`vtl-ar-effect-chip ${i === 0 ? 'vtl-ar-effect-active' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Palette size={14} />
              {effect}
            </motion.div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );

  // ─── STATS VIEW ───
  const renderStats = () => (
    <motion.div className="vtl-container" variants={containerVariants} initial="hidden" animate="show">
      <motion.header className="vtl-header" variants={itemVariants}>
        <div className="vtl-header-left">
          <motion.button className="vtl-back-btn" onClick={() => setActiveView('dashboard')} whileTap={{ scale: 0.9 }}>
            <ChevronLeft size={20} />
          </motion.button>
          <h1 className="vtl-title">Travel Stats</h1>
        </div>
      </motion.header>

      {/* Personal Travel Persona */}
      <motion.section className="vtl-persona-section" variants={itemVariants}>
        <div className="vtl-persona-card">
          <div className="vtl-persona-glow" />
          <div className="vtl-persona-icon">
            <Compass size={32} />
          </div>
          <h3 className="vtl-persona-title">The Adventurer</h3>
          <p className="vtl-persona-desc">You crave adrenaline and unique experiences. Your trips are filled with bold moments and unforgettable vibes.</p>
          <div className="vtl-persona-badges">
            <span className="vtl-persona-badge" style={{ background: 'rgba(248, 113, 113, 0.2)', color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.3)' }}>
              <Mountain size={12} /> Adrenaline Junkie
            </span>
            <span className="vtl-persona-badge" style={{ background: 'rgba(167, 139, 250, 0.2)', color: '#a78bfa', borderColor: 'rgba(167, 139, 250, 0.3)' }}>
              <Globe size={12} /> World Explorer
            </span>
          </div>
        </div>
      </motion.section>

      {/* Vibe Distribution */}
      <motion.section className="vtl-section" variants={itemVariants}>
        <div className="vtl-section-header">
          <h3 className="vtl-section-title">
            <BarChart3 size={18} className="vtl-section-icon" />
            Vibe Distribution
          </h3>
        </div>
        <div className="vtl-vibe-chart">
          {VIBES.map((vibe, i) => {
            const height = [85, 65, 50, 35, 15][i];
            return (
              <div key={vibe.id} className="vtl-chart-bar-col">
                <motion.div
                  className="vtl-chart-bar"
                  style={{ background: vibe.gradient }}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                />
                <span className="vtl-chart-bar-label">{vibe.label}</span>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* Key Stats Grid */}
      <motion.section className="vtl-section" variants={itemVariants}>
        <div className="vtl-section-header">
          <h3 className="vtl-section-title">
            <Target size={18} className="vtl-section-icon" />
            Key Metrics
          </h3>
        </div>
        <div className="vtl-stats-grid">
          <div className="vtl-stat-card">
            <div className="vtl-stat-card-icon" style={{ background: 'rgba(0, 180, 216, 0.15)', color: '#00B4D8' }}>
              <Globe size={20} />
            </div>
            <span className="vtl-stat-card-value">{stats.totalTrips}</span>
            <span className="vtl-stat-card-label">Total Trips</span>
          </div>
          <div className="vtl-stat-card">
            <div className="vtl-stat-card-icon" style={{ background: 'rgba(45, 212, 191, 0.15)', color: '#2DD4BF' }}>
              <MapPin size={20} />
            </div>
            <span className="vtl-stat-card-value">{stats.totalCountries}</span>
            <span className="vtl-stat-card-label">Countries</span>
          </div>
          <div className="vtl-stat-card">
            <div className="vtl-stat-card-icon" style={{ background: 'rgba(250, 204, 21, 0.15)', color: '#facc15' }}>
              <Star size={20} />
            </div>
            <span className="vtl-stat-card-value">{stats.avgRating}</span>
            <span className="vtl-stat-card-label">Avg Rating</span>
          </div>
          <div className="vtl-stat-card">
            <div className="vtl-stat-card-icon" style={{ background: 'rgba(248, 113, 113, 0.15)', color: '#f87171' }}>
              <Flame size={20} />
            </div>
            <span className="vtl-stat-card-value">{stats.streak}</span>
            <span className="vtl-stat-card-label">Day Streak</span>
          </div>
        </div>
      </motion.section>

      {/* Streak Calendar */}
      <motion.section className="vtl-section" variants={itemVariants}>
        <div className="vtl-section-header">
          <h3 className="vtl-section-title">
            <Activity size={18} className="vtl-section-icon" />
            Logging Streak
          </h3>
        </div>
        <div className="vtl-streak-calendar">
          {Array.from({ length: 30 }, (_, i) => {
            const active = i < 12 || (i > 14 && i < 20) || i > 24;
            return (
              <motion.div
                key={i}
                className={`vtl-streak-day ${active ? 'vtl-streak-active' : ''}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.02 }}
              />
            );
          })}
        </div>
      </motion.section>

      {/* Achievement Badges */}
      <motion.section className="vtl-section" variants={itemVariants}>
        <div className="vtl-section-header">
          <h3 className="vtl-section-title">
            <Award size={18} className="vtl-section-icon" />
            Achievements
          </h3>
        </div>
        <div className="vtl-achievements-grid">
          <div className="vtl-achievement">
            <div className="vtl-achievement-icon" style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)' }}>
              <Globe size={20} color="#fff" />
            </div>
            <span>First Trip</span>
          </div>
          <div className="vtl-achievement">
            <div className="vtl-achievement-icon" style={{ background: 'linear-gradient(135deg, #4ade80, #22d3ee)' }}>
              <Flame size={20} color="#fff" />
            </div>
            <span>7 Day Streak</span>
          </div>
          <div className="vtl-achievement">
            <div className="vtl-achievement-icon" style={{ background: 'linear-gradient(135deg, #a78bfa, #818cf8)' }}>
              <Mountain size={20} color="#fff" />
            </div>
            <span>Adrenaline Pro</span>
          </div>
          <div className="vtl-achievement vtl-achievement-locked">
            <div className="vtl-achievement-icon" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <Lock size={20} color="#4a5568" />
            </div>
            <span>World Traveler</span>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );

  // ─── MAIN RENDER ───
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeView}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'log' && renderLogView()}
        {activeView === 'journal' && renderJournal()}
        {activeView === 'detail' && renderDetail()}
        {activeView === 'ar' && renderARView()}
        {activeView === 'stats' && renderStats()}
      </motion.div>
    </AnimatePresence>
  );
};

export default VibeTripLogger;