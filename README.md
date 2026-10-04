# Votify — AI and Blockchain-Driven E-Voting Monitoring Ecosystem

A closed-loop voting platform combining facial-recognition verification, a physical hardware
voting booth, a live administrator dashboard, and AI-based anomaly monitoring — with blockchain
storage as its next extension.

**Status: Research prototype.** Some features in the original design (blockchain ledger, AI
anomaly-detection model, quantitative benchmarking) are proposed but not yet implemented. See
[Implementation Status](#implementation-status) below for exactly what works today.

Built by Ritika Chavan, Rakhi Gaud, and Purva Kakade — Department of Artificial Intelligence,
Usha Mittal Institute of Technology, SNDT Women's University, under the guidance of
Prof. Prakash Khelage.

---

## Why Votify

Traditional voting systems struggle with transparency, tamper resistance, and real-time fraud
visibility. Most research fixes solve one of these at a time. Votify's thesis is that voter
verification, vote storage, and live fraud monitoring should be one closed-loop system.

This project includes a systematic review of 14 base papers (2023–2026) on blockchain voting,
biometric authentication, and AI-based fraud detection, and positions Votify's design against the
gaps that review surfaces:

- Blockchain voting systems are strong on cryptography and throughput, but rarely include AI
  monitoring or an admin dashboard.
- Biometric voting systems verify identity once at login, but don't monitor activity afterward.
- Surveys call for an integrated AI + blockchain system, but none build one.

Votify combines facial-recognition verification, a low-cost hardware booth, live activity
logging, and an administrator dashboard in one system — a combination not found in full in any
single reviewed paper.

---

## Implementation Status

### Built and functionally tested

- Facial verification — Python (`face.py`) using OpenCV + DeepFace
- Hardware voting booth — NodeMCU ESP8266 + RC522 RFID reader + ST7735 TFT display + DS1307 RTC + piezo buzzer
- Hardware-software link — USB Serial, COM3 @ 115200 baud
- Vote/activity storage — Supabase (PostgreSQL) `booth_activity` table via HTTP REST
- Live dashboard sync — Supabase Realtime → Next.js dashboard (Vercel)
- One-vote enforcement — checked against voter status before recording
- Testing performed — end-to-end functional walkthrough; Wokwi-simulated and single-unit hardware prototype

### Designed, not yet implemented

- **Blockchain ledger** — proposed in the architecture, but the current build uses Supabase/Postgres instead. This is a known, tracked conflict (see Roadmap).
- **AI anomaly detection** — an Isolation Forest / Random Forest model is specified in the design but not yet built or evaluated.
- **Quantitative metrics** — no measured accuracy, latency, or precision/recall numbers yet. Dashboard analytics shown use sample data for demonstration, not live results.
- **Flutter/Flask stack** — the original design spec; the as-built system uses Next.js and Python instead.
- **Field/load testing** — not yet performed.

---

## Architecture

Target design:

```
Voter Interface -> Authentication -> Vote Processing -> Blockchain Storage -> AI Monitoring
                                                                 |
                                                     Administrator Dashboard
```

As actually built:

```
face.py (OpenCV + DeepFace)
   | USB Serial (COM3)
NodeMCU ESP8266 (RFID / TFT / RTC / Buzzer)
   |
Supabase (Postgres) booth_activity table
   | Supabase Realtime
Next.js Dashboard (Vercel)
```

---

## Tech Stack

As-built: Next.js, Vercel, Python, OpenCV, DeepFace, Supabase, PostgreSQL, Arduino C++, NodeMCU ESP8266

Proposed extensions: Blockchain ledger (consensus TBD), Isolation Forest / Random Forest anomaly model, Flutter, Flask

---

## Hardware

| Component | Role |
|---|---|
| NodeMCU ESP8266 | Main controller |
| RC522 RFID Reader | Voter card identification |
| ST7735 1.8" SPI TFT | Visual feedback to voter |
| DS1307 RTC | Vote timestamping |
| Piezo Buzzer | Audio confirmation |

Booth state flow: Locked -> Tag Scan -> Biometric Verification -> Authorized -> Vote & Reset
(30-second security timeout reverts to Locked if voting isn't completed)

---

## Getting Started

```bash
git clone https://github.com/ritikachavan/VOTIFY_blockchain-AI
cd VOTIFY_blockchain-AI
npm install
npm run dev
```

Open `http://localhost:3000/dashboard`.

**Hardware setup:** Flash the Arduino C++ firmware to the ESP8266, wire the RFID reader, TFT
display, RTC, and buzzer per the circuit diagram, and connect via USB.

**Software setup:** Set up Python with OpenCV and DeepFace for `face.py`, point it at your serial
port (default COM3 @ 115200 baud), and configure Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Benchmarks: Votify vs. the Literature

Votify's current contribution is architectural and functional, not yet a quantitative improvement
on any single metric. Here's how it compares to the strongest reported results in the reviewed
literature:

| Metric | Best Reported (Literature) | Votify (Current) |
|---|---|---|
| Authentication accuracy | 99.68% TAR [1]; 95.7% first-attempt [10] | Functionally verified end-to-end; not yet measured |
| Anomaly-detection quality | 90.0% F1 [1]; 97% breach detection [7] | Model not yet implemented |
| Ledger tamper evidence | 100%, SHA-256 blockchain [1] | No blockchain in current build |
| Latency | 2.3s [7]; 45% throughput gain [2] | 10s serial confirmation window observed; not yet benchmarked |
| Field/uptime validation | 300-voter field test, 99.2% uptime [10] | Simulated and single-unit prototype only |

Closing these rows with Votify's own measured numbers is the immediate next milestone.

---

## Roadmap

- Resolve the blockchain-vs-Postgres conflict — implement a real ledger or formally re-scope the integrity claim to Postgres constraints/RLS/audit logging
- Build and evaluate the AI anomaly-detection model
- Measure real accuracy, latency, and anomaly-detection metrics
- Document the hardware-backend wire protocol
- Add dedicated subsystem flowcharts (auth, vote processing, AI monitoring)
- Multi-voter / multi-booth field and load testing

---

## Academic Context

Documented in an accompanying research paper reviewing 14 base papers (2023–2026) on blockchain
and biometric e-voting, with a full gap analysis positioning Votify's design against the
literature. The paper is explicit that the current prototype is a functional and architectural
contribution — the next step is closing the gap on measured performance.

Authors: Ritika Chavan, Rakhi Gaud, Purva Kakade
Guide: Prof. Prakash Khelage
Institution: Department of Artificial Intelligence, Usha Mittal Institute of Technology, SNDT Women's University

## License

Add your license of choice here (e.g. MIT).v
