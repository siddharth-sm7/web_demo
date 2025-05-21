import { useState, useEffect, useCallback, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import Peer from 'simple-peer';
import { WebRTCState, WebRTCActions } from '../types';

const SERVER_URL = 'http://localhost:3001';

export const useWebRTC = (
  onMessage: (text: string, sender: 'user' | 'langpal') => void,
  systemPrompt: string
): [WebRTCState, WebRTCActions] => {
  const [state, setState] = useState<WebRTCState>({
    isConnected: false,
    isMicActive: false,
    isProcessing: false,
    error: null,
  });
  
  const socketRef = useRef<Socket | null>(null);
  const peerRef = useRef<Peer.Instance | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Handle connection setup
  const setupConnection = useCallback(async () => {
    try {
      // Clear any previous errors
      setState(prev => ({ ...prev, error: null, isProcessing: true }));
      
      // Connect to server
      socketRef.current = io(SERVER_URL);
      
      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Setup audio processing
      audioContextRef.current = new AudioContext();
      
      // Wait for signaling server connection
      socketRef.current.on('connect', () => {
        console.log('Connected to signaling server');
        
        // Initialize peer connection
        peerRef.current = new Peer({
          initiator: true,
          trickle: false,
          stream,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' }
            ]
          }
        });
        
        // Send system prompt to server
        socketRef.current!.emit('system-prompt', { systemPrompt });
        
        // Handle successful connection
        peerRef.current.on('signal', (data) => {
          socketRef.current!.emit('signal', data);
        });
        
        // Handle incoming data
        peerRef.current.on('data', (data) => {
          const message = JSON.parse(data.toString());
          if (message.type === 'transcript') {
            onMessage(message.text, 'user');
          } else if (message.type === 'response') {
            onMessage(message.text, 'langpal');
          }
        });
        
        // Handle incoming signal from server
        socketRef.current.on('signal', (data) => {
          peerRef.current!.signal(data);
        });
        
        peerRef.current.on('connect', () => {
          setState(prev => ({ 
            ...prev, 
            isConnected: true, 
            isMicActive: true,
            isProcessing: false 
          }));
        });
        
        // Handle errors
        peerRef.current.on('error', (err) => {
          console.error('Peer error:', err);
          setState(prev => ({ 
            ...prev, 
            error: 'Connection error. Please try again.' 
          }));
        });
      });
      
      // Handle server errors
      socketRef.current.on('error', (error) => {
        console.error('Socket error:', error);
        setState(prev => ({ 
          ...prev, 
          error: 'Server connection error. Please try again.',
          isProcessing: false 
        }));
      });
      
    } catch (error) {
      console.error('WebRTC setup error:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to access microphone. Please check permissions.',
        isProcessing: false 
      }));
    }
  }, [onMessage, systemPrompt]);
  
  // Cleanup function
  const cleanup = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setState({
      isConnected: false,
      isMicActive: false,
      isProcessing: false,
      error: null,
    });
  }, []);
  
  // Start conversation
  const startConversation = useCallback(() => {
    cleanup();
    setupConnection();
  }, [cleanup, setupConnection]);
  
  // End conversation
  const endConversation = useCallback(() => {
    cleanup();
  }, [cleanup]);
  
  // Toggle microphone
  const toggleMic = useCallback(() => {
    if (!streamRef.current) return;
    
    const newMicState = !state.isMicActive;
    streamRef.current.getAudioTracks().forEach(track => {
      track.enabled = newMicState;
    });
    
    setState(prev => ({ ...prev, isMicActive: newMicState }));
  }, [state.isMicActive]);
  
  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);
  
  return [
    state,
    { startConversation, endConversation, toggleMic }
  ];
};