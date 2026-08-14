'use client';

import { useEffect, useRef, useState } from 'react';
import {
  IoPlaySkipBack,
  IoPlaySkipForward,
  IoPlay,
  IoPause,
  IoVolumeHigh,
  IoVolumeMute,
  IoList,
  IoClose,
  IoMusicalNotes,
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
    const res = await fetch(
      `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`
    );

    if (!res.ok) {
      return { title: '', author: '' };
    }

    const data = await res.json();

    return {
      title: data.title || '',
      author: data.author_name || '',
    };
  } catch {
    return {
      title: '',
      author: '',
    };
  }
}

export default function MusicPlayer({
  playlistId = PLAYLIST_ID,
}) {
  const playerRef = useRef(null);
  const timerRef = useRef(null);
  const pollRef = useRef(null);
  const apiReadyRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [muted, setMuted] = useState(false);

  const [showPlaylist, setShowPlaylist] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);

  const [trackTitle, setTrackTitle] = useState(
    'Press Play to Begin'
  );

  const [trackArtist, setTrackArtist] = useState(
    'Rajasthan Beats'
  );

  const [trackThumb, setTrackThumb] = useState('');
  const [playlist, setPlaylist] = useState([]);

  // ---------------------------------------------------------
  // YouTube API
  // ---------------------------------------------------------

  useEffect(() => {
    let mounted = true;

    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : '';

    const buildPlayer = () => {
      if (!mounted) return;

      if (!window.YT?.Player) {
        console.error('[YT] Player API not available');
        return;
      }

      console.log('[YT] Creating player');
      console.log('[YT] Origin:', origin);
      console.log('[YT] Playlist:', playlistId);

      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}

        playerRef.current = null;
      }

      const mount = document.getElementById(
        'yt-player-mount'
      );

      if (!mount) {
        console.error('[YT] Player mount not found');
        return;
      }

     playerRef.current = new window.YT.Player(
  'yt-player-mount',
  {
    width: '200',
    height: '200',

    playerVars: {
      autoplay: 0,
      controls: 0,
      rel: 0,
      playsinline: 1,
      enablejsapi: 1,
      origin: window.location.origin,
    },

    events: {
      onReady: handleReady,
      onStateChange: handleStateChange,
      onError: handlePlayerError,
    },
  }
);
    };

    // API already loaded
    if (window.YT?.Player) {
      apiReadyRef.current = true;
      buildPlayer();
      return;
    }

    // API script already exists
    const existingScript =
      document.getElementById('yt-iframe-api');

    if (existingScript) {
      window.onYouTubeIframeAPIReady = () => {
        apiReadyRef.current = true;
        buildPlayer();
      };

      return () => {
        mounted = false;
      };
    }

    // Load YouTube API
    const script = document.createElement('script');

    script.id = 'yt-iframe-api';
    script.src =
      'https://www.youtube.com/iframe_api';
    script.async = true;

    script.onerror = () => {
      console.error(
        '[YT] Failed to load YouTube iframe API'
      );
    };

    document.head.appendChild(script);

    window.onYouTubeIframeAPIReady = () => {
      console.log(
        '[YT] YouTube iframe API ready'
      );

      apiReadyRef.current = true;

      buildPlayer();
    };

    return () => {
      mounted = false;

      if (window.onYouTubeIframeAPIReady) {
        window.onYouTubeIframeAPIReady = null;
      }

      clearInterval(timerRef.current);
      clearTimeout(pollRef.current);
    };
  }, [playlistId]);

  // ---------------------------------------------------------
  // Player Ready
  // ---------------------------------------------------------

  function handleReady(event) {
    console.log('[YT] Player ready');

    const player = event.target;

    try {
      player.mute();

      // Load playlist
      player.loadPlaylist({
        listType: 'playlist',
        list: playlistId,
        index: 0,
      });

      console.log(
        '[YT] Loading playlist:',
        playlistId
      );

      // Wait for playlist
      clearTimeout(pollRef.current);

      pollRef.current = setTimeout(() => {
        pollPlaylist(player, 0);
      }, 2000);
    } catch (error) {
      console.error(
        '[YT] Playlist load error:',
        error
      );
    }
  }

  // ---------------------------------------------------------
  // Playlist polling
  // ---------------------------------------------------------

  function pollPlaylist(player, attempt) {
    try {
      const ids = player.getPlaylist();

      console.log(
        `[YT] Playlist attempt ${attempt}:`,
        ids
      );

      if (Array.isArray(ids) && ids.length > 0) {
        console.log(
          '[YT] Playlist loaded:',
          ids.length,
          'tracks'
        );

        const tracks = ids.map((id, index) => ({
          id,
          index,
          title: `Track ${index + 1}`,
          author: '',
          thumb:
            `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
        }));

        setPlaylist(tracks);

        setTrackThumb(
          `https://img.youtube.com/vi/${ids[0]}/mqdefault.jpg`
        );

        fetchTitlesInBatches(ids);

        try {
          player.pauseVideo();
          player.unMute();
          player.setVolume(volume);
        } catch {}

        return;
      }
    } catch (error) {
      console.error(
        '[YT] getPlaylist error:',
        error
      );
    }

    if (attempt < 40) {
      pollRef.current = setTimeout(() => {
        pollPlaylist(player, attempt + 1);
      }, 500);
    } else {
      console.error(
        '[YT] Playlist could not be loaded.'
      );

      console.error(
        '[YT] Check playlist visibility and YouTube embedding.'
      );
    }
  }

  // ---------------------------------------------------------
  // Fetch titles
  // ---------------------------------------------------------

  async function fetchTitlesInBatches(ids) {
    const BATCH = 5;

    for (
      let i = 0;
      i < ids.length;
      i += BATCH
    ) {
      const batch = ids.slice(i, i + BATCH);

      const results = await Promise.all(
        batch.map((id) => fetchTitle(id))
      );

      setPlaylist((previous) => {
        const updated = [...previous];

        batch.forEach((_, j) => {
          const index = i + j;

          if (!updated[index]) return;

          updated[index] = {
            ...updated[index],
            title:
              results[j]?.title ||
              updated[index].title,
            author:
              results[j]?.author || '',
          };
        });

        return updated;
      });

      if (i === 0 && results[0]?.title) {
        updateSongInfo(
          results[0].title,
          results[0].author
        );
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 200)
      );
    }
  }

  // ---------------------------------------------------------
  // Song info
  // ---------------------------------------------------------

  function updateSongInfo(title, author = '') {
    const raw = title || '';

    const separator = raw.indexOf(' - ');

    if (separator > 0) {
      setTrackArtist(
        raw.slice(0, separator).trim()
      );

      setTrackTitle(
        raw.slice(separator + 3).trim()
      );
    } else {
      setTrackTitle(raw);

      setTrackArtist(author || '');
    }
  }

  // ---------------------------------------------------------
  // Sync current track
  // ---------------------------------------------------------

  function syncTrack(player) {
    try {
      const index =
        player.getPlaylistIndex();

      const data =
        player.getVideoData();

      if (index >= 0) {
        setTrackIndex(index);
      }

      if (data?.title) {
        updateSongInfo(
          data.title,
          data.author || ''
        );

        setPlaylist((previous) =>
          previous.map((track, i) =>
            i === index
              ? {
                  ...track,
                  title: data.title,
                  author:
                    data.author ||
                    track.author,
                }
              : track
          )
        );
      }

      if (data?.video_id) {
        setTrackThumb(
          `https://img.youtube.com/vi/${data.video_id}/mqdefault.jpg`
        );
      }

      setDuration(
        player.getDuration() || 0
      );
    } catch {}
  }

  // ---------------------------------------------------------
  // State change
  // ---------------------------------------------------------

  function handleStateChange(event) {
    const state = event.data;
    const YTState =
      window.YT?.PlayerState;

    if (!YTState) return;

    if (state === YTState.PLAYING) {
      setPlaying(true);

      syncTrack(event.target);

      clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        try {
          setCurrentTime(
            event.target.getCurrentTime() || 0
          );

          setDuration(
            event.target.getDuration() || 0
          );
        } catch {}
      }, 500);
    }

    else if (state === YTState.PAUSED) {
      setPlaying(false);

      clearInterval(timerRef.current);
    }

    else if (state === YTState.ENDED) {
      setPlaying(false);

      clearInterval(timerRef.current);

      setTimeout(() => {
        try {
          playerRef.current?.nextVideo();
        } catch {}
      }, 400);
    }

    else if (state === YTState.BUFFERING) {
      syncTrack(event.target);
    }
  }

  // ---------------------------------------------------------
  // YouTube error
  // ---------------------------------------------------------

  function handlePlayerError(event) {
    console.error(
      '[YT] Player error:',
      event.data
    );

    /*
      2  = Invalid video parameter
      5  = HTML5 player error
      100 = Video not found/private
      101 = Embedding not allowed
      150 = Embedding not allowed
    */

    if (
      event.data === 101 ||
      event.data === 150
    ) {
      console.error(
        '[YT] This video does not allow embedding.'
      );
    }
  }

  // ---------------------------------------------------------
  // Play / Pause
  // ---------------------------------------------------------

  const togglePlay = () => {
    const player = playerRef.current;

    if (!player) {
      console.warn(
        '[YT] Player is not ready yet'
      );
      return;
    }

    try {
      if (playing) {
        player.pauseVideo();
      } else {
        player.unMute();
        player.setVolume(volume);
        player.playVideo();
      }
    } catch (error) {
      console.error(
        '[YT] Play error:',
        error
      );
    }
  };

  // ---------------------------------------------------------
  // Previous
  // ---------------------------------------------------------

  const handlePrev = () => {
    try {
      playerRef.current?.previousVideo();
    } catch {}
  };

  // ---------------------------------------------------------
  // Next
  // ---------------------------------------------------------

  const handleNext = () => {
    try {
      playerRef.current?.nextVideo();
    } catch {}
  };

  // ---------------------------------------------------------
  // Seek
  // ---------------------------------------------------------

  const handleSeek = (event) => {
    const time =
      (parseFloat(event.target.value) / 100) *
      duration;

    setCurrentTime(time);

    try {
      playerRef.current?.seekTo(
        time,
        true
      );
    } catch {}
  };

  // ---------------------------------------------------------
  // Volume
  // ---------------------------------------------------------

  const handleVolume = (event) => {
    const value = parseInt(
      event.target.value,
      10
    );

    setVolume(value);
    setMuted(value === 0);

    try {
      playerRef.current?.setVolume(value);

      if (value > 0) {
        playerRef.current?.unMute();
      }
    } catch {}
  };

  // ---------------------------------------------------------
  // Mute
  // ---------------------------------------------------------

  const toggleMute = () => {
    const next = !muted;

    setMuted(next);

    try {
      if (next) {
        playerRef.current?.mute();
      } else {
        playerRef.current?.unMute();
        playerRef.current?.setVolume(volume);
      }
    } catch {}
  };

  // ---------------------------------------------------------
  // Playlist item
  // ---------------------------------------------------------

  const handleTrackClick = (index) => {
    try {
      playerRef.current?.playVideoAt(index);

      playerRef.current?.unMute();

      playerRef.current?.setVolume(volume);

      setShowPlaylist(false);
    } catch {}
  };

  const progress =
    duration > 0
      ? (currentTime / duration) * 100
      : 0;

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <>
      {/* Hidden YouTube Player */}
