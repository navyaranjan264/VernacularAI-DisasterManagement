import React, { useEffect, useState, useRef } from 'react';
import { Volume2, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { playVernacularAudio, stopVernacularAudio, cleanTextForSpeech } from '@/utils/vernacularTTS';

interface VoiceAdvisoryButtonProps {
  text: string;
  language?: string;
  className?: string;
  disabled?: boolean;
}

const VoiceAdvisoryButton: React.FC<VoiceAdvisoryButtonProps> = ({
  text,
  language = 'en',
  className,
  disabled,
}) => {
  const [speaking, setSpeaking] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (stopRef.current) {
        stopRef.current();
        stopRef.current = null;
      }
      stopVernacularAudio();
    };
  }, []);

  const stop = () => {
    if (stopRef.current) {
      stopRef.current();
      stopRef.current = null;
    }
    stopVernacularAudio();
    setSpeaking(false);
  };

  const toggle = () => {
    if (disabled || !text.trim()) return;
    if (speaking) {
      stop();
      return;
    }

    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) return;

    setSpeaking(true);
    const cancelFn = playVernacularAudio({
      text: cleaned,
      language,
      rate: 0.95,
      onStart: () => setSpeaking(true),
      onEnd: () => {
        setSpeaking(false);
        stopRef.current = null;
      },
      onError: () => {
        setSpeaking(false);
        stopRef.current = null;
      },
    });
    stopRef.current = cancelFn;
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled || !text.trim()}
      className={cn(
        'inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md border text-sm font-medium transition-colors',
        speaking
          ? 'border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15'
          : 'border-border bg-card text-foreground hover:bg-secondary',
        'disabled:opacity-50 disabled:pointer-events-none',
        className,
      )}
    >
      {speaking ? <Square className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      {speaking ? 'Stop Broadcast' : 'Listen to Broadcast'}
    </button>
  );
};

export default VoiceAdvisoryButton;
