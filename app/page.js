import MusicPlayer from './components/MusicPlayer';
import Clock from './components/Clock';
import Slogan from './components/Slogan';
import FlowerRain from './components/FlowerRain';

export default function Home() {
  return (
    <div className="relative w-full h-screen overflow-hidden">

      {/* ── White Background ── */}
      <div className="absolute inset-0 z-0" style={{ background: '#f0ece8' }} />

      {/* ── Hero Image ── */}
      <div
        className="absolute inset-0 z-[1] scale-110 animate-[slowmo_30s_ease-in-out_infinite_alternate]"
        style={{
          backgroundImage: "url('/hero.png')",
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
         
        }}
      />

      {/* ── Saffron gradient top ── */}
      <div className="absolute top-0 left-0 right-0 z-[3] pointer-events-none" style={{
        height: '80px',
        background: 'linear-gradient(to bottom, rgba(255,103,31,0.85) 0%, rgba(255,103,31,0.3) 50%, transparent 100%)',
      }} />
      {/* ── Green gradient bottom ── */}
      <div className="absolute bottom-0 left-0 right-0 z-[3] pointer-events-none" style={{
        height: '80px',
        background: 'linear-gradient(to top, rgba(4,106,56,0.85) 0%, rgba(4,106,56,0.3) 50%, transparent 100%)',
      }} />

      {/* ── Independence Day Header (top-center) ── */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center gap-1 px-5 py-2 rounded-2xl"
        style={{
          background: 'black',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.35)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        }}>
        {/* Waving flags row */}
       
        {/* Title */}
        <div style={{
          fontFamily: "'Tiro Devanagari Hindi', serif",
          fontSize: 'clamp(15px, 2.2vw, 22px)',
          fontWeight: '800',
          letterSpacing: '2px',
          background: 'linear-gradient(135deg, #FF671F 0%, #ffffff 50%, #046A38 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.35))',
          whiteSpace: 'nowrap',
        }}>
          15 अगस्त &nbsp;•&nbsp; स्वतंत्रता दिवस
        </div>
        {/* Tricolor underline */}
        <div style={{
          width: '120px', height: '3px', borderRadius: '2px',
          background: 'linear-gradient(90deg, #FF671F 33%, #ffffff 33%, #ffffff 66%, #046A38 66%)',
        }} />
      </div>
      <div className="absolute top-5 right-5 z-50">
        <img
          src="/ChatGPT Image Jul 16, 2026, 03_04_47 PM.png"
          alt="Logo"
          className="h-14 w-auto rounded-full object-contain drop-shadow-2xl"
        />
      </div>

      {/* ── Flower Rain on Click ── */}
      <FlowerRain />

      {/* ── Clock (top-left) ── */}
      <Clock />

      {/* ── Slogan ── */}
      <Slogan />

      {/* ── Bottom Credit ── */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
        <a
          href="https://www.codewale.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1 rounded-full no-underline"
          style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.25)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          }}
        >
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.5px' }}>designed by</span>
          <span style={{
            fontSize: '11px',
            fontWeight: '700',
            letterSpacing: '0.5px',
            background: 'linear-gradient(135deg, #FF671F, #ffffff, #046A38)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>CodeWale.in</span>
        </a>
      </div>

      {/* ── Music Player (bottom-center) ── */}
      <MusicPlayer />
    </div>
  );
}
