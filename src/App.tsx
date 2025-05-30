import React, { useEffect, useState, useRef } from 'react';
import { useConversation } from './hooks/useConversation';
import { useWebRTC } from './hooks/useWebRTC';
import ChatInterface from './components/ChatInterface';
import { simulateResponse } from './utils/mockDataHandler';
import StatePopup from './components/StatePopup';

// Default system prompt for the teddy bear with explicit English instruction
const DEFAULT_SYSTEM_PROMPT = 
  "You are LangPal, a friendly AI teddy bear designed to help children learn languages. " +
  "Keep your responses simple, encouraging, and suitable for young learners. " +
  "Focus on basic vocabulary, simple phrases, and gentle pronunciation guidance. " +
  "Be patient, enthusiastic, and always maintain a positive, supportive tone. " +
  "Respond with short, clear sentences that are easy for children to understand. " +
  "Always respond in English and assume the user is speaking English unless they specifically ask to practice another language. " +
  "If you hear unclear audio, ask the user to repeat their question in English.";

// Backend server URL configuration
const getBackendUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:10000';
  }
  // Replace with your actual Render service URL
  return 'https://web-demo-daja.onrender.com'; // UPDATE THIS!
};

function App() {
  const [demoMode, setDemoMode] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const imageRef = useRef<HTMLImageElement>(null);
  
  const {
    messages,
    robotState,
    isSoundEnabled,
    addMessage,
    clearMessages,
    toggleSound,
    setRobotState
  } = useConversation();
  
  const [webrtcState, webrtcActions] = useWebRTC(
    (text, sender) => {
      addMessage(text, sender);
      
      // Update robot state based on message
      if (sender === 'user') {
        setRobotState('thinking');
        setTimeout(() => setRobotState('listening'), 1000);
      } else if (sender === 'langpal') {
        setRobotState('speaking');
        setTimeout(() => setRobotState('listening'), 2000);
      }
      
      // In demo mode, generate a response to user messages
      if (demoMode && sender === 'user') {
        setRobotState('thinking');
        simulateResponse(text, (response) => {
          setRobotState('speaking');
          addMessage(response, 'langpal');
          setTimeout(() => setRobotState('listening'), 500);
        });
      }
    },
    DEFAULT_SYSTEM_PROMPT
  );
  
  // Determine if we're connected by either demo mode or WebRTC
  const isConnected = demoMode || webrtcState.isConnected;
  
  // Check server status on load
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const backendUrl = getBackendUrl();
        console.log('Checking server status at:', backendUrl);
        
        const response = await fetch(`${backendUrl}/api/status`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Server status response:', data);
          setServerStatus('online');
        } else {
          console.log('Server status check failed:', response.status);
          setServerStatus('offline');
          setDemoMode(true);
        }
      } catch (error) {
        console.log('Server appears to be offline, enabling demo mode:', error);
        setServerStatus('offline');
        setDemoMode(true);
      }
    };
    
    checkServerStatus();
  }, []);
  
  const handleStartConversation = () => {
    clearMessages();
    setRobotState('listening');
    
    if (demoMode) {
      // In demo mode, generate a welcome message
      setTimeout(() => {
        setRobotState('speaking');
        addMessage("Hi there! I'm LangPal, your friendly teddy bear language tutor! What language would you like to practice today?", 'langpal');
        setTimeout(() => setRobotState('listening'), 1000);
      }, 1500);
    } else {
      // Use WebRTC in normal mode
      webrtcActions.startConversation();
    }
  };
  
  const handleEndConversation = () => {
    if (!demoMode) {
      webrtcActions.endConversation();
    }
    setRobotState('idle');
  };
  
  // Handle message submission for demo mode (when user types messages)
  const handleMessageSubmit = (message: string) => {
    if (message.trim()) {
      addMessage(message, 'user');
      
      if (demoMode) {
        setRobotState('thinking');
        simulateResponse(message, (response) => {
          setRobotState('speaking');
          addMessage(response, 'langpal');
          setTimeout(() => setRobotState('listening'), 500);
        });
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Server status indicator */}
      {serverStatus === 'checking' && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4">
          <div className="flex">
            <div className="py-1">
              <svg className="animate-spin h-6 w-6 text-blue-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div>
              <p className="font-bold">Connecting to Server</p>
              <p className="text-sm">Checking backend server status...</p>
            </div>
          </div>
        </div>
      )}
      
      {serverStatus === 'offline' && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
          <div className="flex">
            <div className="py-1">
              <svg className="h-6 w-6 text-yellow-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="font-bold">Demo Mode Active</p>
              <p className="text-sm">Backend server is not available. Running in demo mode with simulated responses.</p>
            </div>
          </div>
        </div>
      )}
      
      {serverStatus === 'online' && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
          <div className="flex">
            <div className="py-1">
              <svg className="h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-bold">Server Connected</p>
              <p className="text-sm">Backend server is online and ready for voice interaction.</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left panel - Image */}
        <div className="w-full md:w-1/2 h-full flex items-center justify-center bg-white p-8 relative">
          <img 
            ref={imageRef}
            src="/images/teddy.png" 
            alt="LangPal Teddy"
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              // Fallback to a placeholder if image doesn't exist
              e.currentTarget.style.display = 'none';
              const placeholder = document.createElement('div');
              placeholder.className = 'w-64 h-64 bg-amber-200 rounded-3xl flex items-center justify-center';
              placeholder.innerHTML = '<div class="text-6xl">🧸</div>';
              e.currentTarget.parentElement!.appendChild(placeholder);
            }}
          />
          
          {/* State popup positioned near teddy bear's right ear */}
          {isConnected && (
            <div className="absolute top-32 right-16 md:top-24 md:right-20">
              <StatePopup state={robotState} />
            </div>
          )}
        </div>
        
        {/* Right panel - Chat interface */}
        <div className="w-full md:w-1/2 h-full">
          <ChatInterface
            messages={messages}
            isSoundEnabled={isSoundEnabled}
            onToggleSound={toggleSound}
            isConnected={isConnected}
            isProcessing={webrtcState.isProcessing}
            onStartConversation={handleStartConversation}
            onEndConversation={handleEndConversation}
            onMessageSubmit={handleMessageSubmit}
            demoMode={demoMode}
            robotState={robotState}
          />
        </div>
      </div>
      
      {/* Error notification */}
      {webrtcState.error && !demoMode && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg max-w-md text-center">
          <p className="font-medium">Connection Error</p>
          <p className="text-sm">{webrtcState.error}</p>
        </div>
      )}
    </div>
  );
}

export default App;