import { useEffect, useRef } from "react";
import { geoOrthographic, geoPath, geoDistance } from "d3-geo";
import { feature } from "topojson-client";
import landTopology from "world-atlas/land-110m.json";

// Purely visual component: draws the top part of a rotating Earth on a <canvas>.
// It has no connection to chat state, API calls or any app logic.
// The only input is `active`: true while the chat is empty (Earth spins),
// false once messages exist (Earth keeps spinning while the CSS "slide down"
// animation plays, then the animation loop stops to save CPU/battery).

// Real coastline shapes (Natural Earth, 110m detail) converted to GeoJSON once.
const LAND = feature(landTopology, landTopology.objects.land);

// Decorative glowing city markers: [longitude, latitude]
const CITIES = [
  [-74.0, 40.7], // New York
  [-122.4, 37.8], // San Francisco
  [-99.1, 19.4], // Mexico City
  [-46.6, -23.5], // Sao Paulo
  [-0.1, 51.5], // London
  [3.4, 6.5], // Lagos
  [28.0, -26.2], // Johannesburg
  [55.3, 25.2], // Dubai
  [77.2, 28.6], // Delhi
  [103.8, 1.35], // Singapore
  [139.7, 35.7], // Tokyo
  [151.2, -33.9], // Sydney
];

const TILT_DEG = 22; // tilts the north pole towards the viewer
const START_LONGITUDE = 25; // initial rotation (Americas left, Europe/Africa centre)
const SPEED_DEG_PER_SEC = 9; // one full turn in ~40 seconds
const STOP_DELAY_MS = 1100; // keep spinning this long after `active` turns false

function GlobeCanvas({ active = true }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const activeRef = useRef(active);
  const stopAtRef = useRef(0);
  const startRef = useRef(null);

  // Main effect: sets up sizing, drawing and the animation loop once.
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // d3's orthographic projection = "looking at a sphere from far away".
    // clipAngle(90) hides everything on the far side of the planet.
    const projection = geoOrthographic().clipAngle(90).precision(0.6);
    const path = geoPath(projection, ctx);

    let w = 0;
    let h = 0;
    let dpr = 1;
    let rotation = START_LONGITUDE;
    let last = 0;
    let raf = 0;
    let running = false;

    const draw = (now) => {
      if (!w || !h) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // A huge sphere whose centre is below the canvas: only its upper cap
      // is visible, which gives the curved "horizon" look.
      const R = Math.max(w * 0.8, 380);
      const cx = w / 2;
      const top = h * 0.46; // y position of the highest point of the cap
      const cy = top + R;

      projection
        .translate([cx, cy])
        .scale(R)
        .rotate([rotation, -TILT_DEG]);

      // 1. Faint atmosphere glow just outside the rim
      const glow = ctx.createRadialGradient(cx, cy, R * 0.99, cx, cy, R * 1.07);
      glow.addColorStop(0, "rgba(255, 255, 255, 0.10)");
      glow.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.07, 0, Math.PI * 2);
      ctx.fill();

      // 2. Ocean: a very dark disc, slightly lighter near the top
      const ocean = ctx.createLinearGradient(0, top, 0, h);
      ocean.addColorStop(0, "#111113");
      ocean.addColorStop(1, "#060607");
      ctx.fillStyle = ocean;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // 3. Continents: brighter near the horizon, fading as they go down
      const landFill = ctx.createLinearGradient(0, top, 0, h);
      landFill.addColorStop(0, "#38383d");
      landFill.addColorStop(0.5, "#202024");
      landFill.addColorStop(1, "#0f0f11");
      ctx.fillStyle = landFill;
      ctx.beginPath();
      path(LAND);
      ctx.fill();

      // 4. Thin rim highlight that fades downwards
      const rim = ctx.createLinearGradient(0, top, 0, top + h * 0.45);
      rim.addColorStop(0, "rgba(255, 255, 255, 0.28)");
      rim.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.strokeStyle = rim;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      // 5. Glowing city markers (only those facing us, fading near the edge)
      const centre = [-rotation, TILT_DEG]; // lon/lat currently facing the viewer
      const pulse = 0.5 + 0.5 * Math.sin((now || 0) / 700);
      for (let i = 0; i < CITIES.length; i++) {
        const dist = geoDistance(CITIES[i], centre);
        if (dist > Math.PI / 2 - 0.05) continue;
        const p = projection(CITIES[i]);
        if (!p || p[1] > h) continue;
        const edgeFade = Math.min(1, (Math.PI / 2 - dist) * 2.5);
        const haloR = 10 + pulse * 4;
        const halo = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], haloR);
        halo.addColorStop(0, `rgba(255, 255, 255, ${0.45 * edgeFade})`);
        halo.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(p[0], p[1], haloR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(240, 240, 245, ${edgeFade})`;
        ctx.beginPath();
        ctx.arc(p[0], p[1], 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const resize = () => {
      w = wrap.clientWidth;
      h = wrap.clientHeight;
      if (!w || !h) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      draw(performance.now());
    };

    const tick = (now) => {
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      rotation += dt * (reduceMotion ? 1 : SPEED_DEG_PER_SEC);
      draw(now);
      if (!activeRef.current && now > stopAtRef.current) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    startRef.current = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    resize();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      startRef.current = null;
    };
  }, []);

  // Start / schedule-stop the loop whenever `active` changes.
  useEffect(() => {
    activeRef.current = active;
    if (active) {
      startRef.current?.();
    } else {
      stopAtRef.current = performance.now() + STOP_DELAY_MS;
    }
  }, [active]);

  return (
    <div ref={wrapRef} className="globe-wrap" aria-hidden="true">
      <canvas ref={canvasRef} className="globe-canvas" />
    </div>
  );
}

export default GlobeCanvas;
