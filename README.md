# LangPal Interactive Demo

This is an interactive demo for "LangPal", an AI language learning robot toy that uses OpenAI's realtime API with WebRTC.

## Project Structure

The project is split into two main components:

1. **Frontend**: React application for the user interface
2. **Backend**: Node.js server to handle realtime processing and API authentication

## Features

- Split-screen layout with LangPal visualization and interactive content
- Real-time voice interaction with visual feedback
- Conversation transcription for monitoring
- Simple, intuitive controls suitable for young children
- Responsive design that works across devices

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```
4. Start the development server:
   ```
   npm run dev
   ```
5. In a separate terminal, start the backend server:
   ```
   npm run server
   ```

## Usage

1. Open the application in your browser
2. Click the "Start Conversation" button
3. Grant microphone permissions when prompted
4. Start talking to LangPal!

## Technologies Used

- React
- WebRTC (simple-peer)
- Socket.IO
- Express
- TailwindCSS
- OpenAI API

## License

This project is for demonstration purposes only.