/**
 * QR Code Generator — Modern, Client-Side Application Logic
 */

(function () {
  'use strict';

  // DOM Elements
  const urlInput = document.getElementById('urlInput');
  const inputClearBtn = document.getElementById('inputClearBtn');
  const pasteBtn = document.getElementById('pasteBtn');
  const generateBtn = document.getElementById('generateBtn');
  const validationMessage = document.getElementById('validationMessage');
  const validationText = document.getElementById('validationText');
  const protocolNotice = document.getElementById('protocolNotice');
  const inputWrapper = document.querySelector('.input-wrapper');
  
  // Output Elements
  const qrPlaceholder = document.getElementById('qrPlaceholder');
  const qrResult = document.getElementById('qrResult');
  const qrCanvas = document.getElementById('qrCanvas');
  const qrUrlPreview = document.getElementById('qrUrlPreview');
  const qrUrlText = document.getElementById('qrUrlText');
  const exportSizeSelect = document.getElementById('exportSizeSelect');
  const eccSelect = document.getElementById('eccSelect');
  
  // Action Buttons
  const downloadBtn = document.getElementById('downloadBtn');
  const copyLinkBtn = document.getElementById('copyLinkBtn');
  const copyLinkText = document.getElementById('copyLinkText');
  const clearBtn = document.getElementById('clearBtn');
  const downloadSvgBtn = document.getElementById('downloadSvgBtn');
  const copyImageBtn = document.getElementById('copyImageBtn');
  const copyImageText = document.getElementById('copyImageText');
  const sampleChips = document.querySelectorAll('.sample-chip');
  
  // Toast Element
  const toast = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');
  let toastTimeout = null;

  // State
  let currentNormalizedUrl = '';

  /**
   * Normalize input text by trimming and adding https:// if no scheme is present
   * @param {string} rawInput 
   * @returns {{ url: string, protocolAdded: boolean, isValid: boolean, error?: string }}
   */
  function normalizeUrl(rawInput) {
    const trimmed = (rawInput || '').trim();

    if (!trimmed) {
      return { url: '', protocolAdded: false, isValid: false, error: 'Please enter a URL or link to generate a QR code.' };
    }

    // Check for standard URL schemes (http, https, mailto, tel, sms, ftp, etc.)
    const schemeRegex = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//i;
    const specialSchemeRegex = /^(mailto|tel|sms|geo):/i;

    let finalUrl = trimmed;
    let protocolAdded = false;

    if (!schemeRegex.test(trimmed) && !specialSchemeRegex.test(trimmed)) {
      // User entered a domain or path without protocol (e.g. "google.com" or "sub.site.co/path")
      // Check if it resembles a valid web address or host
      finalUrl = 'https://' + trimmed;
      protocolAdded = true;
    }

    // Basic URL validity check
    try {
      if (schemeRegex.test(finalUrl)) {
        const parsed = new URL(finalUrl);
        // Ensure hostname has at least one dot or is localhost
        if (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost') {
          // It might be a custom string or single-word, still scannable as URL
        }
      }
    } catch (e) {
      // If URL constructor fails, but user provided custom scheme or text:
      // It will still encode into QR, but flag if malformed
      if (!specialSchemeRegex.test(finalUrl)) {
        return { 
          url: finalUrl, 
          protocolAdded, 
          isValid: false, 
          error: 'Please enter a valid URL (e.g. yourwebsite.com or https://example.com).' 
        };
      }
    }

    return { url: finalUrl, protocolAdded, isValid: true };
  }

  /**
   * Display or hide error validation message
   */
  function showError(msg) {
    if (msg) {
      validationText.textContent = msg;
      validationMessage.hidden = false;
      inputWrapper.classList.add('has-error');
      protocolNotice.hidden = true;
    } else {
      validationMessage.hidden = true;
      inputWrapper.classList.remove('has-error');
    }
  }

  /**
   * Show temporary toast notification
   */
  function showToast(message, duration = 2500) {
    if (!toast) return;
    toastMessage.textContent = message;
    toast.hidden = false;
    toast.classList.remove('toast-fadeout');

    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }

    toastTimeout = setTimeout(() => {
      toast.classList.add('toast-fadeout');
      setTimeout(() => {
        toast.hidden = true;
      }, 200);
    }, duration);
  }

  /**
   * Generate QR Code on the display canvas
   */
  async function generateQRCode(targetUrl) {
    if (!targetUrl) return;

    if (typeof QRCode === 'undefined') {
      showError('QR Code library failed to load. Please refresh the page.');
      return;
    }

    try {
      const ecc = eccSelect ? eccSelect.value : 'M';
      
      // Render to display canvas with sharp resolution
      await QRCode.toCanvas(qrCanvas, targetUrl, {
        width: 280,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: ecc
      });

      // Update state & UI
      currentNormalizedUrl = targetUrl;
      qrUrlText.textContent = targetUrl;
      qrUrlPreview.href = targetUrl;

      // Reveal result and hide placeholder
      qrPlaceholder.hidden = true;
      qrResult.hidden = false;
      showError('');

    } catch (err) {
      console.error('Failed to generate QR Code:', err);
      showError('Unable to generate QR code for this link. Please check the URL.');
    }
  }

  /**
   * Handle user clicking "Generate QR Code" or pressing Enter
   */
  function handleGenerate() {
    const rawValue = urlInput.value;
    const { url, protocolAdded, isValid, error } = normalizeUrl(rawValue);

    if (!isValid) {
      showError(error);
      return;
    }

    showError('');

    // Update input display if https:// was prepended
    if (protocolAdded) {
      protocolNotice.hidden = false;
    } else {
      protocolNotice.hidden = true;
    }

    generateQRCode(url);
  }

  /**
   * Reset all inputs and display
   */
  function handleClear() {
    urlInput.value = '';
    currentNormalizedUrl = '';
    showError('');
    protocolNotice.hidden = true;
    inputClearBtn.hidden = true;

    // Reset display
    qrResult.hidden = true;
    qrPlaceholder.hidden = false;

    // Focus input for quick next action
    urlInput.focus();
    showToast('Input and QR code cleared');
  }

  /**
   * Download high-resolution PNG image
   */
  async function handleDownloadPng() {
    if (!currentNormalizedUrl) {
      handleGenerate();
      if (!currentNormalizedUrl) return;
    }

    try {
      const exportWidth = parseInt(exportSizeSelect.value, 10) || 1024;
      const ecc = eccSelect ? eccSelect.value : 'M';

      // Generate high-resolution data URL
      const dataUrl = await QRCode.toDataURL(currentNormalizedUrl, {
        width: exportWidth,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: ecc
      });

      // Create filename based on URL domain
      let filename = 'qrcode';
      try {
        const u = new URL(currentNormalizedUrl);
        const host = u.hostname.replace(/^www\./, '').replace(/[^a-z0-9.-]/gi, '_');
        filename = `qrcode-${host || 'link'}`;
      } catch (e) {
        filename = 'qrcode';
      }

      // Download trigger
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Downloaded ${exportWidth}×${exportWidth}px PNG`);
    } catch (err) {
      console.error('Download error:', err);
      showToast('Error downloading QR code');
    }
  }

  /**
   * Download vector SVG format
   */
  async function handleDownloadSvg() {
    if (!currentNormalizedUrl) return;

    try {
      const ecc = eccSelect ? eccSelect.value : 'M';
      const svgString = await QRCode.toString(currentNormalizedUrl, {
        type: 'svg',
        margin: 2,
        errorCorrectionLevel: ecc,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      let filename = 'qrcode';
      try {
        const u = new URL(currentNormalizedUrl);
        const host = u.hostname.replace(/^www\./, '').replace(/[^a-z0-9.-]/gi, '_');
        filename = `qrcode-${host || 'link'}`;
      } catch (e) {
        filename = 'qrcode';
      }

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${filename}.svg`;
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      showToast('Downloaded vector SVG');
    } catch (err) {
      console.error('SVG download error:', err);
      showToast('Error downloading SVG');
    }
  }

  /**
   * Copy the current normalized URL to clipboard
   */
  async function handleCopyLink() {
    const linkToCopy = currentNormalizedUrl || normalizeUrl(urlInput.value).url;

    if (!linkToCopy) {
      showError('Please enter a link first.');
      urlInput.focus();
      return;
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(linkToCopy);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = linkToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      // Visual feedback on button
      const originalText = copyLinkText.textContent;
      copyLinkText.textContent = 'Copied!';
      copyLinkBtn.classList.add('btn-primary');
      copyLinkBtn.classList.remove('btn-secondary');

      showToast('Link copied to clipboard!');

      setTimeout(() => {
        copyLinkText.textContent = originalText;
        copyLinkBtn.classList.remove('btn-primary');
        copyLinkBtn.classList.add('btn-secondary');
      }, 2000);

    } catch (err) {
      console.error('Clipboard copy failed:', err);
      showToast('Failed to copy to clipboard');
    }
  }

  /**
   * Copy QR Code image directly to clipboard
   */
  async function handleCopyImage() {
    if (!qrCanvas) return;

    try {
      if (!navigator.clipboard || !window.ClipboardItem) {
        showToast('Direct image copying not supported on this browser');
        return;
      }

      qrCanvas.toBlob(async (blob) => {
        if (!blob) {
          showToast('Failed to generate image blob');
          return;
        }

        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);

          const originalText = copyImageText.textContent;
          copyImageText.textContent = 'Image Copied!';
          showToast('QR code image copied to clipboard!');

          setTimeout(() => {
            copyImageText.textContent = originalText;
          }, 2000);
        } catch (err) {
          console.error('Failed to copy image to clipboard:', err);
          showToast('Could not copy image to clipboard');
        }
      }, 'image/png');

    } catch (err) {
      console.error('Image copy error:', err);
      showToast('Error copying image');
    }
  }

  /**
   * Paste from clipboard into URL input
   */
  async function handlePaste() {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          urlInput.value = text.trim();
          inputClearBtn.hidden = false;
          showError('');
          handleGenerate();
        } else {
          showToast('Clipboard is empty');
        }
      } else {
        urlInput.focus();
        showToast('Press Ctrl+V to paste');
      }
    } catch (err) {
      console.warn('Clipboard read permission denied or unsupported:', err);
      urlInput.focus();
      showToast('Press Ctrl+V to paste');
    }
  }

  /**
   * Event Listeners Setup
   */
  function initEvents() {
    // Generate Button click
    generateBtn.addEventListener('click', handleGenerate);

    // Enter key triggers generate
    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleGenerate();
      }
    });

    // Input changes: toggle clear button, clear errors on input
    urlInput.addEventListener('input', () => {
      const hasText = urlInput.value.length > 0;
      inputClearBtn.hidden = !hasText;
      if (hasText) {
        showError('');
      }
    });

    // Input clear 'X' button
    inputClearBtn.addEventListener('click', () => {
      urlInput.value = '';
      inputClearBtn.hidden = true;
      protocolNotice.hidden = true;
      showError('');
      urlInput.focus();
    });

    // Paste button
    pasteBtn.addEventListener('click', handlePaste);

    // Download PNG Button
    downloadBtn.addEventListener('click', handleDownloadPng);

    // Copy Link Button
    copyLinkBtn.addEventListener('click', handleCopyLink);

    // Clear Button
    clearBtn.addEventListener('click', handleClear);

    // Secondary buttons
    downloadSvgBtn.addEventListener('click', handleDownloadSvg);
    copyImageBtn.addEventListener('click', handleCopyImage);

    // Sample chips
    sampleChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const sampleUrl = chip.getAttribute('data-url');
        urlInput.value = sampleUrl;
        inputClearBtn.hidden = false;
        showError('');
        handleGenerate();
      });
    });

    // Options change updates QR code dynamically if already generated
    eccSelect.addEventListener('change', () => {
      if (currentNormalizedUrl) {
        generateQRCode(currentNormalizedUrl);
      }
    });
  }

  // Initialize
  initEvents();

})();
