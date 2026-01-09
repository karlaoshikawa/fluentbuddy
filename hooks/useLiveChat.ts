
import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { ConnectionStatus, TranscriptionEntry, TeacherPersona, CEFRLevel } from '../types';
import { decode, encode, decodeAudioData } from '../utils/audioUtils';
import { SYSTEM_INSTRUCTION } from '../constants';

export function useLiveChat(persona: TeacherPersona, userLevel: CEFRLevel = 'B1', onTurnComplete?: (entries: TranscriptionEntry[]) => void) {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const micStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  const currentInputText = useRef('');
  const currentOutputText = useRef('');

  const stopSession = useCallback(() => {
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    sourcesRef.current.forEach(s => {
      try { s.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => {
        try { session.close(); } catch(e) {}
      }).catch(() => {});
      sessionPromiseRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }

    setStatus(ConnectionStatus.DISCONNECTED);
  }, []);

  const startSession = useCallback(async () => {
    try {
      stopSession(); 
      setStatus(ConnectionStatus.CONNECTING);
      setErrorMsg(null);

      const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext);
      inputAudioCtxRef.current = new AudioCtx({ sampleRate: 16000 });
      outputAudioCtxRef.current = new AudioCtx({ sampleRate: 24000 });

      await Promise.all([
        inputAudioCtxRef.current.resume(),
        outputAudioCtxRef.current.resume()
      ]);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      // Importante: criar a instância do SDK exatamente antes de conectar para pegar a API_KEY atualizada do process.env
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: persona.voice as any } },
          },
          systemInstruction: SYSTEM_INSTRUCTION(persona, userLevel),
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            console.log('Gemini Live session opened');
            setStatus(ConnectionStatus.CONNECTED);
            
            if (!inputAudioCtxRef.current || !micStreamRef.current) return;

            const source = inputAudioCtxRef.current.createMediaStreamSource(micStreamRef.current);
            const scriptProcessor = inputAudioCtxRef.current.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };

              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              }).catch(() => {});
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioCtxRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioCtxRef.current) {
              const ctx = outputAudioCtxRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const sourceNode = ctx.createBufferSource();
              sourceNode.buffer = audioBuffer;
              sourceNode.connect(ctx.destination);
              sourceNode.addEventListener('ended', () => sourcesRef.current.delete(sourceNode));
              sourceNode.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(sourceNode);
            }

            if (message.serverContent?.inputTranscription) {
              currentInputText.current += message.serverContent.inputTranscription.text;
            }
            if (message.serverContent?.outputTranscription) {
              currentOutputText.current += message.serverContent.outputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
              if (currentInputText.current || currentOutputText.current) {
                const newEntries: TranscriptionEntry[] = [];
                if (currentInputText.current) newEntries.push({ role: 'user', text: currentInputText.current, timestamp: new Date() });
                if (currentOutputText.current) newEntries.push({ role: 'teacher', text: currentOutputText.current, timestamp: new Date() });
                
                setTranscriptions(prev => {
                  const updated = [...prev, ...newEntries];
                  if (onTurnComplete) onTurnComplete(updated);
                  return updated;
                });
                currentInputText.current = '';
                currentOutputText.current = '';
              }
            }
          },
          onerror: (e: any) => {
            console.error('Live API Error:', e);
            setErrorMsg(e?.message || 'Erro na sessão ao vivo. Verifique seu faturamento.');
            setStatus(ConnectionStatus.ERROR);
            stopSession();
          },
          onclose: (e) => setStatus(ConnectionStatus.DISCONNECTED)
        }
      });

      sessionPromiseRef.current = sessionPromise;
    } catch (err: any) {
      setErrorMsg(err?.message || 'Falha ao iniciar. Verifique sua conta.');
      setStatus(ConnectionStatus.ERROR);
    }
  }, [persona, isMuted, userLevel, stopSession, onTurnComplete]);

  useEffect(() => {
    return () => stopSession();
  }, []);

  return {
    status,
    errorMsg,
    transcriptions,
    isMuted,
    setIsMuted,
    startSession,
    stopSession
  };
}