<div
  id="yt-player-mount"
  style={{
    position: 'fixed',
    width: '200px',
    height: '200px',
    left: '-220px',
    top: '0',
    opacity: 0.01,
    pointerEvents: 'none',
    overflow: 'hidden',
  }}
/>
      {/* Player Bar */}

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 w-[min(480px,calc(100vw-24px))]">

        <div
          className="absolute inset-x-8 -bottom-2 h-6 rounded-full blur-xl opacity-40"
          style={{
            background:
              'linear-gradient(90deg, #FF671F, #ffffff, #046A38)',
          }}
        />

        <div
          className="relative flex flex-col gap-1.5 px-3 py-2.5 rounded-[20px]"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,103,31,0.22) 0%, rgba(255,255,255,0.32) 50%, rgba(4,106,56,0.22) 100%)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border:
              '1px solid rgba(255,255,255,0.35)',
            boxShadow:
              '0 6px 24px rgba(0,0,0,0.18)',
          }}
        >

          <div className="flex items-center gap-2">

            {/* Thumbnail */}

            <div
              className={`shrink-0 w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shadow ring-1 ring-white/20 ${
                playing ? 'animate-spin' : ''
              }`}
              style={{
                animationDuration: '4s',
              }}
            >
              {trackThumb ? (
                <img
                  src={trackThumb}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) =>
                    (e.currentTarget.style.display =
                      'none')
                  }
                />
              ) : (
                <IoMusicalNotes className="text-white/40 text-sm" />
              )}
            </div>

            {/* Song Info */}

            <div className="flex flex-col flex-1 min-w-0">

              <span
                className="text-[11px] font-semibold truncate leading-tight"
                style={{ color: '#111' }}
              >
                {trackTitle}
              </span>

              <span
                className="text-[10px] truncate leading-tight"
                style={{
                  color:
                    'rgba(0,0,0,0.5)',
                }}
              >
                {trackArtist}
              </span>

            </div>

            {/* Previous */}

            <button
              onClick={handlePrev}
              className="p-1 text-base active:scale-90"
              style={{
                color:
                  'rgba(0,0,0,0.6)',
              }}
            >
              <IoPlaySkipBack />
            </button>

            {/* Play */}

            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-full flex items-center justify-center text-base active:scale-90 shrink-0"
              style={{
                color: '#fff',
                background:
                  'linear-gradient(145deg, #FF671F, #046A38)',
                boxShadow:
                  '0 3px 12px rgba(255,103,31,0.45)',
              }}
            >
              {playing ? (
                <IoPause />
              ) : (
                <IoPlay />
              )}
            </button>

            {/* Next */}

            <button
              onClick={handleNext}
              className="p-1 text-base active:scale-90"
              style={{
                color:
                  'rgba(0,0,0,0.6)',
              }}
            >
              <IoPlaySkipForward />
            </button>

            {/* Volume */}

            <button
              onClick={toggleMute}
              className="p-1 text-base"
              style={{
                color:
                  'rgba(0,0,0,0.6)',
              }}
            >
              {muted || volume === 0 ? (
                <IoVolumeMute />
              ) : (
                <IoVolumeHigh />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="100"
              value={muted ? 0 : volume}
              onChange={handleVolume}
              className="w-14 h-1 rounded-full cursor-pointer"
              style={{
                accentColor: '#046A38',
                background:
                  'rgba(0,0,0,0.12)',
              }}
            />

            {/* Playlist */}

            <button
              onClick={() =>
                setShowPlaylist((value) => !value)
              }
              className="p-1 text-base"
              style={
                showPlaylist
                  ? { color: '#FF671F' }
                  : {
                      color:
                        'rgba(0,0,0,0.6)',
                    }
              }
            >
              <IoList />
            </button>

          </div>

          {/* Progress */}

          <div className="flex items-center gap-1.5">

            <span
              className="text-[10px] tabular-nums font-mono shrink-0"
              style={{
                color:
                  'rgba(0,0,0,0.45)',
              }}
            >
              {fmt(currentTime)}
            </span>

            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="flex-1 h-1 rounded-full cursor-pointer"
              style={{
                accentColor: '#FF671F',
                background:
                  'rgba(0,0,0,0.12)',
              }}
            />

            <span
              className="text-[10px] tabular-nums font-mono shrink-0"
              style={{
                color:
                  'rgba(0,0,0,0.45)',
              }}
            >
              {fmt(duration)}
            </span>

          </div>

        </div>
      </div>

      {/* Playlist */}

      {showPlaylist && (
        <div
          className="absolute inset-0 z-[200] flex items-center justify-center bg-white/20"
          onClick={() =>
            setShowPlaylist(false)
          }
        >
          <div
            className="relative flex flex-col w-[min(580px,calc(100vw-32px))] max-h-[75vh] overflow-hidden"
            style={{
              isolation: 'isolate',
              background:
                'linear-gradient(180deg, rgba(255,103,31,0.45) 0%, rgba(255,255,255,0.55) 50%, rgba(4,106,56,0.45) 100%)',
              backdropFilter:
                'blur(18px)',
              WebkitBackdropFilter:
                'blur(18px)',
              border:
                '1px solid rgba(255,255,255,0.35)',
              borderRadius: '30px',
              boxShadow:
                '0 8px 30px rgba(0,0,0,0.2)',
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* Header */}

            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{
                borderBottom:
                  '1px solid rgba(255,255,255,0.3)',
                background:
                  'rgba(255,255,255,0.1)',
              }}
            >

              <div className="flex items-center gap-3">

                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-white/10 border border-white/15 shadow-lg">

                  {trackThumb ? (
                    <img
                      src={trackThumb}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <IoMusicalNotes className="text-white/30 text-2xl m-auto mt-3" />
                  )}

                </div>

                <div>

                  <div
                    className="text-[13px] font-bold"
                    style={{
                      color: '#1a1a1a',
                    }}
                  >
                    🎵 Rajasthan Journey
                  </div>

                  <div
                    className="text-xs mt-1"
                    style={{
                      color:
                        'rgba(30,30,30,0.45)',
                    }}
                  >
                    {playlist.length > 0
                      ? `${playlist.length} Tracks`
                      : 'Loading...'}
                  </div>

                  <div
                    className="text-xs mt-1 truncate max-w-[240px] font-medium"
                    style={{
                      color: '#046A38',
                    }}
                  >
                    {trackTitle}
                  </div>

                </div>

              </div>

              <button
                onClick={() =>
                  setShowPlaylist(false)
                }
                className="w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all shrink-0"
                style={{
                  background:
                    'rgba(30,30,30,0.06)',
                  color:
                    'rgba(30,30,30,0.6)',
                }}
              >
                <IoClose />
              </button>

            </div>

            {/* Track list */}

            <div className="overflow-y-auto flex-1 py-1.5 scrollbar-thin scrollbar-thumb-white/10">

              {playlist.length === 0 ? (
                <div
                  className="flex flex-col items-center gap-3 py-10 text-sm"
                  style={{
                    color:
                      'rgba(30,30,30,0.4)',
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white/10 animate-spin"
                    style={{
                      borderTopColor:
                        '#046A38',
                    }}
                  />

                  Loading playlist from YouTube…
                </div>
              ) : (
                playlist.map((track, index) => (
                  <div
                    key={track.id}
                    onClick={() =>
                      handleTrackClick(index)
                    }
                    className="flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors border-l-[3px]"
                    style={
                      index === trackIndex
                        ? {
                            background:
                              'rgba(30,30,30,0.08)',
                            borderLeftColor:
                              '#046A38',
                            paddingLeft: '13px',
                          }
                        : {
                            borderLeftColor:
                              'transparent',
                          }
                    }
                  >

                    {/* Thumbnail */}

                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white/8">

                      <img
                        src={track.thumb}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) =>
                          (e.currentTarget.style.display =
                            'none')
                        }
                      />

                      {index === trackIndex &&
                        playing && (
                          <div
                            className="absolute inset-0 flex items-center justify-center animate-pulse"
                            style={{
                              background:
                                'rgba(30,30,30,0.4)',
                            }}
                          >
                            <span
                              className="text-sm"
                              style={{
                                color:
                                  '#046A38',
                              }}
                            >
                              ▶
                            </span>
                          </div>
                        )}

                    </div>

                    <span
                      className="text-xs font-mono w-5 shrink-0 text-right"
                      style={{
                        color:
                          'rgba(30,30,30,0.3)',
                      }}
                    >
                      {String(index + 1).padStart(
                        2,
                        '0'
                      )}
                    </span>

                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">

                      <span
                        className={`text-[13px] truncate ${
                          index === trackIndex
                            ? 'font-semibold'
                            : ''
                        }`}
                        style={{
                          color:
                            index === trackIndex
                              ? '#1a1a1a'
                              : 'rgba(30,30,30,0.75)',
                        }}
                      >
                        {track.title}
                      </span>

                      <span
                        className="text-[11px] truncate"
                        style={{
                          color:
                            'rgba(30,30,30,0.4)',
                        }}
                      >
                        {track.author}
                      </span>

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