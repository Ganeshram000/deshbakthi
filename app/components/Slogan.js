'use client';
import { useState, useEffect } from 'react';

const SLOGANS = [
  { text: 'भारत माता की जय !', emoji: '🇮🇳' },
  { text: 'वंदे मातरम् !', emoji: '🇮🇳' },
  { text: 'जय हिंद !', emoji: '🇮🇳' },
  { text: 'इंकलाब ज़िंदाबाद !', emoji: '✊' },
  { text: 'हिंदुस्तान ज़िंदाबाद !', emoji: '🇮🇳' },
  { text: 'भारत ज़िंदाबाद !', emoji: '🇮🇳' },
  { text: 'शहीदों अमर रहो !', emoji: '🙏' },
  { text: 'वीर जवान ज़िंदाबाद !', emoji: '⚔️' },
  { text: 'तिरंगा हमारी शान है', emoji: '🇮🇳' },
  { text: 'मेरा भारत महान', emoji: '🇮🇳' },
];

export default function Slogan() {
  const [index,   setIndex]   = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % SLOGANS.length);
        setVisible(true);
      }, 700);
    }, 20000);
    return () => clearInterval(id);
  }, []);

  const s = SLOGANS[index];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi:ital@0;1&display=swap');
        .slogan-text {
          font-family: 'Tiro Devanagari Hindi', serif;
        }
      `}</style>

      <div className="absolute bottom-35 left-1/2 -translate-x-1/2 z-40 pointer-events-none text-center w-full px-6">
        <div
          style={{
            transition: 'opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0px) scale(1)' : 'translateY(14px) scale(0.96)',
          }}
        >
          {/* Emoji */}
          <div style={{ fontSize: '28px', marginBottom: '4px', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}>
            {s.emoji}
          </div>

          {/* Main slogan text */}
          <div
            className="slogan-text"
            style={{
              fontSize: 'clamp(24px, 4vw, 38px)',
              fontWeight: '700',
              lineHeight: '1.3',
              background: 'linear-gradient(135deg, #FF671F 0%, #ffffff 50%, #046A38 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 2px 16px rgba(255,103,31,0.35))',
              letterSpacing: '1px',
            }}
          >
            {s.text}
          </div>

          {/* Decorative underline */}
          <div style={{
            margin: '8px auto 0',
            width: '60px',
            height: '3px',
            borderRadius: '2px',
            background: 'linear-gradient(90deg, #FF671F, #ffffff, #046A38)',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.7s ease',
          }} />
        </div>
      </div>
    </>
  );
}
