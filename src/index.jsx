
const latestVersion = '2.2';

/* ── URL params ──────────────────────────────────── */
const params = new URLSearchParams(window.location.search);
const ip = params.get('ip') || window.location.hostname;
const port = params.get('r') || '443';
const path = params.get('p') || `/v${latestVersion}/`;
const appUrl = (ip && port) ? `https://${ip}:${port}${path}` : null;

const ua = navigator.userAgent;
const isIOS = (/iPad|iPhone|iPod/.test(ua) && !window.MSStream)
    || (/Mac/.test(ua) && navigator.maxTouchPoints > 1);

/* ── navigation ──────────────────────────────────── */
function showScreen(id, fromRight = true) {
    const current = document.querySelector('.screen.active');
    if (current && current.id !== id) {
        current.classList.remove('active');
    }
    const next = document.getElementById(id);
    if (!next) return;
    // Set entry direction before making active
    next.style.transform = fromRight ? 'translateX(48px)' : 'translateX(-48px)';
    // Force reflow so transition fires
    next.offsetHeight;
    next.classList.add('active');
}

window.navigateTo = function(id) {
    history.pushState({ screen: id }, '', '#' + id);
    showScreen(id, true);
}

window.goBack = function() {
    history.back();
}

window.addEventListener('popstate', (e) => {
    const id = e.state && e.state.screen;
    if (id) {
        showScreen(id, false);
    } else {
        showScreen('screen-landing', false);
    }
});

/* ── connection test ─────────────────────────────── */
async function checkConnection() {
    if (!appUrl) {
        showScreen('screen-error', true);
        history.replaceState({ screen: 'screen-error' }, '', '#screen-error');
        return;
    }

    let signal;
    try { signal = AbortSignal.timeout(4000); }
    catch (_) {
        const c = new AbortController();
        setTimeout(() => c.abort(), 4000);
        signal = c.signal;
    }

    try {
        const res = await fetch(new URL('/ping', appUrl), { signal, mode: 'cors' });
        if (res.ok) {
            showScreen('screen-success', true);
            history.replaceState({ screen: 'screen-success' }, '', '#screen-success');
            setTimeout(() => { window.location.href = appUrl; }, 1200);
            return;
        }
    } catch (_) { }

    buildTutorial();
    showScreen('screen-landing', true);
    history.replaceState({ screen: 'screen-landing' }, '', '#screen-landing');
}

/* ── mockup helpers ──────────────────────────────── */
function shortIP(n) { return n && n.length > 14 ? n.slice(0, 13) + '…' : (n || 'server'); }

function mockAndroid_Advanced() {
    return `<div class="bm">
    <div class="bm-bar">
        <div class="bm-dot" style="background:#EF4444"></div>
        <div class="bm-dot" style="background:#F59E0B"></div>
        <div class="bm-dot" style="background:#22C55E"></div>
        <div class="bm-addr warn"><i class="fa-solid fa-lock-open" style="font-size:5px"></i> ${shortIP(ip)}</div>
    </div>
    <div class="bm-body">
        <i class="fa-solid fa-lock-open bm-warn-icon"></i>
        <div class="bm-warn-text">Your connection<br>is not private</div>
        <div class="bm-spacer"></div>
        <div class="tap-target btn-style">Advanced</div>
    </div>
</div>`;
}
function mockAndroid_Proceed() {
    return `<div class="bm">
    <div class="bm-bar">
        <div class="bm-dot" style="background:#EF4444"></div>
        <div class="bm-dot" style="background:#F59E0B"></div>
        <div class="bm-dot" style="background:#22C55E"></div>
        <div class="bm-addr warn">${shortIP(ip)}</div>
    </div>
    <div class="bm-body">
        <i class="fa-solid fa-circle-info bm-warn-icon" style="color:#9CA3AF;font-size:11px"></i>
        <div class="bm-warn-text" style="color:#9CA3AF;font-size:6px">Server cert not trusted<br>by this device</div>
        <div class="bm-spacer"></div>
        <div class="tap-target link-style">Proceed (unsafe)</div>
    </div>
</div>`;
}
function mockIOS_ShowDetails() {
    return `<div class="bm">
    <div class="bm-bar">
        <div class="bm-addr warn" style="text-align:center">
        <i class="fa-solid fa-lock-open" style="font-size:5px"></i> Not Secure
        </div>
    </div>
    <div class="bm-body">
        <i class="fa-solid fa-lock-open bm-warn-icon"></i>
        <div class="bm-warn-text">This Connection<br>Is Not Private</div>
        <div class="bm-spacer"></div>
        <div class="tap-target link-style">Show Details</div>
    </div>
</div>`;
}
function mockIOS_VisitWebsite() {
    return `<div class="bm">
    <div class="bm-bar">
        <div class="bm-addr warn" style="text-align:center">
        <i class="fa-solid fa-lock-open" style="font-size:5px"></i> Not Secure
        </div>
    </div>
    <div class="bm-body">
        <i class="fa-solid fa-certificate bm-warn-icon" style="color:#9CA3AF;font-size:11px"></i>
        <div class="bm-warn-text" style="color:#9CA3AF;font-size:6px">Certificate issued by<br>unknown authority</div>
        <div class="bm-spacer"></div>
        <div class="tap-target link-style">visit this website</div>
    </div>
</div>`;
}
function mockIOS_Continue() {
    return `<div class="dm">
    <div class="dm-title">Website Not Secure</div>
    <div class="dm-body">Safari wants to open this site even though it may not be secure.</div>
    <div class="dm-divider"></div>
    <div class="dm-row">
        <div class="dm-cancel">Cancel</div>
        <div class="dm-ok">Continue</div>
    </div>
</div>`;
}

function buildTutorial() {
    const wrap = document.getElementById('steps-wrap');
    const steps = isIOS ? [
        { label: 'Tap "Show Details"', sub: 'At the bottom of the page', vis: mockIOS_ShowDetails() },
        { label: 'Tap "visit this website"', sub: 'The link in the details', vis: mockIOS_VisitWebsite() },
        { label: 'Tap "Continue"', sub: 'In the confirmation popup', vis: mockIOS_Continue() },
    ] : [
        { label: 'Tap "Advanced"', sub: 'At the bottom of the page', vis: mockAndroid_Advanced() },
        { label: 'Tap "Proceed (unsafe)"', sub: 'The link that appears below', vis: mockAndroid_Proceed() },
    ];

    let html = `<div class="step-card step-go">
<div class="badge">1</div>
    <div class="step-text">
        <div class="step-label">Open the link</div>
        <div class="step-sub">Tap to open in a new tab</div>
    </div>
    <a class="open-btn" href="${appUrl}" target="_blank">
        <i class="fa-solid fa-arrow-up-right-from-square"></i> Open
    </a>
</div>`;

    steps.forEach((s, i) => {
        html += `<div class="connector"><i class="fa-solid fa-arrow-down"></i></div>
<div class="step-card">
    <div class="badge">${i + 2}</div>
    <div class="step-text">
    <div class="step-label">${s.label}</div>
    <div class="step-sub">${s.sub}</div>
    </div>
    <div class="step-vis">${s.vis}</div>
</div>`;
    });

    wrap.innerHTML = html;
}

checkConnection();