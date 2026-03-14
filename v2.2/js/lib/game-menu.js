/**
 * game-menu.js
 * Client-side library for a searchable, responsive game card grid.
 *
 * Usage:
 *   const menu = GameMenu.create(containerElement, gamesArray, options)
 *   menu.updateGames(newArray)
 *   menu.setMode('remote' | 'host')
 *   menu.destroy()
 *
 * Games array format: [{ name: string, gameId: string }, ...]
 *
 * Options:
 *   mode            'remote' | 'host'           (default: 'remote')
 *   onInsert(game)  called in remote mode        (game = { name, gameId })
 *   onDelete(game)  called in host mode per card
 *   onImport()      called when Import Game tapped (host mode)
 *   onSelect(game)  optional, called on card body click
 *   labels          { insert, delete, import, searchPlaceholder, noGames, noResults }
 */
(function (global) {
  'use strict';

  // ─── CSS injection ───────────────────────────────────────────────────────────

  const STYLE_ID = 'game-menu-styles';

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = /* css */`
      /* ── Root ── */
      .gm-root {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        font-family: inherit;
        color: var(--text-color, #383838);
        background: transparent;
      }

      /* ── Toolbar ── */
      .gm-toolbar {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        flex-shrink: 0;
        flex-wrap: wrap;
      }

      .gm-search-wrap {
        flex: 1;
        min-width: 130px;
        position: relative;
        display: flex;
        align-items: center;
      }

      .gm-search-wrap > i {
        position: absolute;
        left: 12px;
        font-size: 1rem;
        pointer-events: none;
        opacity: 0.45;
        color: var(--text-color, #383838);
      }

      .gm-search {
        font-family: inherit;
        font-size: 1rem;
        width: 100%;
        box-sizing: border-box;
        padding: 0.5rem 0.75rem 0.5rem 2.3rem;
        border: 2px solid var(--container-border, #cfcfcf);
        border-radius: 20px;
        background: var(--side-panel-background-color, white);
        color: var(--text-color, #383838);
        outline: none;
        /* override global user-select: none so typing works */
        -webkit-user-select: text;
        user-select: text;
        /* allow panning inside the field */
        touch-action: auto;
        transition: border-color 0.15s;
      }

      .gm-search:focus {
        border-color: var(--home-btn-color, rgb(8 190 2));
      }

      /* ── Import button (host mode only) ── */
      .gm-import-btn {
        font-family: inherit;
        font-size: 1rem;
        letter-spacing: 0.5px;
        padding: 0.45rem 1rem;
        border: 2px solid black;
        border-radius: 20px;
        background: var(--wiiBtn-background-color, white);
        color: var(--wiiBtn-color, #323232);
        cursor: pointer;
        white-space: nowrap;
        flex-shrink: 0;
        touch-action: manipulation;
        transition: transform 0.15s, background 0.1s;
        display: none; /* shown only in host mode */
      }

      .gm-import-btn:active {
        transform: scale(0.95);
        background: var(--btn-pressed-background-color, #acacac);
      }

      @media (hover: hover) {
        .gm-import-btn:hover {
          background: var(--btn-background-color, #dadada);
        }
      }

      /* ── Grid ── */
      .gm-grid {
        flex: 1;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        padding: 8px 12px 16px;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 12px;
        align-content: start;
      }

      @media (min-width: 600px) {
        .gm-grid {
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }
      }

      /* ── Card ── */
      .gm-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        padding: 14px 10px 12px;
        border: 2px solid var(--container-border, #cfcfcf);
        border-radius: 10px;
        background: var(--side-panel-background-color, white);
        gap: 12px;
        min-height: 110px;
        box-sizing: border-box;
        cursor: pointer;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
        transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s;
      }

      .gm-card:focus {
        outline: none;
        border-color: var(--home-btn-color, rgb(8 190 2));
        box-shadow: 0 0 0 2px var(--home-btn-color, rgb(8 190 2));
      }

      .gm-card.gm-selected {
        border-color: var(--home-btn-color, rgb(8 190 2));
        box-shadow: 0 0 0 2px var(--home-btn-color, rgb(8 190 2));
      }

      .gm-card:active {
        transform: scale(0.97);
      }

      @media (hover: hover) {
        .gm-card:not(.gm-selected):hover {
          border-color: var(--home-btn-color, rgb(8 190 2));
        }
      }

      .gm-card-name {
        font-size: 1rem;
        font-weight: bold;
        text-align: center;
        width: 100%;
        word-break: break-word;
        line-height: 1.3;
        color: var(--text-color, #383838);
      }

      /* ── Per-card action buttons ── */
      .gm-action-btn {
        font-family: inherit;
        font-size: 0.85rem;
        padding: 0.4rem 0.85rem;
        border: 2px solid black;
        border-radius: 20px;
        background: var(--wiiBtn-background-color, white);
        color: var(--wiiBtn-color, #323232);
        cursor: pointer;
        white-space: nowrap;
        min-height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        align-self: stretch;
        touch-action: manipulation;
        transition: transform 0.15s, background 0.1s;
      }

      .gm-action-btn:active {
        transform: scale(0.95);
        background: var(--btn-pressed-background-color, #acacac);
      }

      .gm-action-btn:disabled {
        opacity: 0.45;
        cursor: not-allowed;
        transform: none !important;
      }

      @media (hover: hover) {
        .gm-action-btn:not(:disabled):hover {
          background: var(--btn-background-color, #dadada);
        }
      }

      .gm-delete-btn {
        border-color: #c0392b;
        color: #c0392b;
      }

      @media (hover: hover) {
        .gm-delete-btn:not(:disabled):hover {
          background: #fdecea;
        }
      }

      /* ── Busy spinner ── */
      @keyframes gm-spin {
        to { transform: rotate(360deg); }
      }

      .gm-busy-icon {
        display: inline-block;
        animation: gm-spin 0.8s linear infinite;
        pointer-events: none;
      }

      /* ── Empty states ── */
      .gm-empty {
        grid-column: 1 / -1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        text-align: center;
        color: var(--text-color, #383838);
        opacity: 0.55;
        font-size: 1.1rem;
        gap: 10px;
      }

      .gm-empty > i {
        font-size: 2.5rem;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  }

  // ─── Normalization ───────────────────────────────────────────────────────────

  function normalizeGames(games) {
    if (!Array.isArray(games)) {
      console.warn('[GameMenu] games must be an array, received:', typeof games);
      return [];
    }
    const seen = new Set();
    return games.filter((g, idx) => {
      if (!g || typeof g !== 'object') {
        console.warn(`[GameMenu] Skipping index ${idx}: not an object`);
        return false;
      }
      if (typeof g.name !== 'string' || !g.name.trim()) {
        console.warn(`[GameMenu] Skipping index ${idx}: "name" must be a non-empty string`);
        return false;
      }
      if (typeof g.gameId !== 'string' || !g.gameId.trim()) {
        console.warn(`[GameMenu] Skipping index ${idx}: "gameId" must be a non-empty string`);
        return false;
      }
      if (seen.has(g.gameId)) {
        console.warn(`[GameMenu] Skipping duplicate gameId "${g.gameId}" at index ${idx}`);
        return false;
      }
      seen.add(g.gameId);
      return true;
    }).map(g => ({ name: g.name.trim(), gameId: g.gameId.trim() }));
  }

  // ─── HTML building helpers ───────────────────────────────────────────────────

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function escapeAttr(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function buildCardHtml(game, mode, isBusy, isSelected, labels) {
    const selectedClass = isSelected ? ' gm-selected' : '';
    const busyIcon = `<i class="fa-solid ${mode === 'remote' ? 'fa-compact-disc' : 'fa-trash'} gm-busy-icon"></i>`;

    let actionBtn = '';
    if (mode === 'remote') {
      const icon = isBusy
        ? busyIcon
        : '<i class="fa-solid fa-compact-disc"></i>';
      actionBtn = `
        <button class="gm-action-btn gm-insert-btn" data-action="insert"${isBusy ? ' disabled' : ''} tabindex="-1">
          ${icon} ${escapeHtml(labels.insert)}
        </button>`;
    } else if (mode === 'host') {
      const icon = isBusy
        ? busyIcon
        : '<i class="fa-solid fa-trash"></i>';
      actionBtn = `
        <button class="gm-action-btn gm-delete-btn" data-action="delete"${isBusy ? ' disabled' : ''} tabindex="-1">
          ${icon} ${escapeHtml(labels.delete)}
        </button>`;
    }

    return `
      <div class="gm-card${selectedClass}"
           data-game-id="${escapeAttr(game.gameId)}"
           tabindex="0"
           role="button"
           aria-label="${escapeAttr(game.name)}">
        <div class="gm-card-name">${escapeHtml(game.name)}</div>
        ${actionBtn}
      </div>`;
  }

  // ─── Grid column count (for arrow-key navigation) ────────────────────────────

  function getColumnCount(gridEl) {
    return getComputedStyle(gridEl).gridTemplateColumns.split(' ').length;
  }

  // ─── create() ────────────────────────────────────────────────────────────────

  function create(container, games, options) {
    if (!(container instanceof Element)) {
      throw new Error('[GameMenu] First argument must be a DOM Element');
    }

    // Merge options with defaults
    const opts = Object.assign({
      mode: 'remote',
      onInsert: null,
      onDelete: null,
      onImport: null,
      onSelect: null,
      labels: {}
    }, options || {});

    opts.labels = Object.assign({
      insert: 'Insert Disc',
      delete: 'Delete',
      import: 'Import Game',
      searchPlaceholder: 'Search games\u2026',
      noGames: 'No games installed.',
      noResults: 'No games match your search.'
    }, opts.labels || {});

    injectStyles();

    // ── Internal state ──────────────────────────────────────────────────────────
    const state = {
      originalGames: normalizeGames(games),
      filteredGames: [],
      searchQuery: '',
      selectedGameId: null,
      busyGameIds: new Set(),
      mode: opts.mode
    };

    // ── Build DOM ───────────────────────────────────────────────────────────────
    container.innerHTML = '';

    const root = document.createElement('div');
    root.className = 'gm-root';
    root.innerHTML = `
      <div class="gm-toolbar">
        <div class="gm-search-wrap">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input
            class="gm-search"
            type="text"
            placeholder="${escapeAttr(opts.labels.searchPlaceholder)}"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
          />
        </div>
        <button class="gm-import-btn">
          <i class="fa-solid fa-file-import"></i> ${escapeHtml(opts.labels.import)}
        </button>
      </div>
      <div class="gm-grid"></div>
    `;

    container.appendChild(root);

    const searchEl  = root.querySelector('.gm-search');
    const importBtn = root.querySelector('.gm-import-btn');
    const gridEl    = root.querySelector('.gm-grid');

    // ── Event delegation: grid ──────────────────────────────────────────────────
    gridEl.addEventListener('click', (e) => {
      const card = e.target.closest('.gm-card');
      if (!card) return;

      const gameId = card.dataset.gameId;
      const game   = state.originalGames.find(g => g.gameId === gameId);
      if (!game) return;

      const actionBtn = e.target.closest('[data-action]');

      if (actionBtn) {
        if (actionBtn.disabled) return;
        const action = actionBtn.dataset.action;
        if (action === 'insert' && typeof opts.onInsert === 'function') {
          setBusy(gameId, true);
          Promise.resolve(opts.onInsert(game)).finally(() => setBusy(gameId, false));
        } else if (action === 'delete' && typeof opts.onDelete === 'function') {
          setBusy(gameId, true);
          Promise.resolve(opts.onDelete(game)).finally(() => setBusy(gameId, false));
        }
        // Don't also fire onSelect when an action button was the target
        return;
      }

      // Card body click = select
      selectGame(gameId);
    });

    // Arrow-key + Enter/Space navigation for desktop
    gridEl.addEventListener('keydown', (e) => {
      const card = e.target.closest('.gm-card');
      if (!card) return;

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
        return;
      }

      const cards = Array.from(gridEl.querySelectorAll('.gm-card'));
      const idx   = cards.indexOf(card);
      const cols  = getColumnCount(gridEl);
      let next    = -1;

      if      (e.key === 'ArrowRight') next = Math.min(idx + 1,    cards.length - 1);
      else if (e.key === 'ArrowLeft')  next = Math.max(idx - 1,    0);
      else if (e.key === 'ArrowDown')  next = Math.min(idx + cols,  cards.length - 1);
      else if (e.key === 'ArrowUp')    next = Math.max(idx - cols,  0);

      if (next >= 0 && next !== idx) {
        e.preventDefault();
        cards[next].focus();
      }
    });

    // ── Search input ────────────────────────────────────────────────────────────
    searchEl.addEventListener('input', () => {
      state.searchQuery = searchEl.value.trim();
      renderGrid();
    });

    searchEl.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchEl.value   = '';
        state.searchQuery = '';
        renderGrid();
        searchEl.blur();
      }
    });

    // ── Import button (host mode) ───────────────────────────────────────────────
    importBtn.addEventListener('click', () => {
      if (typeof opts.onImport === 'function') opts.onImport();
    });

    // ── Helpers ─────────────────────────────────────────────────────────────────

    function applyMode() {
      importBtn.style.display = state.mode === 'host' ? '' : 'none';
    }

    function selectGame(gameId) {
      state.selectedGameId = gameId;
      // Update selected class in-place instead of doing a full re-render
      Array.from(gridEl.querySelectorAll('.gm-card')).forEach(c => {
        c.classList.toggle('gm-selected', c.dataset.gameId === gameId);
      });
      if (typeof opts.onSelect === 'function') {
        const game = state.originalGames.find(g => g.gameId === gameId);
        if (game) opts.onSelect(game);
      }
    }

    function setBusy(gameId, isBusy) {
      if (isBusy) state.busyGameIds.add(gameId);
      else        state.busyGameIds.delete(gameId);

      // Swap just the affected card to avoid losing scroll position
      const card = Array.from(gridEl.querySelectorAll('.gm-card'))
                        .find(c => c.dataset.gameId === gameId);
      if (!card) return;

      const game = state.originalGames.find(g => g.gameId === gameId);
      if (!game) return;

      const tmp = document.createElement('div');
      tmp.innerHTML = buildCardHtml(
        game,
        state.mode,
        isBusy,
        state.selectedGameId === gameId,
        opts.labels
      );
      card.replaceWith(tmp.firstElementChild);
    }

    function computeFiltered() {
      if (!state.searchQuery) {
        state.filteredGames = state.originalGames.slice();
        return;
      }
      const q = state.searchQuery.toLowerCase();
      state.filteredGames = state.originalGames.filter(g =>
        g.name.toLowerCase().includes(q)
      );
    }

    function renderGrid() {
      computeFiltered();

      if (state.filteredGames.length === 0) {
        const isEmpty = state.originalGames.length === 0;
        const msg  = isEmpty ? opts.labels.noGames : opts.labels.noResults;
        const icon = isEmpty ? 'fa-gamepad' : 'fa-magnifying-glass';
        gridEl.innerHTML = `
          <div class="gm-empty">
            <i class="fa-solid ${icon}"></i>
            <span>${escapeHtml(msg)}</span>
          </div>`;
        return;
      }

      gridEl.innerHTML = state.filteredGames
        .map(game => buildCardHtml(
          game,
          state.mode,
          state.busyGameIds.has(game.gameId),
          state.selectedGameId === game.gameId,
          opts.labels
        ))
        .join('');
    }

    // ── Initial render ───────────────────────────────────────────────────────────
    applyMode();
    renderGrid();

    // ── Public instance API ──────────────────────────────────────────────────────
    return {
      /**
       * Replace the full games list.
       * @param {Array<{name:string, gameId:string}>} newGames
       */
      updateGames(newGames) {
        state.originalGames  = normalizeGames(newGames);
        state.busyGameIds.clear();
        state.selectedGameId = null;
        renderGrid();
      },

      /**
       * Switch between 'remote' and 'host' mode.
       * @param {'remote'|'host'} newMode
       */
      setMode(newMode) {
        state.mode = newMode;
        applyMode();
        renderGrid();
      },

      /**
       * Tear down the component and clear the container.
       */
      destroy() {
        container.innerHTML = '';
      }
    };
  }

  // ─── Global export ───────────────────────────────────────────────────────────
  global.GameMenu = { create };

}(typeof globalThis !== 'undefined' ? globalThis : window));
