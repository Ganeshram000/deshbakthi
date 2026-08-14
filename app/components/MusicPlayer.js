"use client";

import { useEffect, useRef, useState } from "react";

const PLAYLIST_ID = "PL-urDfWQtlQZbxQwzDTe14IFhN4N4m20Y";

export default function MusicPlayer() {
  const iframeRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [volume, setVolume] = useState(80);

  const sendCommand = (func, args = []) => {
    const iframe = iframeRef.current;

    if (!iframe || !iframe.contentWindow) return;

    iframe.contentWindow.postMessage(
      JSON.stringify({
        event: "command",
        func,
        args,
      }),
      "https://www.youtube.com"
    );
  };

  const playMusic = () => {
    sendCommand("playVideo");
    setIsPlaying(true);
  };

  const pauseMusic = () => {
    sendCommand("pauseVideo");
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  };

  const changeVolume = (value) => {
    const newVolume = Number(value);

    setVolume(newVolume);

    sendCommand("setVolume", [newVolume]);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* YouTube player */}
      <div
        style={{
          position: "fixed",
          width: "1px",
          height: "1px",
          left: "-10px",
          bottom: "-10px",
          overflow: "hidden",
          opacity: 0.01,
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        <iframe
          ref={iframeRef}
          width="200"
          height="200"
          src={`https://www.youtube.com/embed/videoseries?list=${PLAYLIST_ID}&enablejsapi=1&origin=${encodeURIComponent(
            typeof window !== "undefined"
              ? window.location.origin
              : "https://indiantruckmusic.codewale.in"
          )}&playsinline=1&rel=0`}
          title="Rajasthan Journey Music"
          allow="autoplay; encrypted-media"
          style={{
            border: "none",
          }}
          onLoad={() => {
            setLoaded(true);
          }}
        />
      </div>

      {/* Music Player UI */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{
          background: "rgba(0,0,0,0.78)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.25)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
        }}
      >
        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          disabled={!loaded}
          aria-label={isPlaying ? "Pause music" : "Play music"}
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            border: "none",
            cursor: loaded ? "pointer" : "not-allowed",
            background:
              "linear-gradient(135deg, #FF671F, #ffffff, #046A38)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            color: "#000",
            boxShadow: "0 4px 15px rgba(255,103,31,0.35)",
          }}
        >
          {!loaded ? "⏳" : isPlaying ? "❚❚" : "▶"}
        </button>

        {/* Text */}
        <div
          style={{
            minWidth: "145px",
            color: "white",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: "700",
              letterSpacing: "0.5px",
            }}
          >
            🎵 Rajasthan Journey
          </div>

          <div
            style={{
              marginTop: "3px",
              fontSize: "10px",
              color: "rgba(255,255,255,0.65)",
            }}
          >
            {loaded
              ? isPlaying
                ? "Now Playing • Patriotic Playlist"
                : "Press Play to Begin"
              : "Loading playlist from YouTube…"}
          </div>
        </div>

        {/* Volume */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span style={{ fontSize: "14px" }}>🔊</span>

          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => changeVolume(e.target.value)}
            style={{
              width: "65px",
              cursor: "pointer",
            }}
          />
        </div>
      </div>
    </>
  );
}