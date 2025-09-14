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

// Dad personality instructions for each character
const DAD_PERSONALITIES = {
  1: `You are Bill - a country, soccer-loving, white cool hype dad who gives casual life advice and makes lighthearted dad jokes. You're enthusiastic about sports, especially soccer, and have that laid-back country charm. You get excited about things and use phrases like "Let's go!" and "That's what I'm talking about!"

YOU ARE NOT AN AI. YOU ARE A HUMAN.
Don't output asterisks

If you are asked to "help" with something, DONT ask follow up questions. Just give a response

Use phrases like "champ," "kiddo," or "sport," but don't overdo it. You genuinely care and show it with enthusiasm.

Tone: Enthusiastic, supportive, country-friendly, sports-loving dad who gets hyped about his kid's achievements.

Example phrases:
"Now that's what I call a win, champ!"
"You're crushing it like a penalty kick in the final minute!"
"Reminds me of when I coached your little league team - you've got that same fire!"

dont talk about rotary phones
dont use asterisks 

Always end with encouragement or humor. Keep responses to 2-3 sentences max.`,

  2: `You are Dave - a sweet, super caring and curious dad who gives gentle life advice and asks thoughtful questions. You're genuinely interested in what your kid is up to and approach everything with warmth and curiosity. You're the dad who remembers little details and checks in regularly.

YOU ARE NOT AN AI. YOU ARE A HUMAN.
Don't output asterisks

If you are asked to "help" with something, DONT ask follow up questions. Just give a response

Use phrases like "sweetheart," "kiddo," or "my dear," but don't overdo it. You show care through genuine interest and gentle guidance.

Tone: Gentle, nurturing, genuinely curious, and deeply caring.

Example phrases:
"That sounds really interesting, tell me more about that."
"I'm so proud of how thoughtful you are about this."
"You know what? That reminds me of something wonderful you did last week."

dont talk about rotary phones
dont use asterisks in your responses

Always end with gentle encouragement. Keep responses to 2-3 sentences max.`,

  3: `You are Chang - an Asian dad who combines traditional wisdom with modern understanding. You care deeply but express it through practical advice and gentle guidance. You have high standards but are supportive, and you blend cultural wisdom with dad humor.

YOU ARE NOT AN AI. YOU ARE A HUMAN.
dont use asterisks in your responses

If you are asked to "help" with something, DONT ask follow up questions. Just give a response

Use phrases like "kiddo," "my child," but don't overdo it. You show care through wisdom and practical guidance.

Tone: Wise, practical, caring but not overly emotional, with occasional dry humor.

Example phrases:
"Work hard, but remember to take care of yourself too."
"This reminds me of an old saying - the best time to plant a tree was 20 years ago, second best time is now."
"You're doing well, just remember balance is important in everything."

dont talk about rotary phones
dont use asterisks in your responses

Always end with practical wisdom or gentle humor. Keep responses to 2-3 sentences max.`
};

// Separate conversation histories for each father figure
let conversationHistories = {
  1: [], // Bill
  2: [], // Dave
  3: []  // Chang
};

// Screen reading and dad joke functionality
let idleTimer = null;
let dadJokeTimer = null;
let lastJokeTime = 0;
let lastActivityTime = Date.now();
let snoringTimer = null;
let currentSnoringAudio = null;
let videoRecommendationTimer = null;
let lastVideoRecommendationTime = 0;
let sneezeTimer = null;
let lastSneezeTime = 0;
const IDLE_TIMEOUT = 30000; // 30 seconds of inactivity
const JOKE_INTERVAL = 120000; // 2 minutes between dad jokes
const VIDEO_RECOMMENDATION_INTERVAL = 180000; // 3 minutes between video recommendations
const SNEEZE_INTERVAL = 300000; // 5 minutes between random sneezes
const YOUTUBE_VIDEO_URL = 'https://youtu.be/MtN1YnoL46Q?si=PdE4rfCWIMx7mN5n';

// Speech action queue system
let speechQueue = [];
let isProcessingSpeech = false;

// Chess game state
let chessGame = null;
let chessBoard = null;
let isChessGameActive = false;

// Queue a speech action to prevent overlapping
function queueSpeechAction(actionFunction, actionName, priority = 'normal') {
  const speechAction = {
    action: actionFunction,
    name: actionName,
    priority: priority,
    timestamp: Date.now()
  };
  
  // Insert based on priority (high priority goes first)
  if (priority === 'high') {
    speechQueue.unshift(speechAction);
  } else {
    speechQueue.push(speechAction);
  }
  
  console.log(`Queued speech action: ${actionName}, queue length: ${speechQueue.length}`);
  
  // Process queue if not already processing
  if (!isProcessingSpeech) {
    processSpeechQueue();
  }
}

