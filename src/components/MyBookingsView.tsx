import React from 'react';
import { Ticket, Calendar, ShieldCheck, Clock, Trash2, HelpCircle, RefreshCw, XCircle, ChevronRight, Award } from 'lucide-react';
import { Booking } from '../types';

interface MyBookingsViewProps {
  bookings: Booking[];
  onCancelBooking: (bookingId: string) => void;
  onNavigateHome: () => void;
}

export default function MyBookingsView({ bookings, onCancelBooking, onNavigateHome }: MyBookingsViewProps) {
  
  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-150 p-10 text-center max-w-lg mx-auto my-12 shadow-sm space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
          <Ticket className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-xl font-bold text-slate-800">No Tickets Booked Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your BookMyTheatre cinema dashboard is currently empty. Reserve seat tickets for trending blockbuster movies or live music concerts!
          </p>
        </div>
        <button
          onClick={onNavigateHome}
          className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold px-6 py-2.5 rounded-xl transition-all shadow-md text-xs cursor-pointer inline-flex items-center gap-1.5"
        >
          Explore Movies & Events <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Ticket className="w-5 h-5 text-rose-500" /> My Reserved Tickets ({bookings.length})
          </h2>
          <p className="text-xs text-slate-500">View gate passes, download active M-tickets, or cancel orders for instant refund credits.</p>
        </div>
        <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md tracking-wider flex items-center gap-1.5 border border-emerald-100">
          <Award className="w-3.5 h-3.5" /> 100% Secure M-Gate Verified
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bookings.map((booking) => {
          const isCancelled = booking.ticketStatus === 'Cancelled';
          
          return (
            <div 
              key={booking.id}
              className={`border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between transition-all ${
                isCancelled 
                  ? 'bg-slate-50/70 border-slate-200 opacity-75' 
                  : 'bg-white border-slate-150 relative hover:shadow-md'
              }`}
            >
              {/* Top half / Details content */}
              <div className="p-4 sm:p-5 space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md ${
                      isCancelled 
                        ? 'bg-slate-200 text-slate-600' 
                        : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {booking.movie ? 'Cinema M-Ticket' : 'Live Event Entry'}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-base sm:text-lg mt-1.5 leading-snug">
                      {booking.movie ? booking.movie.title : booking.event?.title}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-400 font-semibold tracking-wider font-mono">BOOKING ID</p>
                    <p className="font-mono font-bold text-xs text-slate-800">{booking.id}</p>
                  </div>
                </div>

                {/* Info row grids */}
                <div className="grid grid-cols-2 gap-3 text-xs border-y border-dashed border-slate-150 py-3">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-semibold">Venue Location</span>
                    <span className="font-bold text-slate-800 leading-tight block">{booking.theatreName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-semibold">Date & Showtime</span>
                    <span className="font-bold text-slate-800 leading-tight block mt-0.5">
                      {booking.showDate} {booking.showtime ? `at ${booking.showtime}` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-semibold">Reserved Seats</span>
                    <span className="font-mono font-extrabold text-rose-500 block text-xs mt-0.5 tracking-wider">
                      {booking.seats.length > 0 ? booking.seats.join(', ') : 'General Admission'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-semibold">Booking Amount</span>
                    <span className="font-extrabold text-slate-900 block text-xs mt-0.5">₹{booking.totalPrice}</span>
                  </div>
                </div>

                {/* Food items info */}
                {booking.foodItems.length > 0 && (
                  <div className="bg-amber-50/50 p-2 border border-amber-100 rounded-lg text-[11px] text-amber-900">
                    <span className="font-extrabold uppercase text-[9px] text-amber-700 block mb-0.5">Pre-Ordered Food & Drinks Add-ons</span>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {booking.foodItems.map((fi, idx) => (
                        <span key={idx}>
                          🍿 {fi.item.name} <strong className="text-slate-900">x{fi.quantity}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom scan or cancellation area */}
              <div className="bg-slate-50 px-4 sm:px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                {!isCancelled ? (
                  <>
                    <div className="flex items-center gap-2">
                      {/* Check mark badge */}
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block animate-pulse"></span>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Active QR Scan Ready</span>
                    </div>

                    <button
                      id={`cancel-booking-${booking.id}`}
                      onClick={() => {
                        if (confirm(`Are you sure you want to cancel booking ${booking.id}? You will receive a 100% refund of ₹${booking.totalPrice} directly back into your BookMyTheatre digital wallet.`)) {
                          onCancelBooking(booking.id);
                        }
                      }}
                      className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                      title="Cancel Ticket & Refund Wallet"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-rose-500" /> Cancel Reservation
                    </button>
                  </>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[10px] uppercase">
                      <XCircle className="w-4 h-4 text-slate-400" /> Cancelled & Credited
                    </div>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 font-extrabold px-2 py-0.5 rounded uppercase">
                      100% Refunded (₹{booking.totalPrice})
                    </span>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
