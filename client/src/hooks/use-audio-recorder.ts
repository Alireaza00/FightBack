import { useState, useRef, useCallback } from "react";

export interface UseAudioRecorderReturn {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  recordingTime: number;
  error: string | null;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });
      
      streamRef.current = stream;
      
      // Create MediaRecorder
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorder.current = recorder;
      audioChunks.current = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };
      
      recorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Unable to access microphone. Please check permissions.');
      throw err;
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorder.current || !isRecording) {
        resolve(null);
        return;
      }

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { 
          type: 'audio/webm;codecs=opus' 
        });
        
        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        if (recordingInterval.current) {
          clearInterval(recordingInterval.current);
          recordingInterval.current = null;
        }
        
        setIsRecording(false);
        mediaRecorder.current = null;
        audioChunks.current = [];
        
        resolve(audioBlob);
      };

      mediaRecorder.current.stop();
    });
  }, [isRecording]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    recordingTime,
    error,
  };
}
