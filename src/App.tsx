import React from 'react';
import { useConversation } from './hooks/useConversation';
import { useWebRTC } from './hooks/useWebRTC';
import ChatInterface from './components/ChatInterface';

function App() {
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
    },
    import.meta.env.VITE_SYSTEM_PROMPT
  );
  
  const handleStartConversation = () => {
    clearMessages();
    setRobotState('listening');
    webrtcActions.startConversation();
  };
  
  const handleEndConversation = () => {
    webrtcActions.endConversation();
    setRobotState('idle');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left panel - Image */}
      <div className="w-full md:w-1/2 h-full flex items-center justify-center bg-white p-8">
        <img 
          src="/images/teddy.png" 
          alt="LangPal Teddy"
          className="max-w-full max-h-full object-contain"
        />
      </div>
      
      {/* Right panel - Chat interface */}
      <div className="w-full md:w-1/2 h-full">
        <ChatInterface
          messages={messages}
          isSoundEnabled={isSoundEnabled}
          onToggleSound={toggleSound}
          isConnected={webrtcState.isConnected}
          isProcessing={webrtcState.isProcessing}
          onStartConversation={handleStartConversation}
          onEndConversation={handleEndConversation}
        />
      </div>
      
      {/* Error notification */}
      {webrtcState.error && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {webrtcState.error}
        </div>
      )}
    </div>
  );
}

export default App;