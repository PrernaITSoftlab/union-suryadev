import QRCode from 'qrcode';

/**
 * Converts any image URL to a Base64 data URL.
 * Handles both relative and remote URLs with CORS fallback.
 */
export async function urlToBase64(url) {
  if (!url) return null;
  if (url.startsWith('data:')) return url;

  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error('Fetch failed');
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(url);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    // Canvas fallback with crossOrigin
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width || 300;
          canvas.height = img.naturalHeight || img.height || 300;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch (e) {
          console.warn('Canvas toDataURL failed, using original url:', e);
          resolve(url);
        }
      };
      img.onerror = () => resolve(url);
      img.src = url;
    });
  }
}

/**
 * Generates an actual scannable QR code Data URL containing member verification details.
 */
export async function generateMemberQrCode(memberData) {
  const { memberId, fullName, designation, circle, unionRole } = memberData;
  const qrPayload = `MPVMAVAKS UNION DIGITAL VERIFIED ID\nMember ID: ${memberId || 'N/A'}\nName: ${fullName || 'N/A'}\nRole: ${unionRole || designation || 'Union Member'}\nCircle: ${circle || 'Indore'}\nStatus: VERIFIED ACTIVE\nPortal: https://mpvmavaksunion.org`;

  try {
    const dataUrl = await QRCode.toDataURL(qrPayload, {
      width: 256,
      margin: 1,
      color: {
        dark: '#0B0F1D',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });
    return dataUrl;
  } catch (err) {
    console.error('QR code generation failed:', err);
    return null;
  }
}

/**
 * Deterministically generates Code128-style barcode pattern from text.
 */
export function getBarcodePattern(text) {
  const safeText = String(text || 'UNION-001').toUpperCase();
  const bars = [];
  
  // Start pattern
  bars.push(2, 1, 1, 2, 3, 1);

  for (let i = 0; i < safeText.length; i++) {
    const charCode = safeText.charCodeAt(i);
    const w1 = (charCode % 3) + 1;
    const w2 = ((charCode * 3) % 2) + 1;
    const w3 = ((charCode * 7) % 3) + 1;
    const w4 = ((charCode * 5) % 2) + 1;
    bars.push(w1, w2, w3, w4);
  }

  // Stop pattern
  bars.push(2, 3, 1, 1, 1, 2, 3);

  return bars;
}
