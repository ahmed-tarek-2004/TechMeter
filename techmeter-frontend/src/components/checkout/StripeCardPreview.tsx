import React from 'react';
import { ShieldCheck, Wifi } from 'lucide-react';

interface StripeCardPreviewProps {
  cardholderName: string;
  expiryDate: string;
  brand: string;
  last4: string;
  isFocused?: string | null;
}

export const StripeCardPreview: React.FC<StripeCardPreviewProps> = ({
  cardholderName,
  expiryDate,
  brand,
  last4,
}) => {
  // Brand color themes & logos
  const getBrandDetails = (cardBrand: string) => {
    switch (cardBrand.toLowerCase()) {
      case 'visa':
        return {
          name: 'VISA',
          gradient: 'from-blue-700 via-indigo-800 to-slate-900',
          accent: 'text-blue-200',
          badgeBg: 'bg-blue-600/30 border-blue-400/40',
          logo: (
            <span className="font-black italic tracking-wider text-xl text-white font-serif drop-shadow-sm">
              VISA
            </span>
          ),
        };
      case 'mastercard':
        return {
          name: 'Mastercard',
          gradient: 'from-slate-900 via-red-950 to-orange-950',
          accent: 'text-amber-200',
          badgeBg: 'bg-orange-600/30 border-orange-400/40',
          logo: (
            <div className="flex items-center -space-x-2.5">
              <div className="w-6 h-6 rounded-full bg-red-500/90 shadow-sm" />
              <div className="w-6 h-6 rounded-full bg-amber-400/90 shadow-sm" />
            </div>
          ),
        };
      case 'amex':
      case 'american express':
        return {
          name: 'American Express',
          gradient: 'from-cyan-900 via-teal-900 to-slate-950',
          accent: 'text-cyan-200',
          badgeBg: 'bg-cyan-600/30 border-cyan-400/40',
          logo: (
            <span className="font-extrabold tracking-widest text-xs px-2 py-1 bg-cyan-400 text-slate-950 rounded uppercase shadow-sm">
              AMEX
            </span>
          ),
        };
      case 'discover':
        return {
          name: 'Discover',
          gradient: 'from-orange-800 via-amber-900 to-slate-900',
          accent: 'text-orange-200',
          badgeBg: 'bg-orange-600/30 border-orange-400/40',
          logo: (
            <span className="font-black tracking-wider text-sm text-orange-400 uppercase">
              DISCOVER
            </span>
          ),
        };
      default:
        return {
          name: 'Stripe Card',
          gradient: 'from-indigo-700 via-purple-900 to-slate-950',
          accent: 'text-indigo-200',
          badgeBg: 'bg-indigo-600/30 border-indigo-400/40',
          logo: (
            <div className="flex items-center gap-1 font-bold text-white tracking-wide text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>SECURE CARD</span>
            </div>
          ),
        };
    }
  };

  const brandInfo = getBrandDetails(brand);

  const formatCardNumberDisplay = () => {
    if (last4) {
      return `•••• •••• •••• ${last4}`;
    }
    return '•••• •••• •••• ••••';
  };

  return (
    <div className="relative w-full max-w-sm mx-auto select-none perspective-1000 mb-6">
      {/* Glow Effect behind card */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition duration-500 pointer-events-none" />

      {/* Credit Card Container */}
      <div
        className={`relative aspect-[1.586/1] w-full rounded-2xl bg-gradient-to-tr ${brandInfo.gradient} p-5 sm:p-6 text-white shadow-2xl border border-white/15 overflow-hidden flex flex-col justify-between transition-all duration-300 transform hover:scale-[1.01]`}
      >
        {/* Holographic background watermarks */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]"
        />

        {/* Top Header: Chip, Contactless Icon, & Brand Logo */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* EMV Golden Chip */}
            <div className="relative w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-[1.5px] shadow-sm">
              <div className="w-full h-full rounded-[3px] bg-gradient-to-br from-amber-300 to-amber-500 border border-amber-600/40 relative overflow-hidden">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-amber-700/50" />
                <div className="absolute inset-y-0 left-1/3 w-[1px] bg-amber-700/50" />
                <div className="absolute inset-y-0 right-1/3 w-[1px] bg-amber-700/50" />
              </div>
            </div>

            {/* Contactless Waveform Icon */}
            <Wifi className="h-5 w-5 text-white/70 rotate-90" />
          </div>

          {/* Card Brand Logo */}
          <div className="flex items-center h-7">
            {brandInfo.logo}
          </div>
        </div>

        {/* Card Number */}
        <div className="relative z-10 my-auto py-2">
          <p className="text-base sm:text-lg font-mono font-bold tracking-[0.2em] text-white/95 drop-shadow-md truncate">
            {formatCardNumberDisplay()}
          </p>
        </div>

        {/* Bottom Details: Cardholder & Expiry */}
        <div className="relative z-10 flex items-end justify-between">
          <div className="max-w-[65%]">
            <span className="block text-[9px] uppercase tracking-wider font-semibold text-white/60">
              Cardholder Name
            </span>
            <p className="text-xs sm:text-sm font-bold tracking-wide uppercase text-white truncate drop-shadow-xs">
              {cardholderName.trim() || 'CARDHOLDER NAME'}
            </p>
          </div>

          <div className="text-right">
            <span className="block text-[9px] uppercase tracking-wider font-semibold text-white/60">
              Expires
            </span>
            <p className="text-xs sm:text-sm font-mono font-bold tracking-wider text-white drop-shadow-xs">
              {expiryDate || 'MM/YY'}
            </p>
          </div>
        </div>

        {/* Security watermark badge */}
        <div className="absolute bottom-2 right-1/2 translate-x-1/2 opacity-20 pointer-events-none flex items-center gap-1 text-[8px] font-bold tracking-widest uppercase">
          <ShieldCheck className="h-3 w-3" />
          <span>256-Bit Encrypted</span>
        </div>
      </div>
    </div>
  );
};
