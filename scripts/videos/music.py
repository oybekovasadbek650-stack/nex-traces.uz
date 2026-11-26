"""
promo2 videosi uchun original musiqa va effektlar (36 s, 120 BPM, A minor).
Ishlatish: python scripts/videos/music.py chiqish.wav
Vaqtlar scripts/videos/promo2.js dagi sahnalar bilan bir xil.
"""
import sys
import wave

import numpy as np

SR = 44100
DUR = 36.0
END = 31.2  # yakuniy sahna (promo2.js dagi END)
BEAT = 0.5
N = int(SR * DUR)
rng = np.random.default_rng(7)

left = np.zeros(N)
right = np.zeros(N)


def t_axis(seconds):
    return np.arange(int(seconds * SR)) / SR


def add(signal, start, gain=1.0, pan=0.0):
    """Signalni start (s) ga qo'shadi. pan: -1 chap, +1 o'ng."""
    i = int(start * SR)
    if i >= N:
        return
    end = min(N, i + len(signal))
    part = signal[: end - i] * gain
    left[i:end] += part * np.sqrt((1 - pan) / 2) * 1.414
    right[i:end] += part * np.sqrt((1 + pan) / 2) * 1.414


def lowpass(signal, cutoff):
    spectrum = np.fft.rfft(signal)
    freqs = np.fft.rfftfreq(len(signal), 1 / SR)
    spectrum *= 1 / (1 + (freqs / cutoff) ** 4)
    return np.fft.irfft(spectrum, len(signal))


def highpass(signal, cutoff):
    spectrum = np.fft.rfft(signal)
    freqs = np.fft.rfftfreq(len(signal), 1 / SR)
    spectrum *= 1 - 1 / (1 + (freqs / cutoff) ** 4)
    return np.fft.irfft(spectrum, len(signal))


def saw(freq, seconds, detune=0.0):
    t = t_axis(seconds)
    phase = (t * freq * (1 + detune)) % 1
    return 2 * phase - 1


def saw_n(freq, count, detune=0.0):
    phase = (np.arange(count) / SR * freq * (1 + detune)) % 1
    return 2 * phase - 1


def env(seconds, attack=0.005, decay=0.2):
    t = t_axis(seconds)
    return np.minimum(1, t / max(attack, 1e-4)) * np.exp(-t / decay)


# ---- Tovushlar ----
def kick(gain=1.0):
    t = t_axis(0.45)
    freq = 45 + 110 * np.exp(-t * 28)
    phase = 2 * np.pi * np.cumsum(freq) / SR
    body = np.sin(phase) * np.exp(-t * 7)
    click = rng.standard_normal(len(t)) * np.exp(-t * 300) * 0.3
    return (body + click) * gain


def boom():
    t = t_axis(1.6)
    freq = 32 + 90 * np.exp(-t * 10)
    phase = 2 * np.pi * np.cumsum(freq) / SR
    noise = lowpass(rng.standard_normal(len(t)), 900) * np.exp(-t * 5) * 0.5
    return (np.sin(phase) * np.exp(-t * 2.2) + noise) * 1.2


def hat(open_hat=False):
    seconds = 0.18 if open_hat else 0.05
    noise = highpass(rng.standard_normal(int(seconds * SR)), 7000)
    return noise * env(seconds, 0.001, 0.06 if open_hat else 0.015) * 0.35


def clap():
    seconds = 0.25
    noise = highpass(lowpass(rng.standard_normal(int(seconds * SR)), 4000), 900)
    t = t_axis(seconds)
    shape = np.exp(-t * 18) + 0.6 * np.exp(-np.abs(t - 0.012) * 400) + 0.5 * np.exp(-np.abs(t - 0.024) * 400)
    return noise * shape * 0.45


def pluck(freq, seconds=0.22):
    t = t_axis(seconds)
    tone = np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(2 * np.pi * freq * 2 * t) + 0.12 * np.sin(2 * np.pi * freq * 3 * t)
    return tone * env(seconds, 0.002, 0.09) * 0.22


def tick():
    t = t_axis(0.06)
    return (np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 120) + rng.standard_normal(len(t)) * np.exp(-t * 400) * 0.4) * 0.5


