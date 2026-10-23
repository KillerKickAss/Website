// Self-playing Snake game, drawn behind the blog.
// The snake follows a loop that visits every square (so it never crashes),
// and takes safe shortcuts toward the food to look more natural.
(() => {
  const canvas = document.getElementById('snake-bg');
  const ctx = canvas.getContext('2d');

  const CELL = 22;          // size of one square in pixels
  const STEP_MS = 70;       // time between moves (lower = faster)
  // Colors come from the CSS variables in style.css (so dark mode works)
  let BG, HEAD, BODY, FOOD;
  function readColors() {
    const css = getComputedStyle(document.documentElement);
    BG = css.getPropertyValue('--game-bg').trim();
    HEAD = css.getPropertyValue('--game-head').trim();
    BODY = css.getPropertyValue('--game-body').trim();
    FOOD = css.getPropertyValue('--game-food').trim();
  }
  readColors();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let cols, rows, N, cells, order, snake, occupied, food, ox, oy, timer;

  function setup() {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cols = Math.max(4, Math.floor(w / CELL));
    rows = Math.max(4, Math.floor(h / CELL));
    rows -= rows % 2; // the loop needs an even number of rows
    N = cols * rows;
    ox = (w - cols * CELL) / 2;
    oy = (h - rows * CELL) / 2;

    buildLoop();
    reset();
  }

  // Build a loop that passes through every square exactly once.
  function buildLoop() {
    cells = new Int32Array(N);   // position in loop -> square
    order = new Int32Array(N);   // square -> position in loop
    let p = 0;
    for (let x = 0; x < cols; x++) cells[p++] = x;
    for (let y = 1; y < rows; y++) {
      if (y % 2 === 1) for (let x = cols - 1; x >= 1; x--) cells[p++] = y * cols + x;
      else for (let x = 1; x < cols; x++) cells[p++] = y * cols + x;
    }
    for (let y = rows - 1; y >= 1; y--) cells[p++] = y * cols;
    for (let i = 0; i < N; i++) order[cells[i]] = i;
  }

  function reset() {
    snake = [cells[0], cells[1], cells[2]];
    occupied = new Uint8Array(N);
    snake.forEach(c => (occupied[c] = 1));
    placeFood();
  }

  function placeFood() {
    let c;
    do { c = Math.floor(Math.random() * N); } while (occupied[c]);
    food = c;
  }

  function step() {
    const head = snake[snake.length - 1];
    const hx = head % cols;
    const hy = Math.floor(head / cols);
    const hPos = order[head];

    const foodDist = (order[food] - hPos + N) % N;
    let tailDist = (order[snake[0]] - hPos + N) % N;
    if (snake.length === 1) tailDist = N;

    // Default move: next square along the loop (always safe).
    let next = cells[(hPos + 1) % N];

    // Shortcut: jump ahead on the loop if it doesn't pass the food or the tail.
    if (snake.length < N / 2) {
      const options = [];
      if (hx > 0) options.push(head - 1);
      if (hx < cols - 1) options.push(head + 1);
      if (hy > 0) options.push(head - cols);
      if (hy < rows - 1) options.push(head + cols);
      let best = 1;
      for (const n of options) {
        const d = (order[n] - hPos + N) % N;
        if (!occupied[n] && d > best && d <= foodDist && d < tailDist) {
          best = d;
          next = n;
        }
      }
    }

    snake.push(next);
    occupied[next] = 1;

    if (next === food) {
      if (snake.length >= N) { reset(); return; }
      placeFood();
    } else {
      occupied[snake.shift()] = 0;
    }
  }

  function draw() {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const pad = 2;
    const size = CELL - pad * 2;

    // food
    ctx.fillStyle = FOOD;
    ctx.beginPath();
    ctx.arc(ox + (food % cols) * CELL + CELL / 2,
            oy + Math.floor(food / cols) * CELL + CELL / 2,
            size / 2, 0, Math.PI * 2);
    ctx.fill();

    // body, fading toward the tail
    const len = snake.length;
    for (let i = 0; i < len - 1; i++) {
      const c = snake[i];
      const alpha = 0.18 + 0.32 * (i / len);
      ctx.fillStyle = `rgba(${BODY}, ${alpha})`;
      ctx.fillRect(ox + (c % cols) * CELL + pad,
                   oy + Math.floor(c / cols) * CELL + pad, size, size);
    }

    // head
    const h = snake[len - 1];
    ctx.fillStyle = HEAD;
    ctx.fillRect(ox + (h % cols) * CELL + pad,
                 oy + Math.floor(h / cols) * CELL + pad, size, size);
  }

  function start() {
    clearInterval(timer);
    setup();
    draw();
    if (reduceMotion) return; // show a still picture instead of animating
    timer = setInterval(() => { step(); draw(); }, STEP_MS);
  }

  // Redraw with new colors when the system switches between light and dark
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    readColors();
    draw();
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(start, 200);
  });

  start();
})();
