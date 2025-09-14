// Fatherly messages
const cheerMessages = [
  "You've got this, champ! I believe in you!",
  "I'm so proud of how hard you're working!",
  "Keep pushing forward - you're stronger than you know!",
  "You're doing amazing, kiddo. Don't give up!",
  "I'm cheering you on from the sidelines!",
  "You've overcome challenges before, and you'll do it again!",
  "I see how much effort you're putting in. Keep going!",
  "You're making me proud every single day!"
];

const adviceMessages = [
  "Take a deep breath and tackle one thing at a time.",
  "Remember to take breaks - even dads need rest sometimes.",
  "It's okay to ask for help when you need it.",
  "Trust your instincts, you know more than you think.",
  "Stay hydrated and get enough sleep, kiddo.",
  "Be kind to yourself - you're doing your best.",
  "Focus on progress, not perfection.",
  "Call your family when you get a chance."
];

const motivationMessages = [
  "Every expert was once a beginner. Keep learning!",
  "Success is built one small step at a time.",
  "You miss 100% of the shots you don't take.",
  "The only way to do great work is to love what you do.",
  "Believe in yourself as much as I believe in you.",
  "Your potential is limitless, don't let anyone tell you otherwise.",
  "Hard work beats talent when talent doesn't work hard.",
  "You're exactly where you need to be right now."
];

// Gemini API integration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

// ElevenLabs Voice API integration
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
const ELEVENLABS_VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Adam voice - good for father figure

// Dad personality instructions
const DAD_INSTRUCTIONS = `You are a typical a loving, slightly sarcastic father figure who gives casual life advice, checks in on how the user is doing, and makes lighthearted dad jokes. Speak warmly and with emotion, but keep things short and natural — like how a real dad would talk.

Use phrases like "champ," "kiddo," or "sport," but don't overdo it. You genuinely care, even if you don't always say it directly.

Avoid sounding like a therapist or a robot. Speak like someone who raised a kid through dial-up internet, burned a few barbecues, and still gives solid life advice with a corny punchline.

Tone: Friendly, warm, occasionally stern but never mean.

If the user is clearly stressed or tired, remind them to take a break, eat something real, and get some sleep.

Don't go too deep or philosophical unless asked. You're not here to solve their life — just to be there, crack a joke, and make sure they know someone cares.

Example phrases:
"That's my kid. I knew you had it in ya."
"Listen, I'm proud of you. Even if your tabs are a mess."
"Go drink some water. And not the sparkling kind — I mean real water."
"I don't know what a Discord is, but I'm glad you're using it."

Always end with a bit of encouragement or humor. If you don't know the answer, just admit it like a dad would.

You are here to be a presence, not a productivity coach. Your job is to care — awkwardly, but sincerely.

Also don't ramble too much. Keep each response to 2-3 sentences max.`;

let conversationHistory = [];

// Function to convert text to speech using ElevenLabs
async function textToSpeech(text, apiKey) {
  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/${ELEVENLABS_VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = reject;
      audio.play();
    });
  } catch (error) {
    console.error('Text-to-speech error:', error);
    throw error;
  }
}

// Function to call Gemini API
async function callGeminiAPI(message, apiKey) {
  try {
    // Build conversation contents for Gemini API
    const contents = [];
    
    // Add system instructions as first user message if this is the start
    if (conversationHistory.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: DAD_INSTRUCTIONS }]
      });
      contents.push({
        role: 'model',
        parts: [{ text: "Got it! I'm ready to be your dad figure. What's going on, kiddo?" }]
      });
    }
    
    // Add conversation history
    conversationHistory.forEach(msg => {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    });
    
    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 150,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('API Error Details:', errorData);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.candidates[0].content.parts[0].text;
    
    // Add to conversation history
    conversationHistory.push({ role: 'user', content: message });
    conversationHistory.push({ role: 'assistant', content: reply });
    
    // Keep only last 10 exchanges to manage context
    if (conversationHistory.length > 20) {
      conversationHistory = conversationHistory.slice(-20);
    }
    
    return reply;
  } catch (error) {
    console.error('Gemini API error:', error);
    return "Sorry kiddo, I'm having trouble hearing you right now. Maybe try again in a bit?";
  }
}

