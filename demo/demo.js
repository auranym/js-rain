function toggleRain() {
  const rainBackground = document.querySelector("rain-background");
  rainBackground.style.visibility = rainBackground.style.visibility === "hidden" ? "" : "hidden";
}

function toggleSplashes() {
  for (let splashContainer of document.querySelectorAll("splash-container")) {
    splashContainer.style.visibility = splashContainer.style.visibility === "hidden" ? "" : "hidden";
  }
}