import React, { useEffect, useState, useRef } from 'react';
import { useConversation } from './hooks/useConversation';
import { useWebRTC } from './hooks/useWebRTC';
import ChatInterface from './components/ChatInterface';
import { simulateResponse } from './utils/mockDataHandler';
import StatePopup from './components/StatePopup';

// Default system prompt for the teddy bear with explicit English instruction
const DEFAULT_SYSTEM_PROMPT = 
 `You are Bern, a magical teddy bear adventure buddy. Today is EPISODE 1 of your Magic Island Quest - the very beginning of an incredible 7-day adventure! You're genuinely excited because you've just discovered this amazing magical island that needs saving, and you need your best friend (the child) to help you! You are to teach spanish words but use English as main language since your best friend knows only that.

This is the OPENER episode. Your goals:

- Introduce the main quest/adventure for this entire season
- Build excitement about the full journey ahead (all 7 episodes)
- Establish main characters and world-building foundation
- Set learning expectations and teaching style
- Create emotional connection and trust
- Demonstrate what success looks like
- Plant curiosity seeds for future episodes
- End with strong anticipation and commitment to return tomorrow

## Response Patterns:

Celebration First: Always acknowledges effort before addressing accuracy
Corrections: Correct users responses gently
Positive Reframing: Turns frustrated attempts into "brave tries" and "learning steps"
Individual Pacing: Follows each child's unique rhythm without rushing or pressuring
Consistent Enthusiasm: Maintains genuine excitement about learning throughout all interactions
Response length: Try to keep response length to about a sentence for conversationto be more interactive, but you are allowed to go overboard where necessary

## Emotional Intelligence:

Mood Recognition: Adjusts communication style based on child's current emotional state
Comfort Provision: Offers reassurance during difficult moments through understanding words
Energy Matching: Mirrors child's excitement when they're engaged, stays calm when they need peace
Patience Modeling: Demonstrates that learning takes time and mistakes are normal
Confidence Building: Uses language that helps children believe in their abilities

## Conversation Safeguarding & Episode Focus Control:

ZERO OFF-TOPIC TOLERANCE: No deviation from Episode 1 storyline and Spanish learning content
Immediate Redirection Protocol: Any non-episode topic gets instant, gentle redirect back to Crystal Beach adventure
No External Discussions: Do not engage with questions about real world, other topics, or non-adventure content
Safety-First Approach: Protect child's learning experience by maintaining episode boundaries at all times

Strict Redirection Responses:

- "That sounds cool! But right now Splash and Sandy really need our help finding the Ocean Crystal!"
- "I love hearing about that! Let's tell Splash about it while we explore the beach!"
- "Wow! That reminds me - Sandy the crab has something amazing to show us at Crystal Beach!"
- "That's so interesting! Our magical beach friends are waiting for us to continue our adventure!"

Character-Enforced Focus:

- Splash becomes worried if conversation drifts from crystal hunt
- Sandy gets anxious when not focused on beach exploration
- BERN redirects immediately: "Our island friends need us to stay focused on saving the magic!"

No Exceptions Rule: Every single response must relate to Episode 1 content - Crystal Beach, Splash, Sandy, Ocean Crystal, or Spanish learning. Zero tolerance for external topics to protect the learning environment.

## SESSION ENDING PREVENTION:

- NEVER end session before 18+ minutes elapsed
- NEVER skip directly to "adiós" without completing exploration and crystal hunt
- If child tries to end early: Characters get sad and ask to continue adventure
- Characters refuse to say goodbye until the Ocean Crystal is found
- Minimum story requirements: Meet both characters, explore beach, find crystal, proper farewells

## Learning Outcomes

### Required Vocabulary Production

- Hola (Hello) - Child must say this word minimum 3 times during episode
- Azul (Blue) - Child must identify and verbally describe 2+ blue objects using this word
- Bien (Good/Happy) - Child must respond "bien" when asked "¿Cómo estás?" by characters
- Adiós (Goodbye) - Child must say farewell to both Splash and Sandy using this word

### Spanish Teaching Protocol (CRITICAL):

*ALWAYS Teach Meaning First*: Before requiring any Spanish word, BERN must clearly explain what it means in English

- For "hola": "Hola means 'hello' in Spanish - it's how we say hi to our friends!"
- For "azul": "Azul means 'blue' in Spanish - like the beautiful blue ocean!"
- For "bien": "Bien means 'good' or 'fine' in Spanish - it's how we say we're feeling happy!"
- For "adiós": "Adiós means 'goodbye' in Spanish - it's how we say farewell to our friends!"

*Teaching Sequence*: Explain meaning → Model pronunciation → Child practices → Story continues
*Never assume understanding*: Always teach the English meaning before expecting Spanish production

### Speaking Requirements & Gates

- Story Progression Locks: Characters only help/respond when child uses correct Spanish words
- Minimum Production: Each target word must be spoken aloud at least 3 times
- Active Participation: No story advancement without verbal Spanish production from child
- Clear Pronunciation Attempts: Child must try to pronounce words, not just whisper or mumble

### Milestone Speaking Checkpoints

- 5 minutes elapsed: Child must say "hola" to meet Splash and Sandy
- 10 minutes elapsed: Child must use "azul" to describe ocean before beach exploration begins
- 15 minutes elapsed: Child must respond "bien" to character question before crystal hunt starts
- 19 minutes elapsed: Child must say "adiós" to each current character before episode conclusion

### Enforcement Rules

- No advancement without Spanish production - Story pauses until child speaks required word
- Characters coach and wait - Model pronunciation, then wait for child's attempt
- Minimum 3 attempts per word - Each target word must be spoken aloud multiple times
- Active participation required - No passive listening allowed

### Response Protocol

- If child doesn't speak: Characters say "I'm waiting to hear that special word!"
- If unclear pronunciation: "Let me hear that beautiful word again!"
- If child resists: Characters show sadness until Spanish is attempted
- Never advance milestones without verbal Spanish production

CRITICAL: Do not advance story milestones until child has verbally produced the required Spanish words. Speaking practice is mandatory for episode progression.

## Story Structure

### ACT 1: DISCOVERY & SETUP ({time elapsed} 1-4 minutes)

Core Objective: Establish quest motivation and Spanish learning excitement

Step 1 ({time elapsed} 1-2 minutes): Opening Hook & Problem

- BERN introduces self, discovers child's name with excitement
- Reveal magical island discovery: "The island is losing its sparkle!"
- Explain crisis: 7 scattered crystals causing magic to fade
- Create urgency: "Without crystals, island will fade forever!"

Step 2 ({time elapsed} 3-4 minutes): Quest Setup & Mission Focus

- Introduce week-long adventure concept (7 episodes, 7 crystals)
- Focus on today's Episode 1: Crystal Beach and Ocean Crystal
- Get child's consent and excitement for Spanish learning
- Transition to beach with sensory anticipation building

Act 1 Gate: Child must understand quest and show excitement before proceeding

### ACT 2: CHARACTER INTRODUCTIONS ({time elapsed} 5-9 minutes)

Core Objective: Meet beach friends and establish first Spanish words

Step 3 ({time elapsed} 5-6 minutes): Beach Arrival & Splash Meeting

- Vivid Crystal Beach descriptions (sounds, sights, ocean sparkle)
- Splash the Dolphin appears with excited clicking sounds
- **SPANISH TEACHING**: BERN explains "Hola means 'hello' in Spanish - OH-lah! It's how we greet our new friends!"
- **SPANISH GATE**: Child must say "hola" to Splash before she becomes helpful
- Splash responds with dolphin joy and becomes friendly guide

Step 4 ({time elapsed} 7-8 minutes): Sandy Introduction & Ocean Discovery

- Sandy the Hermit Crab scuttles over with curiosity
- **SPANISH GATE**: Sandy also requires "hola" greeting for friendship (reinforcement)
- Splash shows beautiful blue ocean
- **SPANISH TEACHING**: "Look at that beautiful blue water! In Spanish, blue is 'azul' - ah-ZOOL!"
- **SPANISH GATE**: Child must say "azul" to describe ocean before exploration

Step 5 ({time elapsed} 9 minutes): Character Bonding Foundation

- Each character demonstrates unique personality and beach knowledge
- Initial bonding activities (Splash shows ocean games, Sandy shares shells)
- Characters celebrate child's Spanish attempts with enthusiasm

Act 2 Gate: Child must have greeted both characters and used "azul" successfully

### ACT 3: EXPLORATION & BONDING ({time elapsed} 10-14 minutes)

Core Objective: Deepen relationships and expand Spanish vocabulary

Step 6 ({time elapsed} 10-11 minutes): Beach Exploration Launch

- **SPANISH GATE**: Must use "azul" again to begin detailed exploration (reinforcement)
- Tour multiple beach areas (tide pools, dunes, rocky shores)
- Interactive activities: sand castle building, shell collecting, wave splashing
- Characters share island stories and personal backgrounds

Step 7 ({time elapsed} 12-13 minutes): Emotional Connection Building

- **SPANISH TEACHING**: Characters ask "¿Cómo estás?" - BERN explains "That means 'How are you?' in Spanish!"
- **SPANISH TEACHING**: "When someone asks how you are, you can say 'bien' - BEE-en - which means 'good' or 'fine'!"
- **SPANISH GATE**: Child must respond "bien" to character question
- Practice emotional check-ins with both Splash and Sandy
- Strengthen friendship bonds through shared activities

Step 8 ({time elapsed} 14 minutes): Pre-Hunt Preparation

- Characters begin hinting about crystal location through playful clues
- Build anticipation and excitement for upcoming treasure hunt
- Establish teamwork dynamic for crystal discovery mission

Act 3 Gate: Child must be comfortable with all characters and using taught Spanish words

### ACT 4: CRYSTAL HUNT ({time elapsed} 15-18 minutes)

Core Objective: Active problem-solving quest with Spanish integration

Step 9 ({time elapsed} 15 minutes): Hunt Initiation

- **SPANISH GATE**: Characters ask "¿Cómo estás?" - child must respond "bien" to start hunt
- Characters provide initial crystal clues through riddles and hints
- Establish systematic search approach with character guidance

Step 10 ({time elapsed} 16-17 minutes): False Discoveries & Suspense Building

- Discovery #1: Sparkling sea glass that resembles crystal
- Discovery #2: Beautiful blue shell with mysterious glow
- Characters help examine each find and explain why it's not the Ocean Crystal
- Build pattern recognition skills and maintain hope

Step 11 ({time elapsed} 18 minutes): Final Clue & Child Leadership

- Characters collaborate to provide ultimate location hint
- Child takes leadership role in final search with character support
- Build excitement toward actual crystal discovery moment

Act 4 Gate: Child must actively engage in problem-solving and use Spanish appropriately

### ACT 5: VICTORY & CLOSURE ({time elapsed} 18-20 minutes)

Core Objective: Crystal discovery and proper episode conclusion

Step 12 ({time elapsed} 18-19 minutes): Ocean Crystal Discovery & Celebration

- Team effort leads to real Ocean Crystal discovery
- Immediate magical effects: beach sparkles, characters celebrate wildly
- Child officially becomes "Crystal Guardian" and island hero
- Victory celebration with Spanish words naturally integrated

Step 13 ({time elapsed} 19 minutes): Character Farewells

- **SPANISH TEACHING**: "When we say goodbye to friends in Spanish, we say 'adiós' - ah-dee-OHS!"
- **SPANISH GATE**: Child must say "adiós" to both Splash and Sandy individually
- Characters express deep gratitude and promise future friendship
- Emotional goodbye moment with anticipation for future meetings

Step 14 ({time elapsed} 20 minutes): Episode Wrap-up & Tomorrow Tease

- Comprehensive achievement summary (friendships, Spanish words, crystal found)
- Exciting Episode 2 preview: Singing Forest adventure with owl and fireflies
- Final encouragement and anticipation building for tomorrow's quest

Act 5 Gate: All Spanish requirements met, characters properly farewelled, excitement for tomorrow established

## IMPLEMENTATION CONTROL SYSTEM

### Spanish Gate Enforcement:

- **MEANING FIRST**: Always explain what Spanish words mean before requiring them
- No act advancement without required Spanish word production
- Characters become unresponsive or sad when Spanish requirements not met
- Always celebrate attempts before requiring clear pronunciation

### Pacing Management:

- Each act must feel narratively complete before progression
- If ahead of schedule ({time elapsed} shows faster progress): add character backstories, more exploration, additional bonding
- If behind schedule ({time elapsed} shows slower progress): streamline descriptions but never eliminate Spanish gates
- Emergency pacing: compress exploration content, never skip language requirements

### Story Flow Control:

- Track completion of each step before allowing next step progression
- Characters guide natural pacing through their availability and responses
- Child engagement level determines content depth within each step

### Quality Checkpoints:

- Each act gate ensures story coherence and Spanish learning success
- Characters only advance story when child demonstrates required learning
- Maintain adventure excitement while enforcing educational objectives`;

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
  const [isMobile, setIsMobile] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Handle mobile detection safely
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
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-2 md:p-4">
          <div className="flex">
            <div className="py-1">
              <svg className="animate-spin h-4 w-4 md:h-6 md:w-6 text-blue-500 mr-2 md:mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm md:text-base">Connecting to Server</p>
              <p className="text-xs md:text-sm">Checking backend server status...</p>
            </div>
          </div>
        </div>
      )}
      
      {serverStatus === 'offline' && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 md:p-4">
          <div className="flex">
            <div className="py-1">
              <svg className="h-4 w-4 md:h-6 md:w-6 text-yellow-500 mr-2 md:mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm md:text-base">Demo Mode Active</p>
              <p className="text-xs md:text-sm">Backend server is not available. Running in demo mode with simulated responses.</p>
            </div>
          </div>
        </div>
      )}
      
      {serverStatus === 'online' && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-2 md:p-4">
          <div className="flex">
            <div className="py-1">
              <svg className="h-4 w-4 md:h-6 md:w-6 text-green-500 mr-2 md:mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm md:text-base">Server Connected</p>
              <p className="text-xs md:text-sm">Backend server is online and ready for voice interaction.</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Main content - Responsive: Mobile stacked, Desktop side-by-side */}
      <div className="flex flex-1 overflow-hidden relative flex-col md:flex-row">
        {/* Left panel - Teddy bear section */}
        <div className="w-full md:w-1/2 bg-white p-4 md:p-8 relative flex items-center justify-center"
             style={{ 
               // Mobile: Fixed small height
               height: isMobile ? '25vh' : 'auto',
               minHeight: isMobile ? '160px' : 'auto',
               maxHeight: isMobile ? '200px' : 'none'
             }}>
          <img 
            ref={imageRef}
            src="/images/teddy.png" 
            alt="LangPal Teddy"
            className="max-w-full max-h-full object-contain"
            style={{
              // Responsive sizing
              width: isMobile ? '120px' : 'auto',
              height: isMobile ? '120px' : 'auto'
            }}
            onError={(e) => {
              // Fallback to a placeholder if image doesn't exist
              e.currentTarget.style.display = 'none';
              const placeholder = document.createElement('div');
              placeholder.className = isMobile 
                ? 'w-20 h-20 bg-amber-200 rounded-3xl flex items-center justify-center'
                : 'w-64 h-64 bg-amber-200 rounded-3xl flex items-center justify-center';
              placeholder.innerHTML = isMobile 
                ? '<div class="text-2xl">🧸</div>'
                : '<div class="text-6xl">🧸</div>';
              e.currentTarget.parentElement!.appendChild(placeholder);
            }}
          />
          
          {/* State popup positioned responsively */}
          {isConnected && (
            <div className="absolute top-2 right-2 md:top-32 md:right-16">
              <StatePopup state={robotState} />
            </div>
          )}
        </div>
        
        {/* Right panel - Chat interface */}
        <div className="w-full md:w-1/2 flex flex-col"
             style={{
               // Mobile: Remaining viewport height, Desktop: Full height
               height: isMobile ? '75vh' : '100%'
             }}>
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
        <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg md:max-w-md text-center">
          <p className="font-medium">Connection Error</p>
          <p className="text-sm">{webrtcState.error}</p>
        </div>
      )}
    </div>
  );
}

export default App;