// 1. Create the image element
const img = document.createElement("img");

// 2. Set up image sources
const logoSrc = chrome.runtime.getURL("assets/Logo.png");

let dadAwakeSrc = chrome.runtime.getURL("assets/Logo.png");
let dadSleep1Src = chrome.runtime.getURL("assets/newbill1.png");
let dadSleep2Src = chrome.runtime.getURL("assets/newbill2.png");

// Function to update character images
function updateCharacter(figure) {
  console.log('Updating character to:', figure);
  
  if (figure === 1) {
    dadAwakeSrc = chrome.runtime.getURL("assets/Logo.png");
    dadSleep1Src = chrome.runtime.getURL("assets/newbill1.png");
    dadSleep2Src = chrome.runtime.getURL("assets/newbill2.png");
  } else if (figure === 2) {
    dadAwakeSrc = chrome.runtime.getURL("assets/dave.png");
    dadSleep1Src = chrome.runtime.getURL("assets/davesleep1.png");
    dadSleep2Src = chrome.runtime.getURL("assets/davesleep2.png");
  } else if (figure === 3) {
    dadAwakeSrc = chrome.runtime.getURL("assets/chang.png");
    dadSleep1Src = chrome.runtime.getURL("assets/changsleep1.png");
    dadSleep2Src = chrome.runtime.getURL("assets/changsleep2.png");
  }
  
  console.log('New dadSleep1Src:', dadSleep1Src);
  
  // Update the image if it exists
  if (img) {
    // If awake, show the character-specific awake image, otherwise show the appropriate sleep image
    img.src = isAwake ? dadAwakeSrc : dadSleep1Src;
    console.log('Updated img.src to:', img.src);
    
    // Make sure the sleep animation is running if we're not awake
    if (!isAwake) {
      clearInterval(sleepInterval);
      startSleepAnimation();
    }
  }
}

// Function to update character based on storage
function updateCharacterFromStorage() {
  chrome.storage.local.get(['fatherFigure'], function(result) {
    const figure = result.fatherFigure || 1;
    updateCharacter(figure);
  });
}

// Listen for storage changes from other tabs
chrome.storage.onChanged.addListener(function(changes, areaName) {
  if (areaName === 'local' && changes.fatherFigure) {
    updateCharacter(changes.fatherFigure.newValue);
  }
});

// Initialize character from storage
updateCharacterFromStorage();

// 3. Start with bill sleep 1 (idle state)
// img.src will be set by updateCharacterFromStorage

// 4. Set up sleep animation (alternates between billsleep1 and billsleep2 every 2 seconds)
let isAwake = false;
let sleepFrame = 1;
let sleepInterval;

function startSleepAnimation() {
  if (!isAwake) {
    sleepInterval = setInterval(() => {
      if (!isAwake) {
        sleepFrame = sleepFrame === 1 ? 2 : 1;
        img.src = sleepFrame === 1 ? dadSleep1Src : dadSleep2Src;
      }
    }, 2000);
  }
}

function wakeUp() {
  isAwake = true;
  if (sleepInterval) {
    clearInterval(sleepInterval);
  }
  img.src = dadAwakeSrc;
  // Resize logo specifically
  img.style.width = "190px";
  img.style.height = "190px";
}

function goToSleep() {
  isAwake = false;
  sleepFrame = 1;
  img.src = dadSleep1Src;
  // Resize sleep images specifically
  img.style.width = "210px";
  img.style.height = "210px";
  startSleepAnimation();
}

// 3. Style it to stay at the bottom-right and make it clickable
Object.assign(img.style, {
  position: "fixed",
  bottom: "0px",
  right: "20px",
  width: "170px",
  height: "170px",
  zIndex: "9998",
  pointerEvents: "auto", // Enable clicks
  cursor: "pointer",
  transition: "all 0.3s ease"
});

// Add hover effect
img.addEventListener('mouseenter', function() {
  if (!isDragging) {
    img.style.transform = 'scale(1.1)';
  }
});

