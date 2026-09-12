# Eri Online Test Cheating Extension

A lightweight Chrome extension made for using Gemini during browser-based online tests without having to switch to another tab or window.

Some online test websites can detect when you leave the test page, switch tabs, or change windows. This extension was made around that problem by keeping the AI interface directly on top of the page you're currently viewing.

## Features

* **Stay on the same tab** — Use Gemini without opening a separate AI website or switching away from the test page.
* **Quick answers** — Built-in prompts for short answers, code-only responses, and multiple-choice questions.
* **Highlight import** — Select text from the page and send it directly to Gemini.
* **Screen OCR** — Select an area of the screen to extract text from images or text that cannot normally be selected.
* **Your own Gemini API key** — Enter your own API key and choose which Gemini model to use.
* **Quick copy** — Copy both the question and Gemini's response with one click.

## Why?

This project was made because some online test platforms monitor whether the user leaves the test page.

Normally, using an AI assistant means switching to another tab, opening another window, or copying the question somewhere else. On some testing websites, those actions can trigger warnings or be recorded as leaving the test.

Eri takes a different approach: the AI interface is injected directly into the current webpage, so the test page stays open while you work with Gemini.

The project is mainly a personal experiment with **Chrome extensions, webpage injection, OCR, and the Gemini API**, built around the idea of having an AI assistant available without leaving the current page.

## Installation

You don't need to know how to code.

1. Download the repository from GitHub by clicking **Code → Download ZIP**.

2. Extract the ZIP file.

3. Open Chrome and go to:

   `chrome://extensions/`

4. Turn on **Developer mode** in the top-right corner.

5. Click **Load unpacked**.

6. Select the folder you extracted.

Make sure you select the folder containing `manifest.json`, not the ZIP file itself.

The extension should now appear in your extensions list.

## Setup

Open the extension and enter your Gemini API key.

You can also select the Gemini model you want to use.

The key and settings are stored locally in your browser.

## How it works

The extension runs directly in the browser and adds its interface to the current webpage.

You can then:

**Question on page → Highlight or capture it → Send to Gemini → Get the answer without leaving the page**

This makes it particularly useful for experimenting with AI assistance on websites where switching tabs or windows is undesirable.

## Disclaimer

This is a personal experimental project and is not affiliated with Google, Gemini, or any testing platform.

Whether AI assistance is permitted during a particular test depends on the rules of that test.
