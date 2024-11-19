'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mic, Upload, Volume2, VolumeX, Send, Languages } from 'lucide-react';
import { toast } from 'sonner';

const TranslationApp = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isuploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [mounted, setMounted] = useState(false);


  useEffect(() => {
    setMounted(true);

    audioRef.current = new Audio();
    return () => {
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, []);

  if (!mounted) {
    return null;
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/mpeg' });
        const formData = new FormData();
        formData.append('audio', audioBlob);

        try {
          setIsLoading(true);
          const response = await fetch('/api/speech_to_text', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) throw new Error('Speech to text failed');

          const data = await response.json();
          setInputText(data.text);
          toast.success('Speech converted to text');
        } catch (error) {
          console.error('Speech to text error:', error);
          toast.error('Failed to convert speech to text');
        } finally {
          setIsLoading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info('Recording started');
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      toast.info('Recording stopped');
    }
  };

  const handleRecordingClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const playTranslation = async (text: string) => {
    if (!text) return;

    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const response = await fetch('/api/text_to_speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Text to speech failed');

      const blob = await response.blob();
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
      const url = URL.createObjectURL(blob);
      setAudioURL(url);
      
if (audioRef.current) {
        audioRef.current.src = url;
        if (!isMuted) {
          await audioRef.current.play();
        }
      }
    } catch (error) {
      toast.error('Failed to play translation');
      console.error('Text to speech error:', error);
    }
  };


  const handleTranslate = async () => {
    if (!inputText || !selectedLanguage) {
      toast.error('Please enter text and select a language');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          sourceLanguage: selectedLanguage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Translation failed');
      }
  

      const data = await response.json();

      setOutputText(data.translation);
      toast.success('Translation complete');

      await playTranslation(data.translation);
    } catch (error) {
      toast.error('Translation failed. Please try again.');
      console.error('Translation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMute = async () => {
    setIsMuted(!isMuted);
    if (isMuted && outputText) {
      await playTranslation(outputText);
    } else if (!isMuted && audioRef.current) {
      audioRef.current.pause();
    }
  };


  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
  
      // check type
      const allowedTypes = ['text/plain', 'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a text or document file (.txt, .pdf, .doc, .docx)');
        return;
      }
  
      // file limit
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('File size must be less than 5MB');
        return;
      }
  
      try {
        if (file.type === 'text/plain') {
          const text = await file.text();
          setInputText(text);
          toast.success('File uploaded successfully');
        } else {
          toast.info('PDF and DOC support coming soon');
        }
      } catch (error) {
        toast.error('Error reading file');
        console.error('Error reading file:', error);
      }
    };
  
    const triggerFileUpload = () => {
      fileInputRef.current?.click();
    };

  return (
    <Card className="max-w-3xl mx-auto shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Languages className="h-6 w-6 text-blue-500" />
            PollyGlot Translation
          </CardTitle>
        </div>
        <p className="text-sm text-gray-500">Translate to English from your chosen language</p>
      </CardHeader>
      
          <CardContent className="space-y-4">
        {/* File input */} 
          <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".txt,.pdf,.doc,.docx"
          onChange={handleFileUpload}
        />
        {/* Language Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">
                <span className="flex items-center gap-2">
                  🇫🇷 French
                </span>
              </SelectItem>
              <SelectItem value="de">
                <span className="flex items-center gap-2">
                🇩🇪 German 
                </span>
              </SelectItem>
              <SelectItem value="es">
                <span className="flex items-center gap-2">
                  🇪🇸 Spanish
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Translation Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Original Text</label>
            <div className="relative">
              <Textarea 
                value = {inputText}
                placeholder="Enter text to translate..."
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[200px] resize-none"
              />
              <Button 
                variant="ghost" 
                size="icon"
                className={`absolute bottom-2 right-2 ${isRecording ? 'text-red-500' : ''}`}
                onClick={handleRecordingClick}
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Output Area */}
          <div className="space-y-2">
            <label className="text-sm font-medium">English Translation</label>
            <div className="relative">
              <Textarea 
                value = {outputText}
                placeholder="Translation will appear here..." 
                className="min-h-[200px] resize-none bg-gray-50"
                readOnly
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute bottom-2 right-2"
                onClick={toggleMute}
                
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-center pt-4">
          <Button variant="outline" className="w-40"  onClick={triggerFileUpload } >
            <Upload className="h-4 w-4 mr-2"/>
            Upload File
          </Button>
          <Button className="w-40 bg-blue-500 hover:bg-blue-600" onClick={handleTranslate} disabled={isLoading}>
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Translating...' : 'Translate'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TranslationApp;
