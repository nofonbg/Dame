const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restart');

let board, turn = 'white', selected = null, available = [], chainActive = false, gameOverFlag = false, lastMove = null;
let difficulty = 'leicht';
let animating = false, animGen = 0;

function cloneBoard(b){ return b.map(row => row.map(c => c ? { color: c.color, king: c.king } : null)); }

function initialBoard(){
  const b = Array.from({ length: 8 }, () => Array(8).fill(null));
  for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++)
    if ((r + c) % 2 === 1) b[r][c] = { color: 'black', king: false };
  for (let r = 5; r < 8; r++) for (let c = 0; c < 8; c++)
    if ((r + c) % 2 === 1) b[r][c] = { color: 'white', king: false };
  return b;
}

function directionsFor(p){
  if (p.king) return [[-1,-1],[-1,1],[1,-1],[1,1]];
  return p.color === 'white' ? [[-1,-1],[-1,1]] : [[1,-1],[1,1]];
}

// Alle möglichen ersten Schritte (normale Schritte + Sprünge) für eine Figur
function stepsForPiece(b, r, c){
  const p = b[r][c];
  if (!p) return [];
  const dirs = directionsFor(p);
  const steps = [];

  if (!p.king){
    // Spielstein: 1 Feld ziehen, Sprung über genau 1 Stück
    for (const [dr, dc] of dirs){
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr > 7 || nc < 0 || nc > 7) continue;
      if (!b[nr][nc]){
        steps.push({ r, c, nr, nc, capture: false });
      } else if (b[nr][nc].color !== p.color){
        const nr2 = r + 2*dr, nc2 = c + 2*dc;
        if (nr2 >= 0 && nr2 <= 7 && nc2 >= 0 && nc2 <= 7 && !b[nr2][nc2]){
          steps.push({ r, c, nr: nr2, nc: nc2, capture: true, captured: { r: nr, c: nc } });
        }
      }
    }
  } else {
    // König: beliebig weit diagonal; Sprung über gegnerisches Stück, Landung beliebig weit danach
    for (const [dr, dc] of dirs){
      let d = 1;
      let blockerDist = 0;
      let blockerFound = false;
      while (true){
        const nr = r + d*dr, nc = c + d*dc;
        if (nr < 0 || nr > 7 || nc < 0 || nc > 7) break;
        const cell = b[nr][nc];
        if (!cell){
          if (!blockerFound){
            steps.push({ r, c, nr, nc, capture: false });
          } else {
            steps.push({ r, c, nr, nc, capture: true,
                         captured: { r: r + blockerDist*dr, c: c + blockerDist*dc } });
          }
          d++;
          continue;
        }
        if (cell.color === p.color) break;        // eigenes Stück: stoppt alles
        if (!blockerFound){ blockerFound = true; blockerDist = d; d++; continue; }
        break;                                      // weiteres gegnerisches Stück: stoppt
      }
    }
  }
  return steps;
}

// Alle vollständigen Züge (inkl. Mehrfachsprüngen) für eine Figur
function fullMovesFrom(b, r, c){
  const p = b[r][c];
  if (!p) return [];
  const firstSteps = stepsForPiece(b, r, c);
  const result = [];
  for (const s of firstSteps){
    if (!s.capture){
      result.push([s]);
      continue;
    }
    const nb = cloneBoard(b);
    nb[s.captured.r][s.captured.c] = null;
    nb[r][c] = null;
    nb[s.nr][s.nc] = { color: p.color, king: p.king };
    const further = captureChainsFrom(nb, s.nr, s.nc);
    if (further.length){
      for (const ch of further) result.push([s, ...ch]);
    } else {
      result.push([s]);
    }
  }
  return result;
}

// Mehrfachsprünge ab einer Position (nur Sprünge)
function captureChainsFrom(b, r, c){
  const p = b[r][c];
  if (!p) return [];
  const firstSteps = stepsForPiece(b, r, c).filter(s => s.capture);
  const result = [];
  for (const s of firstSteps){
    const nb = cloneBoard(b);
    nb[s.captured.r][s.captured.c] = null;
    nb[r][c] = null;
    nb[s.nr][s.nc] = { color: p.color, king: p.king };
    const further = captureChainsFrom(nb, s.nr, s.nc);
    if (further.length){
      for (const ch of further) result.push([s, ...ch]);
    } else {
      result.push([s]);
    }
  }
  return result;
}

function sideMoves(b, color){
  let all = [];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++){
    const p = b[r][c];
    if (p && p.color === color) all.push(...fullMovesFrom(b, r, c));
  }
  const captures = all.filter(m => m.some(s => s.capture));
  return captures.length ? captures : all;
}

