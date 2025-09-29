import React from 'react';
import { Settings } from 'lucide-react';

const Header = ({ onSettingsClick }) => {
  return (
    <div className="header">
      <div className="logo">
        Voice Board
      </div>
      <button
        className="settings-btn hover-effect"
        onClick={onSettingsClick}
        title="Settings"
      >
        <Settings size={24} />
      </button>
    </div>
  );
};

export default Header;