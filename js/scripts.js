// scripts.js (module)
// Animaciones e interacciones "pro" - guardá como module (type="module")
// Comentarios en español para que puedas modificar fácil.

const ease = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* Cursor glow seguimiento suave */
(() => {
  const glow = document.getElementById('cursorGlow');
  let mouse = { x: window.innerWidth/2, y: window.innerHeight/2 };
  let pos = { x: mouse.x, y: mouse.y };
  window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  function frame() {
    pos.x = ease(pos.x, mouse.x, 0.14);
    pos.y = ease(pos.y, mouse.y, 0.14);
    glow.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`;
    requestAnimationFrame(frame);
  }
  frame();

  // Cambiar tamaño del glow sobre elementos claves
  const bigables = document.querySelectorAll('a, button, .bento-card, .group');
  bigables.forEach(el => {
    el.addEventListener('mouseenter', () => glow.setAttribute('data-cursor', 'big'));
    el.addEventListener('mouseleave', () => glow.removeAttribute('data-cursor'));
  });
})();

/* Tilt 3D para tarjetas (.card-tilt y .bento-card) */
(() => {
  const cards = document.querySelectorAll('.card-tilt, .card-project, .card-cta, .bento-card');
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  cards.forEach(card => {
    let rect = null;
    
    // Skip tilt effects on touch devices for better performance
    if (isTouchDevice) {
      card.classList.add('card-float');
      return;
    }
    
    card.addEventListener('mousemove', (e) => {
      rect = rect || card.getBoundingClientRect();
      const cx = rect.left + rect.width/2;
      const cy = rect.top + rect.height/2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const px = (dx / rect.width) * 30; // porcentaje
      const py = (dy / rect.height) * 30;
      const rx = clamp(-py, -12, 12);
      const ry = clamp(px, -12, 12);
      const s = 1.02;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`;
      // cambiar shine position via css var para pseudo
      const shineX = ((e.clientX - rect.left) / rect.width) * 100;
      const shineY = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--shine-x', `${shineX}%`);
      card.style.setProperty('--shine-y', `${shineY}%`);
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.setProperty('--shine-x', `50%`);
      card.style.setProperty('--shine-y', `50%`);
      rect = null;
    });

    // small floating offset desynchronized
    card.classList.add('card-float');
  });
})();

/* Reveal on scroll (IntersectionObserver) */
(() => {
  const reveals = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach(r => obs.observe(r));
})();

/* Portrait background lazy set + parallax micro-move */
(() => {
  const portraits = document.querySelectorAll('.card-portrait');
  portraits.forEach(p => {
    const url = p.dataset.bg;
    const bgEl = p.querySelector('.portrait-bg');
    if (bgEl && url) bgEl.style.backgroundImage = `url("${url}")`;
    // parallax on mousemove inside portrait
    p.addEventListener('mousemove', (e) => {
      const rect = p.getBoundingClientRect();
      const rx = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
      const ry = ((e.clientY - rect.top) / rect.height - 0.5) * 6;
      bgEl.style.transform = `translate(${rx}px, ${ry}px) scale(1.03)`;
    });
    p.addEventListener('mouseleave', () => { bgEl.style.transform = ''; });
  });
})();

/* Marquee: pausa on hover (ya en CSS) + speed control with wheel */
(() => {
  const m = document.getElementById('marquee');
  if (!m) return;
  let base = 30; // segundos
  m.addEventListener('wheel', (ev) => {
    ev.preventDefault();
    base = clamp(base + (ev.deltaY > 0 ? 3 : -3), 8, 80);
    m.style.animationDuration = `${base}s`;
  }, { passive: false });
})();

/* Typing / loop words in hero */
(() => {
  const el = document.querySelector('.hero-subtitle');
  if (!el) return;
  const phrases = [
    'Construyendo bases y soluciones enfocado en <span class="word-pop">programación y datos</span>.',
    'Convirtiendo ideas simples en <span class="word-pop">soluciones funcionales</span>.',
    'Estudiante de <span class="word-pop">Ingeniería de Sistemas</span> con productos reales, funcionales y modernos.',
  ];
  let idx = 0;
  function setPhrase(i) {
    el.classList.add('typing');
    el.innerHTML = phrases[i];
    setTimeout(() => el.classList.remove('typing'), 1500);
  }
  setPhrase(idx);
  setInterval(() => {
    idx = (idx + 1) % phrases.length;
    // animate fade out/in
    el.style.transition = 'opacity .35s';
    el.style.opacity = 0;
    setTimeout(() => {
      setPhrase(idx);
      el.style.opacity = 1;
    }, 380);
  }, 4200);
})();

/* Nav active link on scroll */
(() => {
  const sections = [...document.querySelectorAll('main section[id]')];
  const links = [...document.querySelectorAll('.nav-link')];
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        const id = en.target.id;
        links.forEach(l => l.classList.toggle('text-primary', l.getAttribute('href') === `#${id}`));
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => obs.observe(s));
})();

/* Mobile Menu Toggle */
(() => {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  
  if (!mobileMenuBtn || !mobileMenu) return;
  
  let isOpen = false;
  
  function toggleMenu() {
    isOpen = !isOpen;
    
    if (isOpen) {
      mobileMenu.classList.remove('opacity-0', 'pointer-events-none');
      mobileMenu.classList.add('opacity-100');
      document.body.style.overflow = 'hidden';
      
      // Animate hamburger to X
      const spans = mobileMenuBtn.querySelectorAll('span');
      spans[0].style.transform = 'rotate(45deg) translate(2px, 2px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(2px, -2px)';
    } else {
      mobileMenu.classList.add('opacity-0', 'pointer-events-none');
      mobileMenu.classList.remove('opacity-100');
      document.body.style.overflow = '';
      
      // Reset hamburger
      const spans = mobileMenuBtn.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  }
  
  mobileMenuBtn.addEventListener('click', toggleMenu);
  
  // Close menu when clicking links
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (isOpen) toggleMenu();
    });
  });
  
  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) toggleMenu();
  });
})();

/* Small utility: animate numeric counters (if any) */
(() => {
  const nums = document.querySelectorAll('[data-count]');
  nums.forEach(el => {
    const target = Number(el.dataset.count);
    let v = 0;
    const step = Math.max(1, Math.floor(target / 60));
    function tick() {
      v += step;
      if (v >= target) el.textContent = target.toLocaleString();
      else { el.textContent = v.toLocaleString(); requestAnimationFrame(tick); }
    }
    tick();
  });
})();
