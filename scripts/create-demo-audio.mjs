// Original, synthetic demo chimes. Replace public/audio/demo-music.wav with your licensed music.
import { mkdir, writeFile } from 'node:fs/promises'

const sampleRate = 16000
const seconds = 16
const samples = sampleRate * seconds
const wave = Buffer.alloc(44 + samples * 2)
wave.write('RIFF', 0)
wave.writeUInt32LE(wave.length - 8, 4)
wave.write('WAVEfmt ', 8)
wave.writeUInt32LE(16, 16)
wave.writeUInt16LE(1, 20)
wave.writeUInt16LE(1, 22)
wave.writeUInt32LE(sampleRate, 24)
wave.writeUInt32LE(sampleRate * 2, 28)
wave.writeUInt16LE(2, 32)
wave.writeUInt16LE(16, 34)
wave.write('data', 36)
wave.writeUInt32LE(samples * 2, 40)
const notes = [261.63, 329.63, 392, 523.25, 440, 392, 329.63, 293.66]
for (let i = 0; i < samples; i++) {
  const time = i / sampleRate
  let sound = 0
  for (let note = 0; note < notes.length; note++) {
    const age = time - note * 1.8
    if (age < 0 || age > 4) continue
    const envelope = Math.min(1, age / 0.04) * Math.exp(-age * 1.4)
    const frequency = notes[note]
    sound += envelope * (Math.sin(2 * Math.PI * frequency * age) + 0.22 * Math.sin(4 * Math.PI * frequency * age)) * 0.15
  }
  sound *= Math.min(1, (seconds - time) / 1.5)
  wave.writeInt16LE(Math.round(Math.max(-1, Math.min(1, sound)) * 32767), 44 + i * 2)
}
await mkdir(new URL('../public/audio/', import.meta.url), { recursive: true })
await writeFile(new URL('../public/audio/demo-music.wav', import.meta.url), wave)
console.log('Created original demo chimes (16 seconds, mono PCM WAV).')
