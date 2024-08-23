function toggleRain() {
  const rainBackground = document.querySelector("rain-background");
  rainBackground.style.visibility = rainBackground.style.visibility === "hidden" ? "" : "hidden";
}

function toggleSplashes() {
  const splashContainer = document.querySelector("splash-container");
  splashContainer.style.visibility = splashContainer.style.visibility === "hidden" ? "" : "hidden";
}