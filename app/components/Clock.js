'use client';
import { useState, useEffect } from 'react';
import { IoTime } from 'react-icons/io5';

export default function Clock() {
  const [time, setTime] = useState(null);

  useEffect(() => {
    setTime(new Date());
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;

  const hh = String(time.getHours()).padStart(2, '0');
  const mm = String(time.getMinutes()).padStart(2, '0');
  const ss = String(time.getSeconds()).padStart(2, '0');
  const dd = time.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' });

  return (
    <div
      className="absolute top-5 left-5 z-50 flex items-center gap-2 px-4 py-2 rounded-2xl shadow-lg"
      style={{
        background: 'linear-gradient(180deg, rgba(255,103,31,0.35) 0%, rgba(255,255,255,0.45) 50%, rgba(4,106,56,0.35) 100%)',
        backdropFilter: 'blur(1px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.35)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      }}
    >
      <IoTime className="text-base shrink-0" style={{ color: '#FF671F' }} />
      <span className="font-bold text-lg tabular-nums tracking-widest font-mono" style={{ color: '#111111' }}>
        {hh}:{mm}:{ss}
      </span>
      <span className="text-xs pl-2 ml-1" style={{ color: 'rgba(0,0,0,0.45)', borderLeft: '1px solid rgba(0,0,0,0.15)' }}>
        {dd}
      </span>
    </div>
  );
}
