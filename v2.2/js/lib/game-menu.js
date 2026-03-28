/**
 * game-menu.js
 * Client-side library for a searchable, responsive game card grid overlay.
 *
 * Usage:
 *   const menu = GameMenu.create(options)   // builds overlay, does NOT show it
 *   menu.open()                             // shows the overlay
 *   menu.close()                            // hides the overlay
 *   menu.updateGames(newArray)
 *   menu.setMode('remote' | 'host')
 *
 * Games array format: [{ name: string, gameId: string, images: { cover?: string, disc?: string } }, ...]
 *
 * Options:
 *   games           Array<{name,gameId,images}> (default: [])
 *   mode            'remote' | 'host'       (default: 'remote')
 *   gamesSelectable boolean                 (default: true, controls card selection/highlight)
 *   onInsert(game)  called in remote mode   (game = { name, gameId })
 *   onDelete(game)  called in host mode per card
 *   onImport()      called when Import Game tapped (host mode)
 *   onSelect(game)  optional – called on card body click
 *   onClose()       optional – called whenever the overlay closes
 *   labels          { insert, delete, import, close, searchPlaceholder, noGames, noResults }
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
      /* ── Overlay / dimmer ── */
      .gm-overlay {
        position: fixed;
        inset: 0;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 1;
        transition: opacity 0.2s ease;
        pointer-events: all;
      }

      .gm-overlay.gm-hidden {
        opacity: 0;
        pointer-events: none;
      }

      .gm-dimmer {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.55);
      }

      /* ── Panel ── */
      .gm-panel {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        width: min(92vw, 860px);
        height: min(88vh, 700px);
        border-radius: 18px;
        color-scheme: light dark;
        background: light-dark(var(--background-color, white), var(--wiiBtn-background-color, white));
        box-shadow: 0 8px 40px rgba(0,0,0,0.35);
        overflow: hidden;
        font-family: inherit;
        color: var(--text-color, #383838);
      }

      /* ── Toolbar ── */
      .gm-toolbar {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 14px;
        flex-shrink: 0;
        flex-wrap: wrap;
        border-bottom: 2px solid var(--container-border, #cfcfcf);
      }

      .gm-search-wrap {
        opacity: 0;
        pointer-events: none;

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
        background: var(--background-color, #eaeaea);
        color: var(--text-color, #383838);
        outline: none;
        -webkit-user-select: text;
        user-select: text;
        touch-action: auto;
        transition: border-color 0.15s;
      }

      .gm-search:focus {
        border-color: var(--home-btn-color, rgb(8 190 2));
      }

      /* ── Toolbar buttons (import, close) ── */
      .gm-toolbar-btn {
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
        display: flex;
        align-items: center;
        gap: 6px;
        transition: transform 0.15s, background 0.1s;
      }

      .gm-toolbar-btn:active {
        transform: scale(0.95);
        background: var(--btn-pressed-background-color, #acacac);
      }

      @media (hover: hover) {
        .gm-toolbar-btn:hover {
          background: var(--btn-background-color, #dadada);
        }
      }

      .gm-close-btn {
        border-color: light-dark(#555, var(--container-border, #cfcfcf));
        color: light-dark(#555, #aaa);
        font-size: 1.1rem;
        padding: 0.45rem 0.75rem;
      }

      @media (hover: hover) {
        .gm-close-btn:hover {
          border-color: #c0392b;
          color: #c0392b;
          background: #fdecea;
        }
      }

      /* ── Grid ── */
      .gm-grid {
        flex: 1;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        padding: 14px 14px 20px;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 12px;
        align-content: start;
      }

      @media (min-width: 500px) {
        .gm-grid {
          grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
          gap: 14px;
        }
      }

      @media (min-width: 700px) {
        .gm-grid {
          grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
          gap: 16px;
        }
      }

      /* ── Card ── */
      .gm-card {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 12px 10px 12px;
        border: 2px solid var(--container-border, #cfcfcf);
        border-radius: 10px;
        background: rgba(128, 128, 128, 0.1);
        gap: 10px;
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

      .gm-panel.gm-games-not-selectable .gm-card {
        cursor: default;
      }

      .gm-panel.gm-games-not-selectable .gm-card:focus {
        border-color: var(--container-border, #cfcfcf);
        box-shadow: none;
      }

      .gm-panel.gm-games-not-selectable .gm-card.gm-selected {
        border-color: var(--container-border, #cfcfcf);
        box-shadow: none;
      }

      .gm-card:active {
        transform: scale(0.97);
      }

      .gm-panel.gm-games-not-selectable .gm-card:active {
        transform: none;
      }

      @media (hover: hover) {
        .gm-card:not(.gm-selected):hover {
          border-color: var(--home-btn-color, rgb(8 190 2));
        }

        .gm-panel.gm-games-not-selectable .gm-card:hover {
          border-color: var(--container-border, #cfcfcf);
        }
      }

      /* ── Cover art ── */
      .gm-cover-wrap {
        width: 100%;
        aspect-ratio: 2 / 3;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        overflow: hidden;
        flex-shrink: 0;
      }

      .gm-cover {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
      }

      .gm-cover-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        gap: 6px;
        color: var(--text-color, #383838);
        opacity: 0.3;
        font-size: 2rem;
      }

      .gm-cover-placeholder span {
        font-size: 0.65rem;
        opacity: 0.8;
      }

      /* ── Card name ── */
      .gm-card-name {
        font-size: 0.85rem;
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
        font-size: 0.82rem;
        padding: 0.4rem 0.85rem;
        border: 2px solid black;
        border-radius: 20px;
        background: var(--wiiBtn-background-color, white);
        color: var(--wiiBtn-color, #323232);
        cursor: pointer;
        white-space: nowrap;
        min-height: 36px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
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

      .gm-insert-btn {
        position: absolute;
        bottom: 1rem;
        width: calc(100% - 20px);
        box-shadow: 0px 2px 20px -4px #000000ad;
        opacity: 1;
        pointer-events: all;
        transition: transform 0.15s, opacity 0.15s;
      }
      .gm-card:not(.gm-selected) .gm-insert-btn {
        opacity: 0;
        pointer-events: none;
        transform: translateY(.5rem);
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
        padding: 50px 20px;
        text-align: center;
        color: var(--text-color, #383838);
        opacity: 0.5;
        font-size: 1.1rem;
        gap: 12px;
      }

      .gm-empty > i {
        font-size: 3rem;
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
    }).map(g => ({
      name: g.name.trim(),
      gameId: g.gameId.trim(),
      images: {
        cover: typeof g.images.cover === 'string' && g.images.cover.trim() ? g.images.cover.trim() : '',
        disc: typeof g.images.disc === 'string' && g.images.disc.trim() ? g.images.disc.trim() : ''
      }
    }));
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

  function buildCardHtml(game, mode, isBusy, isSelected, labels, gamesSelectable, showGameNames) {
    const selectedClass = gamesSelectable && isSelected ? ' gm-selected' : '';
    const busyIcon = `<i class="fa-solid fa-compact-disc gm-busy-icon"></i>`;

    const coverHtml = game.images.cover
      ? `
      <div class="gm-cover-wrap">
        <img
          class="gm-cover"
          src="${escapeAttr(game.images.cover)}"
          alt="${escapeAttr(game.name)}"
          loading="lazy"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
        />
        <div class="gm-cover-placeholder" style="display:none;">
          <i class="fa-solid fa-gamepad"></i>
          <span>${escapeHtml(game.gameId)}</span>
        </div>
      </div>`
      : `
      <div class="gm-cover-wrap">
        <div class="gm-cover-placeholder">
          <i class="fa-solid fa-gamepad"></i>
          <span>${escapeHtml(game.gameId)}</span>
        </div>
      </div>`;

    let actionBtn = '';
    if (mode === 'remote') {
      const icon = isBusy ? busyIcon : '<i class="fa-solid fa-compact-disc"></i>';
      actionBtn = `
        <button class="gm-action-btn gm-insert-btn" data-action="insert"${isBusy ? ' disabled' : ''} tabindex="-1">
          ${icon} ${escapeHtml(labels.insert)}
        </button>`;
    } else if (mode === 'host') {
      const icon = isBusy ? `<i class="fa-solid fa-trash gm-busy-icon"></i>` : '<i class="fa-solid fa-trash"></i>';
      actionBtn = `
        <button class="gm-action-btn gm-delete-btn" data-action="delete"${isBusy ? ' disabled' : ''} tabindex="-1">
          ${icon} ${escapeHtml(labels.delete)}
        </button>`;
    }

    return `
      <div class="gm-card${selectedClass}"
           data-game-id="${escapeAttr(game.gameId)}"
           tabindex="${gamesSelectable ? '0' : '-1'}"
           role="${gamesSelectable ? 'button' : 'group'}"
           aria-label="${escapeAttr(game.name)}">
        ${coverHtml}
        ${showGameNames ? `<div class="gm-card-name">${escapeHtml(game.name)}</div>` : ''}
        ${actionBtn}
      </div>`;
  }

  // ─── Grid column count (for arrow-key navigation) ────────────────────────────

  function getColumnCount(gridEl) {
    return getComputedStyle(gridEl).gridTemplateColumns.split(' ').length;
  }

  // ─── create() ────────────────────────────────────────────────────────────────

  function create(options) {
    const opts = Object.assign({
      games: [],
      mode: 'remote',
      gamesSelectable: true,
      showGameNames: true,
      onInsert: null,
      onDelete: null,
      onImport: null,
      onSelect: null,
      onClose: null,
      labels: {}
    }, options || {});

    opts.labels = Object.assign({
      insert: 'Insert Disc',
      delete: 'Delete',
      import: 'Import Game',
      close: 'Close',
      searchPlaceholder: 'Search games\u2026',
      noGames: 'No games imported.',
      noResults: 'No games match your search.'
    }, opts.labels || {});

    injectStyles();

    // ── Internal state ──────────────────────────────────────────────────────────
    const state = {
      originalGames: normalizeGames(opts.games),
      filteredGames: [],
      searchQuery: '',
      selectedGameId: null,
      busyGameIds: new Set(),
      mode: opts.mode
    };

    // ── Build overlay DOM ───────────────────────────────────────────────────────
    const overlay = document.createElement('div');
    overlay.className = 'gm-overlay gm-hidden';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `
      <div class="gm-dimmer"></div>
      <div class="gm-panel">
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
          <button class="gm-toolbar-btn gm-import-btn">
            <i class="fa-solid fa-file-import"></i> ${escapeHtml(opts.labels.import)}
          </button>
          <button class="gm-toolbar-btn gm-close-btn" aria-label="Close">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="gm-grid"></div>
      </div>
    `;

    document.body.appendChild(overlay);

    const dimmerEl  = overlay.querySelector('.gm-dimmer');
    const searchEl  = overlay.querySelector('.gm-search');
    const importBtn = overlay.querySelector('.gm-import-btn');
    const closeBtn  = overlay.querySelector('.gm-close-btn');
    const gridEl    = overlay.querySelector('.gm-grid');
    const panelEl   = overlay.querySelector('.gm-panel');

    // ── Close logic ─────────────────────────────────────────────────────────────
    function closeOverlay() {
      overlay.classList.add('gm-hidden');
      if (typeof opts.onClose === 'function') opts.onClose();
    }

    closeBtn.addEventListener('click', closeOverlay);

    dimmerEl.addEventListener('click', closeOverlay);

    // Escape key closes
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeOverlay();
    });

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
        return;
      }

      // Card body click = select
      if (opts.gamesSelectable) {
        selectGame(gameId);
      }
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

      if      (e.key === 'ArrowRight') next = Math.min(idx + 1,   cards.length - 1);
      else if (e.key === 'ArrowLeft')  next = Math.max(idx - 1,   0);
      else if (e.key === 'ArrowDown')  next = Math.min(idx + cols, cards.length - 1);
      else if (e.key === 'ArrowUp')    next = Math.max(idx - cols, 0);

      if (next >= 0 && next !== idx) {
        e.preventDefault();
        cards[next].focus();
      }
    });

    // ── Search ──────────────────────────────────────────────────────────────────
    searchEl.addEventListener('input', () => {
      state.searchQuery = searchEl.value.trim();
      renderGrid();
    });

    searchEl.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Let the overlay-level Escape handler close the menu
        // only if search is already empty; otherwise just clear search
        if (searchEl.value === '') return;
        e.stopPropagation();
        searchEl.value    = '';
        state.searchQuery = '';
        renderGrid();
      }
    });

    // ── Import button ───────────────────────────────────────────────────────────
    importBtn.addEventListener('click', () => {
      if (typeof opts.onImport === 'function') opts.onImport();
    });

    // ── Helpers ─────────────────────────────────────────────────────────────────

    function applyMode() {
      importBtn.style.display = state.mode === 'host' ? '' : 'none';
      panelEl.classList.toggle('gm-games-not-selectable', !opts.gamesSelectable);
    }

    function selectGame(gameId) {
      if (!opts.gamesSelectable) return;
      state.selectedGameId = gameId;
      Array.from(gridEl.querySelectorAll('.gm-card')).forEach(c => {
        c.classList.toggle('gm-selected', c.dataset.gameId === gameId);
      });
      if (typeof opts.onSelect === 'function') {
        const game = state.originalGames.find(g => g.gameId === gameId);
        if (game) opts.onSelect(game);
      }
    }

    function setBusy(gameId, busy) {
      if (busy) state.busyGameIds.add(gameId);
      else      state.busyGameIds.delete(gameId);

      const card = Array.from(gridEl.querySelectorAll('.gm-card'))
                        .find(c => c.dataset.gameId === gameId);
      if (!card) return;

      const game = state.originalGames.find(g => g.gameId === gameId);
      if (!game) return;

      const tmp = document.createElement('div');
      tmp.innerHTML = buildCardHtml(
        game, state.mode, busy,
        state.selectedGameId === gameId, opts.labels, opts.gamesSelectable, opts.showGameNames
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
          opts.labels,
          opts.gamesSelectable,
          opts.showGameNames
        ))
        .join('');
    }

    // ── Initial render (hidden) ─────────────────────────────────────────────────
    applyMode();
    renderGrid();

    // ── Public instance API ─────────────────────────────────────────────────────
    return {
      /** Show the overlay. */
      open() {
        overlay.classList.remove('gm-hidden');
        // Focus the search box for keyboard users
        setTimeout(() => searchEl.focus(), 50);
      },

      /** Hide the overlay. */
      close() {
        closeOverlay();
      },

      /** Replace the full games list. */
      updateGames(newGames) {
        state.originalGames  = normalizeGames(newGames);
        state.busyGameIds.clear();
        state.selectedGameId = null;
        renderGrid();
      },

      /** Switch between 'remote' and 'host' mode. */
      setMode(newMode) {
        state.mode = newMode;
        applyMode();
        renderGrid();
      }
    };
  }

  // ─── Global export ───────────────────────────────────────────────────────────
  global.GameMenu = { create };

}(typeof globalThis !== 'undefined' ? globalThis : window));
