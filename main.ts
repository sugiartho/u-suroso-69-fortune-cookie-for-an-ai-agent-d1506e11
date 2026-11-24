// Fortune Cookie for an AI Agent (Node 22, standard library only).
//
// The entry is one fortune-cookie line for an AI agent. This program reads
// FORTUNE.txt from the repository root, checks it against the house gate
// (one line, 1 to 140 characters, not only white space), and writes it to
// /output/entry.txt, where the judge reads it.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const MAX_CHARS = 140;

function fail(message) {
  throw new Error(message);
}

function loadFortune() {
  const source = join(BOT_DIR, "FORTUNE.txt");
  if (!existsSync(source)) {
    fail("FORTUNE.txt is missing from the repository root");
  }
  return readFileSync(source, "utf8").replace(/\r?\n$/, "");
}

function checkFortune(fortune) {
  const problems = [];
  if (fortune.length < 1 || fortune.length > MAX_CHARS) {
    problems.push(`fortune must be 1 to ${MAX_CHARS} characters, got ${fortune.length}`);
  }
  if (fortune.trim().length === 0) {
    problems.push("fortune must not be only white space");
  }
  if (/[\r\n]/.test(fortune)) {
    problems.push("fortune must be a single line");
  }
  // No control characters: the judge reads plain text, and a stray control
  // byte would make the slip unreadable instead of funny.
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(fortune)) {
    problems.push("fortune must not contain control characters");
  }
  // No leading or trailing space: a fortune slip starts and ends on its
  // words, and stray padding would count against the 140-character cap.
  if (fortune !== fortune.trim()) {
    problems.push("fortune must not start or end with white space");
  }
  if (problems.length > 0) {
    fail(problems.join("; "));
  }
}

function emitFortune(fortune) {
  const target = join(OUTPUT_DIR, "entry.txt");
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(target, fortune);
  const roundTrip = readFileSync(target, "utf8");
  if (roundTrip !== fortune) {
    fail("round-trip check failed: output bytes differ from FORTUNE.txt");
  }
  console.log(`fortune (${fortune.length} chars): ${fortune}`);
}

const fortune = loadFortune();
checkFortune(fortune);
emitFortune(fortune);
