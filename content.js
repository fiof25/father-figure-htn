// 1. Create the image element
const img = document.createElement("img");

// 2. Set the image source dynamically using chrome.runtime.getURL
img.src = chrome.runtime.getURL("assets/Logo.png");

// 3. Style it to stay at the bottom-right
Object.assign(img.style, {
  position: "fixed",   // stay relative to viewport
  bottom: "20px",      // 20px from bottom
  right: "20px",       // 20px from right
  width: "100px",      // adjust size as needed
  height: "100px",
  zIndex: "9999",      // appear on top
  pointerEvents: "none" // allows clicks to pass through
});

// 4. Append to the page
document.body.appendChild(img);