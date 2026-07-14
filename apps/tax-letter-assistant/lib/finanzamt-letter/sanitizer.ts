/**
 * Sanitize personal information from extracted text before sending to AI.
 * Replaces German PII patterns (names, addresses, tax IDs, IBANs, etc.) with [REDACTED].
 */
export function sanitizePersonalInfo(text: string): string {
  const patterns = [
    // Names (common German name patterns)
    /\b[A-ZÄÖÜ][a-zäöüß]+\s+[A-ZÄÖÜ][a-zäöüß]+\b/g,
    // Addresses (Street + Number)
    /\b[A-ZÄÖÜ][a-zäöüß]+(?:straße|str\.|platz|weg|gasse|allee)\s*\d+[a-z]?\b/gi,
    // Phone numbers
    /(?:\+49|0049|0)\s*(?:\d{2,5})\s*[\d\s\-/]{4,}/g,
    // Email addresses
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    // German tax ID (Steuer-ID)
    /\b\d{11}\b/g,
    // German tax number patterns
    /\b\d{2,3}\/\d{3,4}\/\d{4,5}\b/g,
    // Postal codes with city names
    /\b\d{5}\s+[A-ZÄÖÜ][a-zäöüß\s]+\b/g,
    // Bank account numbers (IBAN)
    /\bDE\d{2}\s*[\d\s]{18,22}\b/gi,
    // Social security numbers
    /\b\d{2}\s*\d{6}\s*[A-Z]\s*\d{3}\b/g,
    // Dates in various formats that might be birthdates
    /\b(?:0[1-9]|[12][0-9]|3[01])\.(?:0[1-9]|1[012])\.(?:19|20)\d{2}\b/g,
  ];

  let sanitizedText = text;

  for (const pattern of patterns) {
    sanitizedText = sanitizedText.replace(pattern, "[REDACTED]");
  }

  // Remove common salutations that might contain names
  sanitizedText = sanitizedText.replace(
    /(?:Sehr geehrte[rs]?|Liebe[rs]?)\s+(?:Herr|Frau|Damen und Herren)\s*[A-ZÄÖÜ][a-zäöüß]*(?:\s+[A-ZÄÖÜ][a-zäöüß]*)*[,.]?/gi,
    "Sehr geehrte Damen und Herren,",
  );

  return sanitizedText;
}
