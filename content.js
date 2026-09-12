// Returns text the user has actually highlighted on the page.
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'getSelectedText') {
    var selectedText = window.getSelection ? window.getSelection().toString() : '';
    sendResponse({ selectedText: selectedText });
    return;
  }

  if (request.action === 'startAreaSelect') {
    startAreaSelection();
    sendResponse({ started: true });
    return;
  }
});

// --- Area-selection overlay ---
// Lets the user drag a rectangle over the visible page. On mouseup, sends
// the rectangle (in CSS px, viewport-relative) to background.js, which
// screenshots just that region and OCRs it via Gemini.
function startAreaSelection() {
  if (document.getElementById('__studyhelper_overlay__')) return; // already active

  var overlay = document.createElement('div');
  overlay.id = '__studyhelper_overlay__';
  overlay.style.cssText =
    'position:fixed;top:0;left:0;width:100vw;height:100vh;' +
    'background:rgba(0,0,0,0.15);cursor:crosshair;z-index:2147483647;';

  var box = document.createElement('div');
  box.style.cssText =
    'position:fixed;border:2px solid #4285f4;background:rgba(66,133,244,0.15);' +
    'z-index:2147483647;display:none;pointer-events:none;';

  document.documentElement.appendChild(overlay);
  document.documentElement.appendChild(box);

  var startX = 0, startY = 0, dragging = false;

  function onMouseDown(e) {
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    box.style.left = startX + 'px';
    box.style.top = startY + 'px';
    box.style.width = '0px';
    box.style.height = '0px';
    box.style.display = 'block';
  }

  function onMouseMove(e) {
    if (!dragging) return;
    var x = Math.min(e.clientX, startX);
    var y = Math.min(e.clientY, startY);
    var w = Math.abs(e.clientX - startX);
    var h = Math.abs(e.clientY - startY);
    box.style.left = x + 'px';
    box.style.top = y + 'px';
    box.style.width = w + 'px';
    box.style.height = h + 'px';
  }

  function onMouseUp(e) {
    if (!dragging) return;
    dragging = false;
    var rect = {
      left: Math.min(e.clientX, startX),
      top: Math.min(e.clientY, startY),
      width: Math.abs(e.clientX - startX),
      height: Math.abs(e.clientY - startY),
    };
    cleanup();
    if (rect.width > 3 && rect.height > 3) {
      chrome.runtime.sendMessage({
        action: 'areaSelected',
        rect: rect,
        devicePixelRatio: window.devicePixelRatio || 1,
      });
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') cleanup();
  }

  function cleanup() {
    overlay.removeEventListener('mousedown', onMouseDown);
    overlay.removeEventListener('mousemove', onMouseMove);
    overlay.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('keydown', onKeyDown);
    overlay.remove();
    box.remove();
  }

  overlay.addEventListener('mousedown', onMouseDown);
  overlay.addEventListener('mousemove', onMouseMove);
  overlay.addEventListener('mouseup', onMouseUp);
  document.addEventListener('keydown', onKeyDown);
}
