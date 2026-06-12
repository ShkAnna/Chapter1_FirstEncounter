#!/usr/bin/env python3
"""Generate original procedural audio drafts for Chapter 1."""

from __future__ import annotations

import math
import subprocess
import tempfile
import wave
from pathlib import Path

import numpy as np


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public/assets/game/audio"
FFMPEG = Path("/Users/anna/anaconda3/bin/ffmpeg")
SAMPLE_RATE = 22050
RNG = np.random.default_rng(20260612)


def midi(note: int) -> float:
    return 440.0 * (2.0 ** ((note - 69) / 12.0))


def oscillator(freq: float, duration: float, waveform: str = "sine") -> np.ndarray:
    count = max(1, int(duration * SAMPLE_RATE))
    t = np.arange(count, dtype=np.float64) / SAMPLE_RATE
    phase = 2.0 * np.pi * freq * t
    if waveform == "triangle":
        return (2.0 / np.pi) * np.arcsin(np.sin(phase))
    if waveform == "soft_square":
        return np.tanh(1.6 * np.sin(phase))
    if waveform == "bell":
        return (
            np.sin(phase)
            + 0.42 * np.sin(phase * 2.01)
            + 0.2 * np.sin(phase * 3.98)
        ) / 1.62
    return np.sin(phase)


def envelope(
    duration: float,
    attack: float = 0.03,
    release: float = 0.18,
    sustain: float = 0.82,
) -> np.ndarray:
    count = max(1, int(duration * SAMPLE_RATE))
    attack_count = min(count, int(attack * SAMPLE_RATE))
    release_count = min(count - attack_count, int(release * SAMPLE_RATE))
    env = np.full(count, sustain, dtype=np.float64)
    if attack_count:
        env[:attack_count] = np.linspace(0.0, sustain, attack_count, endpoint=False)
    if release_count:
        env[-release_count:] = np.linspace(sustain, 0.0, release_count)
    return env


def pan_stereo(mono: np.ndarray, pan: float) -> np.ndarray:
    pan = float(np.clip(pan, -1.0, 1.0))
    left = math.cos((pan + 1.0) * math.pi / 4.0)
    right = math.sin((pan + 1.0) * math.pi / 4.0)
    return np.column_stack((mono * left, mono * right))


def add_note(
    target: np.ndarray,
    start: float,
    duration: float,
    note: int,
    amplitude: float,
    waveform: str = "sine",
    pan: float = 0.0,
    attack: float = 0.03,
    release: float = 0.18,
) -> None:
    begin = int(start * SAMPLE_RATE)
    if begin >= len(target):
        return
    tone = oscillator(midi(note), duration, waveform)
    tone *= envelope(duration, attack, release)
    tone *= amplitude
    stereo = pan_stereo(tone, pan)
    end = min(len(target), begin + len(stereo))
    target[begin:end] += stereo[: end - begin]


def add_kick(target: np.ndarray, start: float, amplitude: float = 0.16) -> None:
    duration = 0.22
    count = int(duration * SAMPLE_RATE)
    t = np.arange(count) / SAMPLE_RATE
    phase = 2 * np.pi * (78 * t - 30 * t * t)
    mono = np.sin(phase) * np.exp(-18 * t) * amplitude
    begin = int(start * SAMPLE_RATE)
    end = min(len(target), begin + count)
    target[begin:end] += pan_stereo(mono[: end - begin], 0.0)


def add_hat(target: np.ndarray, start: float, amplitude: float = 0.025) -> None:
    duration = 0.055
    count = int(duration * SAMPLE_RATE)
    mono = RNG.normal(0.0, 1.0, count) * np.exp(-55 * np.arange(count) / SAMPLE_RATE)
    mono *= amplitude
    begin = int(start * SAMPLE_RATE)
    end = min(len(target), begin + count)
    target[begin:end] += pan_stereo(mono[: end - begin], 0.15)


def apply_delay(audio: np.ndarray, delay: float, amount: float) -> np.ndarray:
    shift = int(delay * SAMPLE_RATE)
    result = audio.copy()
    if 0 < shift < len(audio):
        result[shift:] += audio[:-shift] * amount
    return result


