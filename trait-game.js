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

  // --- Stick figure ---
  function drawStickFigure(x, y, walkPhase, emotion, color, expr, scale) {
    const s = scale || 1;
    const headR = 7 * s;
    const bodyLen = 16 * s;
    const limbLen = 12 * s;
    const t = walkPhase;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2 * s;
    ctx.lineCap = 'round';

    // Glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;

    // Head
    ctx.beginPath();
    ctx.arc(x, y - bodyLen - headR, headR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();

    // Expression inside head
    ctx.shadowBlur = 0;
    ctx.font = `${Math.round(headR * 1.1)}px "Segoe UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(expr, x, y - bodyLen - headR + 1);

    // Body
    ctx.beginPath();
    ctx.moveTo(x, y - bodyLen);
    ctx.lineTo(x, y);
    ctx.stroke();

    // Arms - one holds a pencil/notepad
    const armSwing = Math.sin(t * 6) * 0.3;

    // Left arm (swings)
    ctx.beginPath();
    ctx.moveTo(x, y - bodyLen * 0.65);
    ctx.lineTo(
      x - Math.cos(armSwing + 0.5) * limbLen,
      y - bodyLen * 0.65 + Math.sin(armSwing + 0.5) * limbLen
    );
    ctx.stroke();

    // Right arm (holds notepad - slightly forward)
    const noteAngle = 0.3 + Math.sin(t * 3) * 0.1;
    const handX = x + Math.cos(noteAngle) * limbLen;
    const handY = y - bodyLen * 0.65 + Math.sin(noteAngle) * limbLen;
    ctx.beginPath();
    ctx.moveTo(x, y - bodyLen * 0.65);
    ctx.lineTo(handX, handY);
    ctx.stroke();

    // Notepad in hand
    ctx.fillStyle = '#f5f0e1';
    ctx.fillRect(handX - 4 * s, handY - 6 * s, 10 * s, 12 * s);
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(handX - 4 * s, handY - 6 * s, 10 * s, 12 * s);
    // Scribble lines on notepad
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 3; i++) {
      const ly = handY - 3 * s + i * 3 * s;
      ctx.beginPath();
      ctx.moveTo(handX - 2 * s, ly);
      ctx.lineTo(handX + 4 * s, ly);
      ctx.stroke();
    }
    // Pencil
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    const pencilWiggle = Math.sin(t * 12) * 2;
    ctx.beginPath();
    ctx.moveTo(handX + 5 * s, handY - 4 * s);
    ctx.lineTo(handX + 9 * s + pencilWiggle, handY - 10 * s);
    ctx.stroke();
    // Pencil tip
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(handX + 9 * s + pencilWiggle, handY - 10 * s, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    const legSwing = Math.sin(t * 6) * 0.5;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2 * s;

    // Left leg
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
      x - Math.sin(legSwing) * limbLen * 0.7,
      y + Math.cos(legSwing) * limbLen
    );
    ctx.stroke();

    // Right leg
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
      x + Math.sin(legSwing) * limbLen * 0.7,
      y + Math.cos(-legSwing) * limbLen
    );
    ctx.stroke();

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
