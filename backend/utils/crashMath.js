const HOUSE_EDGE = 0.01;
const GROWTH_RATE = 0.06;

import crypto from "crypto";

export function generateServerSeed() {
  return crypto.randomBytes(32).toString("hex");
}

export function getCrashPoint(serverSeed, clientSeed = "public", nonce = 0) {
  const message = `${clientSeed}:${nonce}`;

  const hash = crypto
    .createHmac("sha256", serverSeed)
    .update(message)
    .digest("hex");

  const h = hash.slice(0, 13);
  const r = parseInt(h, 16);
  const MAX = Math.pow(2, 52);

  const X = r / MAX;
  const crash = (1 - HOUSE_EDGE) / (1 - X);

  return Math.max(1, Math.floor(crash * 100) / 100);
}

export function getCrashTime(crashPoint) {
  return Math.log(crashPoint) / GROWTH_RATE;
}