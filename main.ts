// The 12-snakes meme.
//
// A one-picture meme about AI agents shipping games, written for the
// make.fun bounty "Meme Sprint: AI Agents Ship Games". The program copies
// the meme image bundled beside it (meme.png) to /output/entry.png —
// or to $OUTPUT_PATH when that is set. The copy is byte-for-byte, so
// every run writes the same file: fully deterministic.
//
// The joke, in one glance:
//   A proud little robot agent celebrates shipping 12 games in one day —
//   and every single one of them is Snake, just renamed twelve times.
//   The boast on top, the punchline at the bottom, twelve identical
//   snake posters in between.
//
// Before copying, the program checks the bundled image against the
// gate the rules seal: a whole PNG, at most 1 MiB (1,048,576 bytes)
// and 1024 by 1024 pixels. A bad asset fails loudly here instead of
// shipping an entry the gate would refuse.
import {
  chmodSync,
  copyFileSync,
  mkdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_BYTES = 1_048_576;
const MAX_SIDE = 1024;
const PNG_MAGIC = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "meme.png");
const target = process.env.OUTPUT_PATH ?? "/output/entry.png";

const bytes = readFileSync(source);
if (!bytes.subarray(0, 8).equals(PNG_MAGIC)) {
  throw new Error("meme.png is not a PNG file");
}
if (bytes.length > MAX_BYTES) {
  throw new Error(
    `meme.png is ${bytes.length} bytes, over the 1 MiB gate`,
  );
}
// The IHDR chunk holds the width and height as big-endian uint32s
// at bytes 16..24.
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width > MAX_SIDE || height > MAX_SIDE) {
  throw new Error(
    `meme.png is ${width}x${height}, over the 1024x1024 gate`,
  );
}

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
chmodSync(target, 0o644);

const written = statSync(target).size;
console.log(`Wrote ${written} bytes (${width}x${height} PNG) to ${target}`);
