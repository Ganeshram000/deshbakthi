'use client';
import { useEffect, useRef, useState } from 'react';
import {
  IoPlaySkipBack, IoPlaySkipForward,
  IoPlay, IoPause,
  IoVolumeHigh, IoVolumeMute,
  IoList, IoClose, IoMusicalNotes,
} from 'react-icons/io5';

const PLAYLIST_ID = 'PL-urDfWQtlQZbxQwzDTe14IFhN4N4m20Y';

function fmt(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

async function fetchTitle(videoId) {
  try {
    const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
    const data = await res.json();
    return { title: data.title || '', author: data.author_name || '' };
  } catch { return { title: '', author: '' }; }
}

export default function MusicPlayer({ playlistId = PLAYLIST_ID }) {
  const playerRef    = useRef(null);
  const containerRef = useRef(null);
  const timerRef     = useRef(null);
  const pollRef      = useRef(null);

  const [started,      setStarted]      = useState(false);
  const [playing,      setPlaying]      = useState(false);
  const [currentTime,  setCurrentTime]  = useState(0);
  const [duration,     setDuration]     = useState(0);
  const [volume,       setVolume]       = useState(70);
  const [muted,        setMuted]        = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [trackIndex,   setTrackIndex]   = useState(0);
  const [trackTitle,   setTrackTitle]   = useState('Press Play to Begin');
  const [trackArtist,  setTrackArtist]  = useState('Rajasthan Beats');
  const [trackThumb,   setTrackThumb]   = useState('');
  const [playlist,     setPlaylist]     = useState([]);

  useEffect(() => {
    console.log('[YT] useEffect fired, building player...');
    const origin = window.location.origin;
    console.log('[YT] origin:', origin);
    let retries = 0;
    const maxRetries = 5;

    const build = () => {
      console.log('[YT] build() called');
      if (playerRef.current) { try { playerRef.current.destroy(); } catch (_) {} playerRef.current = null; }
      try {
        playerRef.current = new window.YT.Player('yt-player-mount', {
          height: '1', width: '1',
          videoId: 'dQw4w9WgXcQ',
          playerVars: { autoplay: 0, controls: 0, rel: 0, modestbranding: 1, enablejsapi: 1, playsinline: 1 },
          events: { onReady, onStateChange },
        });
        console.log('[YT] player created:', playerRef.current);
      } catch (err) {
        console.error('[YT] Failed to create player:', err);
      }
    };

    const tryBuild = () => {
      if (window.YT?.Player) {
        console.log('[YT] YT already loaded');
        build();
        return true;
      }
      if (retries < maxRetries) {
        retries++;
        console.warn(`[YT] YT not ready yet, retrying... (attempt ${retries}/${maxRetries})`);
        setTimeout(tryBuild, 500);
        return false;
      }
      console.error('[YT] YT failed to load after all retries');
      return false;
    };

    if (window.YT?.Player) { console.log('[YT] YT already loaded'); build(); return; }
    if (!document.getElementById('yt-iframe-api')) {
      console.log('[YT] injecting iframe_api script');
      const tag = document.createElement('script');
      tag.id = 'yt-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      // Ensure we do NOT set a crossorigin attribute — that forces CORS mode
      try { tag.removeAttribute && tag.removeAttribute('crossorigin'); } catch (_) {}
      try { tag.crossOrigin = undefined; } catch (_) {}
      tag.onerror = () => {
        console.error('[YT] Failed to load iframe_api script from CDN!');
        console.warn('[YT] Retrying script load...');
        tag.remove();
        setTimeout(() => {
          if (!document.getElementById('yt-iframe-api')) {
            const retryTag = document.createElement('script');
            retryTag.id = 'yt-iframe-api';
            retryTag.src = 'https://www.youtube.com/iframe_api';
            retryTag.async = true;
            try { retryTag.removeAttribute && retryTag.removeAttribute('crossorigin'); } catch (_) {}
            try { retryTag.crossOrigin = undefined; } catch (_) {}
            document.head.appendChild(retryTag);
          }
        }, 1000);
      };
      document.head.appendChild(tag);
    }
    window.onYouTubeIframeAPIReady = () => { console.log('[YT] onYouTubeIframeAPIReady fired'); build(); };
    
    // Fallback: try to build after a delay if API isn't ready
    const fallbackTimer = setTimeout(() => tryBuild(), 3000);
    
    return () => { 
      window.onYouTubeIframeAPIReady = null; 
      clearTimeout(fallbackTimer);
    };
  }, [playlistId]);

  useEffect(() => () => { clearInterval(timerRef.current); clearTimeout(pollRef.current); }, []);

  function onReady(e) {
    console.log('[YT] onReady fired');
    e.target.mute();
    e.target.loadPlaylist({ listType: 'playlist', list: playlistId, index: 0 });
    console.log('[YT] loadPlaylist called with:', playlistId);
    pollRef.current = setTimeout(() => pollForIds(e.target, 0), 2000);
  }

  function pollForIds(player, attempt) {
    const ids = (() => { try { return player.getPlaylist(); } catch(err) { console.error('[YT] getPlaylist error in pollForIds:', err); return null; } })();
    const state = (() => { try { return player.getPlayerState(); } catch(_) { return 'error'; } })();
    console.log(`[YT] pollForIds attempt ${attempt} | Player State: ${state} | Playlist IDs:`, ids);

    if (ids === null) {
      console.error(`[YT] pollForIds: player.getPlaylist() returned null at attempt ${attempt}. This often means the player is not ready or playlist is not loaded.`);
    } else if (ids.length === 0) {
      console.warn(`[YT] pollForIds: player.getPlaylist() returned an empty array at attempt ${attempt}. Check if the playlist ID is valid and accessible.`);
    }

    if (ids?.length > 0) {
      console.log('[YT] Playlist successfully loaded! Total tracks:', ids.length);
      setPlaylist(ids.map((id, i) => ({
        id, index: i,
        title: `Track ${i + 1}`, author: '',
        thumb: `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
      })));
      setTrackThumb(`https://img.youtube.com/vi/${ids[0]}/mqdefault.jpg`);
      fetchTitlesInBatches(ids);
      player.pauseVideo();
      player.unMute();
      player.setVolume(70);
      return;
    }
    if (attempt < 40) pollRef.current = setTimeout(() => pollForIds(player, attempt + 1), 500);
    else console.error('[YT] playlist never loaded after 40 attempts. Playlist ID:', playlistId, '| Check: is playlist Public? Is embedding allowed?');
  }

  async function fetchTitlesInBatches(ids) {
    const BATCH = 5;
    for (let i = 0; i < ids.length; i += BATCH) {
      const batch   = ids.slice(i, i + BATCH);
      const results = await Promise.all(batch.map(id => fetchTitle(id)));
      setPlaylist(prev => {
        const updated = [...prev];
        batch.forEach((_, j) => {
          const idx = i + j;
          if (updated[idx]) updated[idx] = { ...updated[idx], title: results[j].title || updated[idx].title, author: results[j].author || '' };
        });
        return updated;
      });
      if (i === 0 && results[0].title) {
        const raw = results[0].title;
        const sep = raw.indexOf(' - ');
        if (sep > 0) { setTrackArtist(raw.slice(0, sep).trim()); setTrackTitle(raw.slice(sep + 3).trim()); }
        else { setTrackTitle(raw); setTrackArtist(results[0].author || ''); }
      }
      await new Promise(r => setTimeout(r, 300));
    }
  }

  function syncTrack(player) {
    try {
      const idx  = player.getPlaylistIndex();
      const data = player.getVideoData();
      if (idx >= 0) setTrackIndex(idx);
      if (data?.title) {
        const raw = data.title;
        const sep = raw.indexOf(' - ');
        if (sep > 0) { setTrackArtist(raw.slice(0, sep).trim()); setTrackTitle(raw.slice(sep + 3).trim()); }
        else { setTrackTitle(raw); setTrackArtist(data.author || ''); }
        if (idx >= 0) setPlaylist(prev => prev.map((t, i) => i === idx ? { ...t, title: raw, author: data.author || t.author } : t));
      }
      const vid = data?.video_id;
      if (vid) setTrackThumb(`https://img.youtube.com/vi/${vid}/mqdefault.jpg`);
      setDuration(player.getDuration() || 0);
    } catch (_) {}
  }

  function onStateChange(e) {
    const S = window.YT.PlayerState;
    if (e.data === S.PLAYING) {
      setPlaying(true); setStarted(true); syncTrack(e.target);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        try { setCurrentTime(e.target.getCurrentTime() || 0); setDuration(e.target.getDuration() || 0); } catch (_) {}
      }, 500);
    } else if (e.data === S.PAUSED) {
      setPlaying(false); clearInterval(timerRef.current);
    } else if (e.data === S.ENDED) {
      setPlaying(false); clearInterval(timerRef.current);
      setTimeout(() => { try { playerRef.current?.nextVideo(); } catch (_) {} }, 400);
    } else if (e.data === S.BUFFERING) { syncTrack(e.target); }
  }

  const togglePlay = () => {
    try {
      if (playing) {
        playerRef.current?.pauseVideo();
      } else {
        setStarted(true);
        playerRef.current?.unMute();
        playerRef.current?.setVolume(volume);
        playerRef.current?.playVideo();
      }
    } catch (_) {}
  };
  const handlePrev = () => { try { playerRef.current?.previousVideo(); } catch (_) {} };
  const handleNext = () => { try { playerRef.current?.nextVideo(); } catch (_) {} };
  const handleSeek = (e) => { const t = (parseFloat(e.target.value) / 100) * duration; setCurrentTime(t); try { playerRef.current?.seekTo(t, true); } catch (_) {} };
  const handleVolume = (e) => { const v = parseInt(e.target.value); setVolume(v); setMuted(v === 0); try { playerRef.current?.setVolume(v); } catch (_) {} };
  const toggleMute = () => { const next = !muted; setMuted(next); try { next ? playerRef.current?.mute() : playerRef.current?.unMute(); } catch (_) {} };
  const handleTrackClick = (idx) => { setStarted(true); try { playerRef.current?.playVideoAt(idx); } catch (_) {} setShowPlaylist(false); };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* Hidden YT mount */}
      <div id="yt-player-mount" style={{ position: 'fixed', bottom: 0, left: 0, width: '1px', height: '1px', opacity: 0, pointerEvents: 'none', zIndex: -1 }} />

      {/* ── Player Bar ── */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 w-[min(480px,calc(100vw-24px))]">

        {/* Glow */}
        <div className="absolute inset-x-8 -bottom-2 h-6 rounded-full blur-xl opacity-40"
          style={{ background: 'linear-gradient(90deg, #FF671F, #ffffff, #046A38)' }} />

        <div className="relative flex flex-col gap-1.5 px-3 py-2.5 rounded-[20px]"
          style={{
            background: 'linear-gradient(180deg, rgba(255,103,31,0.22) 0%, rgba(255,255,255,0.32) 50%, rgba(4,106,56,0.22) 100%)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.35)',
            boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
          }}>

          {/* Shimmer line */}
          <div className="absolute top-0 left-5 right-5 h-px rounded-full"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)' }} />

          {/* Row 1 — Thumb + Info + Controls + Playlist */}
          <div className="flex items-center gap-2">

            {/* Thumbnail */}
            <div className={`shrink-0 w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shadow ring-1 ring-white/20 ${playing ? 'animate-spin' : ''}`}
              style={{ animationDuration: '4s' }}>
              {trackThumb
                ? <img src={trackThumb} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                : <IoMusicalNotes className="text-white/40 text-sm" />}
            </div>

            {/* Song info */}
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[11px] font-semibold truncate leading-tight" style={{ color: '#111' }}>{trackTitle}</span>
              <span className="text-[10px] truncate leading-tight" style={{ color: 'rgba(0,0,0,0.5)' }}>{trackArtist}</span>
            </div>

            {/* Prev / Play / Next */}
            <button onClick={handlePrev} className="p-1 text-base active:scale-90" style={{ color: 'rgba(0,0,0,0.6)' }}>
              <IoPlaySkipBack />
            </button>
            <button onClick={togglePlay}
              className="w-8 h-8 rounded-full flex items-center justify-center text-base active:scale-90 shrink-0"
              style={{ color: '#fff', background: 'linear-gradient(145deg, #FF671F, #046A38)', boxShadow: '0 3px 12px rgba(255,103,31,0.45)' }}>
              {playing ? <IoPause /> : <IoPlay />}
            </button>
            <button onClick={handleNext} className="p-1 text-base active:scale-90" style={{ color: 'rgba(0,0,0,0.6)' }}>
              <IoPlaySkipForward />
            </button>

            {/* Volume */}
            <button onClick={toggleMute} className="p-1 text-base" style={{ color: 'rgba(0,0,0,0.6)' }}>
              {muted || volume === 0 ? <IoVolumeMute /> : <IoVolumeHigh />}
            </button>
            <input type="range" min="0" max="100" value={muted ? 0 : volume} onChange={handleVolume}
              className="w-14 h-1 rounded-full cursor-pointer" style={{ accentColor: '#046A38', background: 'rgba(0,0,0,0.12)' }} />

            {/* Playlist */}
            <button onClick={() => setShowPlaylist(v => !v)} className="p-1 text-base" style={showPlaylist ? { color: '#FF671F' } : { color: 'rgba(0,0,0,0.6)' }}>
              <IoList />
            </button>
          </div>

          {/* Row 2 — Progress */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] tabular-nums font-mono shrink-0" style={{ color: 'rgba(0,0,0,0.45)' }}>{fmt(currentTime)}</span>
            <input type="range" min="0" max="100" value={progress} onChange={handleSeek}
              className="flex-1 h-1 rounded-full cursor-pointer" style={{ accentColor: '#FF671F', background: 'rgba(0,0,0,0.12)' }} />
            <span className="text-[10px] tabular-nums font-mono shrink-0" style={{ color: 'rgba(0,0,0,0.45)' }}>{fmt(duration)}</span>
          </div>

        </div>
      </div>

      {/* ── Playlist Panel ── */}
      {showPlaylist && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-white/20 "
          onClick={() => setShowPlaylist(false)}>
          <div className="relative flex flex-col w-[min(580px,calc(100vw-32px))] max-h-[75vh] overflow-hidden"
            style={{
              isolation: 'isolate',
              background: 'linear-gradient(180deg, rgba(255,103,31,0.45) 0%, rgba(255,255,255,0.55) 50%, rgba(4,106,56,0.45) 100%)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              border: '1px solid rgba(255,255,255,0.35)',
              borderRadius: '30px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            }}
            onClick={e => e.stopPropagation()}>

           

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)' }}>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-white/10 border border-white/15 shadow-lg">
                  {trackThumb
                    ? <img src={trackThumb} alt="" className="w-full h-full object-cover" />
                    : <IoMusicalNotes className="text-white/30 text-2xl m-auto mt-3" />}
                </div>
                <div>
                  <div className="text-[13px] font-bold" style={{ color: '#1a1a1a' }}>🎵 Rajasthan Journey</div>
                  <div className="text-xs mt-1" style={{ color: 'rgba(30,30,30,0.45)' }}>
                    {playlist.length > 0 ? `${playlist.length} Tracks` : 'Loading...'}
                  </div>
                  <div className="text-xs mt-1 truncate max-w-[240px] font-medium" style={{ color: '#046A38' }}>{trackTitle}</div>
                </div>
              </div>
              <button onClick={() => setShowPlaylist(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all shrink-0"
                style={{ background: 'rgba(30,30,30,0.06)', color: 'rgba(30,30,30,0.6)' }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(49,21,3,0.2)'; e.currentTarget.style.color='#046A38'; }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(30,30,30,0.06)'; e.currentTarget.style.color='rgba(30,30,30,0.6)'; }}>
                <IoClose />
              </button>
            </div>

            {/* Track list */}
            <div className="overflow-y-auto flex-1 py-1.5 scrollbar-thin scrollbar-thumb-white/10">
              {playlist.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-sm" style={{ color: 'rgba(30,30,30,0.4)' }}>
                  <div className="w-6 h-6 rounded-full border-2 border-white/10 animate-spin" style={{ borderTopColor: '#046A38' }} />
                  Loading playlist from YouTube…
                </div>
              ) : (
                playlist.map((t, i) => (
                  <div key={t.id} onClick={() => handleTrackClick(i)}
                    className="flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors border-l-[3px]"
                    style={i === trackIndex
                      ? { background: 'rgba(30,30,30,0.08)', borderLeftColor: '#046A38', paddingLeft: '13px' }
                      : { borderLeftColor: 'transparent' }}>

                    {/* Track thumb */}
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white/8">
                      <img src={t.thumb} alt="" className="w-full h-full object-cover"
                        onError={e => e.target.style.display = 'none'} />
                      {i === trackIndex && playing && (
                        <div className="absolute inset-0 flex items-center justify-center animate-pulse"
                          style={{ background: 'rgba(30,30,30,0.4)' }}>
                          <span className="text-sm" style={{ color: '#046A38' }}>▶</span>
                        </div>
                      )}
                    </div>

                    <span className="text-xs font-mono w-5 shrink-0 text-right" style={{ color: 'rgba(30,30,30,0.3)' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <span className={`text-[13px] truncate ${i === trackIndex ? 'font-semibold' : ''}`}
                        style={{ color: i === trackIndex ? '#1a1a1a' : 'rgba(30,30,30,0.75)' }}>
                        {t.title}
                      </span>
                      <span className="text-[11px] truncate" style={{ color: 'rgba(30,30,30,0.4)' }}>{t.author}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

