import React from 'react';
import { WalletConnectButton } from './WalletConnectButton';
import HealthBanner from './HealthBanner';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 w-full z-40 bg-surface/60 backdrop-blur-md border-b border-white/10 h-[72px]">
      <div className="max-w-container-max mx-auto h-full px-margin-desktop flex justify-between items-center">
        <div className="flex items-center gap-8">
          <HealthBanner />
        </div>
        <div className="flex items-center gap-unit-md">
          <WalletConnectButton />
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/5 bg-transparent border-0 rounded-full transition-colors flex items-center justify-center cursor-pointer">
              <span className="material-symbols-outlined text-on-surface-variant" data-icon="security">security</span>
            </button>
            <button className="p-2 hover:bg-white/5 bg-transparent border-0 rounded-full transition-colors text-primary flex items-center justify-center cursor-pointer">
              <span className="material-symbols-outlined" data-icon="shutter_speed">shutter_speed</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