function firstStepsFor(r, c){
  const moves = fullMovesFrom(board, r, c);
  const anyCapture = moves.some(m => m.some(s => s.capture));
  const filtered = anyCapture ? moves.filter(m => m.some(s => s.capture)) : moves;
  // Duplikate entfernen (gleiche Zielfeld-Kombination)
  const seen = new Set();
  const out = [];
  for (const m of filtered){
    const s = m[0];
    const key = s.nr + ',' + s.nc;
    if (!seen.has(key)){ seen.add(key); out.push(s); }
  }
  return out;
}

function captureFirstStepsFrom(r, c){
  return firstStepsFor(r, c).filter(s => s.capture);
}

function applyStep(step){
  const p = board[step.r][step.c];
  board[step.nr][step.nc] = p;
  board[step.r][step.c] = null;
  if (step.capture) board[step.captured.r][step.captured.c] = null;
}

function promoteIfNeeded(step){
  const p = board[step.nr][step.nc];
  if (!p) return;
  if (!p.king && ((p.color === 'white' && step.nr === 0) || (p.color === 'black' && step.nr === 7)))
    p.king = true;
}

function countPieces(color){
  let n = 0;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++)
    if (board[r][c] && board[r][c].color === color) n++;
  return n;
}

function render(){
  boardEl.innerHTML = '';
  for (let r = 0; r < 8; r++){
    for (let c = 0; c < 8; c++){
      const cell = document.createElement('div');
      cell.className = 'cell ' + ((r + c) % 2 === 1 ? 'dark' : 'light');
      cell.dataset.r = r; cell.dataset.c = c;
      const p = board[r][c];
      if (p){
        const d = document.createElement('div');
        d.className = 'piece ' + p.color + (p.king ? ' king' : '');
        cell.appendChild(d);
      }
      if (selected && selected.r === r && selected.c === c) cell.classList.add('selected');
      if (lastMove && ((lastMove.r === r && lastMove.c === c) || (lastMove.nr === r && lastMove.nc === c))) cell.classList.add('lastmove');
      const step = available.find(s => s.nr === r && s.nc === c);
      if (step){
        cell.classList.add('legal');
        if (step.capture) cell.classList.add('capture');
      }
      boardEl.appendChild(cell);
    }
  }
}

function select(r, c, steps){
  selected = { r, c };
  available = steps;
}
function deselect(){ selected = null; available = []; chainActive = false; }

function animateMove(step, piece, after){
  const gen = animGen;
  const srcEl = boardEl.querySelector(`.cell[data-r="${step.r}"][data-c="${step.c}"]`);
  const dstEl = boardEl.querySelector(`.cell[data-r="${step.nr}"][data-c="${step.nc}"]`);
  if (!srcEl || !dstEl || !piece){ after(); return; }
  animating = true;
  const boardRect = boardEl.getBoundingClientRect();
  const s = srcEl.getBoundingClientRect();
  const d = dstEl.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'piece ' + piece.color + (piece.king ? ' king' : '');
  el.style.position = 'absolute';
  el.style.margin = '0';
  el.style.left = (s.left - boardRect.left + s.width * 0.11) + 'px';
  el.style.top = (s.top - boardRect.top + s.height * 0.11) + 'px';
  el.style.width = s.width * 0.78 + 'px';
  el.style.aspectRatio = '1/1';
  el.style.zIndex = '10';
  el.style.transition = 'transform 0.28s ease-in-out';
  boardEl.appendChild(el);
  requestAnimationFrame(() => {
    el.style.transform = `translate(${d.left - s.left}px, ${d.top - s.top}px)`;
  });
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    el.remove();
    animating = false;
    if (gen !== animGen) return;
    after();
  };
  el.addEventListener('transitionend', finish, { once: true });
  setTimeout(finish, 400);
}

function doStep(step){
  const piece = board[step.r][step.c];
  animateMove(step, piece, () => {
    applyStep(step);
    lastMove = step;
    render();
    if (step.capture){
      const further = captureFirstStepsFrom(step.nr, step.nc);
      if (further.length){
        chainActive = true;
        selected = { r: step.nr, c: step.nc };
        available = further;
        statusEl.textContent = 'Weiter im Sprung!';
        render();
        return;
      }
    }
    promoteIfNeeded(step);
    chainActive = false;
    selected = null; available = [];
    render();
    afterMove();
  });
}

function afterMove(){
  const wMoves = sideMoves(board, 'white').length;
  const bMoves = sideMoves(board, 'black').length;
  const wPieces = countPieces('white');
  const bPieces = countPieces('black');

  if (wPieces === 0 || bMoves === 0){
    gameOverFlag = true;
    statusEl.textContent = 'Sie gewinnen! 🎉';
    return;
  }
  if (bPieces === 0 || wMoves === 0){
    gameOverFlag = true;
    statusEl.textContent = 'Der Computer gewinnt! 💀';
    return;
  }
  if (turn === 'white'){
    turn = 'black';
    statusEl.textContent = 'Computer denkt…';
    render();
    setTimeout(computerTurn, 400);
  } else {
    turn = 'white';
    statusEl.textContent = 'Ihr Zug (Weiß)';
    render();
  }
}