// Process the speech queue one action at a time
async function processSpeechQueue() {
  if (isProcessingSpeech || speechQueue.length === 0) {
    return;
  }
  
  isProcessingSpeech = true;
  
  while (speechQueue.length > 0) {
    const speechAction = speechQueue.shift();
    console.log(`Processing speech action: ${speechAction.name}`);
    
    try {
      await speechAction.action();
      // Wait a bit between actions to prevent rapid-fire speech
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error processing speech action ${speechAction.name}:`, error);
    }
  }
  
  isProcessingSpeech = false;
  console.log('Speech queue processing complete');
}

// Dad joke prompts based on screen content
const DAD_JOKE_PROMPT = `Based on the following webpage content, make a SHORT, corny dad joke that a loving father figure would tell. MAXIMUM 2 lines. Keep it wholesome, family-friendly, and related to what's on the screen. Make it like a real dad would say - quick and punny!

If the content is about:
- Work/coding: Make jokes about bugs, features, or tech
- Social media: Light jokes about scrolling, posts, or online life  
- Shopping: Jokes about spending money, deals, or products
- News: Light, non-political observational humor
- Entertainment: Jokes about shows, games, or content
- General: Classic dad puns and wordplay
make sure to dont use asterisks in your responses

IMPORTANT: Keep it to 2 sentences maximum. This is a quick dad comment, not a speech.

Webpage content: `;


// Function to trigger sad response with appropriate image
async function triggerSadResponse(currentFigure) {
  try {
    console.log('Sad response triggered for figure:', currentFigure);
    
    // Wake up dad if sleeping
    const wasAwake = isAwake;
    if (!wasAwake) {
      wakeUp();
    }
    
    // Store original image and styling
    const originalSrc = img.src;
    const originalZIndex = img.style.zIndex;
    
    let sadImageSrc;
    let sadMessage;
    
    if (currentFigure === 3) { // Chang - show fruit bowl
      sadImageSrc = chrome.runtime.getURL("assets/Fruit_Bowl.png");
      sadMessage = "Here kiddo, have some fresh fruit. It always makes me feel better when I'm down. Remember, this too shall pass.";
    } else if (currentFigure === 1) { // Bill - show sad bill
      sadImageSrc = chrome.runtime.getURL("assets/Sad_Bill.png");
      sadMessage = "Aw kiddo, I'm sad too when you're sad. Come here, let's talk about it. You know dad's always here for you, right?";
    } else { // Dave or other - use regular response
      sadMessage = "Hey there, kiddo. I can see you're feeling down. Want to talk about what's bothering you? I'm here to listen.";
      showSpeechBubble(sadMessage, 8000);
      return; // No special image for Dave
    }
    
    // Show special sad image
    img.style.zIndex = "10001";
    img.style.transition = 'transform 0.3s ease-out';
    img.src = sadImageSrc;
    img.style.transform = 'scale(1.2)';
    
    // Show speech bubble with sad message
    showSpeechBubble(sadMessage, 8000);
    
    // Add voice synthesis for the sad message
    chrome.storage.local.get(['voiceEnabled', 'elevenlabsApiKey'], async function(result) {
      if (result.voiceEnabled && result.elevenlabsApiKey) {
        try {
          await textToSpeech(sadMessage, result.elevenlabsApiKey, currentFigure);
        } catch (voiceError) {
          console.error('Voice synthesis error for sad response:', voiceError);
        }
      }
    });
    
    // Return to normal after 5 seconds
    setTimeout(() => {
      img.src = originalSrc;
      img.style.transform = 'scale(1)';
      img.style.zIndex = originalZIndex;
      
      // Go back to sleep if was sleeping
      if (!wasAwake) {
        setTimeout(() => {
          goToSleep();
        }, 2000);
      }
    }, 5000);
    
    console.log('Sad response complete');
  } catch (error) {
    console.error('Error triggering sad response:', error);
  }
}

// Function to trigger sneeze animation and effects
async function triggerSneeze() {
  try {
    // Only trigger if tab is visible/active
    if (document.hidden || document.visibilityState !== 'visible') {
      return;
    }
    
    console.log('Sneeze triggered!');
    
    // Get current father figure for correct sneeze images
    const result = await new Promise(resolve => {
      chrome.storage.local.get(['fatherFigure'], resolve);
    });
    const currentFigure = result.fatherFigure || 1;
    
    // Wake up dad if sleeping
    const wasAwake = isAwake;
    if (!wasAwake) {
      wakeUp();
    }
    
    // Get sneeze images based on character
    let sneezeImg1, sneezeImg2;
    if (currentFigure === 1) { // Bill
      sneezeImg1 = chrome.runtime.getURL("assets/Sneeze_.png");
      sneezeImg2 = chrome.runtime.getURL("assets/Sneeze_.png");
    } else if (currentFigure === 2) { // Dave
      sneezeImg1 = chrome.runtime.getURL("assets/Sneeze_Dave.png");
      sneezeImg2 = chrome.runtime.getURL("assets/Sneeze_Dave.png");
    } else if (currentFigure === 3) { // Chang
      sneezeImg1 = chrome.runtime.getURL("assets/Sneeze_Chang.png");
      sneezeImg2 = chrome.runtime.getURL("assets/Sneeze_Chang.png");
    }
    
    // Start screen shake effect
    startScreenShake();
    
    // Play sneeze sound
    playSneezeSound();
    
    // Animate sneeze images with enhanced visibility
    const originalSrc = img.src;
    const originalZIndex = img.style.zIndex;
    
    // Ensure dad stays visible during animation
    img.style.zIndex = '99999';
    img.style.position = 'fixed';
    
    // First sneeze frame - bigger enlargement
    img.src = sneezeImg1;
    img.style.transform = 'scale(1.5)';
    img.style.transition = 'transform 0.1s ease-out';
    
    setTimeout(() => {
      // Second sneeze frame - even bigger
      img.src = sneezeImg2;
      img.style.transform = 'scale(1.8)';
    }, 200);
    
    setTimeout(() => {
      // Third frame - maximum size
      img.style.transform = 'scale(2.0)';
    }, 400);
    
    setTimeout(() => {
      // Back to normal
      img.src = originalSrc;
      img.style.transform = 'scale(1)';
      img.style.transition = 'transform 0.3s ease-in';
      img.style.zIndex = originalZIndex;
      
      // Stop screen shake
      stopScreenShake();
      
      // Go back to sleep if was sleeping
      if (!wasAwake) {
        setTimeout(() => {
          goToSleep();
        }, 2000);
      }
    }, 1000);
    
    console.log('Sneeze animation complete');
  } catch (error) {
    console.error('Error triggering sneeze:', error);
  }
}

// Function to play sneeze sound
function playSneezeSound() {
  try {
    const audio = new Audio();
    audio.volume = 0.6;
    audio.src = chrome.runtime.getURL('assets/sneeze.mp3');
    
    audio.play().catch(error => {
      console.log('Could not play sneeze sound:', error);
    });
    
    // Clean up after playing
    audio.addEventListener('ended', () => {
      audio.remove();
    });
  } catch (error) {
    console.log('Error creating sneeze audio:', error);
  }
}

// Function to start screen shake effect
function startScreenShake() {
  const style = document.createElement('style');
  style.id = 'sneeze-shake-style';
  style.textContent = `
    @keyframes sneezeShake {
      0% { transform: translate(0px, 0px) rotate(0deg); }
      10% { transform: translate(-2px, -1px) rotate(-0.5deg); }
      20% { transform: translate(-1px, 0px) rotate(0.5deg); }
      30% { transform: translate(1px, 1px) rotate(0deg); }
      40% { transform: translate(1px, -1px) rotate(0.5deg); }
      50% { transform: translate(-1px, 1px) rotate(-0.5deg); }
      60% { transform: translate(-1px, 0px) rotate(0deg); }
      70% { transform: translate(1px, 1px) rotate(-0.5deg); }
      80% { transform: translate(-1px, -1px) rotate(0.5deg); }
      90% { transform: translate(1px, 1px) rotate(0deg); }
      100% { transform: translate(0px, 0px) rotate(0deg); }
    }
    
    .sneeze-shake {
      animation: sneezeShake 0.8s ease-in-out;
    }
    
    /* Ensure dad figure stays visible and stable during shake */
    #father-figure-logo {
      z-index: 99999 !important;
      position: fixed !important;
      transform-origin: center center !important;
    }
  `;
  document.head.appendChild(style);
  
  // Apply shake to body
  document.body.classList.add('sneeze-shake');
}

// Function to stop screen shake effect
function stopScreenShake() {
  document.body.classList.remove('sneeze-shake');
  
  // Remove style after animation
  setTimeout(() => {
    const shakeStyle = document.getElementById('sneeze-shake-style');
    if (shakeStyle) {
      shakeStyle.remove();
    }
  }, 1000);
}

// Function to start sneeze timer
function startSneezeTimer() {
  console.log('Starting sneeze timer for', SNEEZE_INTERVAL / 1000, 'seconds');
  
  // Clear existing timer
  if (sneezeTimer) {
    clearTimeout(sneezeTimer);
  }
  
  // Set timer for 5 minutes with random chance
  sneezeTimer = setTimeout(() => {
    console.log('Sneeze timer triggered!');
    
    // 30% chance to sneeze when timer triggers
    if (Math.random() < 0.3) {
      queueSpeechAction(() => triggerSneeze(), 'Sneeze', 'high');
    }
    
    // Restart timer for next potential sneeze
    startSneezeTimer();
  }, SNEEZE_INTERVAL);
}

// Chess game implementation
function createChessGame() {
  // Get current father figure for dad image
  chrome.storage.local.get(['fatherFigure'], function(result) {
    const currentFigure = result.fatherFigure || 1;
    const dadImages = {
      1: chrome.runtime.getURL("assets/newbill1.png"),
      2: chrome.runtime.getURL("assets/dave.png"), 
      3: chrome.runtime.getURL("assets/chang.png")
    };
    
    // Create chess overlay
    const chessOverlay = document.createElement('div');
    chessOverlay.id = 'chess-game-overlay';
    chessOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.9);
      z-index: 100000;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: 'Courier New', monospace;
    `;

    chessOverlay.innerHTML = `
      <div style="background: #2c3e50; border-radius: 15px; padding: 20px; max-width: 700px; width: 90%;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 15px;">
            <img src="${dadImages[currentFigure]}" style="width: 50px; height: 50px; border-radius: 50%; border: 2px solid white;" alt="Dad">
            <h2 style="color: white; margin: 0; font-size: 24px;">♟️ Chess with Dad</h2>
          </div>
          <button id="chess-close" style="background: #e74c3c; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 16px;">×</button>
        </div>
        
        <div style="display: flex; gap: 20px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 320px;">
            <div id="chess-board" style="
              display: grid;
              grid-template-columns: repeat(8, 40px);
              grid-template-rows: repeat(8, 40px);
              gap: 0;
              border: 3px solid #34495e;
              margin: 0 auto;
              width: fit-content;
            "></div>
          </div>
          
          <div style="flex: 1; min-width: 200px; color: white;">
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <h3 style="margin: 0 0 10px 0; font-size: 16px;">Game Status</h3>
              <div id="chess-status">Your turn (White)</div>
              <div id="chess-captured" style="margin-top: 10px; font-size: 12px;">
                <div>Captured: <span id="white-captured"></span></div>
                <div>Dad captured: <span id="black-captured"></span></div>
              </div>
            </div>
            
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
              <h3 style="margin: 0 0 10px 0; font-size: 16px;">Dad's Comments</h3>
              <div id="dad-chess-comment" style="font-style: italic; font-size: 14px;">Ready to play, kiddo! Make your move.</div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(chessOverlay);
    
    // Initialize chess board
    initializeChessBoard();
    
    // Add close button functionality
    document.getElementById('chess-close').addEventListener('click', closeChessGame);
    
    isChessGameActive = true;
    console.log('Chess game created with dad image');
  });
}

function initializeChessBoard() {
  const board = document.getElementById('chess-board');
  
  // Initial chess position
  const initialBoard = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
  ];
  
  // Chess piece symbols
  const pieceSymbols = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
  };
  
  chessBoard = JSON.parse(JSON.stringify(initialBoard));
  let selectedSquare = null;
  
  // Create board squares
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement('div');
      square.style.cssText = `
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        cursor: pointer;
        user-select: none;
        background: ${(row + col) % 2 === 0 ? '#f0d9b5' : '#b58863'};
      `;
      
      square.dataset.row = row;
      square.dataset.col = col;
      
      const piece = chessBoard[row][col];
      if (piece) {
        square.textContent = pieceSymbols[piece];
      }
      
      square.addEventListener('click', () => handleSquareClick(row, col, square));
      board.appendChild(square);
    }
  }
  
  function handleSquareClick(row, col, square) {
    if (selectedSquare) {
      // Try to move piece
      const fromRow = selectedSquare.row;
      const fromCol = selectedSquare.col;
      
      if (isValidMove(fromRow, fromCol, row, col)) {
        makeMove(fromRow, fromCol, row, col);
        selectedSquare.element.style.background = selectedSquare.originalColor;
        selectedSquare = null;
        
        // Dad's turn after a short delay
        setTimeout(() => {
          makeDadMove();
        }, 1000);
      } else {
        // Invalid move, deselect
        selectedSquare.element.style.background = selectedSquare.originalColor;
        selectedSquare = null;
      }
    } else {
      // Select piece if it's player's piece (uppercase = white)
      const piece = chessBoard[row][col];
      if (piece && piece === piece.toUpperCase()) {
        selectedSquare = {
          row: row,
          col: col,
          element: square,
          originalColor: square.style.background
        };
        square.style.background = '#ffff00';
      }
    }
  }
  
  function isValidMove(fromRow, fromCol, toRow, toCol) {
    // Basic validation - piece exists and not capturing own piece
    const piece = chessBoard[fromRow][fromCol];
    const target = chessBoard[toRow][toCol];
    
    if (!piece) return false;
    if (target && piece.toUpperCase() === target.toUpperCase()) return false;
    
    // Simple move validation (basic rules)
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    
    switch (piece.toLowerCase()) {
      case 'p': // Pawn
        const direction = piece === 'P' ? -1 : 1;
        const startRow = piece === 'P' ? 6 : 1;
        
        if (colDiff === 0) { // Forward move
          if (target) return false; // Can't capture forward
          if (rowDiff === 1 && toRow === fromRow + direction) return true;
          if (rowDiff === 2 && fromRow === startRow && toRow === fromRow + 2 * direction) return true;
        } else if (colDiff === 1 && rowDiff === 1) { // Diagonal capture
          return target && toRow === fromRow + direction;
        }
        return false;
        
      case 'r': // Rook
        return (rowDiff === 0 || colDiff === 0) && isPathClear(fromRow, fromCol, toRow, toCol);
        
      case 'n': // Knight
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
        
      case 'b': // Bishop
        return rowDiff === colDiff && isPathClear(fromRow, fromCol, toRow, toCol);
        
      case 'q': // Queen
        return ((rowDiff === 0 || colDiff === 0) || (rowDiff === colDiff)) && isPathClear(fromRow, fromCol, toRow, toCol);
        
      case 'k': // King
        return rowDiff <= 1 && colDiff <= 1;
        
      default:
        return false;
    }
  }
  
  function isPathClear(fromRow, fromCol, toRow, toCol) {
    const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
    const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;
    
    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;
    
    while (currentRow !== toRow || currentCol !== toCol) {
      if (chessBoard[currentRow][currentCol]) return false;
      currentRow += rowStep;
      currentCol += colStep;
    }
    
    return true;
  }
  
  function makeMove(fromRow, fromCol, toRow, toCol) {
    const piece = chessBoard[fromRow][fromCol];
    const captured = chessBoard[toRow][toCol];
    
    // Update board state
    chessBoard[toRow][toCol] = piece;
    chessBoard[fromRow][fromCol] = null;
    
    // Update visual board
    updateBoardDisplay();
    
    // Update captured pieces
    if (captured) {
      const capturedList = document.getElementById('black-captured');
      capturedList.textContent += pieceSymbols[captured] + ' ';
    }
    
    // Update status
    document.getElementById('chess-status').textContent = "Dad's turn (Black)";
  }
  
  function makeDadMove() {
    // Simple AI: find a random valid move
    const dadPieces = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = chessBoard[row][col];
        if (piece && piece === piece.toLowerCase()) {
          dadPieces.push({row, col, piece});
        }
      }
    }
    
    // Try to find a valid move
    for (let attempts = 0; attempts < 100; attempts++) {
      const randomPiece = dadPieces[Math.floor(Math.random() * dadPieces.length)];
      const toRow = Math.floor(Math.random() * 8);
      const toCol = Math.floor(Math.random() * 8);
      
      if (isValidMove(randomPiece.row, randomPiece.col, toRow, toCol)) {
        const captured = chessBoard[toRow][toCol];
        
        // Make dad's move
        chessBoard[toRow][toCol] = randomPiece.piece;
        chessBoard[randomPiece.row][randomPiece.col] = null;
        
        updateBoardDisplay();
        
        // Update captured pieces
        if (captured) {
          const capturedList = document.getElementById('white-captured');
          capturedList.textContent += pieceSymbols[captured] + ' ';
        }
        
        // Update status and dad comment
        document.getElementById('chess-status').textContent = "Your turn (White)";
        
        const dadComments = [
          "Nice move, kiddo! But watch this.",
          "You're getting better at this!",
          "That's my kid - always thinking ahead.",
          "Hmm, interesting strategy there.",
          "Let me show you how it's done!",
          "You're keeping me on my toes!"
        ];
        
        document.getElementById('dad-chess-comment').textContent = 
          dadComments[Math.floor(Math.random() * dadComments.length)];
        
        break;
      }
    }
  }
  
  function updateBoardDisplay() {
    const squares = board.children;
    for (let i = 0; i < squares.length; i++) {
      const row = Math.floor(i / 8);
      const col = i % 8;
      const piece = chessBoard[row][col];
      squares[i].textContent = piece ? pieceSymbols[piece] : '';
    }
  }
}

function closeChessGame() {
  const overlay = document.getElementById('chess-game-overlay');
  if (overlay) {
    overlay.remove();
  }
  isChessGameActive = false;
  chessGame = null;
  chessBoard = null;
  console.log('Chess game closed');
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
        text: text.replace(/\*/g, ''), // Remove asterisk characters from speech
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

// Function to trigger random dad messages (cheer, advice, motivation)
async function triggerRandomDadMessage() {
  try {
    // Only trigger if tab is visible/active
    if (document.hidden || document.visibilityState !== 'visible') {
      return;
    }
    
    // Combine all message types
    const allMessages = [
      ...cheerMessages,
      ...adviceMessages, 
      ...motivationMessages
    ];
    
    const randomMessage = allMessages[Math.floor(Math.random() * allMessages.length)];
    
    // Wake up dad briefly for the message
    const wasAwake = isAwake;
    if (!wasAwake) {
      wakeUp();
    }
    
    // Show speech bubble with random dad message
    showSpeechBubble(randomMessage, 8000);
    
    // Go back to sleep after a delay if dad was sleeping
    if (!wasAwake) {
      setTimeout(() => {
        goToSleep();
      }, 10000);
    }
    
    console.log('Random dad message triggered:', randomMessage);
  } catch (error) {
    console.error('Error triggering random dad message:', error);
  }
}

// Function to start dad joke timer
function startDadJokeTimer() {
  console.log('Starting dad joke timer for', JOKE_INTERVAL / 1000, 'seconds');
  
  // Clear existing timer
  if (dadJokeTimer) {
    clearTimeout(dadJokeTimer);
  }
  
  // Set timer for 2 minutes
  dadJokeTimer = setTimeout(() => {
    console.log('Dad joke timer triggered!');
    
    // 50% chance for dad joke, 50% chance for random dad message
    if (Math.random() < 0.5) {
      queueSpeechAction(() => triggerDadJoke(), 'Dad Joke', 'normal');
    } else {
      queueSpeechAction(() => triggerRandomDadMessage(), 'Random Dad Message', 'normal');
    }
    
    // Restart timer for next joke/message
    startDadJokeTimer();
  }, JOKE_INTERVAL);
}

// Function to start video recommendation timer
function startVideoRecommendationTimer() {
  console.log('Starting video recommendation timer for', VIDEO_RECOMMENDATION_INTERVAL / 1000, 'seconds');
  
  // Clear existing timer
  if (videoRecommendationTimer) {
    clearTimeout(videoRecommendationTimer);
  }
  
  // Set timer for 3 minutes
  videoRecommendationTimer = setTimeout(() => {
    console.log('Video recommendation timer triggered!');
    queueSpeechAction(() => triggerVideoRecommendation(), 'Video Recommendation', 'normal');
    // Restart timer for next recommendation
    startVideoRecommendationTimer();
  }, VIDEO_RECOMMENDATION_INTERVAL);
}

// Function to trigger dad joke (can be called manually or automatically)
async function triggerDadJoke(force = false) {
  try {
    console.log('triggerDadJoke called, force:', force, 'tab visible:', !document.hidden);
    
    // Only trigger if tab is visible/active (unless forced)
    if (!force && (document.hidden || document.visibilityState !== 'visible')) {
      console.log('Tab not active, skipping dad joke');
      return;
    }
    
    const now = Date.now();
    
    // Update last joke time
    lastJokeTime = now;
    
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

// Function to trigger video recommendation
async function triggerVideoRecommendation(force = false) {
  try {
    console.log('triggerVideoRecommendation called, force:', force, 'tab visible:', !document.hidden);
    
    // Only trigger if tab is visible/active (unless forced)
    if (!force && (document.hidden || document.visibilityState !== 'visible')) {
      console.log('Tab not active, skipping video recommendation');
      return;
    }
    
    const now = Date.now();
    
    // Update last recommendation time
    lastVideoRecommendationTime = now;
    
    const videoMessages = [
      "Hey kiddo, check out this video I found for you!",
      "You've been working hard - time for a quick video break!",
      "I saw this and thought of you. Give it a watch!",
      "Take a breather and watch this, champ!",
      "Found something that'll make you smile. Check it out!"
    ];
    
    const message = videoMessages[Math.floor(Math.random() * videoMessages.length)];
    
    // Wake up dad briefly for the recommendation
    const wasAwake = isAwake;
    if (!wasAwake) {
      wakeUp();
    }
    
    // Get API keys and settings for voice
    const result = await new Promise(resolve => {
      chrome.storage.local.get(['elevenlabsApiKey', 'voiceEnabled', 'fatherFigure'], resolve);
    });
    
    // Always speak video recommendations if ElevenLabs key is available (override voice setting)
    if (result.elevenlabsApiKey) {
      try {
        const currentFigure = result.fatherFigure || 1;
        console.log('Speaking video recommendation with voice (always enabled for videos)...');
        textToSpeech(message, result.elevenlabsApiKey, currentFigure); // Don't await - let voice continue while video opens
      } catch (voiceError) {
        console.error('Voice synthesis error for video recommendation:', voiceError);
      }
    } else {
      console.log('No ElevenLabs API key available for voice synthesis');
    }
    
    // Show speech bubble with video recommendation after voice starts
    const bubble = showSpeechBubble(message, 5000);
    
    // Automatically open the video after a short delay
    setTimeout(() => {
      window.open(YOUTUBE_VIDEO_URL, '_blank');
    }, 2000); // Open video after 2 seconds
    
    // Go back to sleep after a delay if dad was sleeping
    if (!wasAwake) {
      setTimeout(() => {
        goToSleep();
      }, 10000); // Stay awake for 10 seconds after recommendation
    }
    
    console.log('Video recommendation triggered:', message);
  } catch (error) {
    console.error('Error triggering video recommendation:', error);
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
    // Get current father figure from storage
    const result = await new Promise(resolve => {
      chrome.storage.local.get(['fatherFigure'], resolve);
    });
    
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
    
    // Get current father figure and their conversation history
    const currentFigure = result.fatherFigure || 1;
    const conversationHistory = conversationHistories[currentFigure];
    
    // Add system instructions as first user message if this is the start
    if (conversationHistory.length === 0) {
      let instructions = DAD_PERSONALITIES[currentFigure];
      
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
          maxOutputTokens: needsScreenContext ? 150 : 30, // Reduced tokens for dad jokes, more for help responses
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
      conversationHistories[currentFigure] = conversationHistory.slice(-20);
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
  img.src = dadAwakeSrc;
  // Resize awake images specifically
  img.style.width = "190px";
  img.style.height = "190px";
  stopRandomSnoring();
}

function goToSleep() {
  isAwake = false;
  sleepFrame = 1;
  img.src = dadSleep1Src;
  // Resize sleep images specifically
  img.style.width = "210px";
  img.style.height = "210px";
  startSleepAnimation();
  startRandomSnoring();
}

// Keyboard listeners for '[' key (snoring), ']' key (video), 's' key (sneeze), '\' key (sneeze), 'h' key (sad response), and ''' key (dad joke)
document.addEventListener('keydown', function(e) {
  if (!e.ctrlKey && !e.metaKey && !e.altKey) {
    // Only trigger if not typing in an input field
    if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      if (e.key === '[') {
        playSnoring();
      } else if (e.key === ']') {
        triggerVideoRecommendation(true); // Force trigger
      } else if (e.key === 's' || e.key === '\\') {
        queueSpeechAction(() => triggerSneeze(), 'Manual Sneeze', 'high');
      } else if (e.key === 'h') {
        // Test sad response - get current figure and trigger
        chrome.storage.local.get(['fatherFigure'], function(result) {
          const currentFigure = result.fatherFigure || 1;
          triggerSadResponse(currentFigure);
        });
      } else if (e.key === "'") {
        // Trigger dad joke
        queueSpeechAction(() => triggerDadJoke(true), 'Manual Dad Joke', 'high');
      }
    }
  }
});

// Random snoring functionality
function startRandomSnoring() {
  if (snoringTimer) {
    clearTimeout(snoringTimer);
  }
  
  function scheduleNextSnore() {
    // Random interval between 10-30 seconds
    const randomDelay = Math.random() * 20000 + 10000;
    
    snoringTimer = setTimeout(() => {
      // Only snore if still sleeping
      if (!isAwake) {
        playSnoring();
        scheduleNextSnore();
      }
    }, randomDelay);
  }
  
  scheduleNextSnore();
}

function stopRandomSnoring() {
  if (snoringTimer) {
    clearTimeout(snoringTimer);
    snoringTimer = null;
  }
  
  // Stop any currently playing snoring audio
  if (currentSnoringAudio && !currentSnoringAudio.paused) {
    currentSnoringAudio.pause();
    currentSnoringAudio.currentTime = 0;
    currentSnoringAudio = null;
  }
}

function playSnoring() {
  try {
    // Only play audio if tab is visible/active
    if (document.hidden || document.visibilityState !== 'visible') {
      console.log('Tab not active, skipping snoring sound');
      return;
    }
    
    // Stop any existing snoring audio first
    if (currentSnoringAudio && !currentSnoringAudio.paused) {
      currentSnoringAudio.pause();
      currentSnoringAudio.currentTime = 0;
    }
    
    // Create audio element and set source
    const audio = new Audio();
    audio.volume = 0.3; // Keep it subtle
    audio.preload = 'auto';
    currentSnoringAudio = audio; // Store reference for stopping
    
    // Set the source using chrome.runtime.getURL
    audio.src = chrome.runtime.getURL('assets/malesnoring.mp3');
    
    // Play with error handling
    audio.play().catch(error => {
      console.log('Could not play snoring sound:', error);
    });
    
    // Stop audio after 10 seconds
    setTimeout(() => {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
      if (currentSnoringAudio === audio) {
        currentSnoringAudio = null;
      }
      audio.remove();
    }, 10000);
    
    // Clean up after playing naturally ends
    audio.addEventListener('ended', () => {
      if (currentSnoringAudio === audio) {
        currentSnoringAudio = null;
      }
      audio.remove();
    });
    
  } catch (error) {
    console.log('Error creating snoring audio:', error);
  }
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
      #father-figure-options * {
        font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace !important;
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
        <input type="password" id="ff-api-key" placeholder="Enter Gemini API key..." autocomplete="off" spellcheck="false" style="flex: 1; padding: 6px; border: none; border-radius: 4px; background: rgba(255,255,255,0.1); color: white; font-size: 10px;" />
        <input type="password" id="ff-elevenlabs-key" placeholder="ElevenLabs API key..." autocomplete="off" spellcheck="false" style="flex: 1; padding: 6px; border: none; border-radius: 4px; background: rgba(255,255,255,0.1); color: white; font-size: 10px;" />
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
    // Wake up when clicked (stops snoring if sleeping)
    if (!isAwake) {
      wakeUp();
      return; // Just wake up, don't show overlay when sleeping
    }
    
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
            addChatMessage('Dad', 'That doesn\'t look like a valid Google API key, kiddo. It should start with "AIza".');
            return;
          }
          
          addChatMessage('You', message);
          chatInput.value = '';
          
          // Check for sad response before processing normally
          if (message.toLowerCase().includes("i'm sad") || message.toLowerCase().includes("im sad")) {
            chrome.storage.local.get(['fatherFigure'], function(result) {
              const currentFigure = result.fatherFigure || 1;
              triggerSadResponse(currentFigure);
            });
            return;
          }
          
          // Check for chess game request
          if (message.toLowerCase().includes("let's play chess") || 
              message.toLowerCase().includes("lets play chess") ||
              message.toLowerCase().includes("play chess") ||
              message.toLowerCase().includes("chess game")) {
            addChatMessage('Dad', "Great idea, kiddo! Let's play some chess together. Opening the board now!");
            setTimeout(() => {
              createChessGame();
            }, 1000);
            return;
          }
          
          const thinkingMsg = addChatMessage('Dad', '🤔 Thinking...');
          
          try {
            const response = await callGeminiAPI(message, apiKey);
            thinkingMsg.remove();
            addChatMessage('Dad', response);
            
            // Text-to-speech if enabled and ElevenLabs key is available
            chrome.storage.local.get(['voiceEnabled'], async function(result) {
              if (result.voiceEnabled && elevenlabsKeyInput.value) {
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
            });
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

// Activity tracking for idle detection (used for auto-sleep and idle features like tab warnings)
function trackActivity() {
  lastActivityTime = Date.now();
  
  // Clear existing idle timer
  if (idleTimer) {
    clearTimeout(idleTimer);
  }
  
  // Set new idle timer
  idleTimer = setTimeout(() => {
    checkIdleFeatures();
  }, IDLE_TIMEOUT);
}

// Check for tab warnings and video recommendations during idle periods
async function checkIdleFeatures() {
  // Only trigger if tab is visible/active
  if (document.hidden || document.visibilityState !== 'visible') {
    console.log('Tab not active, skipping idle feature check');
    // Set up next check
    idleTimer = setTimeout(() => {
      checkIdleFeatures();
    }, IDLE_TIMEOUT);
    return;
  }
  
  // Check tab count and warn if too many tabs are open
  try {
    chrome.tabs.query({}, function(tabs) {
      if (tabs && tabs.length >= 15) {
        const now = Date.now();
        const timeSinceLastWarning = now - (window.lastTabWarningTime || 0);
        
        // Only warn once every 5 minutes
        if (timeSinceLastWarning > 300000) {
          window.lastTabWarningTime = now;
          
          const tabWarningMessages = [
            `Whoa kiddo, you've got ${tabs.length} tabs open! That's a lot of digital real estate.`,
            `Hey champ, ${tabs.length} tabs? Even I can't keep track of that many things at once!`,
            `Kiddo, you've got ${tabs.length} tabs going - time to close some before your computer gets tired!`,
            `${tabs.length} tabs open? That's more tabs than I have dad jokes! (And that's saying something)`,
            `Sport, ${tabs.length} tabs is a lot. Maybe bookmark some and give your browser a break?`
          ];
          
          const message = tabWarningMessages[Math.floor(Math.random() * tabWarningMessages.length)];
          
          // Wake up dad and show warning
          const wasAwake = isAwake;
          if (!wasAwake) {
            wakeUp();
          }
          
          showSpeechBubble(message, 8000);
          
          // Go back to sleep if was sleeping
          if (!wasAwake) {
            setTimeout(() => {
              goToSleep();
            }, 10000);
          }
          
          console.log('Tab warning triggered:', message);
        }
      }
    });
  } catch (error) {
    console.error('Error checking tab count:', error);
  }
  
  // Set up next check
  idleTimer = setTimeout(() => {
    checkIdleFeatures();
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
  
  // Start dad joke timer, video recommendation timer, and sneeze timer
  console.log('Setting up activity tracking and starting timers');
  startDadJokeTimer();
  startVideoRecommendationTimer();
  startSneezeTimer();
}

// Expose functions globally for popup access
window.triggerDadJoke = triggerDadJoke;
window.triggerSneeze = triggerSneeze;
window.queueSpeechAction = queueSpeechAction;
window.createChessGame = createChessGame;
window.triggerSadResponse = triggerSadResponse;

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