def ding():
    t = t_axis(1.2)
    tone = np.sin(2 * np.pi * 1318.5 * t) * np.exp(-t * 3) + 0.6 * np.sin(2 * np.pi * 1975.5 * t) * np.exp(-t * 4)
    second = np.zeros_like(t)
    offset = int(0.12 * SR)
    second[offset:] = np.sin(2 * np.pi * 1760 * t[: len(t) - offset]) * np.exp(-t[: len(t) - offset] * 3.5)
    return (tone + second * 0.8) * 0.28


def beep(freq=880, seconds=0.12):
    t = t_axis(seconds)
    return np.sign(np.sin(2 * np.pi * freq * t)) * env(seconds, 0.003, 0.08) * 0.08


def whoosh(seconds=0.55):
    t = t_axis(seconds)
    noise = rng.standard_normal(len(t))
    shape = np.sin(np.pi * t / seconds) ** 2
    out = np.zeros_like(noise)
    chunks = 12
    size = len(noise) // chunks
    for k in range(chunks):
        cut = 400 + 6000 * (k / chunks) ** 1.5
        piece = noise[k * size : (k + 1) * size]
        out[k * size : (k + 1) * size] = lowpass(piece, cut)
    return out * shape * 0.35


def riser(seconds):
    t = t_axis(seconds)
    noise = rng.standard_normal(len(t))
    out = np.zeros_like(noise)
    chunks = 24
    size = len(noise) // chunks
    for k in range(chunks):
        cut = 300 + 9000 * (k / chunks) ** 2
        out[k * size : (k + 1) * size] = lowpass(noise[k * size : (k + 1) * size], cut)
    freq = 200 + 900 * (t / seconds) ** 2
    tone = np.sin(2 * np.pi * np.cumsum(freq) / SR) * 0.15
    return (out * 0.3 + tone) * (t / seconds) ** 2


def sweep(seconds, f0, f1, gain=0.05):
    t = t_axis(seconds)
    freq = f0 + (f1 - f0) * t / seconds
    return np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.sin(np.pi * t / seconds) * gain


# ---- Garmoniya: Am F C G, har biri bitta takt (2 s) ----
CHORDS = [
    (110.0, [220.0, 261.63, 329.63]),
    (87.31, [174.61, 220.0, 261.63]),
    (130.81, [261.63, 329.63, 392.0]),
    (98.0, [196.0, 246.94, 293.66]),
]


