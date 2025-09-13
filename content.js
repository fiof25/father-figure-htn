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

// 1. Create the image element
const img = document.createElement("img");

// 2. Set the image source dynamically using chrome.runtime.getURL
img.src = chrome.runtime.getURL("assets/Logo.png");

// 3. Style it to stay at the bottom-right and make it clickable
Object.assign(img.style, {
  position: "fixed",
  bottom: "20px",
  right: "20px",
  width: "100px",
  height: "100px",
  zIndex: "9999",
  pointerEvents: "auto", // Enable clicks
  cursor: "pointer",
  borderRadius: "50%",
  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
  transition: "all 0.3s ease"
});

// Add hover effect
img.addEventListener('mouseenter', function() {
  img.style.transform = 'scale(1.1)';
});

img.addEventListener('mouseleave', function() {
  img.style.transform = 'scale(1)';
});

// Create options overlay
function createOptionsOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'father-figure-options';
  
  Object.assign(overlay.style, {
    position: 'fixed',
    bottom: '140px',
    right: '20px',
    width: '280px',
    padding: '20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    zIndex: '10000',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    transform: 'scale(0)',
    transformOrigin: 'bottom right',
    transition: 'all 0.3s ease'
  });

  overlay.innerHTML = `
    <div style="text-align: center; margin-bottom: 15px;">
      <h3 style="margin: 0 0 5px 0; font-size: 16px;">Father Figure</h3>
      <p style="margin: 0; font-size: 12px; opacity: 0.8;">What do you need today?</p>
    </div>
    
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <button id="ff-cheer" style="padding: 12px; border: none; border-radius: 8px; background: rgba(255,255,255,0.2); color: white; cursor: pointer; font-size: 13px; transition: all 0.3s ease;">
        🎉 Cheer Me On
      </button>
      <button id="ff-advice" style="padding: 12px; border: none; border-radius: 8px; background: rgba(255,255,255,0.2); color: white; cursor: pointer; font-size: 13px; transition: all 0.3s ease;">
        💡 Give Me Advice
      </button>
      <button id="ff-motivation" style="padding: 12px; border: none; border-radius: 8px; background: rgba(255,255,255,0.2); color: white; cursor: pointer; font-size: 13px; transition: all 0.3s ease;">
        💪 Motivate Me
      </button>
      <button id="ff-close" style="padding: 8px; border: none; border-radius: 8px; background: rgba(255,255,255,0.1); color: white; cursor: pointer; font-size: 12px; transition: all 0.3s ease;">
        Close
      </button>
    </div>
    
    <div id="ff-message" style="margin-top: 15px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px; min-height: 20px; font-size: 12px; line-height: 1.4; display: none;"></div>
  `;

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

  return overlay;
}

// Show message function
function showMessage(text, messageDiv) {
  messageDiv.textContent = text;
  messageDiv.style.display = 'block';
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 5000);
}

// Click handler for the logo
img.addEventListener('click', function() {
  let existingOverlay = document.getElementById('father-figure-options');
  
  if (existingOverlay) {
    // Close overlay
    existingOverlay.style.transform = 'scale(0)';
    setTimeout(() => existingOverlay.remove(), 300);
  } else {
    // Create and show overlay
    const overlay = createOptionsOverlay();
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
      setTimeout(() => overlay.remove(), 300);
    });
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
  document.addEventListener('DOMContentLoaded', addLogoToPage);
} else {
  addLogoToPage();
}