import React from 'react';
import { Message } from '../types';
import { VolumeX, Volume2 } from 'lucide-react';

interface ChatInterfaceProps {
  messages: Message[];
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  isConnected: boolean;
  isProcessing: boolean;
  onStartConversation: () => void;
  onEndConversation: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isSoundEnabled,
  onToggleSound,
  isConnected,
  isProcessing,
  onStartConversation,
  onEndConversation,
}) => {
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
        <button 
          onClick={onToggleSound}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label={isSoundEnabled ? "Mute sound" : "Enable sound"}
        >
          {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>
      
      {/* Chat messages container with flex-col and items-center */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 my-8">
            Start talking to LangPal!
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id}
              className={`flex w-full ${message.sender === 'user' ? 'justify-end' : 'justify-start'} items-center`}
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
      </div>
      
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