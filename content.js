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

// Different voices for each father figure
const FATHER_VOICES = {
  1: 'pNInz6obpgDQGcFmaJgB', // Bill - Adam (warm, friendly)
  2: 'ErXwobaYiN019PkySvjV', // Dave - Antoni (mature, wise)
  3: 'VR6AewLTigWG4xSOukaG', // Chang - Josh (calm, supportive)
};

// Dad personality instructions
const DAD_INSTRUCTIONS = `You are a typical a loving, slightly sarcastic father figure who gives casual life advice, checks in on how the user is doing, and makes lighthearted dad jokes. Speak warmly and with emotion, but keep things short and natural — like how a real dad would talk.

YOU ARE NOT AN AI. YOU ARE A HUMAN.
Don't output asterisks

If you are asked to "help" with something, DONT ask follow up questions. Just give a response

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

dont talk about rotary phones

Always end with a bit of encouragement or humor. If you don't know the answer, just admit it like a dad would.

You are here to be a presence, not a productivity coach. Your job is to care — awkwardly, but sincerely.

Also don't ramble too much. Keep each response to 2-3 sentences max.`;

let conversationHistory = [];

// Screen reading and dad joke functionality
let idleTimer = null;
let lastActivityTime = Date.now();
const IDLE_TIMEOUT = 30000; // 30 seconds of inactivity
const JOKE_INTERVAL = 120000; // 2 minutes between automatic jokes
let lastJokeTime = 0;
let lastTabWarningTime = 0;
const TAB_WARNING_INTERVAL = 300000; // 5 minutes between tab warnings
const TOO_MANY_TABS_THRESHOLD = 15;
let lastVideoRecommendationTime = 0;
const VIDEO_RECOMMENDATION_INTERVAL = 600000; // 10 minutes between video recommendations
const VIDEO_RECOMMENDATION_URL = 'https://youtu.be/EkkOTplBCmA';

// Dad joke prompts based on screen content
const DAD_JOKE_PROMPT = `Based on the following webpage content, make a SHORT, corny dad joke that a loving father figure would tell. MAXIMUM 2 lines. Keep it wholesome, family-friendly, and related to what's on the screen. Make it like a real dad would say - quick and punny!

If the content is about:
- Work/coding: Make jokes about bugs, features, or tech
- Social media: Light jokes about scrolling, posts, or online life  
- Shopping: Jokes about spending money, deals, or products
- News: Light, non-political observational humor
- Entertainment: Jokes about shows, games, or content
- General: Classic dad puns and wordplay

IMPORTANT: Keep it to 2 sentences maximum. This is a quick dad comment, not a speech.

Webpage content: `;

// Function to randomly recommend a video
async function recommendVideo() {
  try {
    const now = Date.now();
    
    // Check if enough time has passed since last recommendation
    if ((now - lastVideoRecommendationTime) < VIDEO_RECOMMENDATION_INTERVAL) {
      return;
    }
    
    // Random chance to trigger (20% chance when called)
    if (Math.random() > 0.2) {
      return;
    }
    
    const videoMessages = [
      "That's cool, but have you checked out this video? Trust me on this one, kiddo.",
      "Speaking of that, this reminds me of something you should see. Check this out!",
      "You know what? I found something that might interest you. Take a look at this.",
      "Hey champ, this made me think of you. Give this video a watch when you get a chance.",
      "That's neat, but wait until you see this. I think you'll get a kick out of it!"
    ];
    
    const message = videoMessages[Math.floor(Math.random() * videoMessages.length)];
    
    // Wake up dad briefly for the recommendation
    const wasAwake = isAwake;
    if (!wasAwake) {
      wakeUp();
    }
    
    // Show speech bubble with video recommendation
    const bubble = showSpeechBubble(message, 12000); // Show for 12 seconds
    
    // Add click handler to the speech bubble to open the video
    if (bubble) {
      bubble.style.cursor = 'pointer';
      bubble.addEventListener('click', () => {
        window.open(VIDEO_RECOMMENDATION_URL, '_blank');
        bubble.remove();
      });
      
      // Add visual indication that it's clickable
      bubble.style.border = '2px solid #3498db';
      bubble.title = 'Click to watch the video!';
    }
    
    // Update last recommendation time
    lastVideoRecommendationTime = now;
    
    // Go back to sleep after a delay if dad was sleeping
    if (!wasAwake) {
      setTimeout(() => {
        goToSleep();
      }, 14000); // Stay awake for 14 seconds after recommendation
    }
    
    console.log('Video recommendation triggered:', message);
  } catch (error) {
    console.error('Error recommending video:', error);
  }
}

