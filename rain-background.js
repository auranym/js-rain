class RainBackground extends HTMLElement {
  // Allow customization
  static observedAttributes = ["color1", "color2"];
  color1;
  color2;

  shadowRoot;
  /** Canvas element to animate. */
  rainCanvas;
  /** Canvas context used for animation. */
  rainCtx;
  /**
   * Array of droplet objects currently in the canvas.
   * Droplets have x, y, and color properties.
   * (See `getDroplet()`.)
   */
  droplets;
  /** Timestamp of previous animation frame (in ms). */
  prevTimestamp;
  /** How much time is left until a new droplet should be spawned (in ms) */
  newDropletTimeoutRemaining;

  constructor() {
    super();

    this.color1 = "#000";
    this.color2 = "#000";
    this.droplets = [];
    this.prevTimestamp = -1;
    this.newDropletTimeoutRemaining = 0;
    this.shadowRoot = this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <canvas
        style="position: fixed; top: 0; left: 0"
        aria-hidden="true"
        role="presentation">
      </canvas>
    `;

    let el = this.shadowRoot.querySelector("canvas");
    if (!el?.getContext) {
      console.error("rain-background: Could not find canvas.");
      return;
    }
    this.rainCanvas = el;

    el = this.rainCanvas.getContext("2d");
    if (!el) {
      console.error("rain-background: Could not get canvas context.");
      return;
    }
    this.rainCtx = el;

    // Set size and watch for changes
    this.setCanvasSize(window.innerWidth, window.innerHeight);

    /**
     * Debounce setWindow at 100ms.
     * 
     * Based on implementation by David Walsh
     * https://davidwalsh.name/javascript-debounce-function
     */
    window.onresize = (func => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, 100);
      };
    })(() => this.setCanvasSize(window.innerWidth, window.innerHeight));

    // Start animation
    window.requestAnimationFrame(this.drawDroplets.bind(this));
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "color1") {
      this.color1 = newValue;
    }
    else if (name === "color2") {
      this.color2 = newValue;
    }
  }

  // --------------------
  //      ANIMATION
  // --------------------
  drawDroplets(timestamp) {

    if (this.prevTimestamp === -1) this.prevTimestamp = timestamp;
    const delta = timestamp - this.prevTimestamp;

    // Clear previous frame
    this.rainCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    this.droplets = this.droplets.reduce((newDroplets, droplet) => {
      // Delete now-out-of-frame raindrops
      if (droplet.y >= window.innerHeight) return newDroplets;

      // Update position of in-frame rain drops
      droplet.y += delta * this.getDropletSpeed();
      newDroplets.push(droplet);
      return newDroplets;
    }, []);
    // Add new droplet if necessary
    if (this.newDropletTimeoutRemaining <= 0) {
      this.droplets.push(this.getDroplet());
      this.newDropletTimeoutRemaining = this.getNewDropletTimeout();
    } else {
      this.newDropletTimeoutRemaining -= delta;
    }

    // Animate droplets array
    const dropletLength = this.getDropletLength();
    for (const droplet of this.droplets) {
      this.rainCtx.fillStyle = droplet.color;
      this.rainCtx.beginPath();
      this.rainCtx.roundRect(
        Math.round(droplet.x),
        Math.round(droplet.y),
        4,
        dropletLength,
        4
      );
      this.rainCtx.fill();
    }

    // Update timestamp
    this.prevTimestamp = timestamp;

    window.requestAnimationFrame(this.drawDroplets.bind(this));
  }

  // --------------------
  //   HELPER FUNCTIONS
  // --------------------
  /**
   * Returns a new droplet object, whose position is where it should
   * initially "spawn" in the canvas.
   */
  getDroplet() {
    const dropletLength = this.getDropletLength();
    return {
      x: window.innerWidth * Math.random(),
      y: (dropletLength / 2.0) * Math.random() - dropletLength / 2.0,
      color: [this.color1, this.color2][Math.floor(Math.random() * 2)]
    };
  }

  /** How long droplets are, in px */
  getDropletLength() {
    return Math.ceil(window.innerHeight / 2);
  }
  /** How fast droplets fall, in px / ms */
  getDropletSpeed() {
    return Math.ceil(window.innerHeight / 250)
  }
  /** How long to wait for a new droplet to spawn, in ms */
  getNewDropletTimeout() {
    return Math.ceil(15000 / window.innerWidth);
  }

  setCanvasSize(width, height) {
    this.rainCanvas.setAttribute("width", `${width}px`);
    this.rainCanvas.setAttribute("height", `${height}px`);
  }
}

customElements.define("rain-background", RainBackground);