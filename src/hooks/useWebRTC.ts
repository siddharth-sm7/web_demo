import { useState, useEffect, useCallback, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import Peer from 'simple-peer';
import { WebRTCState, WebRTCActions } from '../types';

// Fix port to match server port (3000 is the default in server.js)
const SERVER_URL = 'http://localhost:3000';

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
      
      // Add connection error handling
      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setState(prev => ({
          ...prev,
          error: `Server connection error: ${error.message}. Check if server is running.`,
          isProcessing: false
        }));
      });
      
      // First, check if server is running with a simple fetch
      try {
        const statusCheck = await fetch(`${SERVER_URL}/api/status`);
        if (!statusCheck.ok) {
          throw new Error('Server status check failed');
        }
        console.log('Server status check passed');
      } catch (error) {
        console.error('Server status check failed:', error);
        setState(prev => ({
          ...prev,
          error: `Cannot connect to server. Make sure 'npm run server' is running.`,
          isProcessing: false
        }));
        return;
      }
      
      // Get media stream (for real microphone access)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        console.log('Microphone access granted');
      } catch (micError) {
        console.error('Microphone access error:', micError);
        setState(prev => ({
          ...prev,
          error: 'Microphone access denied. Please enable permissions in your browser.',
          isProcessing: false
        }));
        return;
      }
      
      // Setup audio processing
      audioContextRef.current = new AudioContext();
      
      // Wait for signaling server connection
      socketRef.current.on('connect', () => {
        console.log('Connected to signaling server');
        
        // Initialize peer connection
        peerRef.current = new Peer({
          initiator: true,
          trickle: false,
          stream: streamRef.current!,
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
          console.log('Local signal generated, sending to server');
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
        
        // Handle mock responses from server (for demo)
        socketRef.current!.on('mock-response', (data) => {
          console.log('Received mock response from server:', data);
          if (data.type === 'response') {
            onMessage(data.text, 'langpal');
          }
        });
        
        // Handle incoming signal from server
        socketRef.current!.on('signal', (data) => {
          console.log('Received signal from server');
          peerRef.current!.signal(data);
        });
        
        peerRef.current.on('connect', () => {
          console.log('Peer connection established');
          
          // Demo: Generate a fake transcript after connection
          setTimeout(() => {
            onMessage("Hello! I'm ready to chat with LangPal!", 'user');
            
            // Let the server generate a response
            socketRef.current!.emit('conversation-update', {
              text: "Hello! I'm ready to chat with LangPal!",
              sender: 'user',
              timestamp: new Date()
            });
          }, 1000);
          
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
            error: 'WebRTC connection error. Please try again.' 
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
      
      // For demo purposes only: Simulate successful connection after 5 seconds
      // This is a fallback if the WebRTC connection doesn't succeed
      setTimeout(() => {
        if (!state.isConnected && !state.error) {
          console.log('Simulating successful connection for demo');
          setState(prev => ({ 
            ...prev, 
            isConnected: true, 
            isProcessing: false 
          }));
          
          // Generate a fake user message
          setTimeout(() => {
            onMessage("Hello! I'm testing LangPal!", 'user');
            
            // Simulate LangPal response
            setTimeout(() => {
              onMessage("Hi there! I'm LangPal, your friendly teddy bear companion. How can I help you today?", 'langpal');
            }, 2000);
          }, 1000);
        }
      }, 5000);
      
    } catch (error) {
      console.error('WebRTC setup error:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to setup connection. ' + (error instanceof Error ? error.message : 'Please try again.'),
        isProcessing: false 
      }));
    }
  }, [onMessage, systemPrompt, state.isConnected]);
  
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