def finish(audio: np.ndarray, peak: float = 0.82, fade: float = 0.35) -> np.ndarray:
    audio = apply_delay(audio, 0.19, 0.12)
    audio = apply_delay(audio, 0.37, 0.07)
    fade_count = min(len(audio) // 2, int(fade * SAMPLE_RATE))
    if fade_count:
        ramp = np.linspace(0.0, 1.0, fade_count)
        audio[:fade_count] *= ramp[:, None]
        audio[-fade_count:] *= ramp[::-1, None]
    current_peak = float(np.max(np.abs(audio))) or 1.0
    return np.clip(audio * (peak / current_peak), -1.0, 1.0)


def save_ogg(relative_path: str, audio: np.ndarray, quality: int = 4) -> None:
    destination = OUTPUT / relative_path
    destination.parent.mkdir(parents=True, exist_ok=True)
    pcm = (np.clip(audio, -1.0, 1.0) * 32767).astype("<i2")
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temporary:
        temporary_path = Path(temporary.name)
    try:
        with wave.open(str(temporary_path), "wb") as wav:
            wav.setnchannels(2)
            wav.setsampwidth(2)
            wav.setframerate(SAMPLE_RATE)
            wav.writeframes(pcm.tobytes())
        subprocess.run(
            [
                str(FFMPEG),
                "-loglevel",
                "error",
                "-y",
                "-i",
                str(temporary_path),
                "-c:a",
                "vorbis",
                "-strict",
                "-2",
                "-q:a",
                str(quality),
                str(destination),
            ],
            check=True,
        )
        print(f"generated {destination.relative_to(ROOT)}")
    finally:
        temporary_path.unlink(missing_ok=True)


def compose_theme(
    bpm: int,
    bars: int,
    chords: list[tuple[int, ...]],
    melody: list[int],
    mood: str,
) -> np.ndarray:
    beat = 60.0 / bpm
    bar_duration = beat * 4
    duration = bars * bar_duration
    audio = np.zeros((int(duration * SAMPLE_RATE), 2), dtype=np.float64)

    for bar in range(bars):
        chord = chords[bar % len(chords)]
        bar_start = bar * bar_duration
        for index, note in enumerate(chord):
            add_note(
                audio,
                bar_start,
                bar_duration * 0.98,
                note,
                0.055 if mood != "finale" else 0.065,
                "triangle" if mood in {"spring", "playful"} else "sine",
                -0.35 + index * 0.35,
                0.35,
                0.5,
            )
            add_note(
                audio,
                bar_start,
                bar_duration * 0.94,
                note + 12,
                0.022,
                "sine",
                0.3 - index * 0.25,
                0.45,
                0.55,
            )

        root = chord[0] - 12
        for beat_index in range(4):
            add_note(
                audio,
                bar_start + beat_index * beat,
                beat * 0.75,
                root if beat_index != 2 else root + 7,
                0.045,
                "sine",
                -0.05,
                0.02,
                0.16,
            )

        arp_step = beat / 2
        for step in range(8):
            arp_note = chord[step % len(chord)] + 12
            waveform = "bell" if mood in {"night", "finale", "memory"} else "triangle"
            add_note(
                audio,
                bar_start + step * arp_step,
                arp_step * 0.72,
                arp_note,
                0.03 if mood != "playful" else 0.04,
                waveform,
                -0.5 + (step % 3) * 0.5,
                0.01,
                0.12,
            )

        if mood in {"polylan", "focused", "playful"}:
            for beat_index in range(4):
                add_kick(audio, bar_start + beat_index * beat, 0.11 if mood == "focused" else 0.15)
                add_hat(audio, bar_start + (beat_index + 0.5) * beat, 0.018)

    melody_step = beat
    for index in range(int(duration / melody_step)):
        note = melody[index % len(melody)]
        if note < 0:
            continue
        start = index * melody_step
        amplitude = 0.045
        waveform = "bell" if mood in {"night", "finale", "memory"} else "triangle"
        add_note(audio, start, melody_step * 0.78, note, amplitude, waveform, 0.2, 0.02, 0.2)

    if mood == "polylan":
        for index in range(int(duration / (beat / 2))):
            note = chords[(index // 8) % len(chords)][0] + 24
            add_note(audio, index * beat / 2, beat * 0.3, note, 0.018, "soft_square", 0.4)

    return finish(audio, 0.76, 0.7)


def smooth_noise(duration: float, window: int, amplitude: float = 1.0) -> np.ndarray:
    count = int(duration * SAMPLE_RATE)
    raw = RNG.normal(0.0, 1.0, count + window)
    cumulative = np.cumsum(np.insert(raw, 0, 0.0))
    filtered = (cumulative[window:] - cumulative[:-window]) / math.sqrt(window)
    return filtered[:count] * amplitude


def add_chirp(audio: np.ndarray, start: float, freq: float, duration: float = 0.16) -> None:
    count = int(duration * SAMPLE_RATE)
    t = np.arange(count) / SAMPLE_RATE
    sweep = freq + 950 * t
    phase = 2 * np.pi * np.cumsum(sweep) / SAMPLE_RATE
    mono = np.sin(phase) * np.sin(np.pi * t / duration) ** 2 * 0.055
    begin = int(start * SAMPLE_RATE)
    end = min(len(audio), begin + count)
    audio[begin:end] += pan_stereo(mono[: end - begin], RNG.uniform(-0.8, 0.8))


def ambience(kind: str, duration: float = 30.0) -> np.ndarray:
    count = int(duration * SAMPLE_RATE)
    audio = np.zeros((count, 2), dtype=np.float64)
    low = smooth_noise(duration, 900, 0.022)
    air = smooth_noise(duration, 35, 0.007)
    audio += pan_stereo(low + air, 0.0)

    if kind in {"room_day", "unil", "vernand_outside"}:
        for start in RNG.uniform(1.0, duration - 1.0, 16 if kind == "unil" else 8):
            add_chirp(audio, float(start), float(RNG.uniform(1500, 2800)))

    if kind == "room_day":
        hum = oscillator(70, duration) * 0.006 + oscillator(140, duration) * 0.002
        audio += pan_stereo(hum, -0.2)
    elif kind == "room_night":
        hum = oscillator(55, duration) * 0.008
        audio += pan_stereo(hum, 0.15)
        for start in RNG.uniform(2.0, duration - 1.0, 7):
            add_note(audio, float(start), 0.08, 86, 0.012, "bell", float(RNG.uniform(-0.5, 0.5)))
    elif kind == "unil":
        t = np.arange(count) / SAMPLE_RATE
        waves = (np.sin(2 * np.pi * 0.13 * t) + np.sin(2 * np.pi * 0.21 * t)) * 0.012
        audio += pan_stereo(waves * smooth_noise(duration, 20, 0.8), 0.55)
    elif kind == "vernand_outside":
        distant = oscillator(92, duration) * 0.005
        audio += pan_stereo(distant, -0.4)
    elif kind == "briefing":
        hum = oscillator(60, duration) * 0.008 + oscillator(120, duration) * 0.003
        audio += pan_stereo(hum, 0.0)
        for start in RNG.uniform(1.0, duration - 0.2, 14):
            click = np.zeros((int(0.04 * SAMPLE_RATE), 2))
            click[:, 0] = RNG.normal(0, 0.01, len(click))
            click[:, 1] = click[:, 0] * 0.8
            begin = int(start * SAMPLE_RATE)
            audio[begin : begin + len(click)] += click
    elif kind == "range":
        hum = oscillator(48, duration) * 0.01
        audio += pan_stereo(hum, 0.0)
        wind = smooth_noise(duration, 140, 0.018)
        audio += pan_stereo(wind, 0.25)
    elif kind == "polylan":
        hum = oscillator(58, duration) * 0.012 + oscillator(116, duration) * 0.004
        audio += pan_stereo(hum, 0.0)
        for start in RNG.uniform(0.4, duration - 0.2, 55):
            burst = smooth_noise(0.12, 8, 0.014)
            begin = int(start * SAMPLE_RATE)
            audio[begin : begin + len(burst)] += pan_stereo(
                burst,
                float(RNG.uniform(-0.8, 0.8)),
            )
    elif kind == "city_night":
        hum = oscillator(42, duration) * 0.012
        audio += pan_stereo(hum, -0.15)
        for start in (5.0, 17.0, 26.0):
            passby = smooth_noise(2.8, 65, 0.035)
            shape = np.sin(np.linspace(0, np.pi, len(passby))) ** 2
            begin = int(start * SAMPLE_RATE)
            end = min(count, begin + len(passby))
            audio[begin:end] += pan_stereo((passby * shape)[: end - begin], -0.6 + start / duration)
    elif kind == "station":
        hum = oscillator(50, duration) * 0.014 + oscillator(100, duration) * 0.004
        audio += pan_stereo(hum, 0.0)
        for start in (7.0, 21.0):
            chime = np.zeros((int(2.4 * SAMPLE_RATE), 2))
            for note, offset in ((76, 0.0), (81, 0.42), (83, 0.84)):
                add_note(chime, offset, 1.3, note, 0.04, "bell", 0.0, 0.01, 0.7)
            begin = int(start * SAMPLE_RATE)
            end = min(count, begin + len(chime))
            audio[begin:end] += chime[: end - begin]

    return finish(audio, 0.58, 0.9)


def sfx_tone(
    notes: list[int],
    note_duration: float,
    waveform: str = "bell",
    amplitude: float = 0.35,
) -> np.ndarray:
    duration = note_duration * len(notes) + 0.35
    audio = np.zeros((int(duration * SAMPLE_RATE), 2), dtype=np.float64)
    for index, note in enumerate(notes):
        add_note(
            audio,
            index * note_duration,
            note_duration * 1.5,
            note,
            amplitude,
            waveform,
            -0.2 + index * 0.2,
            0.005,
            note_duration,
        )
    return finish(audio, 0.82, 0.015)


def noise_sfx(duration: float, decay: float, amplitude: float = 0.45) -> np.ndarray:
    count = int(duration * SAMPLE_RATE)
    t = np.arange(count) / SAMPLE_RATE
    mono = RNG.normal(0.0, 1.0, count) * np.exp(-decay * t) * amplitude
    return finish(pan_stereo(mono, 0.0), 0.82, 0.005)


def vehicle_sfx(kind: str) -> np.ndarray:
    duration = 3.2 if kind != "door" else 1.2
    count = int(duration * SAMPLE_RATE)
    t = np.arange(count) / SAMPLE_RATE
    if kind == "door":
        mono = smooth_noise(duration, 12, 0.13)
        mono *= np.sin(np.pi * np.clip(t / duration, 0, 1)) ** 1.4
        mono += np.sin(2 * np.pi * 120 * t) * np.exp(-35 * np.abs(t - 0.92)) * 0.08
    elif kind == "train":
        freq = 48 + 22 * (t / duration)
        phase = 2 * np.pi * np.cumsum(freq) / SAMPLE_RATE
        mono = np.sin(phase) * 0.09 + smooth_noise(duration, 45, 0.06)
        mono *= np.sin(np.pi * np.clip(t / duration, 0, 1)) ** 0.5
    else:
        freq = 62 + 8 * np.sin(2 * np.pi * 1.7 * t)
        phase = 2 * np.pi * np.cumsum(freq) / SAMPLE_RATE
        mono = np.sin(phase) * 0.08 + smooth_noise(duration, 35, 0.035)
        mono *= np.sin(np.pi * np.clip(t / duration, 0, 1)) ** 0.6
    return finish(pan_stereo(mono, 0.0), 0.8, 0.02)


def footsteps() -> np.ndarray:
    duration = 1.1
    audio = np.zeros((int(duration * SAMPLE_RATE), 2), dtype=np.float64)
    for index, start in enumerate((0.05, 0.31, 0.58, 0.84)):
        count = int(0.1 * SAMPLE_RATE)
        t = np.arange(count) / SAMPLE_RATE
        mono = RNG.normal(0, 1, count) * np.exp(-36 * t) * 0.18
        mono += np.sin(2 * np.pi * 82 * t) * np.exp(-30 * t) * 0.06
        begin = int(start * SAMPLE_RATE)
        audio[begin : begin + count] += pan_stereo(mono, -0.2 if index % 2 == 0 else 0.2)
    return finish(audio, 0.72, 0.005)


def gunshot() -> np.ndarray:
    duration = 1.35
    count = int(duration * SAMPLE_RATE)
    t = np.arange(count) / SAMPLE_RATE
    crack = RNG.normal(0, 1, count) * np.exp(-48 * t) * 0.7
    body = np.sin(2 * np.pi * 105 * t) * np.exp(-11 * t) * 0.32
    echo = np.sin(2 * np.pi * 72 * t) * np.exp(-4.6 * t) * 0.08
    return finish(pan_stereo(crack + body + echo, 0.0), 0.88, 0.002)


def keyboard_sfx() -> np.ndarray:
    duration = 1.8
    audio = np.zeros((int(duration * SAMPLE_RATE), 2), dtype=np.float64)
    for start in np.arange(0.04, duration - 0.05, 0.095):
        count = int(0.035 * SAMPLE_RATE)
        mono = RNG.normal(0, 1, count) * np.exp(-80 * np.arange(count) / SAMPLE_RATE) * 0.12
        begin = int(start * SAMPLE_RATE)
        audio[begin : begin + count] += pan_stereo(mono, float(RNG.uniform(-0.5, 0.5)))
    return finish(audio, 0.68, 0.005)


def generate_music() -> None:
    themes = {
        "music/title-night-lake.ogg": (70, 8, [(48, 55, 60), (45, 52, 57), (41, 48, 53), (43, 50, 55)], [72, -1, 74, 76, 79, 76, 74, -1], "night"),
        "music/prologue-curiosity.ogg": (92, 10, [(60, 64, 67), (57, 60, 64), (53, 57, 60), (55, 59, 62)], [72, 74, 76, -1, 79, 76, 74, 72], "playful"),
        "music/first-meeting-spring.ogg": (84, 10, [(55, 59, 62), (60, 64, 67), (57, 60, 64), (62, 66, 69)], [74, 76, 79, 81, 79, 76, 74, -1], "spring"),
        "music/vernand-focused.ogg": (76, 8, [(50, 53, 57), (48, 52, 55), (45, 50, 53), (47, 50, 55)], [62, -1, 65, 67, 69, -1, 67, 65], "focused"),
        "music/growing-connection.ogg": (78, 10, [(57, 60, 64), (53, 57, 60), (55, 59, 62), (52, 55, 60)], [69, 72, 76, 74, 72, 69, 67, -1], "memory"),
        "music/whatsapp-playful.ogg": (106, 12, [(60, 64, 67), (62, 65, 69), (57, 60, 64), (55, 59, 62)], [79, 81, 83, 81, 79, 76, 74, 76], "playful"),
        "music/polylan-cozy-neon.ogg": (100, 12, [(45, 52, 57), (48, 55, 60), (41, 48, 53), (43, 50, 55)], [69, 72, 76, 74, 72, 69, 67, 64], "polylan"),
        "music/chauderon-tender-night.ogg": (66, 8, [(52, 55, 59), (48, 52, 55), (45, 52, 57), (47, 50, 55)], [71, -1, 72, 74, 76, 74, 72, -1], "night"),
        "music/finale-first-kiss.ogg": (64, 8, [(48, 55, 60), (53, 57, 60), (45, 52, 57), (43, 50, 55)], [72, 76, 79, -1, 81, 79, 76, 74], "finale"),
        "music/transition-memory.ogg": (72, 4, [(48, 52, 55), (53, 57, 60), (55, 59, 62), (48, 52, 55)], [72, 76, 79, 84, 79, 76, 74, 72], "memory"),
    }
    for path, parameters in themes.items():
        save_ogg(path, compose_theme(*parameters), quality=5)


def generate_ambiences() -> None:
    kinds = {
        "ambience/anna-room-day.ogg": "room_day",
        "ambience/alex-room-night.ogg": "room_night",
        "ambience/unil-park-lake.ogg": "unil",
        "ambience/vernand-parking.ogg": "vernand_outside",
        "ambience/vernand-briefing-room.ogg": "briefing",
        "ambience/vernand-shooting-range.ogg": "range",
        "ambience/polylan-hall.ogg": "polylan",
        "ambience/chauderon-city-night.ogg": "city_night",
        "ambience/lausanne-station-platform.ogg": "station",
    }
    for path, kind in kinds.items():
        save_ogg(path, ambience(kind), quality=3)


def generate_sfx() -> None:
    effects = {
        "sfx/ui-confirm.ogg": sfx_tone([72, 79], 0.1, "bell", 0.22),
        "sfx/ui-cancel.ogg": sfx_tone([67, 60], 0.12, "triangle", 0.2),
        "sfx/dialogue-next.ogg": sfx_tone([76], 0.08, "triangle", 0.16),
        "sfx/memory-unlocked.ogg": sfx_tone([72, 76, 79, 84], 0.16, "bell", 0.24),
        "sfx/email-received.ogg": sfx_tone([79, 83, 86], 0.13, "bell", 0.2),
        "sfx/email-sent.ogg": sfx_tone([72, 76, 81], 0.11, "triangle", 0.22),
        "sfx/phone-message.ogg": sfx_tone([83, 88], 0.09, "bell", 0.2),
        "sfx/phone-low-battery.ogg": sfx_tone([69, 66], 0.18, "sine", 0.22),
        "sfx/footsteps-stone-loop.ogg": footsteps(),
        "sfx/keyboard-typing.ogg": keyboard_sfx(),
        "sfx/minibus-door.ogg": vehicle_sfx("door"),
        "sfx/minibus-engine.ogg": vehicle_sfx("engine"),
        "sfx/city-bus-pass.ogg": vehicle_sfx("engine"),
        "sfx/train-door.ogg": vehicle_sfx("door"),
        "sfx/train-departure.ogg": vehicle_sfx("train"),
        "sfx/shooting-22lr-indoor.ogg": gunshot(),
        "sfx/soft-impact.ogg": noise_sfx(0.35, 18, 0.18),
        "sfx/romantic-sparkle.ogg": sfx_tone([76, 79, 83, 88], 0.2, "bell", 0.18),
    }
    for path, audio in effects.items():
        save_ogg(path, audio, quality=4)


def main() -> None:
    if not FFMPEG.exists():
        raise SystemExit(f"ffmpeg not found at {FFMPEG}")
    generate_music()
    generate_ambiences()
    generate_sfx()


if __name__ == "__main__":
    main()
