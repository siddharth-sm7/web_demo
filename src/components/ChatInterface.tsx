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
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Handle window resize and initial mobile detection
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Set initial value
    checkIsMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);
  
  // Scroll to bottom when messages change
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
    // In a real app, this would toggle speech recognition
  };
  
  // Initial welcome state when not connected
  if (!isConnected) {
    return (
      <div className="flex flex-col h-full w-full bg-white relative">
        {/* Main content area */}
        <div className={`flex flex-col p-4 md:p-6 ${isMobile ? 'pb-20' : ''}`}>
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-800">I'm LangPal!</h1>
            <button 
              onClick={onToggleSound}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label={isSoundEnabled ? "Mute sound" : "Enable sound"}
            >
              {isMobile ? 
                (isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />) :
                (isSoundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />)
              }
            </button>
          </div>
          
          <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8">
            Hello! I'm LangPal, your friend. I'm always bubbling with enthusiasm to learn, play, and join you on imaginative adventures. Let's embark on some fun together!
          </p>
          
          {demoMode && (
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-3 md:p-4 mb-6 md:mb-8">
              <p className="font-bold text-sm md:text-base">Demo Mode Active</p>
              <p className="text-xs md:text-sm">
                This is a demonstration of LangPal. You can type messages to simulate 
                a conversation with the teddy bear.
              </p>
            </div>
          )}
        </div>
        
        {/* Sticky button for mobile, normal positioning for desktop */}
        <div className={`${
          isMobile 
            ? 'fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg' 
            : 'mt-auto p-4 md:p-6'
        }`}>
          <button
            onClick={onStartConversation}
            disabled={isProcessing}
            className="w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm md:text-base"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
  
  // Mobile: Use strict height management with sticky button, Desktop: Use original flex layout
  if (isMobile) {
    // Mobile layout with strict height control and sticky button
    const headerHeight = '48px';
    const buttonHeight = '68px'; // Increased to account for padding
    const inputHeight = demoMode ? '56px' : '0px';
    const availableHeight = `calc(100% - ${headerHeight} - ${buttonHeight} - ${inputHeight})`;
    
    return (
      <div className="w-full h-full flex flex-col relative" style={{ maxHeight: '100%', overflow: 'hidden' }}>
        {/* Header - Fixed height */}
        <div 
          className="border-b border-gray-200 px-3 py-2 flex justify-between items-center bg-white"
          style={{ height: headerHeight, minHeight: headerHeight, maxHeight: headerHeight }}
        >
          <h2 className="text-base font-semibold text-gray-800">LangPal Chat</h2>
          <div className="flex items-center space-x-2">
            {demoMode && (
              <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Demo</span>
            )}
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              robotState === 'listening' ? 'bg-green-100 text-green-800' :
              robotState === 'speaking' ? 'bg-blue-100 text-blue-800' :
              robotState === 'thinking' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {robotState === 'listening' ? 'Listening' :
               robotState === 'speaking' ? 'Speaking' :
               robotState === 'thinking' ? 'Thinking' : 'Idle'}
            </span>
            <button 
              onClick={onToggleSound}
              className="p-1 rounded bg-gray-100 hover:bg-gray-200"
            >
              {isSoundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
          </div>
        </div>
        
        {/* Messages area - Calculated height with scrolling */}
        <div 
          className="px-3 py-2 overflow-y-auto"
          style={{ height: availableHeight, maxHeight: availableHeight }}
        >
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-4">
              {demoMode ? "Type a message below!" : "Start talking to LangPal!"}
            </div>
          ) : (
            <div className="space-y-2 pb-4">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg px-2 py-1 ${
                      message.sender === 'user' 
                        ? 'bg-blue-100 text-blue-900' 
                        : 'bg-red-100 text-red-900'
                    }`}
                  >
                    <p className="text-xs leading-relaxed">{message.text}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-2 py-1">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Input area for demo mode - Fixed height */}
        {demoMode && onMessageSubmit && (
          <div 
            className="border-t border-gray-200 p-2 bg-white"
            style={{ height: inputHeight, minHeight: inputHeight, maxHeight: inputHeight }}
          >
            <form onSubmit={handleSubmit} className="flex items-center space-x-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type message..."
                className="flex-1 p-1.5 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-red-300"
                style={{ height: '32px' }}
              />
              <button
                type="submit"
                className="bg-red-500 text-white p-1.5 rounded hover:bg-red-600 transition-colors"
                disabled={!inputText.trim()}
                style={{ height: '32px', width: '32px' }}
              >
                <Send size={12} />
              </button>
              <button
                type="button"
                onClick={toggleListening}
                className={`p-1.5 rounded transition-colors ${
                  isListening 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                style={{ height: '32px', width: '32px' }}
              >
                {isListening ? <Mic size={12} /> : <MicOff size={12} />}
              </button>
            </form>
          </div>
        )}
        
        {/* Sticky End button for mobile */}
        <div 
          className="fixed bottom-0 left-0 right-0 border-t border-gray-200 p-3 bg-white shadow-lg"
          style={{ height: buttonHeight, minHeight: buttonHeight, maxHeight: buttonHeight }}
        >
          <button
            onClick={onEndConversation}
            className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors text-sm"
            style={{ height: '32px' }}
          >
            End Conversation
          </button>
        </div>
      </div>
    );
  }
  
  // Desktop: Original layout with flexible heights
  return (
    <div className="flex flex-col h-full w-full bg-white">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800">Conversation with LangPal</h2>
        <div className="flex items-center">
          {demoMode && (
            <span className="mr-3 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Demo Mode</span>
          )}
          <div className="mr-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              robotState === 'listening' ? 'bg-green-100 text-green-800' :
              robotState === 'speaking' ? 'bg-blue-100 text-blue-800' :
              robotState === 'thinking' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {robotState === 'listening' ? 'Listening' :
               robotState === 'speaking' ? 'Speaking' :
               robotState === 'thinking' ? 'Thinking' : 'Idle'}
            </span>
          </div>
          <button 
            onClick={onToggleSound}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label={isSoundEnabled ? "Mute sound" : "Enable sound"}
          >
            {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </div>
      
      {/* Chat messages container */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 my-8">
            {demoMode ? "Type a message below to chat with LangPal!" : "Start talking to LangPal!"}
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id}
              className={`flex w-full ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.sender === 'user' 
                    ? 'bg-blue-100 text-blue-900' 
                    : 'bg-red-100 text-red-900'
                }`}
              >
                <p>{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        
        {isProcessing && (
          <div className="flex justify-start items-center w-full">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Always have a div at the bottom for scrolling */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area for demo mode */}
      {demoMode && onMessageSubmit && (
        <form onSubmit={handleSubmit} className="p-4 border-t flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-red-300"
          />
          <button
            type="submit"
            className="bg-red-500 text-white p-2 rounded-r-lg hover:bg-red-600 transition-colors"
            disabled={!inputText.trim()}
          >
            <Send size={20} />
          </button>
          <button
            type="button"
            onClick={toggleListening}
            className={`ml-2 p-2 rounded-lg transition-colors ${
              isListening 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isListening ? <Mic size={20} /> : <MicOff size={20} />}
          </button>
        </form>
      )}
      
      {/* End conversation button */}
      <div className="p-4 border-t">
        <button
          onClick={onEndConversation}
          className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
        >
          End Conversation
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