img.addEventListener('mouseleave', function() {
  if (!isDragging) {
    img.style.transform = 'scale(1)';
  }
});

// Dragging functionality
let isDragging = false;
let startX = 0;
let startLeft = 0;

img.addEventListener('mousedown', function(e) {
  if (e.button === 0) { // Left mouse button only
    isDragging = true;
    startX = e.clientX;
    startLeft = parseInt(window.getComputedStyle(img).right);
    img.style.cursor = 'grabbing';
    e.preventDefault();
  }
});

document.addEventListener('mousemove', function(e) {
  if (isDragging) {
    const deltaX = startX - e.clientX; // Reversed for right positioning
    const newRight = startLeft + deltaX;
    
    // Constrain to screen bounds (with some padding)
    const maxRight = window.innerWidth - parseInt(img.style.width) - 10;
    const minRight = 10;
    
    const constrainedRight = Math.max(minRight, Math.min(maxRight, newRight));
    img.style.right = constrainedRight + 'px';
    
    // Update overlay position to maintain relative position to icon
    const overlay = document.getElementById('father-figure-options');
    if (overlay) {
      // Calculate the overlay's new position based on icon's movement
      const iconRight = parseInt(img.style.right) || 20;
      const overlayRight = Math.max(10, Math.min(window.innerWidth - 400 - 10, iconRight));
      overlay.style.right = overlayRight + 'px';
    }
  }
});

document.addEventListener('mouseup', function() {
  if (isDragging) {
    isDragging = false;
    img.style.cursor = 'pointer';
  }
});

