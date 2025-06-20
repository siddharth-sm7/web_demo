import React, { useState, useRef, useEffect } from 'react';
import { Message, RobotState } from '../types';
import { VolumeX, Volume2, Send, Mic, MicOff } from 'lucide-react';

interface ChatInterfaceProps {
  messages: Message[];
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  isConnected: boolean;
  isProcessing: boolean;
  onStartConversation: () => void;
  onEndConversation: () => void;
  onMessageSubmit?: (message: string) => void;
  demoMode?: boolean;
  robotState?: RobotState;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isSoundEnabled,
  onToggleSound,
  isConnected,
  isProcessing,
  onStartConversation,
  onEndConversation,
  onMessageSubmit,
  demoMode = false,
  robotState = 'idle',
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onMessageSubmit && inputText.trim()) {
      onMessageSubmit(inputText);
      setInputText('');
    }
  };
  
  const toggleListening = () => {
    setIsListening(prev => !prev);
  };
  
  // Helper function to get state styling
  const getStateStyles = (state: RobotState) => {
    switch (state) {
      case 'listening':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'speaking':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'thinking':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getStateText = (state: RobotState) => {
    switch (state) {
      case 'listening':
        return 'Listening';
      case 'speaking':
        return 'Speaking';
      case 'thinking':
        return 'Thinking';
      default:
        return 'Idle';
    }
  };
  
  // Initial welcome state when not connected
  if (!isConnected) {
    return (
      <div className="flex flex-col h-full w-full bg-white relative">
        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-200">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">I'm Teddy!</h1>
          <button 
            onClick={onToggleSound}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label={isSoundEnabled ? "Mute sound" : "Enable sound"}
          >
            {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
        
        {/* Content - Add bottom padding to prevent overlap with sticky button */}
        <div className="flex-1 flex flex-col justify-center p-4 md:p-6 space-y-6 pb-24">
          <div className="text-center">
            <p className="text-base md:text-lg text-gray-600 mb-6">
              Hello! I'm Teddy, your friend. I'm always bubbling with enthusiasm to learn, play, and join you on imaginative adventures. Let's embark on some fun together!
            </p>
            
            {demoMode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="font-semibold text-blue-800 mb-2">Demo Mode Active</p>
                <p className="text-sm text-blue-700">
                  This is a demonstration of Teddy. You can type messages to simulate 
                  a conversation with the teddy bear.
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Sticky Start button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <button
            onClick={onStartConversation}
            disabled={isProcessing}
            className="w-full py-3 px-4 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow transition-colors"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </span>
            ) : "Start Conversation"}
          </button>
        </div>
      </div>
    );
  }
  
  // Connected state - Chat interface
  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 p-3 md:p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">
            Conversation with Teddy
          </h2>
          <div className="flex items-center space-x-2 md:space-x-3">
            {demoMode && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Demo
              </span>
            )}
            <span className={`text-xs px-2 py-1 rounded-full border ${getStateStyles(robotState)}`}>
              {getStateText(robotState)}
            </span>
            <button 
              onClick={onToggleSound}
              className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label={isSoundEnabled ? "Mute sound" : "Enable sound"}
            >
              {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Messages Area - This is the key scrollable section */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 md:p-4"
        style={{ 
          minHeight: 0, // Critical for flex child to be scrollable
          maxHeight: '100%' 
        }}
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500 max-w-sm">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-sm md:text-base">
                {demoMode ? "Type a message below to chat with Teddy!" : "Start talking to Teddy!"}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`flex w-full ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] md:max-w-[80%] rounded-lg px-3 py-2 md:px-4 md:py-3 ${
                    message.sender === 'user' 
                      ? 'bg-blue-100 text-blue-900 border border-blue-200' 
                      : 'bg-red-50 text-red-900 border border-red-200'
                  }`}
                >
                  <p className="text-sm md:text-base leading-relaxed break-words">
                    {message.text}
                  </p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Processing indicator */}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 md:px-4 md:py-3">
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <span className="text-xs text-gray-600 ml-2">Teddy is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Input Area (Demo Mode Only) */}
      {demoMode && onMessageSubmit && (
        <div className="flex-shrink-0 border-t border-gray-200 p-3 md:p-4 bg-gray-50">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message here..."
                className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-lg transition-colors ${
                isListening 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title={isListening ? "Stop listening" : "Start listening"}
            >
              {isListening ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
          </form>
        </div>
      )}
      
      {/* End Conversation Button */}
      <div className="flex-shrink-0 p-3 md:p-4 border-t border-gray-200">
        <button
          onClick={onEndConversation}
          className="w-full py-2.5 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
        >
          End Conversation
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
