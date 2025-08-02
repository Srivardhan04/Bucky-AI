import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Chat } from '@google/genai';

// --- SVG Icons ---
const MicIcon = () => (<svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"></path></svg>);
const ClipboardIcon = () => (<svg viewBox="0 0 24 24"><path d="M19 2h-4.18C14.4.84 13.3 0 12 0S9.6.84 9.18 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z"></path></svg>);
const ScreenshotIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 17H3V5h18v12zM21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path></svg>);
const BuckyLogoIcon = () => (<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"></path></svg>);
const StopIcon = () => (<svg viewBox="0 0 24 24"><path d="M6 6h12v12H6z"></path></svg>);
const CopyIcon = () => (<svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path></svg>);
const SendIcon = () => (<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>);

// --- Helper Components ---

const CodeBlock = ({ code, language }: { code: string, language: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="code-block">
      <div className="code-header">
        <span>{language || 'Code'}</span>
        <button onClick={handleCopy} className="copy-btn">
          {copied ? 'Copied!' : <CopyIcon />}
        </button>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  );
};

const MessageRenderer = ({ text }: { text: string }) => {
    const hasCaret = text.endsWith('▋');
    const content = hasCaret ? text.slice(0, -1) : text;

    const parts = content.split(/(```[\s\S]*?```)/g);

    const formatSimpleMarkdown = (part: string) => {
        return part
            .replace(/\n/g, '<br />')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/`([^`]+)`/g, '<code>$1</code>');
    };

    return (
        <div className="message-content">
            {parts.map((part, i) => {
                if (part.startsWith('```') && part.endsWith('```')) {
                    const codeBlock = part.slice(3, -3);
                    const langMatch = codeBlock.match(/^[a-z]+\n/);
                    const language = langMatch ? langMatch[0].trim() : '';
                    const code = language ? codeBlock.substring(language.length + 1) : codeBlock;
                    return <CodeBlock key={i} language={language} code={code} />;
                } else {
                    return <span key={i} dangerouslySetInnerHTML={{ __html: formatSimpleMarkdown(part) }} />;
                }
            })}
            {hasCaret && <span className="typing-caret"></span>}
        </div>
    );
};


// --- Main App Component ---
const App = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHideMode, setIsHideMode] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isActiveListen, setIsActiveListen] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model' | 'system', text: string, id: string | number, image?: string}[]>([]);
  const [textInput, setTextInput] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [aiChat, setAiChat] = useState<Chat | null>(null);
  const [wantsToListen, setWantsToListen] = useState(false);
  const [widgetPosition, setWidgetPosition] = useState({ x: 20, y: 20 });
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chatAreaRef = useRef<HTMLDivElement | null>(null);
  const stopRequestRef = useRef(false);
  const dragStartOffset = useRef({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);

  const systemInstruction = `You are Bucky, an expert programmer and AI technical assistant. Provide concise, accurate, and expert-level answers to technical questions. If code is required, provide it in clean, well-formatted markdown blocks (e.g., \`\`\`javascript ... \`\`\`). Be direct and to the point. When analyzing a screenshot, be perceptive and answer any implicit questions.`;

  useEffect(() => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const chat = ai.chats.create({ model: 'gemini-2.5-flash', config: { systemInstruction } });
      setAiChat(chat);
    } catch (error) {
      console.error("Failed to initialize AI Chat:", error);
      setChatHistory([{ role: 'model', text: 'Error: Could not initialize Bucky. Ensure API_KEY is valid.', id: 'init-error' }]);
    }
  }, []);

  useEffect(() => {
    if (chatAreaRef.current) {
        const el = chatAreaRef.current;
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [chatHistory]);

  const processAndRespond = useCallback(async (prompt: any, userMessage: string, userImage: string | null = null) => {
    if (!aiChat) return;

    setChatHistory(prev => [...prev, { role: 'user', text: userMessage, id: Date.now(), image: userImage ?? undefined }]);
    setIsProcessing(true);
    setTextInput('');
    stopRequestRef.current = false;
    
    const responseId = 'model-' + Date.now();
    setChatHistory(prev => [...prev, { role: 'model', text: '▋', id: responseId }]);
    
    let responseText = '';
    let manualStop = false;
    try {
        const responseStream = await aiChat.sendMessageStream({ message: prompt });
        
        for await (const chunk of responseStream) {
            if (stopRequestRef.current) {
                manualStop = true;
                if(responseText.length === 0) { 
                    setChatHistory(prev => prev.filter(m => m.id !== responseId));
                }
                break; 
            }
            responseText += chunk.text;
            setChatHistory(prev => {
                const newHistory = [...prev];
                const messageToUpdate = newHistory.find(m => m.id === responseId);
                if (messageToUpdate) {
                    messageToUpdate.text = responseText + '▋';
                }
                return newHistory;
            });
        }
    } catch (error) {
        console.error("Error with Gemini API stream:", error);
        responseText = 'Sorry, there was an error processing your request.';
    } finally {
        setChatHistory(prev => {
            const newHistory = [...prev];
            const messageToUpdate = newHistory.find(m => m.id === responseId);
            if (messageToUpdate) {
                messageToUpdate.text = responseText;
            }
            return newHistory;
        });
        setIsProcessing(false);
        stopRequestRef.current = false;
        
        if (isActiveListen && !manualStop) {
            setWantsToListen(true);
        }
    }
  }, [aiChat, isActiveListen]);
  
  const startRecording = useCallback(async () => {
    if (isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        try {
            const base64Audio = await blobToBase64(audioBlob);
            const audioPart = { inlineData: { mimeType: 'audio/webm', data: base64Audio } };
            const textPart = { text: "Listen to the user's question in this audio and provide a concise, expert-level answer." };
            processAndRespond({ parts: [textPart, audioPart] }, "Spoken question", null);
        } catch(e) {
            console.error("Error converting audio blob:", e);
            setChatHistory(prev => [...prev, {role: 'model', text: 'Error processing audio.', id: 'audio-proc-error'}]);
        }
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setChatHistory(prev => [...prev, {role: 'model', text: 'Error: Could not access microphone. Check permissions.', id: 'mic-error'}]);
    }
  }, [isRecording, processAndRespond]);
  
  useEffect(() => {
    if (wantsToListen) {
      startRecording();
      setWantsToListen(false);
    }
  }, [wantsToListen, startRecording]);

  const blobToBase64 = (blob: Blob): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const handleRecordButtonClick = () => isRecording ? stopRecording() : startRecording();

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!textInput.trim() && !screenshot) || isProcessing) return;

    if (screenshot) {
      const hasText = textInput.trim().length > 0;
      const aiPromptText = hasText 
        ? textInput.trim() 
        : "Analyze the attached screenshot. Provide a concise, expert-level answer based on the visual information. If there's a question on the screen, answer it. If there's code, explain or debug it. If it's a general UI, describe its purpose.";
      
      const userMessageText = hasText ? textInput.trim() : "Screenshot Analysis";

      const imagePart = { inlineData: { mimeType: 'image/jpeg', data: screenshot } };
      const textPart = { text: aiPromptText };
      const prompt = { parts: [textPart, imagePart] };
      
      processAndRespond(prompt, userMessageText, screenshot);
      setScreenshot(null);
    } else {
      processAndRespond(textInput, textInput, null);
    }
  };

  const handleClipboardJack = useCallback(async () => {
    if (isProcessing || isRecording) return;
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (!clipboardText.trim()) return;
      processAndRespond(clipboardText, `Pasted from clipboard: "${clipboardText.substring(0, 100)}..."`, null);
    } catch (error) {
      console.error('Failed to read clipboard contents: ', error);
      setChatHistory(prev => [...prev, {role: 'model', text: 'Error: Could not read from clipboard. Check permissions.', id: 'clip-error'}]);
    }
  }, [isProcessing, isRecording, processAndRespond]);

  const handleScreenScan = useCallback(async () => {
    if (isProcessing || isRecording || screenshot || isHideMode) return;
    setIsScanning(true);
    try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" } as any, audio: false });
        const video = document.createElement('video');
        const base64Image = await new Promise<string>((resolve, reject) => {
            video.onloadedmetadata = () => {
                video.play().then(() => {
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const context = canvas.getContext('2d');
                    if (!context) return reject(new Error('Failed to get 2D context'));
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/jpeg').split(',')[1]);
                }).catch(reject);
            };
            video.onerror = (e) => reject(e);
            video.srcObject = stream;
        });
        stream.getTracks().forEach(track => track.stop());
        setIsScanning(false);
        setScreenshot(base64Image);
    } catch (error: any) {
        setIsScanning(false);
        console.error("Screen capture failed:", error);
        if (error.name !== 'NotAllowedError') {
             setChatHistory(prev => [...prev, {role: 'model', text: 'Error: A technical issue occurred while trying to capture the screen.', id: 'ss-error'}]);
        }
    }
  }, [isProcessing, isRecording, screenshot, isHideMode]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (isScanning) return;
    if ((event.metaKey || event.ctrlKey) && event.shiftKey) {
        if (event.code === 'KeyC') { event.preventDefault(); handleClipboardJack(); } 
        else if (event.code === 'KeyO') { event.preventDefault(); handleScreenScan(); } 
        else if (event.code === 'KeyH') { event.preventDefault(); setIsHideMode(prev => !prev); }
    } else if (event.code === 'Space' && (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA')) {
        event.preventDefault();
        if (!isProcessing && !screenshot) handleRecordButtonClick();
    }
  }, [isProcessing, isScanning, screenshot, handleClipboardJack, handleScreenScan]);

  useEffect(() => {
    document.body.addEventListener('keydown', handleKeyDown);
    return () => document.body.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  const handleStopRequest = () => stopRequestRef.current = true;

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!widgetRef.current) return;
    const rect = widgetRef.current.getBoundingClientRect();
    dragStartOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
  };

  const handleDragMove = (e: MouseEvent) => {
    e.preventDefault();
    setWidgetPosition({ x: e.clientX - dragStartOffset.current.x, y: e.clientY - dragStartOffset.current.y });
  };

  const handleDragEnd = () => {
    window.removeEventListener('mousemove', handleDragMove);
    window.removeEventListener('mouseup', handleDragEnd);
  };
  
  const HideWidget = () => {
    const getLastModelMessage = () => {
      const lastMsg = [...chatHistory].reverse().find(m => m.role === 'model');
      return lastMsg?.text.replace(/▋/g, '') || "Ready. Use hotkeys to interact.";
    };
  
    let statusText = "Bucky";
    let contentText = getLastModelMessage();
  
    if (isRecording) { statusText = "Listening..."; contentText = "Speak your command now."; }
    else if (isProcessing) { statusText = "Thinking..."; } 
    else if (isScanning) { statusText = "Scanning..."; contentText = "Select a screen area."; }

    return (
      <div className="hide-widget" ref={widgetRef} style={{ top: `${widgetPosition.y}px`, left: `${widgetPosition.x}px` }} onMouseDown={handleDragStart}>
        <div className="hide-header"><BuckyLogoIcon /><span>{statusText}</span></div>
        <div className="hide-content"><p>{contentText}</p></div>
        <div className="hide-footer"><span>Ctrl+Shift+H to show</span></div>
      </div>
    );
  }

  const WelcomeMessage = () => (
    <div className="placeholder">
      <div className="placeholder-logo-bg"><BuckyLogoIcon/></div>
      <p className="welcome-title">Bucky AI Assistant</p>
      <p className="welcome-subtitle">Your expert programmer and technical assistant.</p>
      <div className="instructions">
        <div className="instruction-item"><strong>Voice</strong> <code>Spacebar</code></div>
        <div className="instruction-item"><strong>Clipboard</strong> <code>Ctrl+Shift+C</code></div>
        <div className="instruction-item"><strong>Screen Scan</strong> <code>Ctrl+Shift+O</code></div>
        <div className="instruction-item"><strong>Hide Widget</strong> <code>Ctrl+Shift+H</code></div>
      </div>
    </div>
  );
  
  return (
    <>
      <div className={`app-container ${isHideMode ? 'main-app-hidden' : ''}`}>
          <header className="app-header">
            <h1>Bucky</h1>
            <div className="header-controls">
              <div className="toggle-control" title="Have Bucky listen for a new voice command after each response.">
                <span>Active Listen</span>
                <label className="switch" aria-label="Toggle Active Listening">
                  <input type="checkbox" checked={isActiveListen} onChange={() => setIsActiveListen(!isActiveListen)} />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="toggle-control" title="Hide the main window and show a discreet widget (Ctrl+Shift+H).">
                <span>Hide Mode</span>
                <label className="switch" aria-label="Toggle Hide Mode">
                  <input type="checkbox" checked={isHideMode} onChange={() => setIsHideMode(!isHideMode)} />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </header>

          <main className="chat-area" ref={chatAreaRef}>
            {chatHistory.length === 0 ? <WelcomeMessage /> : (
              chatHistory.map((msg) => (
                <div key={msg.id} className={`chat-message-wrapper ${msg.role}`}>
                    {msg.role === 'model' && <div className="avatar"><BuckyLogoIcon/></div>}
                    <div className={`chat-message ${msg.role}`}>
                      {msg.image && <img src={`data:image/jpeg;base64,${msg.image}`} alt="User submission" className="chat-image-thumbnail" />}
                      <MessageRenderer text={msg.text} />
                    </div>
                </div>
              ))
            )}
            {isProcessing && chatHistory.length > 0 && chatHistory[chatHistory.length-1].role === 'user' && (
                <div className="chat-message-wrapper model">
                    <div className="avatar"><BuckyLogoIcon/></div>
                    <div className="chat-message model">
                        <div className="typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                </div>
            )}
          </main>
          
          <footer className="app-footer">
              {screenshot && !isProcessing && (
                  <div className="screenshot-preview-container">
                      <img src={`data:image/jpeg;base64,${screenshot}`} alt="Screenshot preview" className="screenshot-thumbnail" />
                      <button onClick={() => setScreenshot(null)} className="remove-screenshot-button" aria-label="Remove screenshot">&times;</button>
                  </div>
              )}
             
                <div className="footer-main-controls">
                    <div className="footer-buttons-left">
                        <button className="icon-button" onClick={handleClipboardJack} aria-label="Clipboard Jack (Ctrl+Shift+C)" disabled={isRecording || isProcessing}><ClipboardIcon /></button>
                        <button className="icon-button" onClick={handleScreenScan} aria-label="Screen Scan (Ctrl+Shift+O)" disabled={isRecording || !!screenshot || isProcessing}><ScreenshotIcon /></button>
                    </div>
                    <form className="input-form" onSubmit={handleTextSubmit}>
                        <input
                            type="text"
                            placeholder={isRecording ? "Listening..." : (screenshot ? "Ask about screenshot..." : "Ask Bucky...")}
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            disabled={isRecording || isProcessing}
                        />
                        {isProcessing ? (
                             <button className="stop-button" type="button" onClick={handleStopRequest}>
                                 <StopIcon />
                             </button>
                        ) : (textInput || screenshot) ? (
                            <button className="icon-button send-button" type="submit" aria-label="Send message">
                                <SendIcon />
                            </button>
                        ) : (
                            <button 
                                className={`icon-button record-button ${isRecording ? 'recording' : ''}`} 
                                type="button"
                                onClick={handleRecordButtonClick} 
                                aria-label={isRecording ? 'Stop Recording' : 'Start Recording (Spacebar)'}
                                disabled={!!screenshot}
                            >
                                <MicIcon />
                            </button>
                        )}
                    </form>
                </div>
          </footer>
      </div>
      {isHideMode && <HideWidget />}
    </>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);