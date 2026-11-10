// oscilloscope.js - Interactive Analog Oscilloscope & Resonance Spectrum Simulator
// Models the WireGuard line-break resonant detection system by Arsh Satsangi
(function() {
  const canvas = document.getElementById('osc-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let poleSelect = 'pole2';
  let filterEnabled = true;
  let lineDist = 50;
  let time = 0;

  const POLE_FREQUENCIES = {
    'normal': { name: 'Normal 50Hz Grid (No Fault)', freq: 0, amp: 0, thd: 1.8 },
    'pole1': { name: 'Break @ Pole #1 (Resonance: 22 kHz)', freq: 22, amp: 0.85, thd: 2.1 },
    'pole2': { name: 'Break @ Pole #2 (Resonance: 36 kHz)', freq: 36, amp: 0.90, thd: 2.4 },
    'pole3': { name: 'Break @ Pole #3 (Resonance: 54 kHz)', freq: 54, amp: 0.78, thd: 2.9 },
    'pole4': { name: 'Break @ Pole #4 (Resonance: 78 kHz)', freq: 78, amp: 0.65, thd: 3.4 }
  };

  function initOscilloscopeUI() {
    const poleBtns = document.querySelectorAll('[data-pole]');
    const filterToggle = document.getElementById('osc-filter-toggle');
    const rangeSlider = document.getElementById('osc-range-slider');
    const rangeDisplay = document.getElementById('osc-range-display');
    const thdDisplay = document.getElementById('osc-thd-val');
    const statusDisplay = document.getElementById('osc-status-text');

    poleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        poleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        poleSelect = btn.getAttribute('data-pole');
        updateStatus();
      });
    });

    if (filterToggle) {
      filterToggle.addEventListener('change', () => {
        filterEnabled = filterToggle.checked;
        updateStatus();
      });
    }

    if (rangeSlider && rangeDisplay) {
      rangeSlider.addEventListener('input', () => {
        lineDist = parseInt(rangeSlider.value);
        rangeDisplay.textContent = `${lineDist} m (Max tested: 50 m)`;
        updateStatus();
      });
    }

    function updateStatus() {
      const pole = POLE_FREQUENCIES[poleSelect];
      if (statusDisplay) {
        statusDisplay.textContent = pole.name;
      }
      if (thdDisplay) {
        const baseTHD = pole.thd * (lineDist / 35);
        const finalTHD = filterEnabled ? baseTHD * 0.32 : baseTHD * 2.8;
        thdDisplay.textContent = `${finalTHD.toFixed(2)}% ${filterEnabled ? '(Filtered)' : '(Raw)'}`;
        thdDisplay.style.color = finalTHD < 2.5 ? '#059669' : '#c25e00';
      }
    }

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    updateStatus();
    renderLoop();
  }

  function renderLoop() {
    time += 0.04;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Graticule grid
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.08)';
    ctx.lineWidth = 1;
    const divX = w / 10;
    const divY = h / 8;
    for (let x = 0; x <= w; x += divX) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += divY) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Center division axes
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(15, 23, 42, 0.18)';
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();

    // Signal waveform synthesis
    ctx.beginPath();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = filterEnabled ? '#059669' : (isDark ? '#e69138' : '#c25e00');

    const pole = POLE_FREQUENCIES[poleSelect];
    const cy = h / 2;
    const ampScale = (h / 2.6) * (1 - (lineDist / 120) * 0.3);

    for (let x = 0; x < w; x++) {
      const tNorm = (x / w) * Math.PI * 8 + time;

      let val = Math.sin(tNorm * 0.8) * 0.45;

      if (pole.freq > 0) {
        const resFreq = (pole.freq / 8);
        val += Math.sin(tNorm * resFreq) * pole.amp * 0.45;
      }

      if (!filterEnabled) {
        val += Math.sin(tNorm * 3.7) * 0.18 + (Math.random() - 0.5) * 0.12;
      }

      const y = cy - val * ampScale;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Top Right HUD
    ctx.font = '11px IBM Plex Mono, monospace';
    ctx.fillStyle = isDark ? '#e69138' : '#c25e00';
    ctx.fillText(`CH1: 200mV/div  TIME: 5ms/div  TRIG: RUN`, 16, 22);
    ctx.fillText(`CARRIER: 50.0 Hz  |  RESONANCE: ${pole.freq > 0 ? pole.freq + ' kHz' : 'NONE'}`, 16, 38);

    requestAnimationFrame(renderLoop);
  }

  window.addEventListener('DOMContentLoaded', initOscilloscopeUI);
})();
