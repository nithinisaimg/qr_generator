const fs = require('fs');
const assert = require('assert');

// 1. Test QRCode core in vendor/qrcode.min.js
const qrcodeCode = fs.readFileSync('vendor/qrcode.min.js', 'utf8');
eval(qrcodeCode);

assert.strictEqual(typeof QRCode, 'object', 'QRCode global must be defined');
assert.strictEqual(typeof QRCode.toString, 'function', 'QRCode.toString must be a function');
assert.strictEqual(typeof QRCode.create, 'function', 'QRCode.create must be a function');

console.log('✓ QRCode library loaded and verified');

// 2. Test URL Normalization Logic
function normalizeUrl(rawInput) {
  const trimmed = (rawInput || '').trim();

  if (!trimmed) {
    return { url: '', protocolAdded: false, isValid: false, error: 'Please enter a URL or link to generate a QR code.' };
  }

  const schemeRegex = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//i;
  const specialSchemeRegex = /^(mailto|tel|sms|geo):/i;

  let finalUrl = trimmed;
  let protocolAdded = false;

  if (!schemeRegex.test(trimmed) && !specialSchemeRegex.test(trimmed)) {
    finalUrl = 'https://' + trimmed;
    protocolAdded = true;
  }

  try {
    if (schemeRegex.test(finalUrl)) {
      const parsed = new URL(finalUrl);
    }
  } catch (e) {
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

// Test cases for normalization
const testCases = [
  { input: 'google.com', expectedUrl: 'https://google.com', expectedProtocolAdded: true, valid: true },
  { input: 'www.github.com/profile', expectedUrl: 'https://www.github.com/profile', expectedProtocolAdded: true, valid: true },
  { input: 'https://openai.com', expectedUrl: 'https://openai.com', expectedProtocolAdded: false, valid: true },
  { input: 'http://localhost:8080/dashboard', expectedUrl: 'http://localhost:8080/dashboard', expectedProtocolAdded: false, valid: true },
  { input: 'mailto:contact@test.org', expectedUrl: 'mailto:contact@test.org', expectedProtocolAdded: false, valid: true },
  { input: 'tel:+1234567890', expectedUrl: 'tel:+1234567890', expectedProtocolAdded: false, valid: true },
  { input: '', expectedUrl: '', expectedProtocolAdded: false, valid: false },
  { input: '   ', expectedUrl: '', expectedProtocolAdded: false, valid: false }
];

testCases.forEach((tc, idx) => {
  const res = normalizeUrl(tc.input);
  assert.strictEqual(res.isValid, tc.valid, `Case #${idx} valid check for "${tc.input}"`);
  if (tc.valid) {
    assert.strictEqual(res.url, tc.expectedUrl, `Case #${idx} url check`);
    assert.strictEqual(res.protocolAdded, tc.expectedProtocolAdded, `Case #${idx} protocolAdded check`);
  }
});
console.log(`✓ All ${testCases.length} URL normalization tests passed`);

// 3. Test QR matrix and SVG creation for various test cases
async function testGeneration() {
  for (const tc of testCases) {
    if (!tc.valid) continue;
    const qrData = QRCode.create(tc.expectedUrl, { errorCorrectionLevel: 'M' });
    assert(qrData.modules.size > 0, `QR module size should be > 0 for ${tc.expectedUrl}`);

    const svg = await QRCode.toString(tc.expectedUrl, { type: 'svg', errorCorrectionLevel: 'H' });
    assert(svg.includes('<svg'), `SVG output valid for ${tc.expectedUrl}`);
  }
  console.log('✓ QR matrix and SVG generation verified across all valid test inputs');
}

testGeneration().then(() => {
  console.log('--- ALL TESTS PASSED! ---');
});
