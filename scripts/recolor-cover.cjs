// Recolours the sand cut-out into the other fabric colours, keeping its shading and weave:
// each channel = 1 − (1 − target)^k, k = pixel luminance / mean cover luminance (linear light):
// ≈ multiplicative in the shadows, but highlights (the lit spine) roll off instead of clipping.
const sharp = require(process.cwd() + '/node_modules/sharp')
const [src, outDir] = process.argv.slice(2)
const targets = { sand: null, milk: '#ece5d8', violet: '#857aa0', graphite: '#3b3835' }
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
const enc = (v) => { v = Math.max(0, Math.min(1, v)); return Math.round(255 * (v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055)) }
const hex = (h) => [1, 3, 5].map((i) => lin(parseInt(h.slice(i, i + 2), 16)))
;(async () => {
  const base = sharp(src).trim({ threshold: 10 }).extend({ top: 8, bottom: 8, left: 8, right: 8, background: { r: 0, g: 0, b: 0, alpha: 0 } })
  const { data, info } = await base.raw().toBuffer({ resolveWithObject: true })
  const n = info.width * info.height
  const L = new Float32Array(n)
  let sum = 0, cnt = 0
  for (let i = 0; i < n; i++) {
    const p = i * 4
    L[i] = 0.2126 * lin(data[p]) + 0.7152 * lin(data[p + 1]) + 0.0722 * lin(data[p + 2])
    if (data[p + 3] > 250) { sum += L[i]; cnt++ }
  }
  const mean = sum / cnt
  for (const [name, h] of Object.entries(targets)) {
    let buf = data
    if (h) {
      const t = hex(h)
            buf = Buffer.from(data)
      for (let i = 0; i < n; i++) {
        const k = L[i] / mean
        const p = i * 4
        for (let c = 0; c < 3; c++) buf[p + c] = enc(1 - (1 - t[c]) ** k)
      }
    }
    const r = await sharp(buf, { raw: info }).webp({ quality: 88, alphaQuality: 90, effort: 6 }).toFile(`${outDir}/closed-${name}.webp`)
    console.log(name, r.width + 'x' + r.height, r.size)
  }
})()
