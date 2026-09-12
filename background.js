// TEST OK


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'startAreaSelect') {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { action: 'startAreaSelect' });
    });
    return;
  }

  if (request.action === 'areaSelected' && sender.tab) {
    handleAreaSelected(request.rect, request.devicePixelRatio, sender.tab.windowId);
    return;
  }
});

function getStoredSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['geminiApiKey', 'geminiModel'], (result) => {
      resolve({
        apiKey: result.geminiApiKey || '',
        model: result.geminiModel || 'gemini-3.6-flash',
      });
    });
  });
}

function cropImage(dataUrl, rect, scale) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(rect.width * scale));
      canvas.height = Math.max(1, Math.round(rect.height * scale));
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        img,
        Math.round(rect.left * scale),
        Math.round(rect.top * scale),
        Math.round(rect.width * scale),
        Math.round(rect.height * scale),
        0,
        0,
        canvas.width,
        canvas.height
      );
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

async function callGeminiOcr(base64Png, apiKey, model) {
  const endpointUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: 'Extract all readable text from this image, exactly as it appears. Return only the extracted text, no extra commentary.' },
          { inline_data: { mime_type: 'image/png', data: base64Png } },
        ],
      },
    ],
  };

  const response = await fetch(endpointUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await response.json();

  if (!response.ok) {
    const message = (result && result.error && result.error.message) || `Request failed (${response.status})`;
    throw new Error(message);
  }
  const candidate = result.candidates && result.candidates[0];
  const parts = candidate && candidate.content && candidate.content.parts;
  const text = parts && parts.map((p) => p.text || '').join('').trim();
  if (!text) throw new Error('Gemini returned no text for this image.');
  return text;
}

function storeResult(text) {
  chrome.storage.local.set({ lastOcrResult: { text: text, timestamp: Date.now() } }, () => {
    chrome.browserAction.setBadgeText({ text: '1' });
    chrome.browserAction.setBadgeBackgroundColor({ color: '#4285f4' });
  });
}

async function handleAreaSelected(rect, devicePixelRatio, windowId) {
  try {
    const { apiKey, model } = await getStoredSettings();
    if (!apiKey) {
      storeResult('Error: No Gemini API key saved yet. Open the popup, enter your key under Settings, and try again.');
      return;
    }

    const dataUrl = await new Promise((resolve, reject) => {
      chrome.tabs.captureVisibleTab(windowId, { format: 'png' }, (result) => {
        if (chrome.runtime.lastError || !result) {
          reject(new Error((chrome.runtime.lastError && chrome.runtime.lastError.message) || 'Screenshot failed'));
        } else {
          resolve(result);
        }
      });
    });

    const croppedDataUrl = await cropImage(dataUrl, rect, devicePixelRatio || 1);
    const base64Png = croppedDataUrl.split(',')[1];
    const text = await callGeminiOcr(base64Png, apiKey, model);
    storeResult(text);
  } catch (err) {
    storeResult('Error: ' + err.message);
  }
}