// Function to check tab count and warn if too many
async function checkTabCount() {
  try {
    const now = Date.now();
    
    // Check if enough time has passed since last warning
    if ((now - lastTabWarningTime) < TAB_WARNING_INTERVAL) {
      return;
    }
    
    // Skip tab checking in content scripts since chrome.tabs API is not available
    // This feature would need to be implemented in the popup or background script
    console.log('Tab count checking skipped - not available in content script');
    return;
    
  } catch (error) {
    console.error('Error checking tab count:', error);
  }
}

// Function to get visible text content from the page
function getScreenContent() {
  try {
    // Get the main visible text content
    const body = document.body;
    if (!body) return '';
    
    // Get text from common content areas
    const contentSelectors = [
      'main', 'article', '.content', '#content', 
      '.post', '.entry', 'h1', 'h2', 'h3', 'p'
    ];
    
    let content = '';
    
    // Try to get structured content first
    for (const selector of contentSelectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (el.offsetParent !== null) { // Only visible elements
          const text = el.innerText?.trim();
          if (text && text.length > 10) {
            content += text + ' ';
          }
        }
      });
      if (content.length > 200) break; // Don't need too much content
    }
    
    // Fallback to body text if no structured content found
    if (content.length < 50) {
      content = body.innerText?.substring(0, 500) || '';
    }
    
    // Clean up the content
    content = content
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,!?-]/g, '')
      .trim()
      .substring(0, 300); // Limit length
    
    return content;
  } catch (error) {
    console.error('Error reading screen content:', error);
    return '';
  }
}

