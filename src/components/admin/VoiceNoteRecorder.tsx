import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Mic, Square, Play, Pause, Trash2, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceNoteRecorderProps {
  onVoiceNoteChange: (file: Blob | null) => void;
  currentVoiceNoteUrl?: string | null;
  maxSizeMB?: number;
  disabled?: boolean;
}

export const VoiceNoteRecorder: React.FC<VoiceNoteRecorderProps> = ({
  onVoiceNoteChange,
  currentVoiceNoteUrl,
  maxSizeMB = 1,
  disabled = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        
        if (blob.size > maxSizeBytes) {
          toast.error(`Recording exceeds ${maxSizeMB}MB limit. Please record a shorter message.`);
          setRecordedBlob(null);
          onVoiceNoteChange(null);
        } else {
          setRecordedBlob(blob);
          onVoiceNoteChange(blob);
          toast.success('Voice note recorded successfully');
        }
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const playRecording = () => {
    const audioUrl = recordedBlob 
      ? URL.createObjectURL(recordedBlob) 
      : currentVoiceNoteUrl;
    
    if (!audioUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    audio.onended = () => {
      setIsPlaying(false);
    };
    
    audio.play();
    setIsPlaying(true);
  };

  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const deleteRecording = () => {
    setRecordedBlob(null);
    onVoiceNoteChange(null);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setRecordingDuration(0);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const hasAudio = recordedBlob || currentVoiceNoteUrl;

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <Volume2 className="h-4 w-4" />
        Voice Note Description (Optional)
      </Label>
      <p className="text-sm text-muted-foreground">
        Record a voice note description (max {maxSizeMB}MB)
      </p>
      
      <div className="flex items-center gap-2 flex-wrap">
        {!isRecording && !hasAudio && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={startRecording}
            disabled={disabled}
            className="gap-2"
          >
            <Mic className="h-4 w-4 text-red-500" />
            Start Recording
          </Button>
        )}

        {isRecording && (
          <>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={stopRecording}
              className="gap-2 animate-pulse"
            >
              <Square className="h-4 w-4" />
              Stop ({formatDuration(recordingDuration)})
            </Button>
            <span className="text-sm text-red-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Recording...
            </span>
          </>
        )}

        {hasAudio && !isRecording && (
          <>
            {!isPlaying ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={playRecording}
                disabled={disabled}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Play
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={pausePlayback}
                className="gap-2"
              >
                <Pause className="h-4 w-4" />
                Pause
              </Button>
            )}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={startRecording}
              disabled={disabled}
              className="gap-2"
            >
              <Mic className="h-4 w-4" />
              Re-record
            </Button>

            {recordedBlob && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={deleteRecording}
                disabled={disabled}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}

            {currentVoiceNoteUrl && !recordedBlob && (
              <span className="text-sm text-muted-foreground">
                (Existing voice note)
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
};
