import React, { useState, useEffect } from 'react';
import { 
  X, MapPin, Clock, Ticket, ShieldAlert, CheckCircle, Flame, 
  CreditCard, Plus, Minus, Popcorn, Coffee, Check, ChevronRight, 
  Sparkles, Wallet, HelpCircle, Utensils, Award, CornerDownRight, Lock
} from 'lucide-react';
import { Movie, Theatre, FoodItem, LiveEvent, Booking, UserAccount } from '../types';
import { THEATRES, FOOD_ITEMS } from '../data/mockData';

interface BookingFlowModalProps {
  movie: Movie | null;
  liveEvent: LiveEvent | null;
  onClose: () => void;
  userWallet: number;
  onUpdateWallet: (newBalance: number) => void;
  onConfirmBooking: (booking: Booking) => void;
  userCity: string;
  currentUser?: UserAccount | null;
  onTriggerLogin?: () => void;
}

export default function BookingFlowModal({
  movie,
  liveEvent,
  onClose,
  userWallet,
  onUpdateWallet,
  onConfirmBooking,
  userCity,
  currentUser = null,
  onTriggerLogin
}: BookingFlowModalProps) {
  // Navigation flow steps: 'theatres' -> 'seats' -> 'snacks' -> 'confirm' -> 'success'
  const [step, setStep] = useState<'theatres' | 'seats' | 'snacks' | 'confirm' | 'success'>('theatres');
  
  // Date selection (Dynamic tabs: Today, Tomorrow, and Next 2 days)
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const showDates = React.useMemo(() => {
    const dates = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < 4; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push({
        dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : days[d.getDay()],
        dayNum: d.getDate(),
        month: months[d.getMonth()],
        fullString: `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`
      });
    }
    return dates;
  }, []);

  // Selected state
  const [selectedTheatre, setSelectedTheatre] = useState<Theatre | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [foodQuantities, setFoodQuantities] = useState<{ [id: string]: number }>({});
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);

  // Generate a random layout for unavailable seats on mount
  const seatGrid = React.useMemo(() => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const cols = Array.from({ length: 12 }, (_, i) => i + 1);
    
    // Rows A-C: Classic, Rows D-F: Premium, Rows G-H: Recliner/VIP
    return rows.map(r => {
      let category: 'Classic' | 'Premium' | 'VIP' = 'Classic';
      let price = 180;
      
      if (['D', 'E', 'F'].includes(r)) {
        category = 'Premium';
        price = 280;
      } else if (['G', 'H'].includes(r)) {
        category = 'VIP';
        price = 450;
      }

      return {
        row: r,
        category,
        price,
        seats: cols.map(c => {
          const seatId = `${r}-${c}`;
          // ~25% random seats are already booked
          const isBooked = Math.random() < 0.25;
          return {
            id: seatId,
            col: c,
            isBooked,
          };
        })
      };
    });
  }, [selectedShowtime, selectedTheatre]);

  // Handle live event flow (bypass theatres/seats layout)
  useEffect(() => {
    if (liveEvent && step === 'theatres') {
      // For live events, preset a single mock theatre
      const mockEventTheatre: Theatre = {
        id: 'ev-theatre',
        name: liveEvent.venue,
        location: userCity,
        amenities: ['M-Ticket'],
        showtimes: [
          { id: 'ev-show-1', time: '06:00 PM', format: '2D', priceRange: `₹${liveEvent.price}`, basePrice: liveEvent.price }
        ]
      };
      setSelectedTheatre(mockEventTheatre);
      setSelectedShowtime(mockEventTheatre.showtimes[0]);
      // Immediately skip to seat equivalent or quantity confirmation
      setStep('seats');
    }
  }, [liveEvent]);

  // Handle seat click
  const handleSeatClick = (seatId: string) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(prev => prev.filter(s => s !== seatId));
    } else {
      if (selectedSeats.length >= 8) {
        alert("You can select a maximum of 8 seats per checkout transaction.");
        return;
      }
      setSelectedSeats(prev => [...prev, seatId]);
    }
  };

  // Pricing calculations
  const calculateTicketTotal = () => {
    if (liveEvent) {
      // Just flat rate per tickets selected
      return selectedSeats.length * liveEvent.price;
    }
    
    // Map selected seats to their grid category price
    let sum = 0;
    selectedSeats.forEach(seatId => {
      const rowLetter = seatId.split('-')[0];
      const matchRow = seatGrid.find(g => g.row === rowLetter);
      if (matchRow) {
        sum += matchRow.price;
      } else {
        sum += selectedShowtime ? selectedShowtime.basePrice : 200;
      }
    });
    return sum;
  };

  const calculateFoodTotal = () => {
    let sum = 0;
    FOOD_ITEMS.forEach(f => {
      const g = foodQuantities[f.id] || 0;
      sum += g * f.price;
    });
    return sum;
  };

  const ticketTotal = calculateTicketTotal();
  const foodTotal = calculateFoodTotal();
  const subtotal = ticketTotal + foodTotal;
  
  // Custom booking charges: ₹30 booking fee per ticket + CGST & SGST (18% on total value)
  const ticketCount = selectedSeats.length || 1;
  const bookingFees = liveEvent ? 0 : ticketCount * 25; 
  const gstTax = Math.floor((subtotal + bookingFees) * 0.18);
  const grandTotal = subtotal + bookingFees + gstTax;

  // Manage F&B quantities
  const updateFoodQuantity = (id: string, delta: number) => {
    setFoodQuantities(prev => {
      const curr = prev[id] || 0;
      const next = Math.max(0, curr + delta);
      return { ...prev, [id]: next };
    });
  };

  // Add random funds play-money action (friction reducer!)
  const handleAddMockFunds = () => {
    onUpdateWallet(userWallet + 1000);
  };

  // Process Mock Checkout Booking
  const handleCheckout = () => {
    if (userWallet < grandTotal) {
      // Insufficient cash
      return;
    }

    // Deduct mock cash
    onUpdateWallet(userWallet - grandTotal);

    // Build booking object
    const finalFoodItems = FOOD_ITEMS.filter(f => (foodQuantities[f.id] || 0) > 0).map(f => ({
      item: f,
      quantity: foodQuantities[f.id]
    }));

    const mockBooking: Booking = {
      id: 'BMT-' + Math.floor(100000 + Math.random() * 900000),
      movie: movie || undefined,
      event: liveEvent || undefined,
      theatreName: selectedTheatre?.name || 'Local Open Stage Arena',
      showtime: selectedShowtime?.time || 'Interactive Timings',
      showDate: showDates[selectedDateIndex].fullString,
      seats: selectedSeats,
      foodItems: finalFoodItems,
      totalPrice: grandTotal,
      bookingTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      qrCodeValue: `BOOKMYTHEATRE|${movie?.title || liveEvent?.title}|${selectedSeats.join(',')}|${grandTotal}`,
      ticketStatus: 'Active'
    };

    setActiveBooking(mockBooking);
    onConfirmBooking(mockBooking);
    setStep('success');
  };

  return (
    <div id="booking-flow-modal-backdrop" className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        id="booking-flow-card"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        {/* Modal Header */}
        <div className="bg-slate-950 text-white p-4 flex items-center justify-between border-b border-rose-500/20">
          <div className="flex items-center gap-3">
            <div className="bg-rose-500 text-white rounded-lg p-2 font-bold font-mono text-sm tracking-tight">
              BMT
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                {movie ? movie.title : liveEvent?.title}
                <span className="text-xs bg-slate-800 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full uppercase">
                  {movie ? movie.certificate : 'LIVE'}
                </span>
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <MapPin className="w-3 h-3 text-rose-400" />
                <span>Selected Location: <strong className="text-white">{userCity}</strong></span>
              </p>
            </div>
          </div>
          <button 
            id="close-booking-modal"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
            title="Cancel Booking"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Wizard Multi-Step Progress Tracker */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-around text-xs sm:text-sm text-slate-500">
          <div className={`flex items-center gap-1.5 font-medium ${step === 'theatres' ? 'text-rose-600' : 'text-slate-900'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'theatres' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'}`}>1</span>
            <span>Cinemas</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <div className={`flex items-center gap-1.5 font-medium ${step === 'seats' ? 'text-rose-600' : step !== 'theatres' ? 'text-slate-900' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'seats' ? 'bg-rose-600 text-white' : step !== 'theatres' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400'}`}>2</span>
            <span>Seats</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <div className={`flex items-center gap-1.5 font-medium ${step === 'snacks' ? 'text-rose-600' : ['confirm', 'success'].includes(step) ? 'text-slate-900' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'snacks' ? 'bg-rose-600 text-white' : ['confirm', 'success'].includes(step) ? 'bg-slate-950 text-white' : 'bg-slate-200 text-slate-400'}`}>3</span>
            <span>Snacks</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <div className={`flex items-center gap-1.5 font-medium ${step === 'confirm' ? 'text-rose-600' : step === 'success' ? 'text-slate-900' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'confirm' ? 'bg-rose-600 text-white' : step === 'success' ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-400'}`}>4</span>
            <span>Pay</span>
          </div>
        </div>

        {/* Main Interface Window */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          
          {/* STEP 1: THEATRE & DATE SELECTOR */}
          {step === 'theatres' && (
            <div className="space-y-5">
              {/* Dynamic Dates slider tabs */}
              <div>
                <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-2">Select Booking Date</h4>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {showDates.map((d, index) => (
                    <button
                      id={`date-tab-${index}`}
                      key={index}
                      onClick={() => setSelectedDateIndex(index)}
                      className={`flex-none px-4 py-2.5 rounded-xl border text-center transition-all ${
                        selectedDateIndex === index 
                          ? 'bg-rose-50 border-rose-500 text-rose-600 shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400">{d.dayName}</p>
                      <p className="text-lg font-extrabold">{d.dayNum}</p>
                      <p className="text-[10px] font-medium text-slate-500">{d.month}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theatre grid listings */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                  <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Available Movie Screens</h4>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Dynamic M-Ticketing active
                  </span>
                </div>

                <div className="space-y-3.5">
                  {THEATRES.map((theatre) => (
                    <div 
                      key={theatre.id}
                      className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* Cinema details */}
                      <div className="space-y-1.5 md:max-w-[45%]">
                        <h5 className="font-bold text-slate-900 text-sm sm:text-base">{theatre.name}</h5>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {theatre.location} • <span className="text-emerald-600 font-medium">{theatre.distance}</span>
                        </p>
                        
                        {/* Badges */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {theatre.amenities.map((amenity, i) => (
                            <span 
                              key={i} 
                              className={`text-[9px] px-2 py-0.5 rounded-md font-medium tracking-wide ${
                                amenity === 'Food & Beverage' 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : amenity === 'Recliner Seats' 
                                  ? 'bg-indigo-100 text-indigo-800' 
                                  : amenity === 'Dolby Atmos'
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Showtime Options */}
                      <div className="flex flex-wrap gap-2 md:max-w-[55%]">
                        {theatre.showtimes.map((st) => (
                          <button
                            id={`showtime-${theatre.id}-${st.id}`}
                            key={st.id}
                            onClick={() => {
                              setSelectedTheatre(theatre);
                              setSelectedShowtime(st);
                              setStep('seats');
                            }}
                            className="bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 px-3.5 py-2.5 rounded-lg text-center transition-all group flex flex-col items-center justify-center min-w-[76px]"
                          >
                            <span className="font-bold text-slate-800 group-hover:text-rose-600 text-xs sm:text-sm">{st.time}</span>
                            <span className="text-[10px] text-slate-400 group-hover:text-rose-500 font-semibold">{st.format}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: INTERACTIVE SEAT SELECTION TOOL */}
          {step === 'seats' && (
            <div className="space-y-6">
              {/* Event specific bypass description */}
              {liveEvent ? (
                <div className="bg-rose-50/50 p-4 border border-rose-100 rounded-xl space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-rose-500" /> Live Event Entry Ticket Booking
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    This is an open stage live performance venue. Tickets grant direct general entry access code. Please select the quantity of live passes you would like to purchase.
                  </p>
                  
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-rose-100">
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Live Ticket Class</p>
                      <p className="font-bold text-slate-900">General Standing Admission Passes</p>
                      <p className="text-xs text-rose-600 font-bold mt-0.5">₹{liveEvent.price} / Ticket</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedSeats(prev => prev.slice(0, Math.max(0, prev.length - 1)))}
                        className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                        disabled={selectedSeats.length === 0}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-extrabold text-lg w-6 text-center">{selectedSeats.length}</span>
                      <button
                        onClick={() => {
                          if (selectedSeats.length >= 8) return;
                          setSelectedSeats(prev => [...prev, `Pass-${prev.length + 1}`]);
                        }}
                        className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Full Cinema seat grid
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-150">
                    <div className="text-xs font-medium text-slate-600">
                      Showtime: <strong className="text-slate-900">{selectedShowtime?.time} ({selectedShowtime?.format})</strong> • Date: <strong className="text-slate-900">{showDates[selectedDateIndex].fullString}</strong>
                    </div>
                    <div className="text-xs font-medium text-slate-600">
                      Theatre: <strong className="text-rose-600">{selectedTheatre?.name}</strong>
                    </div>
                  </div>

                  {/* Seat Colors Indicator Key */}
                  <div className="flex flex-wrap justify-center items-center gap-5 pb-5 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4.5 h-4.5 rounded bg-white border border-slate-300 block"></span>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-4.5 h-4.5 rounded bg-amber-50 border border-amber-300 block"></span>
                      <span>Premium Row</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium text-rose-600">
                      <span className="w-4.5 h-4.5 rounded bg-rose-500 border border-rose-600 block"></span>
                      <span>Your Seat</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-4.5 h-4.5 rounded bg-slate-300 border border-slate-300 relative overflow-hidden block">
                        <span className="absolute inset-0 bg-slate-400 opacity-30 flex items-center justify-center text-[8px] font-bold text-white">X</span>
                      </span>
                      <span>Booked</span>
                    </div>
                  </div>

                  {/* SCREEN DISPLAY GLOW */}
                  <div className="w-full max-w-md mx-auto mb-10 text-center">
                    <div className="h-2.5 bg-gradient-to-b from-sky-400/70 to-sky-100/10 rounded-t-full shadow-md animate-pulse"></div>
                    <p className="text-[10px] text-sky-600 uppercase font-bold tracking-widest mt-1">SCREEN DIRECTION THIS WAY</p>
                  </div>

                  {/* GRID WRAPPER */}
                  <div className="overflow-x-auto pb-4">
                    <div className="min-w-[500px] flex flex-col gap-2 relative">
                      {seatGrid.map((rowGroup) => (
                        <div key={rowGroup.row} className="flex items-center gap-2 justify-center">
                          {/* Row ID label */}
                          <div className="w-5 text-xs font-bold text-slate-400 text-center font-mono">
                            {rowGroup.row}
                          </div>

                          {/* Grid seats */}
                          <div className="flex gap-1.5">
                            {rowGroup.seats.map((seat) => {
                              const isSelected = selectedSeats.includes(seat.id);
                              
                              // Stylings
                              let seatBg = 'bg-white hover:bg-rose-100 border-slate-300 text-slate-700';
                              if (rowGroup.category === 'Premium') {
                                seatBg = 'bg-amber-50/40 hover:bg-rose-100 border-amber-200 text-slate-750';
                              } else if (rowGroup.category === 'VIP') {
                                seatBg = 'bg-indigo-50/40 hover:bg-rose-100 border-indigo-200 text-slate-750';
                              }

                              if (seat.isBooked) {
                                seatBg = 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed';
                              } else if (isSelected) {
                                seatBg = 'bg-rose-500 border-rose-600 text-white font-extrabold scale-105 shadow-sm';
                              }

                              return (
                                <button
                                  id={`seat-button-${seat.id}`}
                                  key={seat.id}
                                  onClick={() => !seat.isBooked && handleSeatClick(seat.id)}
                                  disabled={seat.isBooked}
                                  title={`${seat.id} (${rowGroup.category} - ₹${rowGroup.price})`}
                                  className={`w-7 h-7 sm:w-8 sm:h-8 text-[9px] rounded-md border flex items-center justify-center font-mono transition-all font-semibold ${seatBg} ${
                                    seat.col === 6 ? 'mr-5' : '' // aisle gap
                                  }`}
                                >
                                  {seat.isBooked ? 'X' : seat.col}
                                </button>
                              );
                            })}
                          </div>

                          {/* Price Tag line indicators */}
                          <div className="w-18 text-[9px] font-bold text-slate-400 tracking-wider text-right uppercase">
                            ₹{rowGroup.price}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Seat category breakdown summary */}
                  <p className="text-[10px] text-center text-slate-400 font-medium italic mt-2">
                    Note: Aisle gaps split column 6 & 7. Rows G & H feature ultra-relaxing Recliners with Dolby speaker zones.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: FOOD & BEVERAGES COMBO PANEL */}
          {step === 'snacks' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-white/15 p-2 rounded-lg">
                    <Popcorn className="w-6 h-6 text-yellow-300 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base">Grab a Bite! Up to 25% Off Snacks</h4>
                    <p className="text-xs text-amber-50/90 font-medium">Bypass long lobby queues by ordering premium combos right now.</p>
                  </div>
                </div>
                <button
                  id="skip-food-button"
                  onClick={() => setStep('confirm')}
                  className="bg-white text-orange-600 text-xs px-3 py-1.5 rounded-lg font-bold shadow hover:bg-slate-50 transition-colors"
                >
                  Skip F&B
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FOOD_ITEMS.map((food) => {
                  const quantity = foodQuantities[food.id] || 0;
                  return (
                    <div 
                      key={food.id}
                      className="border border-slate-100 rounded-xl p-3.5 flex items-center gap-4 bg-slate-50/30 hover:shadow-sm transition-all"
                    >
                      {/* Food Emoji Avatar Icon */}
                      <span className="text-3xl p-3 bg-white rounded-xl border border-slate-100 shadow-sm block w-14 text-center">
                        {food.image}
                      </span>
                      
                      {/* Food details */}
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start gap-1">
                          <h5 className="font-bold text-slate-900 text-sm">{food.name}</h5>
                          <span className="font-extrabold text-rose-500 text-xs sm:text-sm">₹{food.price}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">{food.description}</p>
                        
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded">
                            {food.category}
                          </span>

                          {/* Counter controls */}
                          <div className="flex items-center gap-2.5">
                            {quantity > 0 && (
                              <>
                                <button
                                  id={`food-minus-${food.id}`}
                                  onClick={() => updateFoodQuantity(food.id, -1)}
                                  className="w-7 h-7 bg-white text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-300 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="font-extrabold text-slate-800 text-sm font-mono w-4 text-center">{quantity}</span>
                              </>
                            )}
                            <button
                              id={`food-plus-${food.id}`}
                              onClick={() => updateFoodQuantity(food.id, 1)}
                              className="w-7 h-7 bg-rose-500 text-white hover:bg-rose-600 rounded-lg flex items-center justify-center transition-colors shadow"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: ORDER CONFIRMATION & WALLET TRANSACTION CHECKOUT */}
          {step === 'confirm' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* Left Column: Tickets & F&B Itemized Breakdown */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white border border-slate-150 rounded-xl p-4 space-y-3.5 shadow-sm">
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide border-b pb-2 flex items-center gap-1.5">
                    <Ticket className="w-4 h-4 text-rose-500" /> Booking Details Receipt
                  </h4>

                  <div className="space-y-3">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Item:</span>
                      <span className="font-bold text-slate-900">{movie ? movie.title : liveEvent?.title}</span>
                    </div>
                    {!liveEvent && (
                      <>
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>Cinema Hall:</span>
                          <span className="font-bold text-slate-900">{selectedTheatre?.name}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>Timings:</span>
                          <span className="font-bold text-slate-900">{selectedShowtime?.time} ({selectedShowtime?.format})</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Show Date:</span>
                      <span className="font-bold text-slate-900">{showDates[selectedDateIndex].fullString}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Seats List ({selectedSeats.length}):</span>
                      <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-rose-600 text-[11px]">
                        {selectedSeats.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sub-Snack order summaries */}
                {foodTotal > 0 && (
                  <div className="bg-white border border-slate-150 rounded-xl p-4 space-y-2.5 shadow-sm">
                    <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wide border-b pb-1.5">Ordered Food & Beverages</h5>
                    <div className="space-y-2">
                      {FOOD_ITEMS.filter(f => (foodQuantities[f.id] || 0) > 0).map(f => (
                        <div key={f.id} className="flex justify-between text-xs text-slate-600">
                          <span>{f.image} {f.name} (x{foodQuantities[f.id]})</span>
                          <span className="font-semibold text-slate-950">₹{(foodQuantities[f.id] || 0) * f.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Final Tax calculations & Payment Button */}
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
                  <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide border-b border-slate-200 pb-2">
                    Payment Invoice Summary
                  </h4>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Ticket Price ({selectedSeats.length} seats)</span>
                      <span className="font-bold text-slate-900">₹{ticketTotal}</span>
                    </div>
                    {foodTotal > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>F&B Food Total</span>
                        <span className="font-bold text-slate-900">₹{foodTotal}</span>
                      </div>
                    )}
                    {bookingFees > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>Online Convenience Fee</span>
                        <span className="font-bold text-slate-900">₹{bookingFees}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>GST Tax (CGST + SGST 18%)</span>
                      <span className="font-bold text-slate-900">₹{gstTax}</span>
                    </div>
                    
                    <div className="border-t border-dashed border-slate-300 my-2 pt-2.5 flex justify-between text-sm font-extrabold">
                      <span className="text-slate-800">Total Payable Amount</span>
                      <span className="text-rose-600 text-base">₹{grandTotal}</span>
                    </div>
                  </div>

                  {/* Simulated Wallet Widget */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold uppercase">
                        <Wallet className="w-4 h-4 text-slate-400" /> Wallet Balance
                      </div>
                      <span className={`text-sm font-extrabold ${userWallet >= grandTotal ? 'text-emerald-600' : 'text-rose-600'}`}>
                        ₹{userWallet}
                      </span>
                    </div>

                    {userWallet < grandTotal ? (
                      <div className="space-y-2.5">
                        <div className="text-[10px] text-rose-500 font-bold bg-rose-50 p-2 rounded border border-rose-100 flex items-start gap-1">
                          <span>⚠️</span>
                          <span>Booking balance exceeds your current movie wallet. Please replenish simulated bank account below.</span>
                        </div>
                        <button
                          id="replenish-wallet-button"
                          onClick={handleAddMockFunds}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-2 px-3 text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                        >
                          <Plus className="w-4 h-4 text-emerald-400" />
                          Top Up Balance (Add ₹1,000 Free Cash)
                        </button>
                      </div>
                    ) : (
                      <div className="text-[10px] text-emerald-600 bg-emerald-50 p-2 rounded border border-emerald-100 flex items-center gap-1.5 font-medium">
                        <CheckCircle className="w-3.5 h-3.5" /> Balanced funded. Ready for instant booking!
                      </div>
                    )}
                  </div>

                   {/* Main Purchase Action button & Lock segment */}
                  {!currentUser ? (
                    <div className="space-y-2.5">
                      <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-xs font-semibold leading-relaxed">
                        <span className="font-bold text-rose-600 block mb-1">🔒 Login Secure Entry Profile Required</span> 
                        Creating an account with a verified email and 91+ Indian mobile number is mandatory to book show seats.
                      </div>
                      <button
                        type="button"
                        onClick={onTriggerLogin}
                        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-rose-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                      >
                        <Lock className="w-4 h-4 fill-white" />
                        Sign In / Sign Up to Complete Booking
                      </button>
                    </div>
                  ) : (
                    <button
                      id="simulate-purchase-button"
                      onClick={handleCheckout}
                      disabled={userWallet < grandTotal}
                      className={`w-full font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                        userWallet >= grandTotal
                          ? 'bg-rose-500 hover:bg-rose-600 text-white cursor-pointer hover:shadow-rose-500/20 active:scale-98'
                          : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      Confirm & Play-Book Now (₹{grandTotal})
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* STEP 5: BOOKING SUCCESSFUL CONGRATS SHEET */}
          {step === 'success' && activeBooking && (
            <div className="space-y-6 text-center max-w-lg mx-auto py-3">
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce shadow">
                  <Check className="w-10 h-10 stroke-[3]" />
                </div>
                <h4 className="text-xl sm:text-2xl font-extrabold text-slate-900">Booking Confirmed!</h4>
                <p className="text-xs text-slate-500 font-medium">Your movie block tickets has been saved into BookMyTheatre Wallet under My Bookings</p>
              </div>

              {/* RENDER DIGITAL TICKET CARD */}
              <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 text-left shadow-xl border border-indigo-500/20 relative overflow-hidden">
                {/* Visual side curves decor */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full"></div>
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full"></div>

                <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-rose-400 bg-white/10 px-2 py-0.5 rounded-full">
                      M-Ticket Verified
                    </span>
                    <h5 className="text-base sm:text-lg font-bold mt-1.5">{movie ? movie.title : liveEvent?.title}</h5>
                    <p className="text-xs text-slate-300 lowercase italic mt-0.5">Rating: {movie ? `${movie.rating}/10` : '⭐⭐⭐⭐⭐'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Booking Code</p>
                    <p className="text-xs font-mono font-bold text-emerald-400">{activeBooking.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                  <div className="col-span-2 border-b border-white/5 pb-2">
                    <span className="text-slate-400 block text-[10px] uppercase">Registered Ticket Holder</span>
                    <span className="font-bold text-white leading-tight block flex items-center justify-between">
                      <span className="truncate">{currentUser ? currentUser.name : 'Guest User'}</span>
                      <span className="text-[10px] text-rose-400 font-mono tracking-tight shrink-0">{currentUser ? currentUser.phoneNumber : '+91 9876543210'}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Cinema Theatre</span>
                    <span className="font-semibold text-white leading-tight block">{activeBooking.theatreName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Show Date</span>
                    <span className="font-semibold text-white leading-tight block">{activeBooking.showDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Timings</span>
                    <span className="font-semibold text-white leading-tight block">
                      {liveEvent ? '06:00 PM onwards' : activeBooking.showtime}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Allocated Seats</span>
                    <span className="font-mono font-extrabold text-rose-400 block text-[13px] tracking-wide">
                      {activeBooking.seats.join(', ')}
                    </span>
                  </div>
                </div>

                {/* Simulated Barcode QR representation */}
                <div className="bg-white p-3.5 rounded-xl mt-5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Gate Entrance Scan Code</p>
                    <p className="text-[11px] text-slate-800 font-semibold font-mono tracking-tight">Screen 3 • Gate B Access</p>
                    <p className="text-[9px] text-slate-400 leading-normal">Kindly keep brightness high outside cinema hall for automatic scanning check.</p>
                  </div>
                  {/* CSS based pixel QR code */}
                  <div className="w-18 h-18 bg-slate-100 shrink-0 border border-slate-300 rounded-lg p-1.5 flex flex-col justify-between items-center gap-1.5">
                    <div className="w-full flex-1 grid grid-cols-6 grid-rows-6 gap-0.5">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`rounded-sm ${(i % 2 === 0 && i % 3 !== 0) || i % 7 === 0 ? 'bg-slate-900' : 'bg-transparent'}`}
                        ></div>
                      ))}
                    </div>
                    <span className="text-[8px] font-bold text-slate-600 tracking-wider">SCAN CODE</span>
                  </div>
                </div>
              </div>

              <div className="bg-rose-50 text-rose-800 text-xs p-3.5 rounded-xl border border-rose-100 flex items-start gap-2.5">
                <span className="text-lg">🛎️</span>
                <p className="leading-relaxed text-left">
                  We have added <strong className="text-rose-950">₹{(grandTotal * 0.05).toFixed(0)} BMT rewards club points</strong> to your dynamic wallet profile! You can view or cancel this ticket at any time inside the <strong>"My Bookings"</strong> dashboard page.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm">
          {/* Back Controls */}
          {step === 'theatres' && (
            <p className="text-slate-500 text-xs">
              Select any preferred showtime above to begin tickets seat selection.
            </p>
          )}

          {step === 'seats' && (
            <div className="flex items-center justify-between w-full">
              <button
                id="seats-back"
                onClick={() => setStep('theatres')}
                className="px-4 py-2 border border-slate-300 hover:border-slate-400 text-slate-700 bg-white font-semibold rounded-lg transition-all"
              >
                Change Cinema
              </button>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tickets Selected ({selectedSeats.length})</p>
                  <p className="font-extrabold text-slate-900 sm:text-base">Subtotal: ₹{ticketTotal}</p>
                </div>
                <button
                  id="seats-next"
                  onClick={() => setStep(liveEvent ? 'confirm' : 'snacks')}
                  disabled={selectedSeats.length === 0}
                  className={`px-5 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-1 ${
                    selectedSeats.length > 0 
                      ? 'bg-rose-500 hover:bg-rose-600 text-white cursor-pointer active:scale-97' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 'snacks' && (
            <div className="flex items-center justify-between w-full">
              <button
                id="snacks-back"
                onClick={() => setStep('seats')}
                className="px-4 py-2 border border-slate-300 hover:border-slate-400 text-slate-700 bg-white font-semibold rounded-lg transition-all"
              >
                Back To Seats
              </button>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">F&B Total</p>
                  <p className="font-extrabold text-slate-900 sm:text-base">₹{foodTotal}</p>
                </div>
                <button
                  id="snacks-next"
                  onClick={() => setStep('confirm')}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-1"
                >
                  Confirm Cart <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="flex items-center justify-between w-full">
              <button
                id="confirm-back"
                onClick={() => setStep(liveEvent ? 'seats' : 'snacks')}
                className="px-4 py-2 border border-slate-300 hover:border-slate-400 text-slate-700 bg-white font-semibold rounded-lg transition-all"
              >
                Back To Cart
              </button>
              <div className="text-right">
                <span className="text-slate-500 text-xs font-semibold mr-1">Final Amount:</span>
                <span className="font-extrabold text-rose-500 text-sm sm:text-base">₹{grandTotal}</span>
              </div>
            </div>
          )}

          {step === 'success' && (
            <button
              id="success-done"
              onClick={onClose}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3 rounded-lg text-center transition-all cursor-pointer shadow-md"
            >
              Back To Main Screen
            </button>
          )}

        </div>

      </div>
    </div>
  );
}