def chord_at(time):
    return CHORDS[int(time // 2) % 4]


def pad_layer(start, end, gain, cutoff):
    seconds = end - start
    t = t_axis(seconds)
    out_l = np.zeros(len(t))
    out_r = np.zeros(len(t))
    bar = 2.0
    for b in range(int(np.ceil(seconds / bar))):
        _, notes = chord_at(start + b * bar)
        i0 = int(b * bar * SR)
        i1 = min(len(t), int((b + 1) * bar * SR) + int(0.05 * SR))
        length = i1 - i0
        fade = np.minimum(1, np.arange(length) / (0.05 * SR)) * np.minimum(1, (length - np.arange(length)) / (0.05 * SR))
        for note in notes:
            out_l[i0:i1] += saw_n(note, length, -0.004) * fade
            out_r[i0:i1] += saw_n(note, length, 0.004) * fade
    out_l = lowpass(out_l, cutoff) * gain
    out_r = lowpass(out_r, cutoff) * gain
    i = int(start * SR)
    left[i : i + len(t)] += out_l[: N - i]
    right[i : i + len(t)] += out_r[: N - i]


def bass_layer(start, end, gain=0.3):
    step = BEAT / 2
    time = start
    while time < end - 1e-6:
        root, _ = chord_at(time)
        count = len(t_axis(step * 0.95))
        note = saw_n(root, count) * env(step * 0.95, 0.004, 0.18)
        note += np.sin(2 * np.pi * root * t_axis(step * 0.95)) * env(step * 0.95, 0.004, 0.2)
        add(lowpass(note, 600), time, gain)
        time += step


def arp_layer(start, end, gain=1.0):
    step = BEAT / 4
    time = start
    k = 0
    while time < end - 1e-6:
        _, notes = chord_at(time)
        pattern = [0, 1, 2, 1]
        freq = notes[pattern[k % 4]] * 2
        add(pluck(freq), time, gain, pan=-0.45 if k % 2 else 0.45)
        time += step
        k += 1


# ---- Kompozitsiya ----
# 0-4: kirish
pad_layer(0, 4, 0.045, 900)
for time in np.arange(0, 4, BEAT):
    add(tick(), time, 0.35)
for time in (0.5, 1.5, 2.5):
    add(boom(), time, 0.55)
add(riser(1.4), 2.6, 0.9)

# 4-16: asosiy ritm
for time in np.arange(4, 16, BEAT):
    add(kick(), time, 0.9)
bass_layer(4, 16)
pad_layer(4, 16, 0.04, 1400)
for time in np.arange(8, 16, BEAT):
    add(hat(), time + BEAT / 2, 0.9, pan=0.25)
for time in np.arange(8, 16, 1.0):
    add(clap(), time + BEAT, 0.9)
arp_layer(12, 16, 0.8)

# 16-20: tanaffus va urilishlar
pad_layer(16, 20, 0.05, 1000)
for time in (16, 17, 18):
    add(boom(), time, 0.8)
    add(kick(1.1), time)
arp_layer(16, 19, 0.45)
add(riser(1.6), 18.4, 1.0)
roll = 19.0
while roll < 20:
    add(clap(), roll, 0.35 + (roll - 19) * 0.5)
    roll += 0.125 if roll < 19.5 else 0.0625

# 20-END: kuchli qism
add(boom(), 20.0, 1.0)
for time in np.arange(20, END, BEAT):
    add(kick(), time, 0.95)
bass_layer(20, END, 0.33)
pad_layer(20, END, 0.05, 2200)
for time in np.arange(20, END, BEAT / 2):
    add(hat(open_hat=(time * 4) % 2 == 1), time, 0.8, pan=0.3 if (time * 4) % 2 else -0.3)
for time in np.arange(20, END - 0.5, 1.0):
    add(clap(), time + BEAT, 1.0)
arp_layer(20, END, 1.0)

# END-36: yakun
add(boom(), END, 0.9)
pad_layer(END, DUR, 0.06, 1200)
arp_layer(END, END + 2, 0.5)

# ---- Effektlar (video bilan bir vaqtda) ----
for time in (4.0, 8.0, 12.0, 16.0, 26.7, END):
    add(whoosh(), time - 0.35, 0.9)
add(sweep(1.6, 400, 1400, 0.045), 4.4)
add(beep(880), 6.0)
add(beep(880), 6.22)
add(ding(), 8.5)
for time in (10.0, 23.4, 23.9, 24.3, 27.6, 28.6, 29.9):
    add(tick(), time, 0.7)
# Forma to'ldirilayotganda klaviatura tovushi
for start, end, count in ((27.75, 28.35, 7), (28.75, 29.65, 17)):
    for k in range(count):
        add(tick(), start + (end - start) * k / count, 0.22, pan=0.2 if k % 2 else -0.2)
add(ding(), 30.3, 1.1)
add(boom(), 26.1, 0.45)
add(clap(), 26.1, 0.8)

# ---- Miks ----
kick_times = [t for t in np.arange(4, END, BEAT) if not (16 <= t < 20)]
duck = np.ones(N)
for time in kick_times:
    i = int(time * SR)
    length = min(N - i, int(0.3 * SR))
    duck[i : i + length] *= 1 - 0.35 * np.exp(-np.arange(length) / (0.08 * SR))
left *= duck
right *= duck

fade_in = np.minimum(1, np.arange(N) / (0.05 * SR))
fade_out = np.clip((DUR - np.arange(N) / SR) / 2.0, 0, 1)
for channel in (left, right):
    channel *= fade_in * fade_out

stereo = np.stack([left, right], axis=1)
stereo = np.tanh(stereo * 1.2)
stereo /= np.max(np.abs(stereo)) / 0.89

with wave.open(sys.argv[1] if len(sys.argv) > 1 else 'music.wav', 'wb') as file:
    file.setnchannels(2)
    file.setsampwidth(2)
    file.setframerate(SR)
    file.writeframes((stereo * 32767).astype('<i2').tobytes())
print('ok')
