
let autoRefreshGlobe = true;
let autoRefreshEastern = true;

if (window.electronAPI) {
    window.electronAPI.onToggleGlobe((val) => {
        autoRefreshGlobe = val;
        console.log('Auto Refresh Globe:', val);
        updateRefreshStatus();
    });

    window.electronAPI.onToggleEastern((val) => {
        autoRefreshEastern = val;
        console.log('Auto Refresh Eastern:', val);
        updateRefreshStatus();
    });
}

function updateRefreshStatus() {
    const el = document.getElementById('refresh-status');
    if (!el) return;

    if (autoRefreshGlobe || autoRefreshEastern) {
        el.textContent = '▶ Refresh Active';
        el.classList.add('active');
        el.classList.remove('paused');
    } else {
        el.textContent = '⏸ Refresh Paused';
        el.classList.add('paused');
        el.classList.remove('active');
    }
}


/* =====================================================
CONFIG
===================================================== */
const PLDT_INDEX = 0; // Graph 1
const REFRESH_INTERVAL = 30000; // 30 seconds
const PLDT_ACTIVITY_INTERVAL = 10000; // 10 seconds fake mouse move

/* =====================================================
WEBVIEWS
===================================================== */
const webviews = [
    makeWV("https://i-gate.net.ph/client/public/"),
    makeWV(
        "https://mrtg.globebusiness.com.ph/mrtg_customer/index.php?module=my_connection",
    ),
    makeWV("https://bandwidth10.eastern-tele.com/cacti/graph_view.php"),
];

function makeWV(src) {
    const w = document.createElement("webview");
    w.src = src;
    w.style.width = "100%";
    w.style.height = "100%";
    return w;
}

document.getElementById("slot-1").appendChild(webviews[0]);

/* =====================================================
TAB MANAGEMENT
===================================================== */
let activeTab = 0;

function showTab(i) {
    activeTab = i;

    document
        .querySelectorAll(".view")
        .forEach((v) => v.classList.remove("active"));
    document
        .querySelectorAll(".tabs button")
        .forEach((b) => b.classList.remove("active"));

    document.querySelectorAll(".view")[i].classList.add("active");
    document.querySelectorAll(".tabs button")[i].classList.add("active");

    if (i === 0) slot("slot-1", 0);
    if (i === 1) slot("slot-2", 1);
    if (i === 2) slot("slot-3", 2);

    if (i === 3) {
        slot("slot-c1", 0);
        slot("slot-c2", 1);
        slot("slot-c3", 2);
    }
    if (i === 0 || i === 3) {
        injectPLDT7DaysIntoIframe();
    }


    handlePLDTActivity();
    resetRefreshTimer();
}

function slot(id, index) {
    const el = document.getElementById(id);
    if (!el.contains(webviews[index])) {
        el.appendChild(webviews[index]);
    }
}

/* =====================================================
ZOOM
===================================================== */
const zoom = [1, 1, 1];

function zoomIn(i) {
    zoom[i] += 0.1;
    webviews[i].setZoomFactor(zoom[i]);
}
function zoomOut(i) {
    zoom[i] -= 0.1;
    webviews[i].setZoomFactor(zoom[i]);
}
function resetZoom(i) {
    zoom[i] = 1;
    webviews[i].setZoomFactor(1);
}

/* =====================================================
AUTO REFRESH (VISIBLE ONLY)
===================================================== */
let refreshTimer = null;
let isHovering = false;
let pldtRange = '7d'; // default

function resetRefreshTimer() {
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = setTimeout(refreshVisibleGraphs, REFRESH_INTERVAL);
}

function buildPLDTURL() {
    const now = new Date();
    let startDate = new Date(now);

    switch (pldtRange) {
        case '6h':
            startDate.setHours(startDate.getHours() - 6);
            break;
        case '1d':
            startDate.setDate(startDate.getDate() - 1);
            break;
        case '7d':
            startDate.setDate(startDate.getDate() - 7);
            break;
        case '14d':
            startDate.setDate(startDate.getDate() - 14);
            break;
        case '30d':
            startDate.setDate(startDate.getDate() - 30);
            break;
    }

    const start = startDate.toISOString().slice(0, 19).replace("T", " ");
    const end = now.toISOString().slice(0, 19).replace("T", " ");

    return (
        "https://i-gate.net.ph/client/public/dashboard/dashboardChart" +
        "?id=22445" +
        "&startdate=" + encodeURIComponent(start) +
        "&enddate=" + encodeURIComponent(end) +
        "&conversion_type=bps"
    );
}

function injectPLDTIntoIframe() {
    const wv = webviews[PLDT_INDEX];
    if (!wv) return;

    const url = buildPLDTURL();

    wv.executeJavaScript(`
    (function () {
      const iframe = document.getElementById('youriframe');
      if (!iframe) return;
      if (iframe.src !== "${url}") {
        iframe.src = "${url}";
      }
    })();
  `);
}


