// WhatsApp Service Abstraction for QR Payment Details & Member Communications

/**
 * Generate a WhatsApp deep link with pre-filled message text
 * @param {string} phone - Target phone number in international or standard format
 * @param {string} text - Message content
 */
export const buildWhatsAppLink = (phone, text) => {
  if (!phone) return '#';
  const cleanedPhone = phone.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanedPhone.startsWith('91') ? cleanedPhone : '91' + cleanedPhone}?text=${encodedText}`;
};

/**
 * Format registration payment message for WhatsApp sharing
 */
export const formatPaymentWhatsAppMessage = ({
  applicantName,
  applicationNo,
  amount,
  upiId,
  utrNumber
}) => {
  return `*MPWZ UNION MEMBERSHIP PAYMENT PROOF*

*Applicant Name:* ${applicantName}
*Application No:* ${applicationNo}
*Amount Paid:* ₹${amount}
*UPI ID:* ${upiId}
*UTR / Trans ID:* ${utrNumber || 'N/A'}

I have completed the membership registration payment. Please verify and activate my account. Thank you!`;
};

/**
 * Extensible provider hook for future official WhatsApp Business API integrations
 */
export const sendWhatsAppNotification = async (recipientPhone, message) => {
  console.log(`[WhatsApp API Provider Mock] Sending message to ${recipientPhone}: ${message}`);
  return { success: true, delivered: true, timestamp: new Date().toISOString() };
};
