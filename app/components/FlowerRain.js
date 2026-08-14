'use client';
import { useState, useCallback, useEffect } from 'react';
import { Flower2, Sun } from 'lucide-react';

const FLOWER_TYPES = [
  { Icon: Flower2, color: '#FF671F' },  // Marigold saffron
  { Icon: Flower2, color: '#FF9933' },  // Lotus pink-orange
  { Icon: Flower2, color: '#ffffff' },  // White lotus
  { Icon: Sun, color: '#FFD700' }, // Sunflower gold
  { Icon: Flower2, color: '#046A38' },  // Green
  { Icon: Flower2, color: '#FF6B9D' },  // Pink lotus
];

let idCounter = 0;

export default function FlowerRain() {
  const [flowers, setFlowers] = useState([]);

  const spawnFlowers = useCallback(() => {
    const newFlowers = Array.from({ length: 20 }, () => {
      const type = FLOWER_TYPES[Math.floor(Math.random() * FLOWER_TYPES.length)];
      return {
        id: idCounter++,
        Icon: type.Icon,
        color: type.color,
        left: Math.random() * 100,           // % across screen
        size: 18 + Math.random() * 22,        // 18–40px
        duration: 2.5 + Math.random() * 2,    // 2.5–4.5s fall
        delay: Math.random() * 0.8,           // 0–0.8s stagger
        rotate: Math.random() * 360,          // initial rotation
        spin: Math.random() > 0.5 ? 1 : -1,  // spin direction
        drift: (Math.random() - 0.5) * 120,  // horizontal drift px
      };
    });

    setFlowers(prev => [...prev, ...newFlowers]);

    // Remove after longest animation finishes
    setTimeout(() => {
      setFlowers(prev => prev.filter(f => !newFlowers.find(n => n.id === f.id)));
    }, 5500);
  }, []);

  useEffect(() => {
    const handler = () => spawnFlowers();
    window.addEventListener('touchstart', handler);
    window.addEventListener('click', handler);
    return () => {
      window.removeEventListener('touchstart', handler);
      window.removeEventListener('click', handler);
    };
  }, [spawnFlowers]);

  return (
    <>
      {/* Flowers */}
      {flowers.map(f => (
        <div
          key={f.id}
          className="absolute pointer-events-none z-[70]"
          style={{
            top: '-48px',
            left: `${f.left}%`,
            animation: `flowerFall ${f.duration}s ease-in ${f.delay}s forwards`,
            '--drift': `${f.drift}px`,
            '--spin': `${f.spin * 720}deg`,
          }}
        >
          <f.Icon
            size={f.size}
            color={f.color}
            style={{
              filter: `drop-shadow(0 2px 6px ${f.color}88)`,
              transform: `rotate(${f.rotate}deg)`,
            }}
          />
        </div>
      ))}

      <style>{`
        @keyframes flowerFall {
          0%   { transform: translateY(0px)   translateX(0px)              rotate(0deg);   opacity: 1;   }
          60%  { opacity: 1; }
          100% { transform: translateY(110vh) translateX(var(--drift))     rotate(var(--spin)); opacity: 0; }
        }
      `}</style>
    </>
  );
}
