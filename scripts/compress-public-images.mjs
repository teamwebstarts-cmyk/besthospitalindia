/**
 * Losslessly-ish recompress public JPG/PNG assets (same paths, same layout refs).
 * Run: node scripts/compress-public-images.mjs
 */
import { readFile, readdir, rename, stat, writeFile } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const ROOT = path.join(process.cwd(), "public", "images")

const GLOBS = [
  "destinations/states",
  "hospitals/featured/cards",
]

const SKIP_BASENAMES = new Set([
  "hero-find-care-banner.png",
  "hero-find-care-mobile.png",
])

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(full)))
    else if (/\.(jpe?g|png)$/i.test(entry.name) && !SKIP_BASENAMES.has(entry.name)) {
      files.push(full)
    }
  }
  return files
}

async function compressFile(file) {
  const before = (await stat(file)).size
  const ext = path.extname(file).toLowerCase()
  const input = await readFile(file)
  let pipeline = sharp(input)
  if (ext === ".jpg" || ext === ".jpeg") {
    pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true })
  } else if (ext === ".png") {
    pipeline = pipeline.png({ compressionLevel: 9, palette: true })
  }
  const buffer = await pipeline.toBuffer()
  if (buffer.length >= before) return null
  const tmp = `${file}.tmp`
  await writeFile(tmp, buffer)
  await rename(tmp, file)
  const after = (await stat(file)).size
  return { file, before, after }
}

async function main() {
  const targets = []
  for (const rel of GLOBS) {
    targets.push(...(await walk(path.join(ROOT, rel))))
  }
  const doctorDemo = path.join(ROOT, "doctors", "doctor-portrait-demo.png")
  try {
    await stat(doctorDemo)
    targets.push(doctorDemo)
  } catch {
    // optional
  }

  let saved = 0
  for (const file of targets) {
    let result
    try {
      result = await compressFile(file)
    } catch (error) {
      console.warn("Skip (locked or unreadable):", path.relative(process.cwd(), file), error?.code ?? "")
      continue
    }
    if (!result) continue
    saved += result.before - result.after
    console.log(
      path.relative(process.cwd(), result.file),
      `${Math.round(result.before / 1024)} KB → ${Math.round(result.after / 1024)} KB`,
    )
  }
  console.log(`Total saved: ${Math.round(saved / 1024)} KB`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})