function refreshVisibleGraphs() {
    if (isHovering) {
        resetRefreshTimer();
        return;
    }

    // PLDT
    if (activeTab === 0 || activeTab === 3) {
        injectPLDTIntoIframe();
        updateTimestamp(activeTab === 0 ? 'updated-1' : 'updated-c1');
    }

    // Globe
    if ((activeTab === 1 || activeTab === 3) && autoRefreshGlobe) {
        webviews[1].reload();
        updateTimestamp(activeTab === 1 ? 'updated-2' : 'updated-c2');
    }

    // Eastern
    if ((activeTab === 2 || activeTab === 3) && autoRefreshEastern) {
        webviews[2].reload();
        updateTimestamp(activeTab === 2 ? 'updated-3' : 'updated-c3');
    }


    resetRefreshTimer();
}



/* =====================================================
HOVER DETECTION (PAUSE REFRESH ONLY)
===================================================== */
["slot-1", "slot-2", "slot-3", "slot-c1", "slot-c2", "slot-c3"].forEach(
    (id) => {
        const el = document.getElementById(id);
        if (!el) return;

        el.addEventListener("mouseenter", () => {
            isHovering = true;
        });

        el.addEventListener("mouseleave", () => {
            isHovering = false;
            resetRefreshTimer();
        });
    },
);


document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey && e.key === 'r') || e.key === 'F5') {
        e.preventDefault();
        console.log('Reload blocked to preserve PLDT session');
    }
});

/* =====================================================
AUTO-HIDE SCROLLBAR (5 SECONDS)
===================================================== */
let scrollbarTimer = null;
const SCROLLBAR_HIDE_DELAY = 5000;

function showScrollbar() {
    document.body.classList.remove("hide-scrollbar");

    if (scrollbarTimer) clearTimeout(scrollbarTimer);
    scrollbarTimer = setTimeout(hideScrollbar, SCROLLBAR_HIDE_DELAY);
}

function hideScrollbar() {
    document.body.classList.add("hide-scrollbar");
}

/* Show scrollbar on activity */
["mousemove", "wheel", "touchstart", "keydown"].forEach((evt) => {
    document.addEventListener(evt, showScrollbar, { passive: true });
});

/* Hide scrollbar initially */
hideScrollbar();

/* =====================================================
PLDT FAKE ACTIVITY (GRAPH 1 ONLY)
===================================================== */
let pldtActivityTimer = null;

function isPLDTVisible() {
    return activeTab === 0 || activeTab === 3;
}

function keepPLDTAlive() {
    const wv = webviews[PLDT_INDEX];
    if (!wv) return;

    wv.executeJavaScript(`
    (function () {
      const evt = new MouseEvent('mousemove', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: Math.random() * window.innerWidth,
        clientY: Math.random() * window.innerHeight
      });
      document.dispatchEvent(evt);
    })();
  `);
}

function startPLDTActivity() {
    if (pldtActivityTimer) return;

    pldtActivityTimer = setInterval(() => {
        if (isPLDTVisible()) {
            keepPLDTAlive();
        }
    }, PLDT_ACTIVITY_INTERVAL);
}

function stopPLDTActivity() {
    if (pldtActivityTimer) {
        clearInterval(pldtActivityTimer);
        pldtActivityTimer = null;
    }
}

function handlePLDTActivity() {
    if (isPLDTVisible()) {
        startPLDTActivity();
    } else {
        stopPLDTActivity();
    }
}
function setPLDTRange(range, el) {
    pldtRange = range;

    document
        .querySelectorAll('.pldt-range-switch button')
        .forEach(b => b.classList.remove('active'));

    if (el) el.classList.add('active');

    injectPLDTIntoIframe();
    resetRefreshTimer();
}

function updateTimestamp(targetId) {
    const el = document.getElementById(targetId);
    if (!el) return;

    const now = new Date();
    const formatted =
        now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0') + ' ' +
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0') + ':' +
        String(now.getSeconds()).padStart(2, '0');

    el.textContent = '🕒 Updated: ' + formatted;
}


/* =====================================================
START EVERYTHING
===================================================== */
handlePLDTActivity();
resetRefreshTimer();

const modal = document.getElementById('update-modal');
const text = document.getElementById('update-text');
const fill = document.getElementById('progress-fill');
const restartBtn = document.getElementById('restart-btn');

window.updater.onStatus(data => {
    modal.style.display = 'flex';

    if (data.status === 'checking') {
        text.textContent = 'Checking for updates…';
    }

    if (data.status === 'downloading') {
        text.textContent = `Downloading update… ${data.percent}%`;
        fill.style.width = data.percent + '%';
    }

    if (data.status === 'ready') {
        text.textContent = 'Update ready. Restart to apply.';
        restartBtn.style.display = 'inline-block';
    }
});

restartBtn.onclick = () => {
    window.updater.restart();
};
