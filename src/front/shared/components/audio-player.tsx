import { useRef, useState } from "react";
import styles from "./audio-player.module.css";

const SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const;

interface Props {
  src: string;
}

export function AudioPlayer({ src }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(1);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) setCurrentTime(audio.currentTime);
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio) setDuration(audio.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = Number(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const cycleSpeed = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = (speedIndex + 1) % SPEEDS.length;
    const speed = SPEEDS[next];
    if (speed !== undefined) {
      audio.playbackRate = speed;
    }
    setSpeedIndex(next);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className={styles.player}>
      {/* biome-ignore lint/a11y/useMediaCaption: personal-use audio lectures without captions */}
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        preload="metadata"
      />
      <button type="button" className={styles.playButton} onClick={togglePlay}>
        {playing ? "||" : "▶"}
      </button>
      <input
        type="range"
        className={styles.seekBar}
        min={0}
        max={duration || 0}
        step={1}
        value={currentTime}
        onChange={handleSeek}
      />
      <span className={styles.time}>
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
      <button type="button" className={styles.speedButton} onClick={cycleSpeed}>
        {SPEEDS[speedIndex] ?? 1}x
      </button>
    </div>
  );
}
