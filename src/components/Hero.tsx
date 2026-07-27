import React from 'react';
import { ArrowRight, ShieldCheck, Truck, Sparkles, Clock, CheckCircle2, Calculator } from 'lucide-react';

interface HeroProps {
  onOpenBooking: () => void;
  onNavigateToTrack: () => void;
  onNavigateToCalculator: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenBooking,
  onNavigateToTrack,
  onNavigateToCalculator
}) => {
  return (
    <section id="hero" className="relative min-h-[85vh] flex items-center overflow-hidden bg-white pt-10 pb-12 sm:pb-16">
      {/* Background Patterns */}
      <div className="absolute inset-0 hero-pattern pointer-events-none"></div>
      <div className="absolute top-20 -right-20 w-96 h-96 bg-[#5B3F8C]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 -left-20 w-96 h-96 bg-[#D8A620]/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Text Left Column */}
        <div className="lg:col-span-7 space-y-6 text-left">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D8A620]/20 border border-[#D8A620] text-[#5B3F8C] font-bold text-xs sm:text-sm font-manrope shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#D8A620]" />
            <span>Premium Concierge Laundry & Dry Cleaning</span>
          </div>

          {/* Display Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-manrope text-[#5B3F8C] leading-[1.12] tracking-tight">
            Pristine Garment Care <br />
            <span className="text-[#D8A620]">For Every Fiber.</span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg font-worksans text-[#2F2F2F] max-w-2xl leading-relaxed">
            Goldtribe Link Laundromat delivers professional, high-end garment care for busy professionals and families in <span className="font-semibold text-[#5B3F8C]">Rongai</span> and <span className="font-semibold text-[#5B3F8C]">Ngong</span>. We don't just wash; we revitalize.
          </p>

          {/* Quick Features List */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs sm:text-sm font-manrope font-semibold text-[#2F2F2F] pt-1">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xs p-2.5 rounded-xl border border-[#E5E2E1]">
              <CheckCircle2 className="w-4 h-4 text-[#D8A620]" />
              <span>Doorstep Pickup</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xs p-2.5 rounded-xl border border-[#E5E2E1]">
              <Clock className="w-4 h-4 text-[#5B3F8C]" />
              <span>Same Day Delivery</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xs p-2.5 rounded-xl border border-[#E5E2E1]">
              <Sparkles className="w-4 h-4 text-[#D8A620]" />
              <span>Eco Sanitized Wash</span>
            </div>
          </div>

          {/* Call-to-action buttons */}
          <div className="flex flex-wrap gap-3.5 pt-2">
            <button
              onClick={onOpenBooking}
              className="bg-[#5B3F8C] text-white px-7 py-4 rounded-full font-bold font-manrope text-sm sm:text-base hover:bg-[#4A3078] transition-all flex items-center gap-2.5 shadow-lg hover:shadow-xl active:scale-95 group cursor-pointer"
            >
              <Truck className="w-5 h-5 text-[#D8A620]" />
              <span>Book a Collection</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onNavigateToTrack}
              className="px-6 py-4 rounded-full border-2 border-[#5B3F8C] text-[#5B3F8C] font-bold font-manrope text-sm sm:text-base hover:bg-[#5B3F8C]/5 transition-all cursor-pointer"
            >
              Track My Order
            </button>

            <button
              onClick={onNavigateToCalculator}
              className="px-5 py-4 rounded-full bg-[#FAFAFA] border border-[#E5E2E1] text-[#5B3F8C] font-bold font-manrope text-sm hover:bg-[#F0EDED] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-[#D8A620]" />
              <span>Get Instant Quote</span>
            </button>
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-4 pt-4 border-t border-[#E5E2E1]/60">
            <div className="flex -space-x-3">
              <div className="w-9 h-9 rounded-full border-2 border-white bg-[#5B3F8C] text-white font-bold text-xs flex items-center justify-center">
                RN
              </div>
              <div className="w-9 h-9 rounded-full border-2 border-white bg-[#D8A620] text-[#2F2F2F] font-bold text-xs flex items-center justify-center">
                NG
              </div>
              <div className="w-9 h-9 rounded-full border-2 border-white bg-[#D8A620] text-[#2F2F2F] font-bold text-xs flex items-center justify-center">
                GL
              </div>
            </div>
            <p className="text-xs sm:text-sm font-worksans text-[#5F5F5F]">
              <span className="text-[#5B3F8C] font-bold font-manrope text-base">500+</span> Rongai & Ngong professionals trust us weekly
            </p>
          </div>
        </div>

        {/* Hero Visual (Bento Grid) */}
        <div className="lg:col-span-5 grid grid-cols-2 grid-rows-2 gap-3.5 h-[420px] sm:h-[480px]">
          {/* Main vertical image */}
          <div className="col-span-1 row-span-2 rounded-3xl overflow-hidden relative shadow-xl border border-white/40 group">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFbBerB_3VJuKPc9GBdzSiMbWoSCZYYD-u3ZCyqwA5n1Mrdue5fVx26KkcaT0MCKN5-yo-2U9GbJoJQYudsrqFuRkfzdLLxo7tbSFoR6MbHI5yNRh6b-29CtEonvSVWOvTb3tcsQt5DZWnpqVvCjI9lLp76dzEIlPkn8JbnMDPUqojdkC2G0iJBa6GMV39QeIgfSuZv6lA6O-rrF8zUiCGLDJW3xcHO7wsmX7051UzuNi0xEa9cSuLrtI0tU_oc3B1bIdFC2iN9FY" 
              alt="Crisp freshly washed clothes" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#5B3F8C]/80 via-transparent to-transparent flex flex-col justify-end p-5">
              <span className="bg-[#D8A620] text-[#2F2F2F] font-black text-[10px] px-2.5 py-1 rounded-full w-fit uppercase tracking-wider">
                Precision Ironing
              </span>
              <p className="text-white font-manrope font-bold text-sm sm:text-base mt-1.5">
                Wrinkle-Free Executive Finish
              </p>
            </div>
          </div>

          {/* Stainless Steel Washing machines */}
          <div className="col-span-1 row-span-1 rounded-3xl overflow-hidden relative shadow-lg border border-white/40 group">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-cD_CjY0wYPDbP74T9bp-9hyO6LzZ0TTiLZm93HIPb_Lv0Lbc_M5D7_xePg7AJQkLq3mzltzkhztGi3NOQaXy9riP5_y_EAa2k4bLJj3GBuHECaxW_KxjRu7EIA9zZMGud-ByShnKWcLLogV9hC9dA88dwxkACff04BifO9CN4fS-uxkjML930abUOuwr8Ao7jZFn8aUaX473e1k2bRYxKGrWG4fcFtrk5-O3NOCECdfFYgFvSRY8QqSQlzgKUXjauSRRNrqYBIo" 
              alt="Industrial washing machines" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-[#5B3F8C] p-1.5 rounded-full shadow-md">
              <Sparkles className="w-4 h-4 text-[#D8A620]" />
            </div>
          </div>

          {/* Same Day Delivery Highlight Bento */}
          <div className="col-span-1 row-span-1 rounded-3xl bg-[#D8A620] p-5 flex flex-col justify-between shadow-lg text-[#2F2F2F] hover:bg-[#E5B22A] transition-colors relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-2xl bg-[#5B3F8C] text-white flex items-center justify-center">
                <Truck className="w-5 h-5 text-[#D8A620]" />
              </div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider bg-[#5B3F8C]/15 text-[#5B3F8C] px-2 py-0.5 rounded-full">
                Express
              </span>
            </div>
            <div>
              <p className="font-manrope font-black text-lg sm:text-xl leading-tight text-[#2F2F2F]">
                Same Day <br />Express Delivery
              </p>
              <p className="text-xs font-worksans text-[#2F2F2F]/80 font-medium mt-1">
                Pickup before 10 AM, returned by 6 PM
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
