function showLoading() {
  document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
  document.getElementById('loading').style.display = 'none';
}

function getApiKey() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['geminiApiKey'], (result) => {
      resolve(result.geminiApiKey || '');
    });
  });
}

function stripTags(html) {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  const text = temp.textContent || temp.innerText || '';
  temp.remove();
  return text.trim();
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch((err) => console.error(err));
}

function getPromptByType(type) {
  switch (type) {
    case 'GetPromptAnswer':
      return 'Answer concisely in 1-2 sentences.';
    case 'GetCode':
      return 'Provide code only. No explanations.';
    case 'GetOptions':
      return 'State the correct option and 1 brief reason.';
    default:
      return '';
  }
}

// gemini generateContent endpoint.
// test ok
async function callGemini(promptText, model) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error('No Gemini API key saved yet. Enter one under Settings and click "Save key".');
  }

  const endpointUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: promptText }],
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

  if (!text) {
    throw new Error('Gemini returned no text (it may have been blocked by safety filters, or the response was empty).');
  }
  return text;
}

async function runPrompt(sourceText, model, promptType, showQuestion) {
  const promptContent = getPromptByType(promptType);
  const fullPrompt = `${sourceText}\n\n${promptContent}`;

  if (showQuestion) {
    document.getElementById('question-area').innerHTML = `<pre>${sourceText}</pre>`;
  }

  showLoading();
  try {
    const answer = await callGemini(fullPrompt, model);
    document.getElementById('answer-area').innerHTML = `<pre>${answer}</pre>`;
  } catch (err) {
    console.error(err);
    document.getElementById('answer-area').innerHTML = `<pre>Error: ${err.message}</pre>`;
  } finally {
    hideLoading();
  }
}

function getSelectedTextFromPage() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (!tabs[0]) return resolve('');
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getSelectedText' }, function (response) {
        if (chrome.runtime.lastError || !response) {
          resolve('');
        } else {
          resolve(response.selectedText || '');
        }
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  var getOptionsBtn = document.getElementById('get-options-btn');
  var getCodeBtn = document.getElementById('get-code-btn');
  var submitTextBtn = document.getElementById('submit-text-btn');
  var useSelectionBtn = document.getElementById('use-selection-btn');
  var selectAreaBtn = document.getElementById('select-area-btn');
  var areaSelectHint = document.getElementById('area-select-hint');
  var inputText = document.getElementById('input-text');
  var copyQuestionBtn = document.getElementById('copy-question-btn');
  var copyAnswerBtn = document.getElementById('copy-answer-btn');
  var modelSelect = document.getElementById('model-select');
  var apiKeyInput = document.getElementById('api-key-input');
  var saveKeyBtn = document.getElementById('save-key-btn');
  var keyStatus = document.getElementById('key-status');

  // pre-fill neu da save key.
  getApiKey().then((key) => {
    if (key) apiKeyInput.placeholder = 'Key saved (hidden) - paste a new one to replace it';
  });

  // restore last-chosen model, sau nay fill lai background.js
  // dung cho screen ocr tra cung ket qua
  chrome.storage.local.get(['geminiModel'], (result) => {
    if (result.geminiModel) modelSelect.value = result.geminiModel;
  });
  modelSelect.addEventListener('change', function () {
    chrome.storage.local.set({ geminiModel: modelSelect.value });
  });

  // screen-area ocr result is waiting from the background script (test ok)
  // load into the input box and clear the notification (test ok)
  chrome.storage.local.get(['lastOcrResult'], (result) => {
    if (result.lastOcrResult && result.lastOcrResult.text) {
      inputText.value = result.lastOcrResult.text;
      chrome.storage.local.remove('lastOcrResult');
      chrome.browserAction.setBadgeText({ text: '' });
    }
  });

  selectAreaBtn.addEventListener('click', function () {
    // dofumo test
    // closing after sendMessage
    // dofumo test ok
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (!tabs[0]) return;
      chrome.tabs.sendMessage(tabs[0].id, { action: 'startAreaSelect' }, function () {
        window.close();
      });
    });
  });

  saveKeyBtn.addEventListener('click', function () {
    const key = apiKeyInput.value.trim();
    if (!key) return;
    chrome.storage.local.set({ geminiApiKey: key }, function () {
      keyStatus.textContent = 'Saved.';
      apiKeyInput.value = '';
      apiKeyInput.placeholder = 'Key saved (hidden) — paste a new one to replace it';
      setTimeout(() => (keyStatus.textContent = ''), 2000);
    });
  });

  useSelectionBtn.addEventListener('click', async function () {
    const selected = await getSelectedTextFromPage();
    if (selected) {
      inputText.value = selected;
    } else {
      keyStatus.textContent = 'No text is highlighted on the current page.';
      keyStatus.style.color = 'red';
      setTimeout(() => {
        keyStatus.textContent = '';
        keyStatus.style.color = 'green';
      }, 2500);
    }
  });

  copyQuestionBtn.addEventListener('click', function () {
    copyToClipboard(document.getElementById('question-area').innerText);
  });

  copyAnswerBtn.addEventListener('click', function () {
    copyToClipboard(document.getElementById('answer-area').innerText);
  });

  submitTextBtn.addEventListener('click', function () {
    const text = stripTags(inputText.value);
    if (!text) return;
    runPrompt(text, modelSelect.value, 'GetPromptAnswer', true);
  });

  getOptionsBtn.addEventListener('click', function () {
    const text = stripTags(inputText.value);
    if (!text) return;
    runPrompt(text, modelSelect.value, 'GetOptions', true);
  });

  getCodeBtn.addEventListener('click', function () {
    const text = stripTags(inputText.value);
    if (!text) return;
    runPrompt(text, modelSelect.value, 'GetCode', true);
  });
});