function evaluate(b){
  let score = 0;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++){
    const p = b[r][c];
    if (!p) continue;
    let v = p.king ? 350 : 100;
    if (p.color === 'black'){
      score += v;
      if (!p.king) score += (7 - r) * 12;
    } else {
      score -= v;
      if (!p.king) score -= r * 12;
    }
  }
  return score;
}

function applyFullMove(b, move){
  const nb = cloneBoard(b);
  for (const s of move){
    const piece = nb[s.r][s.c];
    nb[s.nr][s.nc] = piece;
    nb[s.r][s.c] = null;
    if (s.capture) nb[s.captured.r][s.captured.c] = null;
  }
  const last = move[move.length - 1];
  const piece = nb[last.nr][last.nc];
  if (piece && !piece.king && ((piece.color === 'white' && last.nr === 0) || (piece.color === 'black' && last.nr === 7)))
    piece.king = true;
  return nb;
}

function minimax(b, depth, alpha, beta, blackToMove){
  if (depth <= 0) return evaluate(b);
  const color = blackToMove ? 'black' : 'white';
  const moves = sideMoves(b, color);
  if (!moves.length) return blackToMove ? -100000 - depth : 100000 + depth;
  if (blackToMove){
    let best = -Infinity;
    for (const m of moves){
      best = Math.max(best, minimax(applyFullMove(b, m), depth - 1, alpha, beta, false));
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  }
  let best = Infinity;
  for (const m of moves){
    best = Math.min(best, minimax(applyFullMove(b, m), depth - 1, alpha, beta, true));
    beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
}

function chooseComputerMove(moves){
  if (difficulty === 'leicht'){
    let best = null, bestScore = -Infinity;
    for (const m of moves){
      const last = m[m.length - 1];
      let score = 0;
      score += m.filter(s => s.capture).length * 100;
      const p = board[m[0].r][m[0].c];
      if (p && !p.king && p.color === 'black' && last.nr === 7) score += 150;
      const dist = Math.max(Math.abs(last.nr - m[0].r), Math.abs(last.nc - m[0].c));
      score += dist * 2;
      if (last.nr >= 3 && last.nr <= 4 && last.nc >= 3 && last.nc <= 4) score += 8;
      score += Math.random() * 10;
      if (score > bestScore){ bestScore = score; best = m; }
    }
    return best;
  }
  const depth = difficulty === 'mittel' ? 2 : 4;
  let best = null, bestScore = -Infinity;
  for (const m of moves){
    const nb = applyFullMove(board, m);
    const s = minimax(nb, depth - 1, -Infinity, Infinity, false);
    if (s > bestScore){ bestScore = s; best = m; }
  }
  return best;
}

function computerTurn(){
  const moves = sideMoves(board, 'black');
  if (!moves.length){ afterMove(); return; }
  const best = chooseComputerMove(moves);
  let i = 0;
  function step(){
    if (i >= best.length){
      promoteIfNeeded(best[best.length - 1]);
      render();
      afterMove();
      return;
    }
    const s = best[i];
    const piece = board[s.r][s.c];
    animateMove(s, piece, () => {
      applyStep(s);
      lastMove = s;
      render();
      i++;
      setTimeout(step, 350);
    });
  }
  step();
}

boardEl.addEventListener('click', (e) => {
  const cell = e.target.closest('.cell');
  if (!cell || gameOverFlag || turn !== 'white' || animating) return;
  const r = +cell.dataset.r, c = +cell.dataset.c;

  const dest = available.find(s => s.nr === r && s.nc === c);
  if (selected && dest){ doStep(dest); return; }

  const piece = board[r][c];
  if (piece && piece.color === 'white'){
    const steps = chainActive
      ? captureFirstStepsFrom(r, c)
      : firstStepsFor(r, c);
    if (steps.length){
      select(r, c, steps);
      statusEl.textContent = chainActive ? 'Weiter im Sprung!' : 'Wähle eine Spielfigur';
      render();
      return;
    }
  }
  deselect(); render();
});

const diffSlider = document.getElementById('diffSlider');
const diffLabel = document.getElementById('diffLabel');
const diffLevels = ['leicht', 'mittel', 'schwer'];
const diffNames = ['Leicht', 'Mittel', 'Schwer'];
diffSlider.addEventListener('input', () => {
  const i = +diffSlider.value;
  difficulty = diffLevels[i];
  diffLabel.textContent = diffNames[i];
  document.querySelectorAll('.diff-tick').forEach((t, j) => t.classList.toggle('active', j === i));
});

restartBtn.addEventListener('click', () => {
  animGen++;
  animating = false;
  board = initialBoard();
  turn = 'white'; selected = null; available = []; chainActive = false; gameOverFlag = false; lastMove = null;
  statusEl.textContent = 'Ihr Zug (Weiß)';
  render();
});

board = initialBoard();
render();