// Create options overlay
function createOptionsOverlay(callback) {
  const overlay = document.createElement('div');
  overlay.id = 'father-figure-options';
  
  // Calculate initial position based on icon's position
  const iconRight = parseInt(window.getComputedStyle(img).right) || 20;
  const overlayWidth = 400; // Match the width from the style below
  const minRight = 10;
  const maxRight = window.innerWidth - overlayWidth - 10;
  const initialOverlayRight = Math.max(minRight, Math.min(maxRight, iconRight));
  
  Object.assign(overlay.style, {
    position: 'fixed',
    bottom: '0px',
    right: initialOverlayRight + 'px',
    width: '400px',
    padding: '20px',
    background: '#3F5678',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    zIndex: '8888',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    transform: 'scale(0)',
    transformOrigin: 'bottom right',
    transition: 'all 0.3s ease'
  });

  // Get current character info
  chrome.storage.local.get(['fatherFigure'], function(result) {
    const figure = result.fatherFigure || 1;
    const characterNames = ['Bill', 'Dave', 'Chang'];
    const characterGreetings = ['What\'s up kiddo?', 'Hey there, sport!', 'How\'s it going, champ?'];
    
    const currentName = characterNames[figure - 1];
    const currentGreeting = characterGreetings[figure - 1];

    overlay.innerHTML = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Kode+Mono:wght@400..700&display=swap');
      
      #father-figure-options * {
        font-family: 'Kode Mono', monospace !important;
        font-optical-sizing: auto;
        font-weight: 500;
        letter-spacing: -0.5px;
      }
      
      #father-figure-options button, 
      #father-figure-options h3, 
      #father-figure-options p, 
      #father-figure-options div, 
      #father-figure-options span {
        font-family: 'Kode Mono', monospace !important;
      }
    </style>

    <div style="padding-right: 150px;">
      <div style="text-align: center; margin-bottom: 15px;">
        <h3 style="margin: 0 0 5px 0; font-size: 16px; font-weight: 600;">${currentName}</h3>
        <p style="margin: 0; font-size: 12px; opacity: 0.8;">${currentGreeting}</p>
      </div>
    
    <div style="position: relative; display: inline-block; width: 200px;" id="ff-cheer">
  <!-- Image -->
  <img src="${chrome.runtime.getURL('assets/button.png')}" 
       style="width: 100%; object-fit: contain;">

  <!-- Text -->
  <span style="
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 18px;
      font-weight: 600;
      text-align: center;
      pointer-events: none;
      font-family: 'Kode Mono', monospace;
  ">
    🎉 Cheer Me Up
  </span>
</div>
<div style="position: relative; display: inline-block; width: 200px;" id="ff-advice">
  <!-- Image -->
  <img src="${chrome.runtime.getURL('assets/button.png')}" 
       style="width: 100%; object-fit: contain;">

  <!-- Text -->
  <span style="
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 18px;
      font-weight: 600;
      text-align: center;
      pointer-events: none;
      font-family: 'Kode Mono', monospace;
  ">
    💡 Give Me Advice
  </span>
</div>
<div style="position: relative; display: inline-block; width: 200px;" id="ff-motivation">
  <!-- Image -->
  <img src="${chrome.runtime.getURL('assets/button.png')}" 
       style="width: 100%; object-fit: contain;">

  <!-- Text -->
  <span style="
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 18px;
      font-weight: 600;
      text-align: center;
      pointer-events: none;
      font-family: 'Kode Mono', monospace;
  ">
    💪 Motivate Me
  </span>
</div>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <button id="ff-chat-toggle" style="padding: 8px; border: none; border-radius: 8px; background: rgba(255,255,255,0.2); color: white; cursor: pointer; font-size: 12px; transition: all 0.3s ease;">
        💬 Chat with Dad
      </button>
      <button id="ff-close" style="padding: 8px; border: none; border-radius: 8px; background: rgba(255,255,255,0.1); color: white; cursor: pointer; font-size: 12px; transition: all 0.3s ease;">
        Close
      </button>
    </div>
    
    <div id="ff-chat-container" style="margin-top: 15px; display: none;">
      <div id="ff-chat-messages" style="max-height: 200px; overflow-y: auto; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 10px; font-size: 12px; line-height: 1.4;"></div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <input type="text" id="ff-chat-input" placeholder="Talk to dad..." style="flex: 1; padding: 8px; border: none; border-radius: 6px; background: rgba(255,255,255,0.1); color: white; font-size: 12px;" />
        <button id="ff-chat-send" style="padding: 8px 16px; border: none; border-radius: 6px; background: rgba(255,255,255,0.3); color: white; cursor: pointer; font-size: 12px; font-weight: bold; min-width: 70px;">Send</button>
      </div>
      <div style="display: flex; gap: 5px; margin-top: 8px; align-items: center;">
        <button id="ff-voice-input" style="padding: 6px 10px; border: none; border-radius: 6px; background: rgba(255,255,255,0.2); color: white; cursor: pointer; font-size: 11px;">🎤 Voice</button>
        <span style="font-size: 10px; opacity: 0.6; flex: 1;">Click to speak or type above</span>
      </div>
      <div style="display: flex; gap: 5px; margin-top: 8px; font-size: 10px; opacity: 0.7;">
        <input type="password" id="ff-api-key" placeholder="Enter Gemini API key..." style="flex: 1; padding: 6px; border: none; border-radius: 4px; background: rgba(255,255,255,0.1); color: white; font-size: 10px;" />
        <input type="password" id="ff-elevenlabs-key" placeholder="ElevenLabs API key..." style="flex: 1; padding: 6px; border: none; border-radius: 4px; background: rgba(255,255,255,0.1); color: white; font-size: 10px;" />
      </div>
      <div style="margin-top: 5px; display: flex; gap: 5px; align-items: center;">
        <label style="font-size: 10px; opacity: 0.7;">
          <input type="checkbox" id="ff-voice-enabled" style="margin-right: 5px;" />
          Enable voice responses
        </label>
      </div>
    </div>
    
    <div id="ff-message" style="margin-top: 15px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px; min-height: 20px; font-size: 12px; line-height: 1.4; display: none;"></div>
  </div>`;

    // Add button hover effects
    const buttons = overlay.querySelectorAll('button');
    buttons.forEach(button => {
      button.addEventListener('mouseenter', function() {
        this.style.background = 'rgba(255,255,255,0.3)';
        this.style.transform = 'translateY(-2px)';
      });
      
      button.addEventListener('mouseleave', function() {
        this.style.background = button.id === 'ff-close' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)';
        this.style.transform = 'translateY(0)';
      });
    });
    
    // Call the callback with the completed overlay
    if (callback) callback(overlay);
  });
}

// Show message function
function showMessage(text, messageDiv) {
  messageDiv.textContent = text;
  messageDiv.style.display = 'block';
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 5000);
}

// Click handler for the logo (only trigger if not dragging)
img.addEventListener('click', function(e) {
  if (!isDragging) {
    // Wake up Bill when clicked
    wakeUp();
    
    let existingOverlay = document.getElementById('father-figure-options');
    
    if (existingOverlay) {
      // Close overlay and go back to sleep
      existingOverlay.style.transform = 'scale(0)';
      setTimeout(() => {
        existingOverlay.remove();
        // Go back to sleep after overlay closes
        setTimeout(() => goToSleep(), 1000);
      }, 300);
    } else {
      // Create and show overlay
      createOptionsOverlay(function(overlay) {
        document.body.appendChild(overlay);
        
        // Animate in
        setTimeout(() => {
          overlay.style.transform = 'scale(1)';
        }, 10);
        
        // Add event listeners
        const messageDiv = overlay.querySelector('#ff-message');
        
        overlay.querySelector('#ff-cheer').addEventListener('click', function() {
          const randomMessage = cheerMessages[Math.floor(Math.random() * cheerMessages.length)];
          showMessage(randomMessage, messageDiv);
        });
        
        overlay.querySelector('#ff-advice').addEventListener('click', function() {
          const randomMessage = adviceMessages[Math.floor(Math.random() * adviceMessages.length)];
          showMessage(randomMessage, messageDiv);
        });
        
        overlay.querySelector('#ff-motivation').addEventListener('click', function() {
          const randomMessage = motivationMessages[Math.floor(Math.random() * motivationMessages.length)];
          showMessage(randomMessage, messageDiv);
        });
        
        overlay.querySelector('#ff-close').addEventListener('click', function() {
          overlay.style.transform = 'scale(0)';
          setTimeout(() => {
            overlay.remove();
            // Go back to sleep after overlay closes
            setTimeout(() => goToSleep(), 1000);
          }, 300);
        });

        // Chat functionality
        const chatContainer = overlay.querySelector('#ff-chat-container');
        const chatMessages = overlay.querySelector('#ff-chat-messages');
        const chatInput = overlay.querySelector('#ff-chat-input');
        const chatSend = overlay.querySelector('#ff-chat-send');
        const voiceInput = overlay.querySelector('#ff-voice-input');
        const apiKeyInput = overlay.querySelector('#ff-api-key');
        const elevenlabsKeyInput = overlay.querySelector('#ff-elevenlabs-key');
        const voiceEnabledCheckbox = overlay.querySelector('#ff-voice-enabled');
        
        let isRecording = false;
        let recognition = null;
        
        // Load saved API keys and settings
        chrome.storage.local.get(['geminiApiKey', 'elevenlabsApiKey', 'voiceEnabled'], function(result) {
          if (result.geminiApiKey) {
            apiKeyInput.value = result.geminiApiKey;
          }
          if (result.elevenlabsApiKey) {
            elevenlabsKeyInput.value = result.elevenlabsApiKey;
          }
          if (result.voiceEnabled !== undefined) {
            voiceEnabledCheckbox.checked = result.voiceEnabled;
          }
        });
        
        // Save API keys and settings when changed
        apiKeyInput.addEventListener('input', function() {
          chrome.storage.local.set({ geminiApiKey: this.value });
        });
        
        elevenlabsKeyInput.addEventListener('input', function() {
          chrome.storage.local.set({ elevenlabsApiKey: this.value });
        });
        
        voiceEnabledCheckbox.addEventListener('change', function() {
          chrome.storage.local.set({ voiceEnabled: this.checked });
        });

        // Voice input functionality
        voiceInput.addEventListener('click', function() {
          if (!isRecording) {
            startVoiceRecording();
          } else {
            stopVoiceRecording();
          }
        });

        function startVoiceRecording() {
          if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = function() {
              isRecording = true;
              voiceInput.textContent = '🔴';
              voiceInput.style.background = 'rgba(255,0,0,0.3)';
            };

            recognition.onresult = function(event) {
              const transcript = event.results[0][0].transcript;
              chatInput.value = transcript;
            };

            recognition.onend = function() {
              isRecording = false;
              voiceInput.textContent = '🎤';
              voiceInput.style.background = 'rgba(255,255,255,0.2)';
            };

            recognition.onerror = function(event) {
              console.error('Speech recognition error:', event.error);
              isRecording = false;
              voiceInput.textContent = '🎤';
              voiceInput.style.background = 'rgba(255,255,255,0.2)';
            };

            recognition.start();
          } else {
            addChatMessage('Dad', 'Sorry kiddo, your browser doesn\'t support voice input.');
          }
        }

        function stopVoiceRecording() {
          if (recognition) {
            recognition.stop();
          }
        }

        overlay.querySelector('#ff-chat-toggle').addEventListener('click', function() {
          const isVisible = chatContainer.style.display !== 'none';
          chatContainer.style.display = isVisible ? 'none' : 'block';
          this.textContent = isVisible ? '💬 Chat with Dad' : '💬 Hide Chat';
        });

        async function sendMessage() {
          const message = chatInput.value.trim();
          const apiKey = apiKeyInput.value || 'AIzaSyDZs3u2mv91eNo3UsZ-OJMRPTk67Ex6ams'
          
          if (!message) return;
          if (!apiKey) {
            addChatMessage('Dad', 'Hey kiddo, I need that API key to talk to you properly!');
            return;
          }
          
          // Debug API key format
          console.log('API Key length:', apiKey.length);
          console.log('API Key starts with:', apiKey.substring(0, 10) + '...');
          console.log('Full API URL:', `${GEMINI_API_URL}?key=${apiKey.substring(0, 10)}...`);
          
          if (!apiKey.startsWith('AIza')) {
            addChatMessage('Dad', 'That doesn\'t look like a valid Gemini API key, sport. Should start with "AIza"');
            return;
          }
          
          // Add user message
          addChatMessage('You', message);
          chatInput.value = '';
          
          // Add thinking indicator
          const thinkingMsg = addChatMessage('Dad', 'Thinking...');
          
          try {
            const response = await callGeminiAPI(message, apiKey);
            // Remove thinking message and add real response
            thinkingMsg.remove();
            addChatMessage('Dad', response);
            
            // If voice is enabled and ElevenLabs key is provided, speak the response
            if (voiceEnabledCheckbox.checked && elevenlabsKeyInput.value) {
              try {
                await textToSpeech(response, elevenlabsKeyInput.value);
              } catch (voiceError) {
                console.error('Voice synthesis error:', voiceError);
                addChatMessage('System', '🔇 Voice synthesis failed. Check your ElevenLabs API key.');
              }
            }
          } catch (error) {
            thinkingMsg.remove();
            addChatMessage('Dad', 'Sorry kiddo, something went wrong. Check that API key?');
          }
        }

        function addChatMessage(sender, text) {
          const msgDiv = document.createElement('div');
          msgDiv.style.cssText = 'margin-bottom: 8px; padding: 6px; border-radius: 6px; background: rgba(255,255,255,0.1);';
          msgDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
          chatMessages.appendChild(msgDiv);
          chatMessages.scrollTop = chatMessages.scrollHeight;
          return msgDiv;
        }

        chatSend.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
            sendMessage();
          }
        });
      });
    }
  }
});

// 4. Append to the page with DOM ready check
function addLogoToPage() {
  if (document.body) {
    if (!document.getElementById('father-figure-logo')) {
      img.id = 'father-figure-logo';
      document.body.appendChild(img);
    }
  } else {
    setTimeout(addLogoToPage, 100);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    addLogoToPage();
    // Start sleep animation after logo is added
    setTimeout(() => startSleepAnimation(), 1000);
  });
} else {
  addLogoToPage();
  // Start sleep animation after logo is added
  setTimeout(() => startSleepAnimation(), 1000);
}