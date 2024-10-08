/**
 * Animates splashes within this element.
 * Use attributes "spashes" and "color" to specify frequency of splashes
 * and how to color them.
 */
class SplashContainer extends HTMLElement {
  // Allow customizing 
  static observedAttributes = ["splashes", "color"];
  splashes;
  color;

  // Internal properties for animation
  shadowRoot;
  clipPathId;
  /** Element where the particles mash should be applied. */
  container;
  /** SVG elements that function as each particle. */
  circles;
  /** Array of objects of splash particles */
  activeParticles;
  /** In pixels/s^2 */
  gravity;
  /** Timestamp of previous animation frame (in ms). */
  prevTimestamp;
  /** How much time is left until a new splash should be spawned (in ms) */
  newSplashTimeout;
  /** How much time is left until new splash should be spawn currently */
  newSplashTimeoutRemaining;
  /** ID of the next animation frame. Used for cancelling via the stop function. */
  animReqId;

  constructor() {
    super();
    // Init properties
    this.splashes = 0;
    this.activeParticles = [];
    this.gravity = 0.002;
    this.prevTimestamp = -1;
    this.newSplashTimeout = 150;
    this.newSplashTimeoutRemaining = Math.random() * this.newSplashTimeout;

    // Generate unique ID for splashes clipPath element
    //
    // Original ID generation implementation:
    // https://stackoverflow.com/questions/52713660/create-a-javascript-function-which-generates-a-random-character-id-comprising-o
    this.clipPathId = "splashes_";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 6; i++)
      this.clipPathId += characters.charAt(Math.floor(Math.random() * characters.length));
    this.shadowRoot = this.attachShadow({ mode: "open" });
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "splashes") {
      this.splashes = newValue;
      this.render();
    }
    else if (name === "color") {
      this.color = newValue;
      this.render();
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
    <div style="height: 100%; width: 100%; background: ${this.color}; clip-path: url(#${this.clipPathId})"></div>
    <svg width="0" height="0">
      <defs>
        <clipPath id=${this.clipPathId}>
          ${Array(2 * this.splashes).fill('<circle cx="-3" cy="-3" r="3" />').join("\n")}
        </clipPath>
      </defs>
    </svg>
    `;

    if (this.splashes > 0) {
      this.container = this.shadowRoot.querySelector("div");;
      this.circles = this.shadowRoot.querySelectorAll("circle");
      this.start();
    }
    else {
      this.stop();
    }
  }

  // --------------------
  //      ANIMATION
  // --------------------

  stop() {
    if (this.animReqId !== undefined) {
      window.cancelAnimationFrame(this.animReqId);
      this.animReqId = undefined;
    }
  }

  start() {
    this.stop();

    // Initialize activeParticles
    for (let i = 0; i < this.circles.length; i++) {
      if (i % 2 === 0)
        this.activeParticles.push({ left: null, right: null });
    }

    // Start animation
    this.animReqId = window.requestAnimationFrame(this.draw.bind(this));
  }

  draw(timestamp) {
    if (this.prevTimestamp === -1) this.prevTimestamp = timestamp;
    const delta = timestamp - this.prevTimestamp;

    // Iterate over particles array
    for (let i = 0; i < this.activeParticles.length; i++) {
      const left = this.activeParticles?.[i]?.left;
      const right = this.activeParticles?.[i]?.right;

      // Animate particles that have time left, or remove them if not
      // DEV NOTE:
      // Not sure why, but sometimes an element in circles is null when
      // splashes is 1 or 2. Hence, the ? accessor.
      if (left && left.timeLeft > 0) {
        this.circles[2 * i]?.setAttribute("cx", String(left.x));
        this.circles[2 * i]?.setAttribute("cy", String(left.y));

        left.timeLeft -= delta;
        left.x += left.velocity.x * delta;
        left.y += left.velocity.y * delta;
        left.velocity.y += this.gravity * delta;
        // Remove particles that do not
      } else if (left) {
        this.activeParticles[i].left = null;
        this.circles[2 * i]?.setAttribute("cx", "-3");
        this.circles[2 * i]?.setAttribute("cy", "-3");
      }
      if (right && right.timeLeft > 0) {
        this.circles[2 * i + 1]?.setAttribute("cx", String(right.x));
        this.circles[2 * i + 1]?.setAttribute("cy", String(right.y));

        right.timeLeft -= delta;
        right.x += right.velocity.x * delta;
        right.y += right.velocity.y * delta;
        right.velocity.y += this.gravity * delta;
        // Remove particles that do not
      } else if (right) {
        this.activeParticles[i].right = null;
        this.circles[2 * i + 1]?.setAttribute("cx", "-3");
        this.circles[2 * i + 1]?.setAttribute("cy", "-3");
      }

      // Add particles to activeParticles if timeout is done AND there is an available slot
      if (
        left === null &&
        right === null &&
        this.newSplashTimeoutRemaining < 0
      ) {
        this.activeParticles[i].left = this.getSplashParticle(true);
        this.activeParticles[i].right = this.getSplashParticle(false);
        this.activeParticles[i].right.x = this.activeParticles[i].left.x;

        this.newSplashTimeoutRemaining = this.newSplashTimeout + delta;
      }
    }
    // Update timestamp
    this.newSplashTimeoutRemaining -= delta;
    this.prevTimestamp = timestamp;

    this.animReqId = window.requestAnimationFrame(this.draw.bind(this));
  }

  // --------------------
  //   HELPER FUNCTIONS
  // --------------------

  /**
   * Returns a new splash particle, whose position is relative to the
   * top-left corner of the div.
   * 
   * Returns an object with x and y coordinates, velocity with x and y coords,
   * and time left in the particle's lifetime.
   */
  getSplashParticle(isLeft) {
    const splashXMargin = 24;
    return {
      x:
        splashXMargin +
        Math.random() * (this.container.clientWidth - 2 * splashXMargin),
      y: this.ySpawnPos ?? this.container.clientHeight,
      velocity: {
        x: (0.01 + 0.09 * Math.random()) * (isLeft ? -1 : 1),
        y: -0.4 + Math.random() * 0.15,
      },
      timeLeft: 250 + Math.random() * 150,
    };
  }
}

customElements.define("splash-container", SplashContainer);