// Writes the PWA icons into public/ with no dependencies (hand-rolled PNG via node:zlib).
// Run: npm run icons. Art stays inside the central 60% so it also survives maskable cropping.
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc = (buf) => {
  let c = 0xffffffff
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (type, data) => {
  const out = Buffer.alloc(12 + data.length)
  out.writeUInt32BE(data.length, 0)
  out.write(type, 4, 'ascii')
  data.copy(out, 8)
  out.writeUInt32BE(crc(out.subarray(4, 8 + data.length)), 8 + data.length)
  return out
}
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t)
const smooth = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

function png(size) {
  const BG0 = [26, 15, 51], BG1 = [11, 7, 20], VIOLET = [167, 139, 250], CYAN = [103, 232, 249]
  const raw = Buffer.alloc(size * (size * 3 + 1))
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0 // filter: none
    for (let x = 0; x < size; x++) {
      const dx = (x + 0.5) / size - 0.5, dy = (y + 0.5) / size - 0.5
      let px = mix(BG0, BG1, Math.min(1, Math.hypot(dx, dy) * 1.6))
      const l1 = Math.abs(dx) + Math.abs(dy) // diamond distance
      const fill = 1 - smooth(0.28, 0.285, l1)
      const hole = 1 - smooth(0.17, 0.175, l1)
      px = mix(px, mix(VIOLET, CYAN, Math.min(1, (dy + 0.3) / 0.6)), fill * (1 - hole * 0.85))
      px.forEach((v, i) => (raw[y * (size * 3 + 1) + 1 + x * 3 + i] = Math.round(v)))
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr.set([8, 2, 0, 0, 0], 8) // 8-bit RGB
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync('public', { recursive: true })
for (const [name, size] of [['icon-192.png', 192], ['icon-512.png', 512], ['apple-touch-icon.png', 180]]) {
  writeFileSync(`public/${name}`, png(size))
  console.log('wrote public/' + name)
}
