const ipRequests = new Map<string, number[]>();

export function checkRateLimit(ip: string, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const requests = ipRequests.get(ip) || [];

  // Clean old requests
  const valid = requests.filter((t) => now - t < windowMs);

  if (valid.length >= maxRequests) {
    return false; // Rate limited
  }

  valid.push(now);
  ipRequests.set(ip, valid);
  return true;
}
