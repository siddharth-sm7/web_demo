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
      <div className="flex flex-col h-full w-full bg-white p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800">I'm LangPal!</h1>
          <button 
            onClick={onToggleSound}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label={isSoundEnabled ? "Mute sound" : "Enable sound"}
          >
            {isSoundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>
        </div>
        
        <p className="text-lg text-gray-600 mb-8">
          Hello! I'm LangPal, your friend. I'm always bubbling with enthusiasm to learn, play, and join you on imaginative adventures. Let's embark on some fun together!
        </p>
        
        {demoMode && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-8">
            <p className="font-bold">Demo Mode Active</p>
            <p>
              This is a demonstration of LangPal. You can type messages to simulate 
              a conversation with the teddy bear.
            </p>
          </div>
        )}
        
        <div className="mt-auto">
          <button
            onClick={onStartConversation}
            disabled={isProcessing}
            className="w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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
  
  // Conversation state when connected
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