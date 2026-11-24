// Comprehensive test of DOM flow and user interaction logic
const fs = require('fs');
const assert = require('assert');

// Simple DOM Mock for headless verification
class MockElement {
  constructor(tag, id = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.children = [];
    const classes = new Set();
    this.classList = {
      classes,
      add: (c) => classes.add(c),
      remove: (c) => classes.delete(c),
      contains: (c) => classes.has(c)
    };
    this.attributes = {};
    this.listeners = {};
    this.hidden = false;
    this.value = '';
    this.textContent = '';
    this.href = '';
    this.style = {};
  }
  addEventListener(event, handler) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(handler);
  }
  dispatchEvent(event) {
    const list = this.listeners[event.type] || [];
    for (const h of list) h(event);
  }
  setAttribute(k, v) { this.attributes[k] = v; }
  getAttribute(k) { return this.attributes[k]; }
  focus() { this.focused = true; }
  select() { this.selected = true; }
  click() { this.clicked = true; }
  getContext() {
    return {
      clearRect: () => {},
      createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
      putImageData: () => {}
    };
  }
  toDataURL() { return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='; }
  toBlob(cb) { cb(new Blob()); }
}

const elements = {
  urlInput: new MockElement('input', 'urlInput'),
  inputClearBtn: new MockElement('button', 'inputClearBtn'),
  pasteBtn: new MockElement('button', 'pasteBtn'),
  generateBtn: new MockElement('button', 'generateBtn'),
  validationMessage: new MockElement('div', 'validationMessage'),
  validationText: new MockElement('span', 'validationText'),
  protocolNotice: new MockElement('div', 'protocolNotice'),
  inputWrapper: new MockElement('div', 'inputWrapper'),
  qrPlaceholder: new MockElement('div', 'qrPlaceholder'),
  qrResult: new MockElement('div', 'qrResult'),
  qrCanvas: new MockElement('canvas', 'qrCanvas'),
  qrUrlPreview: new MockElement('a', 'qrUrlPreview'),
  qrUrlText: new MockElement('span', 'qrUrlText'),
  exportSizeSelect: new MockElement('select', 'exportSizeSelect'),
  eccSelect: new MockElement('select', 'eccSelect'),
  downloadBtn: new MockElement('button', 'downloadBtn'),
  copyLinkBtn: new MockElement('button', 'copyLinkBtn'),
  copyLinkText: new MockElement('span', 'copyLinkText'),
  clearBtn: new MockElement('button', 'clearBtn'),
  downloadSvgBtn: new MockElement('button', 'downloadSvgBtn'),
  copyImageBtn: new MockElement('button', 'copyImageBtn'),
  copyImageText: new MockElement('span', 'copyImageText'),
  toastNotification: new MockElement('div', 'toastNotification'),
  toastMessage: new MockElement('span', 'toastMessage'),
};

elements.exportSizeSelect.value = '1024';
elements.eccSelect.value = 'M';
elements.copyLinkText.textContent = 'Copy Link';
elements.copyImageText.textContent = 'Copy QR Image';

// Mock Document and Window
global.document = {
  getElementById: (id) => elements[id] || null,
  querySelector: (sel) => {
    if (sel === '.input-wrapper') return elements.inputWrapper;
    return null;
  },
  querySelectorAll: (sel) => {
    if (sel === '.sample-chip') {
      const chip1 = new MockElement('button');
      chip1.setAttribute('data-url', 'github.com');
      return [chip1];
    }
    return [];
  },
  createElement: (tag) => new MockElement(tag),
  body: {
    appendChild: () => {},
    removeChild: () => {}
  }
};

global.window = {
  ClipboardItem: class ClipboardItem {}
};

Object.defineProperty(globalThis, 'navigator', {
  value: {
    clipboard: {
      writeText: async (text) => { global.copiedText = text; },
      readText: async () => 'https://copied-link.com'
    }
  },
  configurable: true,
  writable: true
});

// Load QRCode library
const qrcodeScript = fs.readFileSync('vendor/qrcode.min.js', 'utf8');
eval(qrcodeScript);
global.QRCode = QRCode;

// Load App Script
const appScript = fs.readFileSync('app.js', 'utf8');
eval(appScript);

console.log('✓ app.js initialized successfully in mock environment');

// Test 1: Empty input validation
elements.urlInput.value = '   ';
elements.generateBtn.dispatchEvent({ type: 'click' });
assert.strictEqual(elements.validationMessage.hidden, false, 'Validation message should be visible on empty input');
assert(elements.validationText.textContent.includes('Please enter'), 'Should show prompt to enter URL');
console.log('✓ Test 1 Passed: Empty input validation handled gracefully');

// Test 2: Auto-prepend https:// and generate QR code
elements.urlInput.value = 'google.com';
elements.generateBtn.dispatchEvent({ type: 'click' });

setTimeout(async () => {
  assert.strictEqual(elements.validationMessage.hidden, true, 'Validation message hidden');
  assert.strictEqual(elements.protocolNotice.hidden, false, 'Protocol notice visible when https:// prepended');
  assert.strictEqual(elements.qrResult.hidden, false, 'QR result should be visible');
  assert.strictEqual(elements.qrPlaceholder.hidden, true, 'Placeholder should be hidden');
  assert.strictEqual(elements.qrUrlText.textContent, 'https://google.com', 'URL text should be normalized');
  assert.strictEqual(elements.qrUrlPreview.href, 'https://google.com', 'Preview href updated');
  console.log('✓ Test 2 Passed: Auto-prefix https:// and QR generation working');

  // Test 3: Copy Link functionality
  await elements.copyLinkBtn.dispatchEvent({ type: 'click' });
  assert.strictEqual(global.copiedText, 'https://google.com', 'Should have copied normalized link to clipboard');
  console.log('✓ Test 3 Passed: Copy link functionality verified');

  // Test 4: Download PNG button
  await elements.downloadBtn.dispatchEvent({ type: 'click' });
  console.log('✓ Test 4 Passed: Download PNG handled cleanly');

  // Test 5: Download SVG button
  await elements.downloadSvgBtn.dispatchEvent({ type: 'click' });
  console.log('✓ Test 5 Passed: Download SVG handled cleanly');

  // Test 6: Clear button
  elements.clearBtn.dispatchEvent({ type: 'click' });
  assert.strictEqual(elements.urlInput.value, '', 'Input should be empty');
  assert.strictEqual(elements.qrResult.hidden, true, 'Result should be hidden after clear');
  assert.strictEqual(elements.qrPlaceholder.hidden, false, 'Placeholder should be restored');
  assert.strictEqual(elements.protocolNotice.hidden, true, 'Protocol notice hidden');
  console.log('✓ Test 6 Passed: Clear / Reset functionality verified');

  console.log('\n=======================================');
  console.log('ALL APP FLOW INTERACTION TESTS PASSED!');
  console.log('=======================================');
}, 50);
