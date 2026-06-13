/**
 * Validates a phone number is in E.164 format.
 * E.g., +639123456789
 */
export function isValidE164Phone(phone: string): boolean {
  const E164_REGEX = /^\+[1-9]\d{6,14}$/;
  return E164_REGEX.test(phone.trim());
}
