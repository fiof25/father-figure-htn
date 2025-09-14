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

// Show message function
function showMessage(text) {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = text;
  messageDiv.style.display = 'block';
  
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 5000);
}

// Change the father figure and update UI
function changeFatherFigure(figure) {
  // Save the selection
  chrome.storage.local.set({ fatherFigure: figure }, function() {
    // Update UI to show selected character
    document.querySelectorAll('.character-option').forEach(option => {
      option.classList.remove('selected');
    });
    document.getElementById(`character-${['bill', 'dave', 'chang'][figure-1]}`).classList.add('selected');
    
    // Show confirmation message
    const names = ['Bill', 'Dave', 'Chang'];
    showMessage(`Switched to ${names[figure-1]}!`);
  });
}

// Function to trigger dad joke in active tab
function triggerDadJokeInTab() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        function: () => {
          if (window.queueSpeechAction && window.triggerDadJoke) {
            window.queueSpeechAction(() => window.triggerDadJoke(true), 'Manual Dad Joke', 'high');
          }
        }
      });
      
      // Show feedback in popup
      showMessage("Dad is telling you a joke! 😄");
      
      // Close popup after triggering
      setTimeout(() => {
        window.close();
      }, 1500);
    }
  });
}

// Function to trigger sneeze in active tab
function triggerSneezeInTab() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        function: () => {
          console.log('Popup sneeze button clicked - checking functions...');
          console.log('queueSpeechAction available:', typeof window.queueSpeechAction);
          console.log('triggerSneeze available:', typeof window.triggerSneeze);
          
          if (window.queueSpeechAction && window.triggerSneeze) {
            console.log('Triggering sneeze from popup...');
            window.queueSpeechAction(() => window.triggerSneeze(), 'Manual Sneeze', 'high');
          } else {
            console.error('Functions not available - trying direct call...');
            if (window.triggerSneeze) {
              window.triggerSneeze();
            }
          }
        }
      });
      
      // Show feedback in popup
      showMessage("Dad is sneezing! 🤧");
      
      // Close popup after triggering
      setTimeout(() => {
        window.close();
      }, 1500);
    }
  });
}

// Function to trigger chess game in active tab
function triggerChessGameInTab() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        function: () => {
          if (window.createChessGame) {
            window.createChessGame();
          }
        }
      });
      
      // Show feedback in popup
      showMessage("Starting chess game! ♟️");
      
      // Close popup after triggering
      setTimeout(() => {
        window.close();
      }, 1500);
    }
  });
}

// Initialize the popup
document.addEventListener('DOMContentLoaded', function() {
  // Set up character selection
  const characterOptions = document.querySelectorAll('.character-option');
  characterOptions.forEach(option => {
    option.addEventListener('click', function() {
      const figure = parseInt(this.getAttribute('data-character'));
      changeFatherFigure(figure);
    });
  });

  // Set up dad joke button
  const dadJokeBtn = document.getElementById('dad-joke-btn');
  if (dadJokeBtn) {
    dadJokeBtn.addEventListener('click', triggerDadJokeInTab);
  }

  // Set up sneeze button
  const sneezeBtn = document.getElementById('sneeze-btn');
  if (sneezeBtn) {
    sneezeBtn.addEventListener('click', triggerSneezeInTab);
  }

  // Set up chess button
  const chessBtn = document.getElementById('chess-btn');
  if (chessBtn) {
    chessBtn.addEventListener('click', triggerChessGameInTab);
  }

  // Load current selection
  chrome.storage.local.get(['fatherFigure'], function(result) {
    const figure = result.fatherFigure || 1; // Default to Bill (1)
    document.querySelectorAll('.character-option').forEach(option => {
      option.classList.remove('selected');
    });
    document.getElementById(`character-${['bill', 'dave', 'chang'][figure-1]}`)?.classList.add('selected');
  });
});
