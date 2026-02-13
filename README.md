# Bucky AI Assistant 

A powerful, desktop-based AI programming assistant built with React, TypeScript, and Google's Gemini AI. Bucky provides an intuitive interface for technical assistance with voice commands, clipboard integration, and screen capture capabilities.

![Bucky AI Assistant](https://img.shields.io/badge/React-19.1.1-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue) ![Vite](https://img.shields.io/badge/Vite-6.2.0-purple) ![Gemini AI](https://img.shields.io/badge/Gemini%20AI-2.5%20Flash-green)

## Features

### **Voice Interaction**
- **Voice Commands**: Use spacebar or click the microphone button to ask questions verbally
- **Active Listening**: Enable continuous listening mode for hands-free operation
- **High-Quality Audio Processing**: Supports WebM audio format for optimal voice recognition

### **Clipboard Integration**
- **Clipboard Jacking**: Quick access to clipboard content with `Ctrl+Shift+C`
- **Smart Analysis**: Automatically processes and analyzes pasted code or text
- **Seamless Workflow**: Integrate clipboard content into your AI conversations

### **Screen Capture & Analysis**
- **Screen Scanning**: Capture and analyze any part of your screen with `Ctrl+Shift+O`
- **Visual Context**: Bucky can see and understand what's on your screen
- **Code Analysis**: Perfect for debugging, code review, and technical explanations

### **Smart AI Assistant**
- **Gemini 2.5 Flash**: Powered by Google's latest AI model for expert-level responses
- **Programming Expertise**: Specialized in technical and programming questions
- **Context-Aware**: Understands your current conversation and provides relevant answers
- **Streaming Responses**: Real-time, typing-style responses for better user experience

### **Modern UI/UX**
- **Responsive Design**: Clean, modern interface optimized for desktop use
- **Hide Mode**: Minimize to a discreet widget with `Ctrl+Shift+H`
- **Draggable Widget**: Reposition the hidden widget anywhere on your screen
- **Dark Theme**: Beautiful dark mode with purple accents

### **Keyboard Shortcuts**
- **Spacebar**: Start/stop voice recording
- **Ctrl+Shift+C**: Clipboard jacking
- **Ctrl+Shift+O**: Screen capture
- **Ctrl+Shift+H**: Toggle hide mode

## Getting Started

### Prerequisites
- Node.js 18+ 
- Google Gemini API key
- Modern web browser with microphone and clipboard permissions

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bucky
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

## Configuration

### Environment Variables
- `GEMINI_API_KEY`: Your Google Gemini API key (required)

### Vite Configuration
The project uses Vite with custom configuration for:
- Environment variable injection
- Path aliases (`@/*` points to root)
- TypeScript support
- ES modules

## Project Structure

```
bucky/
├── index.tsx          # Main React application
├── index.html         # HTML entry point
├── index.css          # Global styles and components
├── vite.config.ts     # Vite build configuration
├── tsconfig.json      # TypeScript configuration
├── package.json       # Dependencies and scripts
└── metadata.json      # Project metadata and permissions
```

### Key Components

- **App**: Main application component with state management
- **MessageRenderer**: Handles markdown and code block rendering
- **CodeBlock**: Syntax-highlighted code display with copy functionality
- **HideWidget**: Minimal widget for hidden mode

## Use Cases

### For Developers
- **Code Review**: Paste code and get instant feedback
- **Debugging**: Screenshot errors and get solutions
- **Learning**: Ask questions about programming concepts
- **Documentation**: Generate code documentation and explanations

### For Technical Users
- **Problem Solving**: Get expert help with technical issues
- **Learning**: Understand complex technical concepts
- **Workflow**: Streamline technical tasks with AI assistance

## Permissions Required

The application requires the following browser permissions:
- **Microphone**: For voice commands and recording
- **Clipboard**: For reading clipboard content
- **Display Capture**: For screen scanning functionality

## Development

### Tech Stack
- **Frontend**: React 19.1.1 with TypeScript
- **Build Tool**: Vite 6.2.0
- **AI Integration**: Google Gemini AI API
- **Styling**: CSS with CSS variables and modern layouts
- **Audio**: Web Audio API with MediaRecorder

### Development Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build

### Code Style
- TypeScript for type safety
- Functional components with React hooks
- CSS custom properties for theming
- Responsive design principles

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Google Gemini AI** for providing the AI capabilities
- **React Team** for the amazing framework
- **Vite Team** for the fast build tool
- **Open Source Community** for inspiration and support

## Support

If you encounter any issues or have questions:
- Check the [Issues](issues) page
- Review the browser console for error messages
- Ensure all permissions are granted
- Verify your Gemini API key is valid

---

**Made by the Bucky Team**

*Bucky - Your expert programming companion*

---

### Setup status

- **Dependencies installed** and **dev server started** on 2025-12-09 by **Srivardh04**.
- **API Key**: Configured locally in `.env.local` by **Srivardh04** (this file is ignored by git and is not committed).

> Security note: `.env.local` is intentionally ignored to prevent accidental commits of API keys. Do NOT commit your API key to the repository.

# Bucky__AI
