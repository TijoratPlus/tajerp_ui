import { Pause, Play } from "lucide-react";
import * as React from "react";

import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import { focusRing } from "../lib/control";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import { Slider } from "./Slider";
import { useFormat, useMessages } from "./TajUIProvider";

export const audioPlayerMessages = defineMessages("audioPlayer", {
  ru: {
    player: "Аудиоплеер",
    play: "Воспроизвести",
    pause: "Пауза",
    seek: "Позиция воспроизведения",
    speed: "Скорость воспроизведения",
    speedValue: (rate: string) => `Скорость ${rate}×`,
    error: "Не удалось загрузить запись",
  },
  tg: {
    player: "Аудиоплеер",
    play: "Пахш кардан",
    pause: "Таваққуф",
    seek: "Мавқеи пахш",
    speed: "Суръати пахш",
    speedValue: (rate: string) => `Суръат ${rate}×`,
    error: "Сабтро бор кардан нашуд",
  },
  en: {
    player: "Audio player",
    play: "Play",
    pause: "Pause",
    seek: "Playback position",
    speed: "Playback speed",
    speedValue: (rate: string) => `Speed ${rate}×`,
    error: "Could not load the recording",
  },
});

export type AudioPlayerLabels = (typeof audioPlayerMessages.locales)["ru"];

export interface AudioPlayerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onPlay" | "onPause"> {
  src: string;
  /** Speeds offered in the menu. Defaults to 0.5–2×. */
  rates?: number[];
  onPlay?: () => void;
  onPause?: () => void;
  labels?: Partial<AudioPlayerLabels>;
}

const DEFAULT_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

/** "1:05" / "1:02:09" from seconds. */
export function formatPlaybackTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

/** Compact player for call recordings and voice notes. */
export const AudioPlayer = React.forwardRef<HTMLDivElement, AudioPlayerProps>(
  ({ src, rates = DEFAULT_RATES, onPlay, onPause, labels, className, ...props }, ref) => {
    const t = useMessages(audioPlayerMessages, labels);
    const f = useFormat();
    const audioRef = React.useRef<HTMLAudioElement>(null);
    const [playing, setPlaying] = React.useState(false);
    const [time, setTime] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const [rate, setRate] = React.useState(1);
    const [failed, setFailed] = React.useState(false);

    React.useEffect(() => {
      setPlaying(false);
      setTime(0);
      setDuration(0);
      setFailed(false);
    }, [src]);

    const toggle = () => {
      const a = audioRef.current;
      if (!a) return;
      if (a.paused) {
        const p = a.play();
        if (p && typeof p.catch === "function") p.catch(() => setPlaying(false));
      } else a.pause();
    };

    const rateText = (r: number) => f.number(r, { maximumFractionDigits: 2 });

    return (
      <div
        ref={ref}
        role="group"
        aria-label={t.player}
        data-slot="audio-player"
        className={cn(
          "flex w-full items-center gap-2 !rounded-lg border border-hairline bg-ui-surface px-2 py-1.5",
          className,
        )}
        {...props}
      >
        <audio
          ref={audioRef}
          src={src}
          preload="metadata"
          onPlay={() => {
            setPlaying(true);
            onPlay?.();
          }}
          onPause={() => {
            setPlaying(false);
            onPause?.();
          }}
          onEnded={() => setPlaying(false)}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => {
            setDuration(e.currentTarget.duration);
            e.currentTarget.playbackRate = rate;
          }}
          onDurationChange={(e) => setDuration(e.currentTarget.duration)}
          onError={() => setFailed(true)}
        />
        <button
          type="button"
          data-slot="audio-player-toggle"
          aria-label={playing ? t.pause : t.play}
          disabled={failed}
          onClick={toggle}
          className={cn(
            "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center !rounded-full bg-brand-solid text-on-brand transition-colors hover:bg-brand-solid-hover disabled:cursor-not-allowed disabled:opacity-60 [[data-density=touch]_&]:size-11",
            focusRing,
          )}
        >
          {playing ? (
            <Pause className="size-4" aria-hidden />
          ) : (
            <Play className="size-4 translate-x-px" aria-hidden />
          )}
        </button>
        {failed ? (
          <span role="alert" className="flex-1 text-ui-label text-tj-error-ink">
            {t.error}
          </span>
        ) : (
          <>
            <span className="shrink-0 text-ui-caption tabular-nums text-ink-3" aria-hidden>
              {formatPlaybackTime(time)}
            </span>
            <Slider
              aria-label={t.seek}
              className="min-w-16 flex-1"
              min={0}
              max={duration > 0 && Number.isFinite(duration) ? duration : 1}
              step={0.1}
              value={[time]}
              disabled={!(duration > 0)}
              onValueChange={([v]) => {
                const a = audioRef.current;
                if (!a || v === undefined) return;
                a.currentTime = v;
                setTime(v);
              }}
            />
            <span className="shrink-0 text-ui-caption tabular-nums text-ink-3" aria-hidden>
              {formatPlaybackTime(duration)}
            </span>
          </>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              data-slot="audio-player-speed"
              aria-label={t.speedValue(rateText(rate))}
              className={cn(
                "inline-flex h-7 shrink-0 cursor-pointer items-center !rounded-md px-1.5 text-ui-caption font-semibold tabular-nums text-ink-2 hover:bg-ui-surface-2",
                focusRing,
              )}
            >
              {rateText(rate)}×
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" aria-label={t.speed}>
            <DropdownMenuRadioGroup
              value={String(rate)}
              onValueChange={(v) => {
                const r = Number(v);
                setRate(r);
                if (audioRef.current) audioRef.current.playbackRate = r;
              }}
            >
              {rates.map((r) => (
                <DropdownMenuRadioItem key={r} value={String(r)}>
                  {rateText(r)}×
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  },
);
AudioPlayer.displayName = "AudioPlayer";
