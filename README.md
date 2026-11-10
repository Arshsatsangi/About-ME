# Arsh Satsangi — Engineering Portfolio

A portfolio built with the **Impeccable** craft principles and inspired by the minimalist electroluminescent cybernetic aesthetic of Redoyanul Haque's portfolio, tailored specifically to Arsh Satsangi's background in VLSI, embedded systems, and analog circuit engineering.

## Highlights
- **Interactive Particle & Signal Mesh**: Dynamic WebGL/Canvas electric current and particle mesh that reacts to mouse tracking.
- **Dynamic Spotlight Tracking**: Proximity-aware radial illumination on cards and controls.
- **Hardware Laboratory Station 1 (CORDIC Processor Simulator)**:
  - Exact simulation of Arsh's 16-stage pipelined 32-bit CORDIC processor in Q2.30 fixed-point arithmetic.
  - Interactive angle slider ($\theta \in [-180^\circ, 180^\circ]$) plotting live sine/cosine convergence, register states ($X_i, Y_i, Z_i$), shift directions $d_i$, and LUT arctangent constants.
- **Hardware Laboratory Station 2 (WireGuard Oscilloscope)**:
  - Interactive analog oscilloscope and FFT frequency spectrum modeling the WireGuard power line resonant fault-detection system.
  - Live pole resonance frequency selection (22 kHz to 78 kHz), 50m line distance attenuation, and active harmonic filter toggle.
- **Web Audio Laboratory Synthesizer**: Subtle tactile acoustic feedback for laboratory switches and buttons.
- **Integrated Resume PDF**: Direct download and view of Arsh's complete resume.

## Quick Start
To view locally:
```bash
# Option 1: Using Python
python3 -m http.server 3000

# Option 2: Using Node/npx
npx serve . -l 3000
```
Then open `http://localhost:3000` in your browser.
