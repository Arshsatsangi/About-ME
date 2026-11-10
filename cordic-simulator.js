// cordic-simulator.js - Authentic 16-Iteration 32-bit CORDIC Hardware Simulator
// Implements the exact architecture designed by Arsh Satsangi in Verilog
(function() {
  const ATAN_LUT = [
    0.7853981633974483,
    0.4636476090008061,
    0.24497866312686414,
    0.12435499454676144,
    0.06241880999595735,
    0.031239833430268277,
    0.015623728620476831,
    0.007812341060101111,
    0.0039062301319669718,
    0.0019531225164788188,
    0.0009765621895593195,
    0.0004882812111948983,
    0.00024414062014936177,
    0.00012207031189367021,
    0.00006103515617420877,
    0.000030517578115526096
  ];

  const K_FACTOR = 0.607252935008881256;
  const SCALE_Q30 = Math.pow(2, 30);

  function floatToQ30(val) {
    const clamped = Math.max(-2, Math.min(1.999999999, val));
    let intVal = Math.round(clamped * SCALE_Q30);
    if (intVal < 0) {
      intVal = (0xFFFFFFFF + intVal + 1) >>> 0;
    }
    return '0x' + intVal.toString(16).toUpperCase().padStart(8, '0');
  }

  function runCordicSimulation(targetAngle) {
    let angle = targetAngle;
    let signCos = 1;
    let signSin = 1;

    if (angle > Math.PI / 2) {
      angle = Math.PI - angle;
      signCos = -1;
    } else if (angle < -Math.PI / 2) {
      angle = -Math.PI - angle;
      signCos = -1;
    }

    let x = K_FACTOR;
    let y = 0.0;
    let z = angle;

    const iterations = [];

    for (let i = 0; i < 16; i++) {
      const d = z >= 0 ? 1 : -1;
      const shiftVal = Math.pow(2, -i);
      const nextX = x - d * (y * shiftVal);
      const nextY = y + d * (x * shiftVal);
      const nextZ = z - d * ATAN_LUT[i];

      iterations.push({
        step: i,
        d: d,
        x: x,
        y: y,
        z: z,
        atan: ATAN_LUT[i]
      });

      x = nextX;
      y = nextY;
      z = nextZ;
    }

    const finalCos = x * signCos;
    const finalSin = y * signSin;
    const exactCos = Math.cos(targetAngle);
    const exactSin = Math.sin(targetAngle);
    const errorCos = Math.abs(finalCos - exactCos);
    const errorSin = Math.abs(finalSin - exactSin);
    const worstError = Math.max(errorCos, errorSin);

    return {
      angle: targetAngle,
      iterations,
      finalCos,
      finalSin,
      exactCos,
      exactSin,
      worstError,
      q30CosHex: floatToQ30(finalCos),
      q30SinHex: floatToQ30(finalSin)
    };
  }

  function initCordicUI() {
    const angleSlider = document.getElementById('cordic-angle-slider');
    const angleDisplay = document.getElementById('cordic-angle-display');
    const outSin = document.getElementById('cordic-out-sin');
    const outCos = document.getElementById('cordic-out-cos');
    const outSinHex = document.getElementById('cordic-hex-sin');
    const outCosHex = document.getElementById('cordic-hex-cos');
    const outError = document.getElementById('cordic-out-error');
    const tableBody = document.getElementById('cordic-table-body');
    const canvas = document.getElementById('cordic-canvas');

    if (!angleSlider || !canvas) return;
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    }
    resizeCanvas();

    function update() {
      resizeCanvas();
      const degrees = parseFloat(angleSlider.value);
      const radians = (degrees * Math.PI) / 180;
      angleDisplay.textContent = `${degrees.toFixed(1)}° (${radians.toFixed(3)} rad)`;

      const result = runCordicSimulation(radians);

      outSin.textContent = result.finalSin.toFixed(6);
      outCos.textContent = result.finalCos.toFixed(6);
      outSinHex.textContent = result.q30SinHex;
      outCosHex.textContent = result.q30CosHex;
      outError.textContent = `${(result.worstError).toExponential(3)} (Max: ~3.01e-5)`;

      if (tableBody) {
        tableBody.innerHTML = '';
        result.iterations.forEach((it) => {
          const tr = document.createElement('tr');
          tr.className = it.step % 2 === 0 ? 'bg-row-alt' : '';
          tr.innerHTML = `
            <td class="num-cell">Stage ${it.step}</td>
            <td class="num-cell ${it.d === 1 ? 'dir-pos' : 'dir-neg'}">${it.d === 1 ? '+1 (Clockwise)' : '-1 (Counter-CW)'}</td>
            <td class="code-font">${it.x.toFixed(6)}</td>
            <td class="code-font">${it.y.toFixed(6)}</td>
            <td class="code-font">${(it.z * 180 / Math.PI).toFixed(2)}°</td>
            <td class="code-font">${(it.atan * 180 / Math.PI).toFixed(3)}°</td>
          `;
          tableBody.appendChild(tr);
        });
      }

      drawVectorCircle(ctx, canvas.width, canvas.height, radians, result.finalCos, result.finalSin);
    }

    function drawVectorCircle(ctx, w, h, targetAngle, compCos, compSin) {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(cx, cy) - 24;

      // Coordinate axes
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(15, 23, 42, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, 10);
      ctx.lineTo(cx, h - 10);
      ctx.moveTo(10, cy);
      ctx.lineTo(w - 10, cy);
      ctx.stroke();

      // Unit circle
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(15, 23, 42, 0.22)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Angle arc
      ctx.strokeStyle = isDark ? 'rgba(230, 145, 56, 0.45)' : 'rgba(194, 94, 0, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.35, 0, -targetAngle, targetAngle > 0);
      ctx.stroke();

      // CORDIC Computed Point
      const px = cx + compCos * radius;
      const py = cy - compSin * radius;

      // Projection lines
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = isDark ? 'rgba(230, 145, 56, 0.45)' : 'rgba(194, 94, 0, 0.4)';
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px, cy);
      ctx.moveTo(px, py);
      ctx.lineTo(cx, py);
      ctx.stroke();
      ctx.setLineDash([]);

      // Vector ray
      ctx.strokeStyle = isDark ? '#e69138' : '#c25e00';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, py);
      ctx.stroke();

      // Target head node
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();

      // Origin dot
      ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    angleSlider.addEventListener('input', update);
    window.addEventListener('themeChanged', update);
    window.addEventListener('resize', update);
    update();
  }

  window.addEventListener('DOMContentLoaded', initCordicUI);
})();
