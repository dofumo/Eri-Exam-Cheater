# Eri Online Test Cheating Extension

A lightweight Chrome extension that injects Gemini directly into your active browser tab, allowing you to use AI during online tests without triggering tab-switching or window-leaving detection. 

Many online test platforms monitor your browser activity and flag you if you switch tabs or open new windows. Eri solves this by keeping the AI interface directly on top of the page you are currently viewing.

## ✨ Key Features: Screen OCR & In-Page Injection
These two core features are designed specifically to bypass common anti-cheat mechanisms:
* **Zero Tab Switching:** The AI interface is injected directly into the current webpage. You can chat with Gemini without ever leaving the test page or triggering a warning.
* **Screen OCR:** Many platforms disable text selection. Eri lets you select an area of your screen to instantly extract text from images, locked PDFs, or unselectable questions.

## 🚀 Additional Features
* **Highlight Import:** Select standard text on the page and send it directly to Gemini.
* **Smart Prompts:** Built-in templates optimized for short answers, code-only responses, and multiple-choice questions.
* **Bring Your Own Key:** Enter your own Gemini API key and select your preferred model. (Your key and settings are stored locally and securely in your browser).
* **One-Click Copy:** Instantly copy both the original question and Gemini's response to your clipboard.

## 🛠️ Installation

1. Download this repository by clicking **Code → Download ZIP**.
2. Extract the downloaded ZIP file to a folder on your computer.
3. Open Chrome and navigate to `chrome://extensions/`.
4. Toggle **Developer mode** ON in the top-right corner.
5. Click **Load unpacked** in the top-left menu.
6. Select the extracted folder *(Make sure you select the folder containing the `manifest.json` file, not the ZIP itself)*.

## ⚙️ Setup & Usage
1. Open the extension from your Chrome toolbar and enter your Gemini API key.
2. Select the Gemini model you want to use.
3. **During a test:** Highlight a question or use the OCR capture tool, send it to Gemini, and receive your answer without ever leaving the active tab.
