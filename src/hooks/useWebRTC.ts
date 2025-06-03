import { useState, useEffect, useCallback, useRef } from 'react';
import { WebRTCState, WebRTCActions } from '../types';

// Server URL configuration - Update these with your actual domains
const getServerUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:10000'; // Local Render development
  }
  
  // Production - Replace with your actual Render service URL
  return 'https://web-demo-daja.onrender.com'; // UPDATE THIS!
};

const SERVER_URL = getServerUrl();

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
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  
  // Message accumulation state
  const accumulatedTextRef = useRef<string>('');
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isResponseActiveRef = useRef<boolean>(false);
  const lastDeltaTimeRef = useRef<number>(0);
  
  // Function to flush accumulated text
  const flushAccumulatedText = useCallback((reason: string) => {
    if (accumulatedTextRef.current.trim()) {
      console.log(`Flushing accumulated text (${reason}):`, accumulatedTextRef.current.trim());
      onMessage(accumulatedTextRef.current.trim(), 'langpal');
      accumulatedTextRef.current = '';
    }
    
    // Clear safety timeout
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
    
    isResponseActiveRef.current = false;
  }, [onMessage]);
  
  // Function to handle text deltas
  const handleTextDelta = useCallback((delta: string) => {
    if (!isResponseActiveRef.current) return;
    
    // Add delta to accumulated text
    accumulatedTextRef.current += delta;
    lastDeltaTimeRef.current = Date.now();
    
    // Clear existing safety timeout
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
    }
    
    // Set a safety timeout (shorter than before) - only as a fallback
    safetyTimeoutRef.current = setTimeout(() => {
      const timeSinceLastDelta = Date.now() - lastDeltaTimeRef.current;
      
      // Only flush if we haven't received deltas for a while and response seems stalled
      if (timeSinceLastDelta >= 800 && isResponseActiveRef.current) {
        console.log('Safety timeout triggered - response may have stalled');
        flushAccumulatedText('safety_timeout');
      }
    }, 1000); // 1 second safety timeout
  }, [flushAccumulatedText]);
  
  // Setup connection following the official OpenAI pattern
  const setupConnection = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null, isProcessing: true }));
      
      console.log('Connecting to server:', SERVER_URL);
      
      // First check if server is running
      try {
        const statusCheck = await fetch(`${SERVER_URL}/api/status`);
        if (!statusCheck.ok) {
          throw new Error(`Server status check failed: ${statusCheck.status}`);
        }
        console.log('Server status check passed');
      } catch (error) {
        console.error('Server connection error:', error);
        setState(prev => ({
          ...prev,
          error: 'Cannot connect to backend server. Please check if the Render service is running.',
          isProcessing: false
        }));
        return;
      }
      
      // Get ephemeral token from our server
      const tokenResponse = await fetch(`${SERVER_URL}/api/token`);
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Failed to get token: ${tokenResponse.status} ${errorText}`);
      }
      
      const data = await tokenResponse.json();
      const EPHEMERAL_KEY = data.client_secret.value;
      console.log('Token obtained successfully');
      
      // Create peer connection (following official implementation)
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      });
      
      peerConnectionRef.current = pc;
      
      // Set up audio element to play remote audio from the model
      if (!audioElementRef.current) {
        audioElementRef.current = document.createElement("audio");
        audioElementRef.current.autoplay = true;
      }
      
      pc.ontrack = (e) => {
        if (audioElementRef.current) {
          audioElementRef.current.srcObject = e.streams[0];
        }
      };
      
      // Get microphone access and add local audio track with better audio settings
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 16000,
            channelCount: 1
          }
        });
        pc.addTrack(mediaStream.getTracks()[0]);
        setState(prev => ({ ...prev, isMicActive: true }));
        console.log('Microphone access granted');
      } catch (micError) {
        console.error('Microphone access error:', micError);
        setState(prev => ({
          ...prev,
          error: 'Microphone access denied. Please enable microphone permissions.',
          isProcessing: false
        }));
        return;
      }
      
      // Set up data channel for sending and receiving events
      const dc = pc.createDataChannel("oai-events");
      dataChannelRef.current = dc;
      
      // Handle data channel events
      dc.addEventListener("open", () => {
        console.log("Data channel opened");
        setState(prev => ({ ...prev, isConnected: true, isProcessing: false }));
        
        // Send initial system prompt with explicit English language settings
        const systemEvent = {
          type: "session.update",
          session: {
            instructions: systemPrompt,
            voice: "verse",
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
            input_audio_transcription: {
              model: "whisper-1",
              language: "en"
            },
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500
            }
          }
        };
        
        sendEvent(systemEvent);
      });
      
      dc.addEventListener("message", (e) => {
        try {
          const event = JSON.parse(e.data);
          console.log("Received event:", event.type);
          
          // Handle different event types
          switch (event.type) {
            case "conversation.item.input_audio_transcription.completed":
              if (event.transcript) {
                console.log("Transcribed text:", event.transcript);
                
                // Simple filter to reject very short or non-English looking transcriptions
                const transcript = event.transcript.trim();
                if (transcript.length > 2 && /^[a-zA-Z0-9\s.,!?'-]+$/.test(transcript)) {
                  onMessage(transcript, 'user');
                } else {
                  console.log("Rejected transcription (likely not English or too short):", transcript);
                }
              }
              break;
              
            case "response.created":
              console.log("Response started - initializing accumulation");
              // Initialize response state
              accumulatedTextRef.current = '';
              isResponseActiveRef.current = true;
              lastDeltaTimeRef.current = Date.now();
              
              // Clear any existing safety timeout
              if (safetyTimeoutRef.current) {
                clearTimeout(safetyTimeoutRef.current);
                safetyTimeoutRef.current = null;
              }
              break;
              
            case "response.audio_transcript.delta":
              if (event.delta) {
                console.log("Audio transcript delta:", event.delta);
                handleTextDelta(event.delta);
              }
              break;
              
            case "response.text.delta":
              if (event.delta) {
                console.log("Text delta:", event.delta);
                handleTextDelta(event.delta);
              }
              break;
              
            case "response.done":
              console.log("Response completed - flushing immediately");
              // Primary completion trigger - flush immediately
              flushAccumulatedText('response_done');
              break;
              
            case "response.output_item.done":
              console.log("Output item completed - flushing immediately");
              // Secondary completion trigger - flush immediately
              flushAccumulatedText('output_item_done');
              break;
              
            case "response.content_part.done":
              console.log("Content part completed - flushing immediately");
              // Another completion trigger
              flushAccumulatedText('content_part_done');
              break;
              
            case "error":
              console.error("OpenAI API error:", event.error);
              setState(prev => ({ ...prev, error: event.error.message || 'API error occurred' }));
              // Flush any pending text on error
              flushAccumulatedText('error');
              break;
          }
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      });
      
      dc.addEventListener("error", (error) => {
        console.error("Data channel error:", error);
        setState(prev => ({ ...prev, error: 'Data channel error occurred' }));
      });
      
      // Create offer and set local description
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      // Send offer to OpenAI Realtime API
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp",
        },
      });
      
      if (!sdpResponse.ok) {
        throw new Error(`SDP exchange failed: ${sdpResponse.status} ${sdpResponse.statusText}`);
      }
      
      const answer = {
        type: "answer" as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      
      await pc.setRemoteDescription(answer);
      console.log('WebRTC connection established with OpenAI');
      
      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log("Connection state:", pc.connectionState);
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          setState(prev => ({ ...prev, error: 'Connection failed', isConnected: false }));
        }
      };
      
    } catch (error) {
      console.error('WebRTC setup error:', error);
      setState(prev => ({ 
        ...prev, 
        error: `Failed to setup connection: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isProcessing: false 
      }));
    }
  }, [onMessage, systemPrompt, handleTextDelta, flushAccumulatedText]);
  
  // Send event to OpenAI
  const sendEvent = useCallback((event: any) => {
    if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      event.event_id = event.event_id || crypto.randomUUID();
      dataChannelRef.current.send(JSON.stringify(event));
      console.log("Sent event:", event.type);
      return true;
    }
    return false;
  }, []);
  
  // Send text message
  const sendTextMessage = useCallback((message: string) => {
    const event = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: message,
          },
        ],
      },
    };
    
    if (sendEvent(event)) {
      sendEvent({ type: "response.create" });
    }
  }, [sendEvent]);
  
  // Cleanup function
  const cleanup = useCallback(() => {
    // Clear any pending text accumulation
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
    accumulatedTextRef.current = '';
    isResponseActiveRef.current = false;
    lastDeltaTimeRef.current = 0;
    
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    
    if (peerConnectionRef.current) {
      // Stop all tracks
      peerConnectionRef.current.getSenders().forEach((sender) => {
        if (sender.track) {
          sender.track.stop();
        }
      });
      
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null;
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
    if (!peerConnectionRef.current) return;
    
    const newMicState = !state.isMicActive;
    
    peerConnectionRef.current.getSenders().forEach(sender => {
      if (sender.track && sender.track.kind === 'audio') {
        sender.track.enabled = newMicState;
      }
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