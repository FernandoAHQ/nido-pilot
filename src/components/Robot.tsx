interface RobotProps {
  mood?: 'happy' | 'thinking' | 'cheering';
  size?: 'small' | 'large';
}

export function Robot({ mood = 'happy', size = 'large' }: RobotProps) {
  return (
    <div className={`robot robot--${size} robot--${mood}`} aria-hidden="true">
      <svg viewBox="0 0 220 240" role="img">
        <defs>
          <linearGradient id="robotBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" />
            <stop offset="1" stopColor="#dbe8f2" />
          </linearGradient>
          <filter id="robotShadow" x="-30%" y="-30%" width="160%" height="180%">
            <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#28445f" floodOpacity=".2" />
          </filter>
        </defs>
        <g filter="url(#robotShadow)">
          <path className="robot__antenna" d="M110 48V25" stroke="#486579" strokeWidth="9" strokeLinecap="round" />
          <circle cx="110" cy="19" r="12" fill="#ffb443" />
          <rect x="38" y="47" width="144" height="112" rx="45" fill="url(#robotBody)" stroke="#486579" strokeWidth="7" />
          <rect x="55" y="68" width="110" height="68" rx="29" fill="#28445f" />
          <ellipse className="robot__eye robot__eye--left" cx="87" cy="98" rx="9" ry="13" fill="#71e0ce" />
          <ellipse className="robot__eye robot__eye--right" cx="133" cy="98" rx="9" ry="13" fill="#71e0ce" />
          {mood === 'thinking' ? (
            <circle cx="110" cy="120" r="4" fill="#dffaf4" />
          ) : (
            <path d="M91 116 Q110 135 129 116" fill="none" stroke="#dffaf4" strokeWidth="6" strokeLinecap="round" />
          )}
          <path d="M72 158h76l14 48c3 11-5 21-17 21H75c-12 0-20-10-17-21z" fill="url(#robotBody)" stroke="#486579" strokeWidth="7" />
          <circle cx="110" cy="187" r="16" fill="#ff8a65" />
          <path className="robot__arm robot__arm--left" d="M59 174 28 196" stroke="#486579" strokeWidth="13" strokeLinecap="round" />
          <path className="robot__arm robot__arm--right" d="m161 174 31 22" stroke="#486579" strokeWidth="13" strokeLinecap="round" />
          <circle cx="25" cy="199" r="10" fill="#ffb443" />
          <circle cx="195" cy="199" r="10" fill="#ffb443" />
        </g>
      </svg>
    </div>
  );
}
