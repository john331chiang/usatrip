let SLIDES = [];
let idx = 0;

async function loadSlides() {
  const res = await fetch('slides.json', { cache: 'no-store' });
  const data = await res.json();
  SLIDES = data.slides || [];
}

function $(id){ return document.getElementById(id); }

// Wikipedia summary endpoint: thumbnail + extract
async function wikiSummary(q) {
  const encoded = encodeURIComponent(q.replace(/ /g, '_'));
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('no wiki');
  return await res.json();
}

const FALLBACK =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#17223b"/>
        <stop offset="1" stop-color="#0f1a30"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <text x="50%" y="45%" fill="#b9c6ea" font-size="42" font-family="Arial" text-anchor="middle" dominant-baseline="middle">
      Image will load here
    </text>
    <text x="50%" y="55%" fill="#b9c6ea" font-size="18" font-family="Arial" text-anchor="middle" dominant-baseline="middle">
      (Wikipedia thumbnail, if available)
    </text>
  </svg>`);

async function setImage(slide){
  const img = $('img');
  const note = $('imgNote');
  note.textContent = '';
  img.src = FALLBACK;

  const tries = [slide.image, slide.title].filter(Boolean);
  for (const q of tries){
    try{
      const sum = await wikiSummary(q);
      const src = sum?.thumbnail?.source;
      if (src){
        img.src = src;
        note.textContent = 'Wikipedia image';
        return;
      }
    }catch(e){}
  }
  note.textContent = 'No Wikipedia image found';
}

function render(){
  if (!SLIDES.length) return;

  const slide = SLIDES[idx];
  $('crumb').textContent = `${slide.section} • Slide ${slide.id} / ${SLIDES.length}`;
  $('title').textContent = slide.title || '';
  $('subtitle').textContent = slide.subtitle || '';

  const ul = $('bullets');
  ul.innerHTML = '';
  (slide.bullets || []).forEach(t => {
    const li = document.createElement('li');
    li.textContent = t;
    ul.appendChild(li);
  });

  $('counter').textContent = `Slide ${slide.id} of ${SLIDES.length}`;
  $('bar').style.width = `${(slide.id / SLIDES.length) * 100}%`;

  document.querySelectorAll('.item').forEach(el => el.classList.remove('active'));
  const active = document.querySelector(`.item[data-i="${idx}"]`);
  if (active) active.classList.add('active');

  setImage(slide);
}

function buildList(){
  const list = $('list');
  list.innerHTML = '';
  SLIDES.forEach((s, i) => {
    const el = document.createElement('div');
    el.className = 'item';
    el.dataset.i = i;
    el.dataset.q = (s.title + ' ' + (s.section||'') + ' ' + (s.image||'')).toLowerCase();
    el.innerHTML = `
      <div class="k">
        <div><strong>${String(s.id).padStart(2,'0')}</strong> — ${s.title}</div>
        <span class="badge">${s.section}</span>
      </div>
    `;
    el.addEventListener('click', () => { idx = i; render(); });
    list.appendChild(el);
  });
}

function prev(){ idx = (idx - 1 + SLIDES.length) % SLIDES.length; render(); }
function next(){ idx = (idx + 1) % SLIDES.length; render(); }

function wire(){
  $('btnPrev').addEventListener('click', prev);
  $('btnNext').addEventListener('click', next);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  $('search').addEventListener('input', () => {
    const q = $('search').value.trim().toLowerCase();
    document.querySelectorAll('.item').forEach(el => {
      el.style.display = el.dataset.q.includes(q) ? '' : 'none';
    });
  });
}

(async function init(){
  await loadSlides();
  buildList();
  wire();
  render();
})();
