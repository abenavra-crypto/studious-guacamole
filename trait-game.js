(function () {
  const canvas = document.getElementById('trait-game');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // --- Configuration ---
  const TRAITS = [
    'sanguine','buoyant','convivial','misanthropic','solitary','affable',
    'aloof','magnanimous','altruistic','self-serving','duplicitous','guileless',
    'erudite','incurious','pedantic','sagacious','shrewd','obtuse','ascetic',
    'relentless','dilettantish','effusive','reserved','sentimental','detached',
    'passionate','dispassionate','imperious','deferential','domineering',
    'submissive','authoritarian','egalitarian','skeptical','suspicious',
    'trusting','guarded','ingenuous','disingenuous','audacious','timorous',
    'reckless','circumspect','impetuous','deliberate','foolhardy','intrepid'
  ];

  // Trait behaviour modifiers
  const TRAIT_FX = {
    sanguine:      { color: '#FFD700', speed: 1.3, size: 1.0, expression: '😄' },
    buoyant:       { color: '#87CEEB', speed: 1.2, size: 0.9, expression: '🎈' },
    convivial:     { color: '#FFA07A', speed: 1.1, size: 1.1, expression: '🥳' },
    misanthropic:  { color: '#8B0000', speed: 0.7, size: 1.2, expression: '😠' },
    solitary:      { color: '#4B0082', speed: 0.6, size: 0.85, expression: '🧘' },
    affable:       { color: '#FF69B4', speed: 1.0, size: 1.0, expression: '😊' },
    aloof:         { color: '#778899', speed: 0.8, size: 0.9, expression: '😐' },
    magnanimous:   { color: '#DAA520', speed: 1.0, size: 1.3, expression: '👑' },
    altruistic:    { color: '#32CD32', speed: 1.1, size: 1.1, expression: '💚' },
    'self-serving':{ color: '#B22222', speed: 1.4, size: 1.0, expression: '😏' },
    duplicitous:   { color: '#800080', speed: 1.2, size: 1.0, expression: '🎭' },
    guileless:     { color: '#ADD8E6', speed: 0.9, size: 0.9, expression: '😇' },
    erudite:       { color: '#2E8B57', speed: 0.8, size: 1.1, expression: '🎓' },
    incurious:     { color: '#A9A9A9', speed: 0.5, size: 1.0, expression: '😴' },
    pedantic:      { color: '#556B2F', speed: 0.7, size: 1.0, expression: '🤓' },
    sagacious:     { color: '#6A5ACD', speed: 0.9, size: 1.15, expression: '🦉' },
    shrewd:        { color: '#DC143C', speed: 1.3, size: 0.9, expression: '🦊' },
    obtuse:        { color: '#808080', speed: 0.6, size: 1.2, expression: '😕' },
    ascetic:       { color: '#D2B48C', speed: 0.7, size: 0.8, expression: '🧎' },
    relentless:    { color: '#FF4500', speed: 1.6, size: 1.0, expression: '🔥' },
    dilettantish:  { color: '#EE82EE', speed: 1.1, size: 0.95, expression: '🎨' },
    effusive:      { color: '#FF1493', speed: 1.4, size: 1.15, expression: '💖' },
    reserved:      { color: '#708090', speed: 0.6, size: 0.85, expression: '🤐' },
    sentimental:   { color: '#DB7093', speed: 0.8, size: 1.05, expression: '🥹' },
    detached:      { color: '#B0C4DE', speed: 0.7, size: 0.9, expression: '🧊' },
    passionate:    { color: '#FF0000', speed: 1.5, size: 1.1, expression: '❤️‍🔥' },
    dispassionate: { color: '#C0C0C0', speed: 0.6, size: 1.0, expression: '🗿' },
    imperious:     { color: '#800020', speed: 1.1, size: 1.25, expression: '👊' },
    deferential:   { color: '#98FB98', speed: 0.7, size: 0.8, expression: '🙇' },
    domineering:   { color: '#8B0000', speed: 1.4, size: 1.3, expression: '💪' },
    submissive:    { color: '#D3D3D3', speed: 0.5, size: 0.75, expression: '😣' },
    authoritarian: { color: '#2F4F4F', speed: 1.2, size: 1.3, expression: '⚡' },
    egalitarian:   { color: '#3CB371', speed: 1.0, size: 1.0, expression: '⚖️' },
    skeptical:     { color: '#BDB76B', speed: 0.8, size: 1.0, expression: '🤨' },
    suspicious:    { color: '#8B4513', speed: 0.9, size: 1.05, expression: '👀' },
    trusting:      { color: '#87CEFA', speed: 1.0, size: 1.0, expression: '🤝' },
    guarded:       { color: '#696969', speed: 0.7, size: 1.1, expression: '🛡️' },
    ingenuous:     { color: '#FAFAD2', speed: 1.0, size: 0.9, expression: '🌸' },
    disingenuous:  { color: '#483D8B', speed: 1.2, size: 1.0, expression: '🐍' },
    audacious:     { color: '#FF6347', speed: 1.5, size: 1.15, expression: '🚀' },
    timorous:      { color: '#DDA0DD', speed: 0.4, size: 0.75, expression: '😨' },
    reckless:      { color: '#FF4500', speed: 1.7, size: 1.0, expression: '💥' },
    circumspect:   { color: '#5F9EA0', speed: 0.6, size: 1.0, expression: '🔍' },
    impetuous:     { color: '#FF8C00', speed: 1.6, size: 1.05, expression: '⚡' },
    deliberate:    { color: '#4682B4', speed: 0.5, size: 1.1, expression: '🎯' },
    foolhardy:     { color: '#FF69B4', speed: 1.7, size: 1.0, expression: '🤪' },
    intrepid:      { color: '#228B22', speed: 1.4, size: 1.15, expression: '🦁' }
  };

  // --- Sizing ---
  let W, H, cx, cy, arenaR, charR;
  const BUBBLE_R = 28;
  const BASE_CHAR_R = 14;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dim = Math.min(rect.width - 20, 620);
    canvas.width = dim;
    canvas.height = dim;
    W = canvas.width;
    H = canvas.height;
    cx = W / 2;
    cy = H / 2;
    arenaR = (W / 2) - 50;
    charR = BASE_CHAR_R;
  }

  // --- Bubbles ---
  let bubbles = [];
  function initBubbles() {
    bubbles = TRAITS.map((trait, i) => {
      const angle = (2 * Math.PI * i) / TRAITS.length;
      return {
        trait,
        angle,
        x: cx + Math.cos(angle) * arenaR,
        y: cy + Math.sin(angle) * arenaR,
        r: BUBBLE_R,
        alive: true,
        pop: 0 // pop animation progress 0..1
      };
    });
  }

  // --- Character ---
  const char = {
    x: 0, y: 0, vx: 2.5, vy: 1.8,
    currentTrait: null,
    traitColor: '#c9a84c',
    speedMul: 1,
    sizeMul: 1,
    expression: '🙂',
    trail: [],
    absorbedTraits: []
  };

  function resetChar() {
    char.x = cx;
    char.y = cy;
    char.vx = 2.5 * (Math.random() > 0.5 ? 1 : -1);
    char.vy = 1.8 * (Math.random() > 0.5 ? 1 : -1);
    char.currentTrait = null;
    char.traitColor = '#c9a84c';
    char.speedMul = 1;
    char.sizeMul = 1;
    char.expression = '🙂';
    char.trail = [];
    char.absorbedTraits = [];
  }

  // --- Drawing helpers ---
  function drawArena() {
    // Outer glow
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, arenaR + 4, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(201,168,76,0.3)';
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.closePath();

    // Main ring
    ctx.beginPath();
    ctx.arc(cx, cy, arenaR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(201,168,76,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }

  function drawBubble(b) {
    if (!b.alive) {
      if (b.pop < 1) {
        // Pop animation
        b.pop += 0.05;
        const scale = 1 + b.pop * 0.8;
        const alpha = 1 - b.pop;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * scale, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(201,168,76,0.3)';
        ctx.fill();
        ctx.closePath();
        ctx.restore();
      }
      return;
    }

    // Floating motion
    const wobble = Math.sin(Date.now() * 0.002 + b.angle * 3) * 3;
    const bx = b.x + Math.cos(b.angle) * wobble;
    const by = b.y + Math.sin(b.angle) * wobble;

    // Bubble
    ctx.save();
    ctx.beginPath();
    ctx.arc(bx, by, b.r, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(bx - 5, by - 5, 2, bx, by, b.r);
    grad.addColorStop(0, 'rgba(201,168,76,0.25)');
    grad.addColorStop(1, 'rgba(26,26,46,0.7)');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(201,168,76,0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.closePath();

    // Text
    ctx.fillStyle = '#c9a84c';
    ctx.font = '600 9px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.trait, bx, by);
    ctx.restore();
  }

  function drawCharacter() {
    const r = charR * char.sizeMul;
    const x = char.x;
    const y = char.y;

    // Trail
    ctx.save();
    for (let i = 0; i < char.trail.length; i++) {
      const t = char.trail[i];
      const alpha = (i / char.trail.length) * 0.3;
      ctx.beginPath();
      ctx.arc(t.x, t.y, r * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = char.traitColor + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.fill();
      ctx.closePath();
    }
    ctx.restore();

    // Body (simple stick figure in a circle)
    ctx.save();

    // Glow
    ctx.shadowColor = char.traitColor;
    ctx.shadowBlur = 15;

    // Head circle
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = char.traitColor;
    ctx.fill();
    ctx.closePath();

    ctx.shadowBlur = 0;

    // Expression emoji
    ctx.font = `${Math.round(r * 1.4)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char.expression, x, y + 1);

    // Legs (two little lines showing movement direction)
    const angle = Math.atan2(char.vy, char.vx);
    const legLen = r * 1.2;
    const legSpread = 0.4;
    const kick = Math.sin(Date.now() * 0.01) * 0.3;

    ctx.strokeStyle = char.traitColor;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    // Left leg
    ctx.beginPath();
    ctx.moveTo(x, y + r * 0.7);
    ctx.lineTo(
      x + Math.cos(angle + Math.PI * 0.5 + legSpread + kick) * legLen,
      y + r * 0.7 + Math.sin(angle + Math.PI * 0.5 + legSpread + kick) * legLen
    );
    ctx.stroke();

    // Right leg
    ctx.beginPath();
    ctx.moveTo(x, y + r * 0.7);
    ctx.lineTo(
      x + Math.cos(angle + Math.PI * 0.5 - legSpread - kick) * legLen,
      y + r * 0.7 + Math.sin(angle + Math.PI * 0.5 - legSpread - kick) * legLen
    );
    ctx.stroke();

    // Arms
    const armKick = Math.sin(Date.now() * 0.01 + 1) * 0.3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
      x + Math.cos(angle - 0.6 + armKick) * legLen,
      y + Math.sin(angle - 0.6 + armKick) * legLen
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
      x + Math.cos(angle + 0.6 - armKick) * legLen,
      y + Math.sin(angle + 0.6 - armKick) * legLen
    );
    ctx.stroke();

    ctx.restore();
  }

  function drawHUD() {
    // Current trait display
    if (char.currentTrait) {
      ctx.save();
      ctx.fillStyle = '#c9a84c';
      ctx.font = 'bold 16px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('Current trait: ' + char.currentTrait, cx, 12);
      ctx.restore();
    }

    // Absorbed traits count
    if (char.absorbedTraits.length > 0) {
      ctx.save();
      ctx.fillStyle = 'rgba(201,168,76,0.6)';
      ctx.font = '12px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(
        'Absorbed: ' + char.absorbedTraits.join(' → '),
        cx, H - 8
      );
      ctx.restore();
    }
  }

  // --- Physics ---
  function update() {
    const speed = char.speedMul;
    char.x += char.vx * speed;
    char.y += char.vy * speed;

    // Trail
    char.trail.push({ x: char.x, y: char.y });
    if (char.trail.length > 12) char.trail.shift();

    // Bounce off arena circle
    const dx = char.x - cx;
    const dy = char.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const effectiveR = charR * char.sizeMul;

    if (dist + effectiveR > arenaR) {
      // Push back inside
      const nx = dx / dist;
      const ny = dy / dist;
      char.x = cx + nx * (arenaR - effectiveR);
      char.y = cy + ny * (arenaR - effectiveR);

      // Reflect velocity
      const dot = char.vx * nx + char.vy * ny;
      char.vx -= 2 * dot * nx;
      char.vy -= 2 * dot * ny;

      // Small random perturbation so it doesn't loop
      char.vx += (Math.random() - 0.5) * 0.5;
      char.vy += (Math.random() - 0.5) * 0.5;
    }

    // Collision with bubbles
    for (const b of bubbles) {
      if (!b.alive) continue;
      const wobble = Math.sin(Date.now() * 0.002 + b.angle * 3) * 3;
      const bx = b.x + Math.cos(b.angle) * wobble;
      const by = b.y + Math.sin(b.angle) * wobble;
      const ddx = char.x - bx;
      const ddy = char.y - by;
      const d = Math.sqrt(ddx * ddx + ddy * ddy);
      if (d < effectiveR + b.r) {
        absorbTrait(b);
      }
    }
  }

  function absorbTrait(bubble) {
    bubble.alive = false;
    bubble.pop = 0;
    char.currentTrait = bubble.trait;
    char.absorbedTraits.push(bubble.trait);
    // Keep last 5 for display
    if (char.absorbedTraits.length > 5) char.absorbedTraits.shift();

    const fx = TRAIT_FX[bubble.trait];
    if (fx) {
      char.traitColor = fx.color;
      char.speedMul = fx.speed;
      char.sizeMul = fx.size;
      char.expression = fx.expression;
    }

    // Update trait display below canvas
    const el = document.getElementById('trait-display');
    if (el) {
      el.textContent = bubble.trait.toUpperCase();
      el.style.color = fx ? fx.color : '#c9a84c';
    }

    // Check if all absorbed
    if (bubbles.every(b => !b.alive)) {
      setTimeout(() => {
        initBubbles();
        resetChar();
        resize();
      }, 2000);
    }
  }

  // --- Main loop ---
  function frame() {
    ctx.clearRect(0, 0, W, H);

    // Dark bg
    ctx.fillStyle = 'rgba(26,26,46,0.95)';
    ctx.fillRect(0, 0, W, H);

    drawArena();
    bubbles.forEach(drawBubble);
    update();
    drawCharacter();
    drawHUD();

    requestAnimationFrame(frame);
  }

  // --- Init ---
  resize();
  initBubbles();
  resetChar();
  window.addEventListener('resize', () => {
    resize();
    initBubbles();
  });
  frame();
})();
