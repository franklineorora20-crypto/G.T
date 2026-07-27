import React, { useState } from 'react';
import { LOGO_URL } from '../data/initialData';
import { Sparkles } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showMotto?: boolean;
  className?: string;
  onClick?: () => void;
  variant?: 'light' | 'dark' | 'auto';
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showMotto = true,
  className = '',
  onClick,
  variant = 'auto',
}) => {
  const [logoFailed, setLogoFailed] = useState(false);

  const imgHeights = {
    sm: 'h-10 sm:h-12',
    md: 'h-12 sm:h-16',
    lg: 'h-16 sm:h-20',
    xl: 'h-20 sm:h-28',
  };

  const titleSizes = {
    sm: 'text-xs sm:text-sm',
    md: 'text-sm sm:text-base',
    lg: 'text-base sm:text-xl',
    xl: 'text-xl sm:text-3xl',
  };

  const subtitleSizes = {
    sm: 'text-[9px] sm:text-[10px]',
    md: 'text-[10px] sm:text-[11px]',
    lg: 'text-xs sm:text-sm',
    xl: 'text-sm sm:text-base',
  };

  const isDark = variant === 'dark';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      <div className="relative shrink-0">
        <div className="bg-white rounded-2xl p-1.5 sm:p-2 border border-[#D8A620]/40 shadow-md group-hover:border-[#D8A620] group-hover:shadow-lg transition-all flex items-center justify-center min-w-[48px] min-h-[48px]">
          {!logoFailed ? (
            <img
              src={LOGO_URL}
              alt="Goldtribe Link Laundromat Official Logo"
              className={`${imgHeights[size]} w-auto object-contain transition-transform duration-300 group-hover:scale-105`}
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <div className={`${imgHeights[size]} w-auto rounded-2xl bg-[#5B3F8C] text-white flex items-center justify-center font-black text-xs sm:text-sm uppercase tracking-widest`}>
              GL
            </div>
          )}
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#D8A620] rounded-full border-2 border-white shadow-xs" />
      </div>

      <div className="flex flex-col justify-center font-manrope">
        <div className="flex items-center gap-1.5">
          <span
            className={`${titleSizes[size]} font-black tracking-wider uppercase leading-tight ${
              isDark ? 'text-white' : 'text-[#5B3F8C]'
            }`}
          >
            Goldtribe Link
          </span>
          <span className="hidden sm:inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#5B3F8C] text-[#D8A620] uppercase tracking-wider shadow-2xs">
            Laundromat
          </span>
        </div>

        {showMotto && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`${subtitleSizes[size]} font-extrabold text-[#D8A620] uppercase tracking-widest flex items-center gap-1`}
            >
              <Sparkles className="w-3 h-3 text-[#D8A620]" />
              <span>Usafi: Kazi Yetu</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
