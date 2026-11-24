# QR Code Generator

A clean, modern, fully functional **QR Code Generator website** built with HTML5, CSS3, and JavaScript. Generate scannable QR codes instantly from any link or URL — 100% client-side with zero tracking, no backend, and no external API keys required.

## Features

- **Instant QR Generation**: Type or paste any URL to generate a QR code dynamically in real time.
- **Smart Protocol Normalization**: Automatically prepends `https://` when domains are entered without a protocol (e.g. `google.com` &rarr; `https://google.com`), while preserving custom protocols like `mailto:`, `tel:`, etc.
- **High-Resolution PNG Download**: Download print-ready, crystal-clear PNG images at 1024×1024 px or 2048×2048 px.
- **Vector SVG Export**: Export scalable vector graphics (SVG) for designers, print banners, and branding materials.
- **Copy Link**: Quick copy of the normalized URL with visual feedback.
- **Copy QR Image**: One-click direct image copy to clipboard for pasting directly into Slack, Figma, Docs, or email.
- **Reset & Clear**: One-click reset to clean inputs and restore the placeholder state.
- **Input Validation**: Graceful inline error handling for empty or malformed inputs.
- **Minimal Monochrome UI**: Modern black-on-white aesthetic with subtle gray accents, smooth focus rings, and fully responsive design for mobile, tablet, and desktop.
- **Offline Capable**: Bundled standalone QRCode engine (`vendor/qrcode.min.js`) — works completely offline without internet or CDN dependencies.

## Layout & Structure

1. **Header**: Title, subtitle (*"Turn any link into a scannable QR code."*), and badge.
2. **URL Input Area**: Left-aligned link icon, clear `×` button, "Paste" clipboard helper, and sample link chips.
3. **Generate QR Code Button**: High-contrast, keyboard-accessible primary button.
4. **QR Code Display Area**: Centered display canvas with quiet zone border, scannability badge, and clickable destination preview.
5. **Quality & Export Controls**: Selectable resolution (Standard 512px, High-Res 1024px, Ultra HD 2048px) and Error Correction Level (L, M, Q, H).
6. **Action Buttons**:
   - **Download QR Code** (PNG)
   - **Copy Link**
   - **Clear**
   - **Download SVG** & **Copy QR Image**
7. **Privacy Footer**: Transparent notice highlighting 100% client-side local execution.

## Getting Started

### Option 1: Direct File Open
Simply double-click `index.html` in your file explorer to open it directly in any modern web browser (Chrome, Edge, Firefox, Safari).

### Option 2: Local HTTP Server
Run with Python:
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000` in your web browser.

Or run with npm:
```bash
npm start
```

## Running Tests
Run the test suite covering URL normalization, QR matrix generation, and DOM interaction flows:
```bash
npm test
```

## Technologies Used
- Semantic HTML5 & CSS3 with CSS Custom Properties
- Vanilla Modern JavaScript (ES6+)
- Bundled `qrcode` library (compiled to standalone IIFE)