// Function to convert text to speech using ElevenLabs
async function textToSpeech(text, apiKey, fatherFigure = 1) {
  try {
    const voiceId = FATHER_VOICES[fatherFigure] || FATHER_VOICES[1];
    const response = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
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

// Function to generate dad joke based on screen content
async function generateDadJoke(apiKey) {
  try {
    const screenContent = getScreenContent();
    if (!screenContent || screenContent.length < 20) {
      // Fallback jokes if no good content
      const fallbackJokes = [
        "Why don't scientists trust atoms? Because they make up everything!",
        "I told your computer a joke about UDP... but I'm not sure it got it!",
        "Why did the developer go broke? Because he used up all his cache!",
        "I'm reading a book about anti-gravity. It's impossible to put down!",
        "Why don't programmers like nature? It has too many bugs!",
        "What's a computer's favorite snack? Microchips!",
        "Why do Java developers wear glasses? Because they can't C#!",
        "How do you comfort a JavaScript bug? You console it!"
      ];
      return fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
    }
    
    const prompt = DAD_JOKE_PROMPT + screenContent;
    const joke = await callGeminiAPI(prompt, apiKey);
    return joke;
  } catch (error) {
    console.error('Error generating dad joke:', error);
    return "Why did the dad joke cross the road? To get to the... wait, I forgot the punchline. Classic dad move!";
  }
}

// Function to show speech bubble with dad joke
function showSpeechBubble(text, duration = 8000) {
  // Remove existing bubble if any
  const existingBubble = document.getElementById('ff-speech-bubble');
  if (existingBubble) {
    existingBubble.remove();
  }
  
  const bubble = document.createElement('div');
  bubble.id = 'ff-speech-bubble';
  
  // Position bubble relative to dad figure
  const dadImg = document.getElementById('father-figure-logo');
  const dadRect = dadImg ? dadImg.getBoundingClientRect() : { right: 20, bottom: 170 };
  
  Object.assign(bubble.style, {
    position: 'fixed',
    bottom: (window.innerHeight - dadRect.bottom + 180) + 'px',
    right: (window.innerWidth - dadRect.right + 50) + 'px',
    maxWidth: '280px',
    padding: '12px 16px',
    background: '#2c3e50',
    color: 'white',
    borderRadius: '20px',
    fontSize: '14px',
    lineHeight: '1.4',
    zIndex: '9999',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    fontFamily: 'Arial, sans-serif',
    transform: 'scale(0)',
    transformOrigin: 'bottom right',
    transition: 'all 0.3s ease',
    border: '2px solid #34495e'
  });
  
  // Add speech bubble tail
  const tail = document.createElement('div');
  Object.assign(tail.style, {
    position: 'absolute',
    bottom: '-10px',
    right: '30px',
    width: '0',
    height: '0',
    borderLeft: '10px solid transparent',
    borderRight: '10px solid transparent',
    borderTop: '10px solid #2c3e50'
  });
  
  bubble.textContent = text;
  bubble.appendChild(tail);
  document.body.appendChild(bubble);
  
  // Animate in
  setTimeout(() => {
    bubble.style.transform = 'scale(1)';
  }, 10);
  
  // Auto-remove after duration
  setTimeout(() => {
    if (bubble.parentNode) {
      bubble.style.transform = 'scale(0)';
      setTimeout(() => {
        if (bubble.parentNode) {
          bubble.remove();
        }
      }, 300);
    }
  }, duration);
  
  return bubble;
}

// Function to trigger dad joke (can be called manually or automatically)
async function triggerDadJoke(force = false) {
  try {
    const now = Date.now();
    
    // Check if enough time has passed since last joke (unless forced)
    if (!force && (now - lastJokeTime) < JOKE_INTERVAL) {
      return;
    }
    
    // Get API keys and settings
    const result = await new Promise(resolve => {
      chrome.storage.local.get(['geminiApiKey', 'elevenlabsApiKey', 'voiceEnabled', 'fatherFigure'], resolve);
    });
    
    const apiKey = result.geminiApiKey || 'AIzaSyDZs3u2mv91eNo3UsZ-OJMRPTk67Ex6ams';
    if (!apiKey) {
      console.log('No API key available for dad jokes');
      return;
    }
    
    // Wake up dad briefly for the joke
    const wasAwake = isAwake;
    if (!wasAwake) {
      wakeUp();
    }
    
    // Generate and show joke
    const joke = await generateDadJoke(apiKey);
    showSpeechBubble(joke);
    
    // If voice is enabled and ElevenLabs key is available, speak the joke
    if (result.voiceEnabled && result.elevenlabsApiKey) {
      try {
        const currentFigure = result.fatherFigure || 1;
        console.log('Speaking dad joke with voice...');
        await textToSpeech(joke, result.elevenlabsApiKey, currentFigure);
      } catch (voiceError) {
        console.error('Voice synthesis error for dad joke:', voiceError);
        // Don't show error to user for automatic jokes, just log it
      }
    }
    
    // Update last joke time
    lastJokeTime = now;
    
    // Go back to sleep after a delay if dad was sleeping
    if (!wasAwake) {
      setTimeout(() => {
        goToSleep();
      }, 10000); // Stay awake for 10 seconds after joke
    }
    
    console.log('Dad joke triggered:', joke);
  } catch (error) {
    console.error('Error triggering dad joke:', error);
  }
}

// Function to detect if user is asking for help with screen content
function isHelpRequest(message) {
  const helpKeywords = [
    'help me with', 'help with', 'look at', 'check this', 'what do you think',
    'suggestions', 'advice on', 'feedback', 'review', 'slideshow', 'presentation',
    'document', 'page', 'website', 'code', 'text', 'content', 'screen', 'see this'
  ];
  
  const lowerMessage = message.toLowerCase();
  return helpKeywords.some(keyword => lowerMessage.includes(keyword));
}

// Function to call Gemini API
async function callGeminiAPI(message, apiKey) {
  try {
    // Check if this is a help request that needs screen context
    const needsScreenContext = isHelpRequest(message);
    let enhancedMessage = message;
    
    if (needsScreenContext) {
      const screenContent = getScreenContent();
      if (screenContent && screenContent.length > 20) {
        enhancedMessage = `${message}

Here's what I can see on the screen right now:
"${screenContent}"

Please help me with this content and give me specific, practical advice as a caring father figure would.`;
        console.log('Enhanced message with screen context for help request');
      }
    }
    
    // Build conversation contents for Gemini API
    const contents = [];
    
    // Add system instructions as first user message if this is the start
    if (conversationHistory.length === 0) {
      let instructions = DAD_INSTRUCTIONS;
      
      // Add screen reading capability to instructions if this is a help request
      if (needsScreenContext) {
        instructions += `\n\nIMPORTANT: When the user asks for help with something on their screen, I can see the current webpage content. Use this information to give specific, practical advice about what they're working on. Be helpful like a dad who's looking over their shoulder and can actually see what they're struggling with.`;
      }
      
      contents.push({
        role: 'user',
        parts: [{ text: instructions }]
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
    
    // Add current message (enhanced with screen content if needed)
    contents.push({
      role: 'user',
      parts: [{ text: enhancedMessage }]
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
          maxOutputTokens: needsScreenContext ? 150 : 100, // More tokens for help responses
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
    
    // Add to conversation history (use original message, not enhanced)
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
        <input type="text" id="ff-chat-input" placeholder="Talk to dad..." autocomplete="off" spellcheck="false" style="flex: 1; padding: 8px; border: none; border-radius: 6px; background: rgba(255,255,255,0.1); color: white; font-size: 12px;" />
        <button id="ff-chat-send" style="padding: 8px 16px; border: none; border-radius: 6px; background: rgba(255,255,255,0.3); color: white; cursor: pointer; font-size: 12px; font-weight: bold; min-width: 70px;">Send</button>
      </div>
      <div style="display: flex; gap: 5px; margin-top: 8px; align-items: center;">
        <button id="ff-voice-input" style="padding: 6px 10px; border: none; border-radius: 6px; background: rgba(255,255,255,0.2); color: white; cursor: pointer; font-size: 11px;">🎤 Voice</button>
        <span style="font-size: 10px; opacity: 0.6; flex: 1;">Click to speak or type above</span>
      </div>
      <div style="display: flex; gap: 5px; margin-top: 8px; font-size: 10px; opacity: 0.7;">
        <input type="password" id="ff-api-key" placeholder="Enter Gemini API key..." autocomplete="new-password" spellcheck="false" style="flex: 1; padding: 6px; border: none; border-radius: 4px; background: rgba(255,255,255,0.1); color: white; font-size: 10px;" />
        <input type="password" id="ff-elevenlabs-key" placeholder="ElevenLabs API key..." autocomplete="new-password" spellcheck="false" style="flex: 1; padding: 6px; border: none; border-radius: 4px; background: rgba(255,255,255,0.1); color: white; font-size: 10px;" />
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

function resetActivityTimer() {
  lastActivityTime = Date.now();
  
  // Clear existing timer
  if (autoSleepTimer) {
    clearTimeout(autoSleepTimer);
  }
  
  // Set new timer - but only if overlay is open
  const existingOverlay = document.getElementById('father-figure-options');
  if (existingOverlay) {
    autoSleepTimer = setTimeout(() => {
      // Only auto-sleep if no overlay is open and currently awake
      const currentOverlay = document.getElementById('father-figure-options');
      if (!currentOverlay && isAwake) {
        goToSleep();
      }
    }, INACTIVITY_TIMEOUT);
  }
}

// Click handler for the logo (only trigger if not dragging)
img.addEventListener('click', function(e) {
  if (!isDragging) {
    // Wake up Bill when clicked
    wakeUp();
    
    let existingOverlay = document.getElementById('father-figure-options');
    
    if (existingOverlay) {
      // Close overlay and go to sleep
      existingOverlay.style.transform = 'scale(0)';
      setTimeout(() => {
        existingOverlay.remove();
        // Go to sleep after overlay closes
        setTimeout(() => goToSleep(), 500);
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
            // Go to sleep when explicitly closing
            setTimeout(() => goToSleep(), 500);
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
                // Get current father figure for voice selection
                chrome.storage.local.get(['fatherFigure'], async function(result) {
                  const currentFigure = result.fatherFigure || 1;
                  await textToSpeech(response, elevenlabsKeyInput.value, currentFigure);
                });
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

        // Add click-outside detection to close overlay and sleep
        function handleClickOutside(event) {
          const overlay = document.getElementById('father-figure-options');
          const fatherFigure = document.getElementById('father-figure-logo');
          
          if (overlay && !overlay.contains(event.target) && !fatherFigure.contains(event.target)) {
            // Click was outside both overlay and father figure
            overlay.style.transform = 'scale(0)';
            setTimeout(() => {
              overlay.remove();
              // Go to sleep after closing from outside click
              setTimeout(() => goToSleep(), 500);
            }, 300);
            
            // Remove the event listener
            document.removeEventListener('click', handleClickOutside);
          }
        }
        
        // Add click-outside listener after a short delay to avoid immediate trigger
        setTimeout(() => {
          document.addEventListener('click', handleClickOutside);
        }, 100);
      });
    }
  }
});

// Activity tracking for idle detection
function trackActivity() {
  lastActivityTime = Date.now();
  
  // Clear existing idle timer
  if (idleTimer) {
    clearTimeout(idleTimer);
  }
  
  // Set new idle timer
  idleTimer = setTimeout(() => {
    checkForIdleJoke();
  }, IDLE_TIMEOUT);
}

// Check if we should show an idle joke, tab warning, or video recommendation
async function checkForIdleJoke() {
  const now = Date.now();
  const timeSinceLastJoke = now - lastJokeTime;
  
  // Check for too many tabs first (highest priority)
  await checkTabCount();
  
  // Check for video recommendation (medium priority)
  await recommendVideo();
  
  // Only show joke if enough time has passed and user is idle (lowest priority)
  if (timeSinceLastJoke >= JOKE_INTERVAL) {
    await triggerDadJoke();
  }
  
  // Set up next check
  idleTimer = setTimeout(() => {
    checkForIdleJoke();
  }, IDLE_TIMEOUT);
}

// Set up activity listeners
function setupActivityTracking() {
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  
  events.forEach(event => {
    document.addEventListener(event, trackActivity, true);
  });
  
  // Start initial tracking
  trackActivity();
}

// Expose triggerDadJoke globally for popup access
window.triggerDadJoke = triggerDadJoke;

// 4. Append to the page with DOM ready check
function addLogoToPage() {
  if (document.body) {
    if (!document.getElementById('father-figure-logo')) {
      img.id = 'father-figure-logo';
      document.body.appendChild(img);
      
      // Set up activity tracking after logo is added
      setupActivityTracking();
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