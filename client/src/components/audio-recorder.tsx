import { useState, useRef } from "react";
import { Mic, Square, Play, Trash2, FileAudio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";

interface AudioRecording {
  id: string;
  name: string;
  duration: number;
  timestamp: string;
  blob?: Blob;
}

export default function AudioRecorder() {
  const [recordings, setRecordings] = useState<AudioRecording[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  
  const {
    isRecording,
    startRecording,
    stopRecording,
    recordingTime,
    error
  } = useAudioRecorder();

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (err) {
      toast({
        title: "Recording Error",
        description: "Unable to access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = async () => {
    try {
      const audioBlob = await stopRecording();
      if (audioBlob) {
        const newRecording: AudioRecording = {
          id: Date.now().toString(),
          name: `Recording ${recordings.length + 1}`,
          duration: recordingTime,
          timestamp: new Date().toLocaleString(),
          blob: audioBlob,
        };
        setRecordings(prev => [...prev, newRecording]);
        
        toast({
          title: "Recording Saved",
          description: "Your audio recording has been saved.",
        });
      }
    } catch (err) {
      toast({
        title: "Recording Error", 
        description: "Failed to save recording. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePlayRecording = (recording: AudioRecording) => {
    if (!recording.blob) return;
    
    if (playingId === recording.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    const audioUrl = URL.createObjectURL(recording.blob);
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setPlayingId(recording.id);
      
      audioRef.current.onended = () => {
        setPlayingId(null);
        URL.revokeObjectURL(audioUrl);
      };
    }
  };

  const handleDeleteRecording = (id: string) => {
    setRecordings(prev => prev.filter(r => r.id !== id));
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
    }
    
    toast({
      title: "Recording Deleted",
      description: "Audio recording has been removed.",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      <div className="flex items-center space-x-4">
        {!isRecording ? (
          <Button 
            type="button" 
            onClick={handleStartRecording}
            className="bg-error-custom hover:bg-red-600 text-white"
          >
            <Mic className="h-4 w-4 mr-2" />
            Start Recording
          </Button>
        ) : (
          <Button 
            type="button" 
            onClick={handleStopRecording}
            className="bg-gray-500 hover:bg-gray-600 text-white"
          >
            <Square className="h-4 w-4 mr-2" />
            Stop
          </Button>
        )}
        
        <div className="text-sm text-gray-500">
          {isRecording ? `Recording: ${formatTime(recordingTime)}` : "Recording: 0:00"}
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          Error: {error}
        </div>
      )}

      {/* Audio Recordings List */}
      <div className="space-y-3">
        {recordings.map((recording) => (
          <div key={recording.id} className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200">
            <div className="flex items-center space-x-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handlePlayRecording(recording)}
                className="text-primary-custom hover:text-blue-600"
              >
                <Play className="h-4 w-4" />
              </Button>
              <div>
                <p className="text-sm font-medium text-gray-800">{recording.name}</p>
                <p className="text-xs text-gray-500">
                  {recording.timestamp} - {formatTime(recording.duration)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-accent-custom hover:text-teal-600"
              >
                <FileAudio className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteRecording(recording.id)}
                className="text-error-custom hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        {recordings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Mic className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No audio recordings yet</p>
            <p className="text-sm">Start recording to capture audio evidence</p>
          </div>
        )}
      </div>

      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
}
