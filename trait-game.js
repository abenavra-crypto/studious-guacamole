(function () {
  const canvas = document.getElementById('trait-game');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // --- The Writer's Journey stages (clockwise from top-right) ---
  const STAGES = [
    { name: 'The Call to Write',                 phase: 'Inspiration', emotion: 'curious',     color: '#FFD700', expression: '!',  note: 'An idea sparks...' },
    { name: 'Refusal to Write',                  phase: 'Inspiration', emotion: 'fearful',     color: '#A9A9A9', expression: '...',  note: 'Who am I to write this?' },
    { name: 'Finding a Mentor',                  phase: 'Inspiration', emotion: 'awestruck',   color: '#7B68EE', expression: '*',  note: 'A guiding voice' },
    { name: 'Opening the Blank Page',            phase: 'Inspiration', emotion: 'determined',  color: '#FF8C00', expression: '>',  note: 'Chapter one...' },
    { name: 'Lost in the First Draft',           phase: 'Inspiration', emotion: 'overwhelmed', color: '#4169E1', expression: '~',  note: 'Where is this going?' },
    { name: 'The Grind of Revision',             phase: 'Craft',       emotion: 'struggling',  color: '#DC143C', expression: 'X',  note: 'Draft after draft' },
    { name: 'Falling in Love with the Story',    phase: 'Craft',       emotion: 'enchanted',   color: '#FF69B4', expression: '<3', note: 'These characters live' },
    { name: 'Temptation to Abandon',             phase: 'Craft',       emotion: 'conflicted',  color: '#8B008B', expression: '?!', note: 'Maybe a new idea...' },
    { name: 'Confronting the Inner Critic',      phase: 'Craft',       emotion: 'humbled',     color: '#DAA520', expression: '=',  note: 'You\'re not good enough' },
    { name: 'The Breakthrough',                  phase: 'Craft',       emotion: 'transcendent', color: '#E6E6FA', expression: 'o',  note: 'It all clicks!' },
    { name: 'The Finished Draft',                phase: 'Craft',       emotion: 'triumphant',  color: '#FFD700', expression: '!!', note: 'FADE OUT.' },
    { name: 'Reluctance to Share',               phase: 'Release',     emotion: 'reluctant',   color: '#778899', expression: '<-', note: 'Not ready yet...' },
    { name: 'Sending It Out',                    phase: 'Release',     emotion: 'exhilarated', color: '#00CED1', expression: '>>',  note: 'Submitted!' },
    { name: 'Notes from a Reader',               phase: 'Release',     emotion: 'grateful',    color: '#32CD32', expression: '+',  note: 'Feedback arrives' },
    { name: 'The Final Polish',                  phase: 'Release',     emotion: 'resolute',    color: '#FF6347', expression: '><', note: 'One more pass' },
    { name: 'Writer Meets the World',            phase: 'Release',     emotion: 'wise',        color: '#9370DB', expression: '~o', note: 'Story and life merge' },
    { name: 'Freedom to Write Again',            phase: 'Release',     emotion: 'serene',      color: '#3CB371', expression: ':)', note: 'What\'s next?' }
  ];

  const PHASE_COLORS = {
    Inspiration: '#c9a84c',
    Craft:       '#e94560',
    Release:     '#3CB371'
  };

  // --- State ---
  let W, H, cx, cy, circleR;
  let angle = -Math.PI / 2; // start at top
  let speed = 0.004;
  let currentStageIdx = -1;
  let stageProgress = 0; // 0-1 within current stage arc
  let celebrating = false;
  let celebrateStart = 0;
  let loopCount = 0;
  let scribbleNotes = []; // floating note scraps
  let noteTimer = 0;
  let stickColor = '#c9a84c';
  let currentEmotion = '';
  let currentExpression = ':)';
  let sparkles = [];

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dim = Math.min(rect.width - 20, 700);
    canvas.width = dim;
    canvas.height = dim;
    W = canvas.width;
    H = canvas.height;
    cx = W / 2;
    cy = H / 2;
    circleR = (W / 2) - 90;
  }

  // --- Determine current stage from angle ---
  function getStageIndex(a) {
    // Normalize angle to 0..2PI starting from top (-PI/2)
    let norm = a + Math.PI / 2;
    if (norm < 0) norm += Math.PI * 2;
    norm = norm % (Math.PI * 2);
    const segAngle = (Math.PI * 2) / STAGES.length;
    return Math.floor(norm / segAngle) % STAGES.length;
  }

  function getStageAngle(idx) {
    const segAngle = (Math.PI * 2) / STAGES.length;
    return -Math.PI / 2 + segAngle * idx;
  }

  // --- Scribble notes that float up ---
  function spawnNote(x, y, text) {
    scribbleNotes.push({
      x, y, text,
      life: 1,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -0.8 - Math.random() * 0.5
    });
    if (scribbleNotes.length > 15) scribbleNotes.shift();
  }

  function updateNotes() {
    for (let i = scribbleNotes.length - 1; i >= 0; i--) {
      const n = scribbleNotes[i];
      n.x += n.vx;
      n.y += n.vy;
      n.life -= 0.008;
      if (n.life <= 0) scribbleNotes.splice(i, 1);
    }
  }

  function drawNotes() {
    ctx.save();
    for (const n of scribbleNotes) {
      ctx.globalAlpha = Math.max(0, n.life);
      ctx.fillStyle = '#c9a84c';
      ctx.font = 'italic 11px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(n.text, n.x, n.y);
    }
    ctx.restore();
  }

  // --- Draw the journey circle with labels ---
  function drawJourneyCircle() {
    // Main circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, circleR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(201,168,76,0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();

    // Dividing line (Ordinary World / Unknown World)
    ctx.beginPath();
    ctx.moveTo(cx - circleR, cy);
    ctx.lineTo(cx + circleR, cy);
    ctx.strokeStyle = 'rgba(201,168,76,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();

    // World labels
    ctx.fillStyle = 'rgba(201,168,76,0.25)';
    ctx.font = 'italic 14px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('The Idea', cx, cy - 14);
    ctx.fillText('The Work', cx, cy + 26);

    // Phase arcs and labels
    const phases = [
      { name: 'Inspiration', startIdx: 0,  endIdx: 4,  color: PHASE_COLORS.Inspiration },
      { name: 'Craft',       startIdx: 5,  endIdx: 10, color: PHASE_COLORS.Craft },
      { name: 'Release',     startIdx: 11, endIdx: 16, color: PHASE_COLORS.Release }
    ];

    for (const p of phases) {
      const a1 = getStageAngle(p.startIdx);
      const a2 = getStageAngle(p.endIdx + 1);
      ctx.beginPath();
      ctx.arc(cx, cy, circleR + 8, a1, a2);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 4;
      ctx.globalAlpha = 0.5;
      ctx.stroke();
      ctx.closePath();
      ctx.globalAlpha = 1;

      // Phase label
      const midA = (a1 + a2) / 2;
      const lx = cx + Math.cos(midA) * (circleR + 28);
      const ly = cy + Math.sin(midA) * (circleR + 28);
      ctx.fillStyle = p.color;
      ctx.font = 'italic bold 13px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.name, lx, ly);
    }

    // Stage markers and labels
    const segAngle = (Math.PI * 2) / STAGES.length;
    for (let i = 0; i < STAGES.length; i++) {
      const a = getStageAngle(i) + segAngle / 2; // center of segment
      const sx = cx + Math.cos(a) * circleR;
      const sy = cy + Math.sin(a) * circleR;

      // Dot on circle
      const dotR = (i === currentStageIdx) ? 5 : 3;
      ctx.beginPath();
      ctx.arc(sx, sy, dotR, 0, Math.PI * 2);
      ctx.fillStyle = (i === currentStageIdx) ? STAGES[i].color : 'rgba(201,168,76,0.4)';
      ctx.fill();
      ctx.closePath();

      // Stage number + short name label
      const labelR = circleR - 22;
      const lx = cx + Math.cos(a) * labelR;
      const ly = cy + Math.sin(a) * labelR;

      ctx.save();
      ctx.translate(lx, ly);
      // Rotate text to follow circle, but keep readable
      let rot = a + Math.PI / 2;
      if (a > Math.PI / 2 && a < Math.PI * 1.5) rot += Math.PI;
      // For top half, flip if needed
      if (Math.cos(a) < -0.01 && !(a > Math.PI / 2 && a < Math.PI * 1.5)) rot += Math.PI;
      ctx.rotate(rot);

      ctx.fillStyle = (i === currentStageIdx) ? STAGES[i].color : 'rgba(201,168,76,0.35)';
      ctx.font = (i === currentStageIdx) ? 'bold 9px "Segoe UI", sans-serif' : '8px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Abbreviate long names
      const shortName = (i + 1) + '. ' + STAGES[i].name;
      ctx.fillText(shortName, 0, 0);
      ctx.restore();
    }

    ctx.restore();
  }

  // --- Anime character ---
  function drawStickFigure(x, y, walkPhase, emotion, color, expr, scale) {
    const s = scale || 1;
    const t = walkPhase;

    // Dimensions
    const headR = 10 * s;
    const bodyH = 18 * s;
    const bodyW = 12 * s;
    const legLen = 14 * s;
    const armLen = 12 * s;
    const headCY = y - bodyH - headR - 2 * s;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // --- Glow behind character ---
    ctx.shadowColor = color;
    ctx.shadowBlur = 14;

    // --- Hair (behind head) ---
    ctx.fillStyle = '#2a1a3a';
    ctx.beginPath();
    ctx.ellipse(x, headCY - 2 * s, headR + 3 * s, headR + 5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Spiky anime hair tufts
    const hairSpikes = [
      [-8, -8, -13, -18, -4, -14],
      [-3, -10, 0, -22, 3, -10],
      [4, -8, 13, -18, 8, -9],
      [-10, -3, -16, -8, -11, 1],
      [10, -3, 16, -8, 11, 1]
    ];
    ctx.fillStyle = '#2a1a3a';
    for (const sp of hairSpikes) {
      ctx.beginPath();
      ctx.moveTo(x + sp[0] * s, headCY + sp[1] * s);
      ctx.quadraticCurveTo(x + sp[2] * s, headCY + sp[3] * s, x + sp[4] * s, headCY + sp[5] * s);
      ctx.fill();
    }

    ctx.shadowBlur = 0;

    // --- Face (skin) ---
    ctx.fillStyle = '#fde8d0';
    ctx.beginPath();
    ctx.arc(x, headCY, headR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e8c9a8';
    ctx.lineWidth = 0.8 * s;
    ctx.stroke();

    // --- Eyes (big anime style, change with emotion) ---
    const eyeY = headCY + 1 * s;
    const eyeSpacing = 4.5 * s;
    const eyeW = 3.5 * s;
    const eyeH = 4 * s;

    // Eye whites
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(x - eyeSpacing, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + eyeSpacing, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
    ctx.fill();

    // Irises (colored by current trait)
    const irisR = 2.2 * s;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x - eyeSpacing + 0.5 * s, eyeY + 0.5 * s, irisR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + eyeSpacing + 0.5 * s, eyeY + 0.5 * s, irisR, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(x - eyeSpacing + 0.5 * s, eyeY + 0.5 * s, 1 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + eyeSpacing + 0.5 * s, eyeY + 0.5 * s, 1 * s, 0, Math.PI * 2);
    ctx.fill();

    // Eye shine
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x - eyeSpacing - 0.3 * s, eyeY - 1 * s, 0.9 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + eyeSpacing - 0.3 * s, eyeY - 1 * s, 0.9 * s, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows (change with emotion)
    ctx.strokeStyle = '#2a1a3a';
    ctx.lineWidth = 1.5 * s;
    const browLift = (emotion === 'fearful' || emotion === 'overwhelmed') ? -2 * s :
                     (emotion === 'struggling' || emotion === 'conflicted') ? 1 * s :
                     (emotion === 'curious' || emotion === 'awestruck') ? -1.5 * s : 0;
    const browTilt = (emotion === 'struggling' || emotion === 'humbled') ? 1.5 * s :
                     (emotion === 'curious') ? -1 * s : 0;
    // Left brow
    ctx.beginPath();
    ctx.moveTo(x - eyeSpacing - eyeW, eyeY - eyeH - 1 * s + browLift + browTilt);
    ctx.lineTo(x - eyeSpacing + eyeW, eyeY - eyeH - 1 * s + browLift - browTilt);
    ctx.stroke();
    // Right brow
    ctx.beginPath();
    ctx.moveTo(x + eyeSpacing - eyeW, eyeY - eyeH - 1 * s + browLift - browTilt);
    ctx.lineTo(x + eyeSpacing + eyeW, eyeY - eyeH - 1 * s + browLift + browTilt);
    ctx.stroke();

    // --- Mouth (changes with emotion) ---
    const mouthY = headCY + 5.5 * s;
    ctx.strokeStyle = '#c47a5a';
    ctx.lineWidth = 1.2 * s;
    ctx.beginPath();
    if (emotion === 'triumphant' || emotion === 'enchanted' || emotion === 'exhilarated' || emotion === 'serene' || emotion === 'grateful') {
      // Happy smile
      ctx.arc(x, mouthY - 1 * s, 3 * s, 0.1 * Math.PI, 0.9 * Math.PI);
    } else if (emotion === 'fearful' || emotion === 'overwhelmed' || emotion === 'conflicted') {
      // Small 'o' mouth
      ctx.arc(x, mouthY, 1.5 * s, 0, Math.PI * 2);
    } else if (emotion === 'struggling' || emotion === 'humbled' || emotion === 'reluctant') {
      // Frown
      ctx.arc(x, mouthY + 3 * s, 3 * s, 1.1 * Math.PI, 1.9 * Math.PI);
    } else if (emotion === 'transcendent') {
      // Serene closed smile
      ctx.moveTo(x - 2.5 * s, mouthY);
      ctx.quadraticCurveTo(x, mouthY + 2 * s, x + 2.5 * s, mouthY);
    } else {
      // Neutral
      ctx.moveTo(x - 2 * s, mouthY);
      ctx.lineTo(x + 2 * s, mouthY);
    }
    ctx.stroke();

    // Blush for certain emotions
    if (emotion === 'enchanted' || emotion === 'grateful' || emotion === 'serene') {
      ctx.fillStyle = 'rgba(255,150,150,0.3)';
      ctx.beginPath();
      ctx.ellipse(x - eyeSpacing - 1 * s, eyeY + 3 * s, 2.5 * s, 1.5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + eyeSpacing + 1 * s, eyeY + 3 * s, 2.5 * s, 1.5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Hair bangs (on top of face) ---
    ctx.fillStyle = '#2a1a3a';
    ctx.beginPath();
    ctx.moveTo(x - headR * 0.7, headCY - headR * 0.3);
    ctx.quadraticCurveTo(x - 3 * s, headCY - headR - 2 * s, x, headCY - headR * 0.5);
    ctx.quadraticCurveTo(x + 3 * s, headCY - headR - 2 * s, x + headR * 0.7, headCY - headR * 0.3);
    ctx.quadraticCurveTo(x + headR * 0.3, headCY - headR * 0.6, x, headCY - headR * 0.35);
    ctx.quadraticCurveTo(x - headR * 0.3, headCY - headR * 0.6, x - headR * 0.7, headCY - headR * 0.3);
    ctx.fill();

    // --- Body / Jacket ---
    const shoulderY = y - bodyH;
    const hipY = y;

    // Torso
    ctx.fillStyle = '#3a3a5c'; // dark jacket
    ctx.beginPath();
    ctx.moveTo(x - bodyW * 0.7, shoulderY);
    ctx.lineTo(x + bodyW * 0.7, shoulderY);
    ctx.lineTo(x + bodyW * 0.5, hipY);
    ctx.lineTo(x - bodyW * 0.5, hipY);
    ctx.closePath();
    ctx.fill();

    // Jacket lapel detail
    ctx.strokeStyle = color;
    ctx.lineWidth = 1 * s;
    ctx.beginPath();
    ctx.moveTo(x, shoulderY + 1 * s);
    ctx.lineTo(x, hipY);
    ctx.stroke();

    // Collar
    ctx.fillStyle = '#f5f0e1';
    ctx.beginPath();
    ctx.moveTo(x - 3 * s, shoulderY);
    ctx.lineTo(x, shoulderY + 4 * s);
    ctx.lineTo(x + 3 * s, shoulderY);
    ctx.closePath();
    ctx.fill();

    // --- Arms ---
    const armSwing = Math.sin(t * 6) * 0.3;
    ctx.strokeStyle = '#3a3a5c';
    ctx.lineWidth = 3.5 * s;

    // Left arm (swings naturally)
    const lArmEndX = x - bodyW * 0.7 - Math.cos(armSwing + 0.4) * armLen;
    const lArmEndY = shoulderY + Math.sin(armSwing + 0.4) * armLen * 0.5 + armLen * 0.7;
    ctx.beginPath();
    ctx.moveTo(x - bodyW * 0.7, shoulderY + 2 * s);
    ctx.quadraticCurveTo(
      x - bodyW * 0.9, shoulderY + armLen * 0.5,
      lArmEndX, lArmEndY
    );
    ctx.stroke();
    // Hand (skin)
    ctx.fillStyle = '#fde8d0';
    ctx.beginPath();
    ctx.arc(lArmEndX, lArmEndY, 2.5 * s, 0, Math.PI * 2);
    ctx.fill();

    // Right arm (holds notepad)
    const noteAngle = 0.3 + Math.sin(t * 3) * 0.08;
    const rArmEndX = x + bodyW * 0.7 + Math.cos(noteAngle) * armLen * 0.8;
    const rArmEndY = shoulderY + 2 * s + Math.sin(noteAngle) * armLen * 0.5 + armLen * 0.5;
    ctx.strokeStyle = '#3a3a5c';
    ctx.beginPath();
    ctx.moveTo(x + bodyW * 0.7, shoulderY + 2 * s);
    ctx.quadraticCurveTo(
      x + bodyW * 0.9, shoulderY + armLen * 0.4,
      rArmEndX, rArmEndY
    );
    ctx.stroke();
    // Hand
    ctx.fillStyle = '#fde8d0';
    ctx.beginPath();
    ctx.arc(rArmEndX, rArmEndY, 2.5 * s, 0, Math.PI * 2);
    ctx.fill();

    // Notepad
    ctx.fillStyle = '#f5f0e1';
    ctx.save();
    ctx.translate(rArmEndX + 2 * s, rArmEndY - 3 * s);
    ctx.rotate(0.15);
    ctx.fillRect(-5 * s, -7 * s, 11 * s, 14 * s);
    ctx.strokeStyle = '#bbb';
    ctx.lineWidth = 0.6 * s;
    ctx.strokeRect(-5 * s, -7 * s, 11 * s, 14 * s);
    // Scribble lines
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 0.5 * s;
    for (let i = 0; i < 4; i++) {
      const ly = -4 * s + i * 3 * s;
      ctx.beginPath();
      ctx.moveTo(-3 * s, ly);
      ctx.lineTo(4 * s, ly);
      ctx.stroke();
    }
    ctx.restore();

    // Pencil
    const pencilWiggle = Math.sin(t * 12) * 1.5;
    ctx.strokeStyle = '#e8c33e';
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(rArmEndX + 7 * s, rArmEndY - 5 * s);
    ctx.lineTo(rArmEndX + 12 * s + pencilWiggle, rArmEndY - 14 * s);
    ctx.stroke();
    // Pencil tip
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(rArmEndX + 12 * s + pencilWiggle, rArmEndY - 14 * s);
    ctx.lineTo(rArmEndX + 13 * s + pencilWiggle, rArmEndY - 16.5 * s);
    ctx.lineTo(rArmEndX + 11 * s + pencilWiggle, rArmEndY - 14.5 * s);
    ctx.closePath();
    ctx.fill();

    // --- Legs ---
    const legSwing = Math.sin(t * 6) * 0.45;
    ctx.lineWidth = 3.5 * s;

    // Pants
    ctx.strokeStyle = '#2a2a44';
    // Left leg
    const lFootX = x - 3 * s - Math.sin(legSwing) * legLen * 0.5;
    const lFootY = hipY + Math.cos(legSwing) * legLen;
    ctx.beginPath();
    ctx.moveTo(x - bodyW * 0.3, hipY);
    ctx.quadraticCurveTo(x - bodyW * 0.4, hipY + legLen * 0.5, lFootX, lFootY);
    ctx.stroke();

    // Right leg
    const rFootX = x + 3 * s + Math.sin(legSwing) * legLen * 0.5;
    const rFootY = hipY + Math.cos(-legSwing) * legLen;
    ctx.beginPath();
    ctx.moveTo(x + bodyW * 0.3, hipY);
    ctx.quadraticCurveTo(x + bodyW * 0.4, hipY + legLen * 0.5, rFootX, rFootY);
    ctx.stroke();

    // Shoes
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.ellipse(lFootX + 1.5 * s, lFootY + 1 * s, 4 * s, 2 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(rFootX + 1.5 * s, rFootY + 1 * s, 4 * s, 2 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // --- Celebration ---
  function drawCelebration() {
    const elapsed = (Date.now() - celebrateStart) / 1000;

    // Stick figure in center jumping
    const jumpY = Math.abs(Math.sin(elapsed * 4)) * 20;
    drawStickFigure(cx, cy + 20 - jumpY, elapsed, 'triumphant', '#FFD700', ':D', 1.5);

    // Script pages flying out
    for (let i = 0; i < 8; i++) {
      const a = (elapsed * 0.5) + (i / 8) * Math.PI * 2;
      const r = 40 + elapsed * 30 + i * 10;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r - 20;
      const alpha = Math.max(0, 1 - elapsed * 0.15 + 0.3);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(px, py);
      ctx.rotate(a + elapsed);

      // Page
      ctx.fillStyle = '#f5f0e1';
      ctx.fillRect(-6, -8, 12, 16);
      ctx.strokeStyle = '#999';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(-6, -8, 12, 16);
      // Lines on page
      ctx.strokeStyle = '#aaa';
      for (let j = 0; j < 4; j++) {
        ctx.beginPath();
        ctx.moveTo(-4, -5 + j * 4);
        ctx.lineTo(4, -5 + j * 4);
        ctx.stroke();
      }
      ctx.restore();
    }

    // "SCRIPT COMPLETE!" text
    ctx.save();
    const textAlpha = Math.min(1, elapsed * 0.5);
    ctx.globalAlpha = textAlpha;
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 20;
    ctx.fillText('SCRIPT COMPLETE!', cx, cy - circleR * 0.5);
    ctx.shadowBlur = 0;
    ctx.font = '14px Georgia, serif';
    ctx.fillStyle = 'rgba(201,168,76,0.8)';
    ctx.fillText('The writer\'s journey is complete.', cx, cy - circleR * 0.5 + 28);
    ctx.restore();

    // Sparkles
    if (Math.random() < 0.3) {
      sparkles.push({
        x: cx + (Math.random() - 0.5) * circleR * 2,
        y: cy + (Math.random() - 0.5) * circleR * 2,
        life: 1,
        size: 2 + Math.random() * 3
      });
    }
    for (let i = sparkles.length - 1; i >= 0; i--) {
      const sp = sparkles[i];
      sp.life -= 0.02;
      if (sp.life <= 0) { sparkles.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = sp.life;
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.size * sp.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
      ctx.restore();
    }

    // Reset after celebration
    if (elapsed > 6) {
      celebrating = false;
      loopCount++;
      angle = -Math.PI / 2;
      currentStageIdx = -1;
      scribbleNotes = [];
      sparkles = [];
    }
  }

  // --- Current stage info display ---
  function drawStageInfo() {
    if (currentStageIdx < 0 || currentStageIdx >= STAGES.length) return;
    const stage = STAGES[currentStageIdx];

    // Stage name at top
    ctx.save();
    ctx.fillStyle = stage.color;
    ctx.font = 'bold 15px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.shadowColor = stage.color;
    ctx.shadowBlur = 8;
    ctx.fillText(stage.name, cx, 12);
    ctx.shadowBlur = 0;

    // Emotion label
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'italic 12px Georgia, serif';
    ctx.fillText('feeling ' + stage.emotion, cx, 32);
    ctx.restore();
  }

  // --- Update character position ---
  function update() {
    if (celebrating) return;

    angle += speed;

    // Determine current stage
    const newIdx = getStageIndex(angle);
    if (newIdx !== currentStageIdx) {
      currentStageIdx = newIdx;
      const stage = STAGES[currentStageIdx];
      stickColor = stage.color;
      currentEmotion = stage.emotion;
      currentExpression = stage.expression;

      // Update HTML display
      const el = document.getElementById('trait-display');
      if (el) {
        el.textContent = stage.name;
        el.style.color = stage.color;
      }
    }

    // Spawn scribble notes periodically
    noteTimer += speed;
    if (noteTimer > 0.08) {
      noteTimer = 0;
      const sx = cx + Math.cos(angle) * circleR;
      const sy = cy + Math.sin(angle) * circleR;
      const stage = STAGES[Math.max(0, currentStageIdx)];
      spawnNote(sx + (Math.random() - 0.5) * 30, sy - 30, stage.note);
    }

    // Check if completed full loop
    const norm = angle + Math.PI / 2;
    if (norm >= Math.PI * 2 * (loopCount + 1)) {
      celebrating = true;
      celebrateStart = Date.now();
      sparkles = [];
    }
  }

  // --- Main loop ---
  function frame() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(26,26,46,0.97)';
    ctx.fillRect(0, 0, W, H);

    drawJourneyCircle();

    if (celebrating) {
      drawCelebration();
    } else {
      update();

      // Character position on circle
      const sx = cx + Math.cos(angle) * circleR;
      const sy = cy + Math.sin(angle) * circleR;

      // Draw stick figure
      drawStickFigure(sx, sy - 18, angle / speed, currentEmotion, stickColor, currentExpression, 1);

      updateNotes();
      drawNotes();
      drawStageInfo();
    }

    requestAnimationFrame(frame);
  }

  // --- Init ---
  resize();
  window.addEventListener('resize', resize);
  frame();
})();
