(() => {
  'use strict';
  const coarsePointer = window.matchMedia('(pointer: coarse)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!coarsePointer.matches || reducedMotion.matches) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'touch-atmosphere';
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, { position: 'fixed', inset: '0', zIndex: '46', width: '100%', height: '100%', pointerEvents: 'none', touchAction: 'pan-y', mixBlendMode: 'screen' });
  document.body.appendChild(canvas);

  const context = canvas.getContext('2d', { alpha: true });
  let width = 1, height = 1, dpr = 1, frame = 0, active = false;
  let alpha = 0, targetAlpha = 0;
  let x = window.innerWidth * 0.53, y = window.innerHeight * 0.47, targetX = x, targetY = y;
  let lastTime = performance.now();
  const particles = [];
  const maxParticles = 26;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2); width = Math.max(1, window.innerWidth); height = Math.max(1, window.innerHeight);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function setPointer(event, strength) {
    targetX = event.clientX; targetY = event.clientY; targetAlpha = strength;
    document.documentElement.style.setProperty('--pointer-x', `${targetX}px`);
    document.documentElement.style.setProperty('--pointer-y', `${targetY}px`);
    document.documentElement.style.setProperty('--pointer-active', String(strength));
  }
  function burst() {
    for (let index = 0; index < maxParticles; index += 1) {
      const angle = Math.random() * Math.PI * 2, speed = 10 + Math.random() * 34;
      particles.push({ x: targetX, y: targetY, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size: .5 + Math.random() * 1.55, life: .5 + Math.random() * .8, age: 0 });
    }
    if (particles.length > maxParticles * 2) particles.splice(0, particles.length - maxParticles * 2);
  }
  function onPointerDown(event) { if (event.pointerType === 'mouse') return; active = true; setPointer(event, 1); burst(); if (!frame) frame = requestAnimationFrame(render); }
  function onPointerMove(event) { if (!active || event.pointerType === 'mouse') return; setPointer(event, .86); }
  function releasePointer(event) { if (event.pointerType === 'mouse') return; active = false; targetAlpha = 0; document.documentElement.style.setProperty('--pointer-active', '0'); }
  function render(now) {
    const elapsed = Math.min(.05, (now - lastTime) / 1000); lastTime = now;
    x += (targetX - x) * .16; y += (targetY - y) * .16; alpha += (targetAlpha - alpha) * (active ? .16 : .05);
    context.clearRect(0, 0, width, height);
    if (alpha > .008) {
      const gradient = context.createRadialGradient(x, y, 0, x, y, 108);
      gradient.addColorStop(0, `rgba(180, 148, 207, ${alpha * .18})`); gradient.addColorStop(.45, `rgba(136, 88, 176, ${alpha * .07})`); gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      context.fillStyle = gradient; context.fillRect(x - 108, y - 108, 216, 216);
    }
    for (let index = particles.length - 1; index >= 0; index -= 1) {
      const particle = particles[index]; particle.age += elapsed;
      if (particle.age >= particle.life) { particles.splice(index, 1); continue; }
      particle.x += particle.vx * elapsed; particle.y += particle.vy * elapsed; particle.vx *= .975; particle.vy *= .975;
      context.fillStyle = `rgba(218, 211, 224, ${(1 - particle.age / particle.life) * .55})`;
      context.beginPath(); context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2); context.fill();
    }
    if (active || alpha > .008 || particles.length) frame = requestAnimationFrame(render); else frame = 0;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointerdown', onPointerDown, { passive: true });
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerup', releasePointer, { passive: true });
  window.addEventListener('pointercancel', releasePointer, { passive: true });
  window.addEventListener('pointerleave', releasePointer, { passive: true });
})();
