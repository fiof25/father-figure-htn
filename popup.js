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

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('cheer').addEventListener('click', function() {
    const randomMessage = cheerMessages[Math.floor(Math.random() * cheerMessages.length)];
    showMessage(randomMessage);
  });
  
  document.getElementById('advice').addEventListener('click', function() {
    const randomMessage = adviceMessages[Math.floor(Math.random() * adviceMessages.length)];
    showMessage(randomMessage);
  });
  
  document.getElementById('motivation').addEventListener('click', function() {
    const randomMessage = motivationMessages[Math.floor(Math.random() * motivationMessages.length)];
    showMessage(randomMessage);
  });
});
