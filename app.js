(function () {
  'use strict';
  const { SECTIONS, REFS, SOURCES, REF_SRC, DEFAULT_LIMITS, analyze, wordCount } = window.MakaleRules;
  const EXAMPLES = window.MakaleExamples;
  const STORE_KEY = 'makale-atolyesi:doc';
  const FINAL_KEY = 'makale-atolyesi:son-okuma';
  const LIMITS_KEY = 'makale-atolyesi:sinirlar';
  const $ = s => document.querySelector(s);
  const escHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const store = {
    get(k, def) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } }
  };

  // Bölüm başına hazır kalıp cümleler (tıklayınca imlecin olduğu yere eklenir)
  const STARTERS = {
    ozet: ['Bu çalışmanın amacı, … incelemektir.', 'Araştırma, … modeline göre tasarlanmıştır.', 'Çalışma grubunu … oluşturmaktadır.',
      'Veriler, … aracılığıyla toplanmıştır.', 'Bulgular, … olduğunu göstermiştir.', 'Sonuç olarak … söylenebilir.'],
    abstract: ['This study examined …', 'Data were collected from …', 'The results showed that …', 'These findings suggest that …'],
    giris: ['… konusu, son yıllarda … açısından önem kazanmıştır.', 'Literatürde … konusunu ele alan sınırlı sayıda çalışma bulunmaktadır.',
      'Bu çalışmanın amacı, … ortaya koymaktır.', 'Bu çalışma, … açısından önem taşımaktadır.', 'Bu doğrultuda araştırmada şu sorulara yanıt aranmıştır:'],
    yontem: ['Araştırmada … deseni kullanılmıştır.', 'Çalışma grubunu … oluşturmaktadır.', 'Veriler, … aracılığıyla toplanmıştır.', 'Verilerin analizinde … kullanılmıştır.', 'Araştırma için … Etik Kurulundan onay alınmıştır.'],
    bulgular: ['Tablo 1’de … sunulmuştur.', '… ile … arasında anlamlı bir ilişki bulunmuştur (r = …; p < …).', '… puan ortalamasının … olduğu belirlenmiştir.'],
    tartisma: ['Bu bulgu, … (Yazar, Yıl) çalışmasının sonuçlarıyla örtüşmektedir.', 'Buna karşın … (Yazar, Yıl) farklı bir sonuca ulaşmıştır.',
      'Elde edilen sonuç, … ile açıklanabilir.', 'Araştırmanın bazı sınırlılıkları bulunmaktadır.'],
    sonuc: ['Bu çalışmada … sonucuna ulaşılmıştır.', 'Bulgular doğrultusunda … önerilmektedir.', 'Gelecek araştırmalarda … incelenebilir.'],
    kaynakca: ['Soyad, A. (Yıl). Kitap adı. Yayınevi.', 'Soyad, A. ve Soyad, B. (Yıl). Makale başlığı. Dergi Adı, Cilt(Sayı), ss–ss.']
  };

  const FINAL_ITEMS = [
    'Başlık doğru, kısa ve anahtar kavramları içeriyor.',
    'Özet amaç, yöntem, bulgular ve sonucu içeriyor; derginin kelime sınırına ve biçimine uygun.',
    'Özette kaynak atfı ve ana metinde olmayan bilgi yok.',
    'Anahtar kelimeler derginin istediği sayıda ve başlıkla uyumlu.',
    'Giriş; bilinenleri, literatürdeki boşluğu ve çalışmanın amacını ortaya koyuyor.',
    'Yöntem; desen, katılımcılar, veri toplama, analiz ve etik onayı içeriyor.',
    'Bulgular yorumsuz; yorum ve literatür karşılaştırması Tartışma bölümünde.',
    'Tartışmada sınırlılıklar ve çalışmanın katkısı belirtildi.',
    'Sonuç, sunulan bulgulara dayanıyor ve ana mesajı veriyor.',
    'Metindeki her atıf kaynakçada, kaynakçadaki her eser metinde var.',
    'Gündelik dil, değer yargısı ve kaynaksız iddia yok.',
    'Terimler tutarlı; kısaltmalar ilk kullanımda açık yazıldı.',
    'Yazım ve noktalama TDK kurallarına göre kontrol edildi.',
    'Başkasına ait her bilgi için kaynak gösterildi; veriler olduğu gibi raporlandı.'
  ];

  // ---------- görünüm yönetimi ----------
  // Rehber ve Kaynaklar sekmeleri şimdilik kapalı; true yapınca kodlarıyla birlikte geri gelirler
  const GUIDE = false;
  document.documentElement.classList.toggle('no-guide', !GUIDE);

  function route() {
    if (!GUIDE && location.hash !== '#yaz' && location.hash !== '#fisler') history.replaceState(null, '', '#yaz');
    const h = location.hash || '#rehber';
    const view = h === '#yaz' ? 'yaz' : h === '#fisler' ? 'fisler' : (h === '#kaynaklar' || h.startsWith('#k-')) ? 'kaynaklar' : 'rehber';
    for (const v of ['rehber', 'fisler', 'yaz', 'kaynaklar']) document.getElementById('view-' + v).hidden = v !== view;
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.dataset.view === view));
    if (h.startsWith('#g-') || h.startsWith('#k-')) {
      const el = document.getElementById(h.slice(1));
      if (el) requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
      });
    } else window.scrollTo({ top: 0 });
  }
  window.addEventListener('hashchange', route);

  // İçindekiler: görünen bölümü vurgula
  const tocLinks = [...document.querySelectorAll('.toc a[href^="#g-"]')];
  const obs = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) tocLinks.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
  }, { rootMargin: '-30% 0px -60% 0px' });
  document.querySelectorAll('.chapter').forEach(c => obs.observe(c));

  // Son okuma listesi
  {
    const done = store.get(FINAL_KEY, {});
    $('#final-list').innerHTML = FINAL_ITEMS.map((t, i) =>
      `<label><input type="checkbox" data-i="${i}" ${done[i] ? 'checked' : ''}><span>${escHtml(t)}</span></label>`).join('');
    $('#final-list').addEventListener('change', e => { done[e.target.dataset.i] = e.target.checked; store.set(FINAL_KEY, done); });
  }

  // ---------- editör ----------
  let doc = store.get(STORE_KEY, {});
  let limits = { ...DEFAULT_LIMITS, ...store.get(LIMITS_KEY, {}) };
  let active = 'baslik';
  let filter = 'all';
  let result = null;

  const editor = $('#editor');
  editor.innerHTML = SECTIONS.map(s => {
    const field = s.kind === 'input'
      ? `<input type="text" id="f-${s.id}" data-sec="${s.id}" class="${s.id === 'baslik' ? 'title-input' : ''}" placeholder="${escHtml(s.placeholder || '')}" spellcheck="true">`
      : `<textarea id="f-${s.id}" data-sec="${s.id}" rows="${s.rows}" placeholder="${escHtml(s.placeholder || '')}" spellcheck="true"></textarea>`;
    const starters = (STARTERS[s.id] || []).map(t => `<button type="button" class="starter" data-sec="${s.id}">${escHtml(t)}</button>`).join('');
    return `<section class="sec" id="sec-${s.id}" data-sec="${s.id}">
      <div class="sec-head"><h3>${s.label}</h3>${s.optional ? '<span class="opt">isteğe bağlı</span>' : ''}<span class="badge empty" id="b-${s.id}">Boş</span><button type="button" class="sample-btn" data-sample="${s.id}" title="Bu bölüm için örnek metni A4 sayfada gösterir">Örnek metni göster</button></div>
      <p class="sec-hint">${escHtml(s.hint)} <a href="#${s.ref}">Rehberde gör →</a></p>
      ${field}
      <div class="sec-foot"><div class="starters">${starters ? '<span class="lbl">Kalıp ekle:</span>' + starters : ''}</div><span class="wcount" id="wc-${s.id}"></span></div>
    </section>`;
  }).join('');

  const fieldOf = id => document.getElementById('f-' + id);
  function fillFields() { for (const s of SECTIONS) fieldOf(s.id).value = doc[s.id] || ''; }
  fillFields();

  let timer = null, savedTimer = null;
  editor.addEventListener('input', e => {
    const id = e.target.dataset.sec;
    if (!id) return;
    doc[id] = e.target.value;
    clearTimeout(timer);
    timer = setTimeout(() => { save(); run(); }, 250);
  });
  editor.addEventListener('focusin', e => {
    const id = e.target.dataset.sec;
    if (!id || id === active) return;
    active = id;
    document.querySelectorAll('.sec').forEach(s => s.classList.toggle('focus', s.dataset.sec === id));
    renderPanel();
    markCurrent();
    scrollPreviewTo(id);
  });
  editor.addEventListener('click', e => {
    const sb = e.target.closest('.sample-btn');
    if (sb) { toggleSample(sb.dataset.sample); return; }
    const b = e.target.closest('.starter');
    if (!b) return;
    const el = fieldOf(b.dataset.sec);
    const text = b.textContent;
    const start = el.selectionStart ?? el.value.length, end = el.selectionEnd ?? el.value.length;
    const before = el.value.slice(0, start), after = el.value.slice(end);
    const sep = b.dataset.sec === 'kaynakca' ? (before && !before.endsWith('\n') ? '\n' : '') : (before && !/\s$/.test(before) ? ' ' : '');
    el.value = before + sep + text + after;
    const dots = text.indexOf('…');
    const caret = before.length + sep.length + (dots >= 0 ? dots : text.length);
    el.focus();
    el.setSelectionRange(caret, dots >= 0 ? caret + 1 : caret);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });

  // Fişler ekranından gelen metin ilgili bölümün sonuna yeni paragraf olarak eklenir
  document.addEventListener('makale:ekle', e => {
    const { sec, text } = e.detail;
    const cur = (doc[sec] || '').trim();
    doc[sec] = cur ? cur + '\n' + text : text;
    fillFields(); save(); run();
  });
  // Künyeler kaynakçada yoksa eklenir ve kaynakça alfabetik sıralanır; eklenen sayısı detail.added'e yazılır
  document.addEventListener('makale:kaynakca', e => {
    const cur = (doc.kaynakca || '').split('\n').map(x => x.trim()).filter(Boolean);
    const add = e.detail.lines.filter(l => !cur.includes(l));
    e.detail.added = add.length;
    if (!add.length) return;
    doc.kaynakca = [...cur, ...add].sort((a, b) => a.localeCompare(b, 'tr')).join('\n');
    fillFields(); save(); run();
  });

  function save() {
    const ok = store.set(STORE_KEY, doc);
    const el = $('#saved');
    el.textContent = ok ? 'Kaydedildi ✓' : 'Bu tarayıcıda kayıt yapılamıyor';
    clearTimeout(savedTimer);
    savedTimer = setTimeout(() => { el.textContent = 'Otomatik kaydedilir'; }, 1500);
  }

  // ---------- analiz ve panel ----------
  // Dergi sınırları ayarı
  function fillLimits() { for (const k in DEFAULT_LIMITS) document.getElementById('lim-' + k).value = limits[k]; }
  fillLimits();
  $('#limits').addEventListener('input', e => {
    const k = e.target.id && e.target.id.replace('lim-', '');
    if (!(k in DEFAULT_LIMITS)) return;
    const v = parseInt(e.target.value, 10);
    if (Number.isNaN(v) || v < 0) return;
    limits[k] = v;
    store.set(LIMITS_KEY, limits);
    run();
  });
  $('#lim-reset').addEventListener('click', () => { limits = { ...DEFAULT_LIMITS }; store.set(LIMITS_KEY, limits); fillLimits(); run(); });

  function run() {
    result = analyze(doc, limits);
    renderBadges();
    renderPanel();
    $('#st-count').textContent = result.stats.errors + result.stats.warns ? `· ${result.stats.errors + result.stats.warns}` : '';
    renderPreview();
  }

  // ---------- A4 önizleme ----------
  const SAMPLE = EXAMPLES.fatih;
  const sampleOn = new Set();
  const side = $('#side'), pagesEl = $('#pages'), pvScroll = $('#pv-scroll');
  const PH = {
    baslik: 'Makale başlığı', ozet: 'Özet metniniz burada görünecek.', anahtar: 'anahtar kelime 1, anahtar kelime 2, …',
    giris: 'Giriş metniniz burada görünecek.', yontem: 'Yöntem metniniz burada görünecek.', bulgular: 'Bulgular metniniz burada görünecek.',
    tartisma: 'Tartışma metniniz burada görünecek.', sonuc: 'Sonuç metniniz burada görünecek.', kaynakca: 'Kaynakçanız burada görünecek.'
  };
  const HEADINGS = [['giris', '1. Giriş'], ['yontem', '2. Yöntem'], ['bulgular', '3. Bulgular'], ['tartisma', '4. Tartışma'], ['sonuc', '5. Sonuç ve Öneriler']];
  let pvDirty = true;

  // Makaleyi sayfa düzenindeki bloklara çevirir; örneği açık bölümlerde kullanıcının metni yerine örnek gösterilir
  function buildBlocks() {
    const B = [];
    const isS = id => sampleOn.has(id);
    const val = id => (isS(id) ? SAMPLE[id] : (doc[id] || '')).trim();
    const tag = id => { if (isS(id)) B.push({ sec: id, cls: 'a4-tag', text: 'ÖRNEK METİN · yapay zekâ üretimi, gerçek bir çalışma değildir', keep: true }); };
    const paras = (id, cls) => {
      const v = val(id);
      if (!v) { B.push({ sec: id, cls: cls + ' ph', text: PH[id] }); return; }
      for (const p of v.split(/\n+/).map(x => x.trim()).filter(Boolean)) B.push({ sec: id, cls, text: p, sample: isS(id), split: true });
    };
    if (sampleOn.size || doc._sample) B.push({ cls: 'a4-warn', warn: true });
    tag('baslik');
    const t = val('baslik');
    B.push({ sec: 'baslik', cls: 'a4-title' + (t ? '' : ' ph'), text: t || PH.baslik, sample: isS('baslik') });
    tag('ozet');
    B.push({ sec: 'ozet', cls: 'a4-hc', text: 'Öz', keep: true });
    paras('ozet', 'a4-p a4-abs');
    tag('anahtar');
    const kw = val('anahtar');
    B.push({ sec: 'anahtar', cls: 'a4-kw' + (kw ? '' : ' ph'), label: 'Anahtar Kelimeler: ', text: kw || PH.anahtar, sample: isS('anahtar') });
    if (val('abstract') || val('keywords')) {
      tag('abstract');
      B.push({ sec: 'abstract', cls: 'a4-hc', text: 'Abstract', keep: true });
      if (val('abstract')) paras('abstract', 'a4-p a4-abs');
      tag('keywords');
      if (val('keywords')) B.push({ sec: 'keywords', cls: 'a4-kw', label: 'Keywords: ', text: val('keywords'), sample: isS('keywords') });
    }
    for (const [id, h] of HEADINGS) { tag(id); B.push({ sec: id, cls: 'a4-h', text: h, keep: true }); paras(id, 'a4-p'); }
    tag('kaynakca');
    B.push({ sec: 'kaynakca', cls: 'a4-h', text: 'Kaynakça', keep: true });
    paras('kaynakca', 'a4-ref');
    return B;
  }

  function makeNode(b, text) {
    const d = document.createElement('div');
    d.className = b.cls + (b.sample ? ' sample' : '');
    if (b.sec) d.dataset.sec = b.sec;
    if (b.keep) d.dataset.keep = '1';
    if (b.warn) {
      d.innerHTML = `<b>⚠ ${escHtml(EXAMPLES.disclaimer.title)}</b>${escHtml(EXAMPLES.disclaimer.text)}`
        + (doc._sample && !sampleOn.size ? '<br><button type="button" data-act="unflag">Metni kendim yeniden yazdım, uyarıyı kaldır</button>' : '');
      return d;
    }
    if (b.label) { const l = document.createElement('b'); l.textContent = b.label; d.append(l); }
    d.append(text ?? b.text);
    return d;
  }

  const pvVisible = () => pvScroll.offsetParent !== null && pvScroll.clientWidth > 0;

  function renderPreview() {
    if (!pvVisible()) { pvDirty = true; return; }
    pvDirty = false;
    const keepScroll = pvScroll.scrollTop;
    pagesEl.style.zoom = Math.min(1, (pvScroll.clientWidth - 24) / 794);
    const count = paginate(pagesEl, buildBlocks());
    $('#pv-pages').textContent = `${count} sayfa`;
    markCurrent();
    pvScroll.scrollTop = keepScroll;
  }

  // Blokları hedef kapsayıcıda A4 sayfalarına dağıtır; sayfa sayısını döndürür
  function paginate(target, blocks) {
    target.textContent = '';
    let body;
    const newPage = () => {
      const page = document.createElement('div'); page.className = 'page';
      body = document.createElement('div'); body.className = 'page-body';
      const no = document.createElement('div'); no.className = 'page-no';
      page.append(body, no); target.append(page);
    };
    const fits = () => body.scrollHeight <= body.clientHeight + 1;
    // Sayfa sonunda yalnız kalan başlıkları yeni sayfaya taşı
    const breakPage = () => {
      const moved = [];
      while (body.children.length > 1 && body.lastElementChild.dataset.keep) {
        const n = body.lastElementChild;
        n.remove();
        moved.unshift(n);
      }
      newPage();
      for (const m of moved) body.append(m);
    };
    newPage();
    for (const b of blocks) {
      let node = makeNode(b);
      body.append(node);
      if (fits()) continue;
      if (!b.split) { node.remove(); breakPage(); body.append(node); continue; }
      // Uzun paragrafı satır sınırından böl: sığan en çok kelimeyi bul, kalanı sonraki sayfaya aktar
      let words = b.text.split(/\s+/), cont = false, guard = 0;
      while (!fits() && guard++ < 60) {
        let lo = 0, hi = words.length - 1;
        while (lo < hi) {
          const mid = (lo + hi + 1) >> 1;
          node.textContent = words.slice(0, mid).join(' ');
          if (fits()) lo = mid; else hi = mid - 1;
        }
        if (lo === 0) { node.remove(); breakPage(); }
        else { node.textContent = words.slice(0, lo).join(' '); node.classList.add('brk'); words = words.slice(lo); newPage(); cont = true; }
        node = makeNode(b, words.join(' '));
        if (cont) node.classList.add('cont');
        body.append(node);
      }
    }
    const nos = target.querySelectorAll('.page-no');
    nos.forEach((n, i) => { n.textContent = i + 1; });
    return nos.length;
  }

  // PDF: A4 önizlemede ne görünüyorsa o; sayfalar ekran dışındaki tam boyutlu bir kopyaya dizilir,
  // tarayıcının "PDF olarak kaydet" yazdırmasıyla alınır
  function exportPdf() {
    let root = $('#print-root');
    if (!root) { root = document.createElement('div'); root.id = 'print-root'; root.lang = 'tr'; document.body.append(root); }
    paginate(root, buildBlocks());
    const oldTitle = document.title;
    document.title = fileBase(); // tarayıcı PDF dosya adını sayfa başlığından önerir
    const done = () => { document.title = oldTitle; root.textContent = ''; window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    window.print();
  }

  function markCurrent() {
    pagesEl.querySelectorAll('.cur').forEach(n => n.classList.remove('cur'));
    pagesEl.querySelectorAll(`[data-sec="${active}"]:not(.a4-h):not(.a4-hc):not(.a4-tag)`).forEach(n => n.classList.add('cur'));
  }

  function scrollPreviewTo(id) {
    if (!pvVisible()) return;
    const n = pagesEl.querySelector(`[data-sec="${id}"]`);
    if (!n) return;
    const top = n.getBoundingClientRect().top - pvScroll.getBoundingClientRect().top + pvScroll.scrollTop - 24;
    pvScroll.scrollTo({ top, behavior: 'smooth' });
  }

  function setSideTab(tab) {
    side.dataset.tab = tab;
    side.querySelectorAll('.st').forEach(b => b.classList.toggle('on', b.dataset.side === tab));
    if (tab === 'a4' && pvDirty) renderPreview();
  }
  side.querySelector('.side-tabs').addEventListener('click', e => { const b = e.target.closest('.st'); if (b) setSideTab(b.dataset.side); });

  function toggleSample(id) {
    if (sampleOn.has(id)) sampleOn.delete(id); else sampleOn.add(id);
    const btn = document.querySelector(`.sample-btn[data-sample="${id}"]`);
    btn.classList.toggle('on', sampleOn.has(id));
    btn.textContent = sampleOn.has(id) ? 'Örneği gizle' : 'Örnek metni göster';
    if (sampleOn.has(id) && side.dataset.tab !== 'a4' && getComputedStyle(side).display !== 'contents') setSideTab('a4');
    renderPreview();
    if (sampleOn.has(id)) scrollPreviewTo(id);
  }

  // A4'te bir yere tıklayınca ilgili yazma kutusuna git
  pagesEl.addEventListener('click', e => {
    if (e.target.dataset.act === 'unflag') { delete doc._sample; save(); renderPreview(); return; }
    const n = e.target.closest('[data-sec]');
    if (!n) return;
    document.getElementById('sec-' + n.dataset.sec).scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => fieldOf(n.dataset.sec).focus({ preventScroll: true }), 250);
  });

  let resizeTimer = null;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(renderPreview, 150); });
  window.addEventListener('hashchange', () => { if (location.hash === '#yaz') setTimeout(renderPreview, 0); });

  function renderBadges() {
    for (const s of SECTIONS) {
      const b = document.getElementById('b-' + s.id);
      const mine = result.issues.filter(i => i.section === s.id);
      const e = mine.filter(i => i.level === 'error').length, w = mine.filter(i => i.level === 'warn').length;
      const text = (doc[s.id] || '').trim();
      if (!text) { b.className = 'badge ' + (e ? 'err' : 'empty'); b.textContent = e ? 'Eksik' : 'Boş'; }
      else if (e) { b.className = 'badge err'; b.textContent = `${e} hata${w ? ` · ${w} uyarı` : ''}`; }
      else if (w) { b.className = 'badge warn'; b.textContent = `${w} uyarı`; }
      else { b.className = 'badge ok'; b.textContent = '✓ Uygun'; }

      const wc = document.getElementById('wc-' + s.id);
      if (s.id === 'anahtar' || s.id === 'keywords') {
        const n = text.split(/[,;]/).map(x => x.trim()).filter(Boolean).length;
        wc.textContent = `${n} kelime · hedef ${limits.kwMin}–${limits.kwMax}`; wc.classList.toggle('bad', !!text && (n < limits.kwMin || n > limits.kwMax));
      } else if (s.id === 'ozet' || s.id === 'abstract') {
        const n = wordCount(text);
        wc.textContent = `${n} / ${limits.absMin}–${limits.absMax} kelime`; wc.classList.toggle('bad', !!text && (n < limits.absMin || n > limits.absMax));
      } else if (s.id === 'baslik') {
        const n = wordCount(text);
        wc.textContent = `${n} kelime`; wc.classList.toggle('bad', !!text && (n < 4 || n > 20));
      } else if (s.id === 'kaynakca') {
        wc.textContent = `${text ? text.split('\n').filter(l => l.trim()).length : 0} kaynak`;
      } else wc.textContent = `${wordCount(text)} kelime`;
    }
  }

  function renderPanel() {
    if (!result) return;
    const { issues, stats, score, checklists } = result;
    const anyText = SECTIONS.some(s => (doc[s.id] || '').trim());

    $('#score').textContent = anyText ? score : '–';
    const fg = $('#ring-fg');
    fg.style.strokeDashoffset = 314.16 * (1 - (anyText ? score : 0) / 100);
    fg.style.stroke = score >= 80 ? 'var(--ok)' : score >= 50 ? 'var(--warn)' : 'var(--err)';
    $('#score-label').textContent = !anyText ? 'Yazmaya başlayın' : score >= 90 ? 'Kurallara büyük ölçüde uygun' : score >= 75 ? 'İyi gidiyor' : score >= 50 ? 'Geliştirilmeli' : 'Çok sayıda eksik var';
    $('#n-err').textContent = stats.errors; $('#n-warn').textContent = stats.warns; $('#n-info').textContent = stats.infos;
    $('#wc').textContent = `${stats.words} kelime (Türkçe bölümler)`;

    // Sıradaki adım: önce boş zorunlu bölümler, sonra ilk hata/uyarı
    const nextIssue = issues.find(i => i.level === 'error') || issues.find(i => i.level === 'warn');
    if (nextIssue) {
      const sec = SECTIONS.find(s => s.id === nextIssue.section);
      $('#next').innerHTML = `<b>Sıradaki adım · ${escHtml(sec.label)}</b><div>${escHtml(nextIssue.title)}</div><button class="btn" data-go="${issues.indexOf(nextIssue)}">Bölüme git</button>`;
    } else if (anyText) {
      $('#next').innerHTML = `<b>Harika!</b><div>Hata veya uyarı kalmadı. Göndermeden önce ${GUIDE ? '<a href="#g-9">son okuma listesini</a>' : 'son okuma listesini'} gözden geçirin.</div>`;
    } else {
      $('#next').innerHTML = `<b>Nereden başlamalı?</b><div>Başlıktan başlayın ya da nasıl görünmesi gerektiğini görmek için <b>Örnek makale yükle</b>’ye tıklayın.</div>`;
    }

    // Odaktaki bölümün kontrol listesi
    const sec = SECTIONS.find(s => s.id === active);
    const items = checklists[active] || [];
    $('#focus-box').innerHTML = items.length
      ? `<h4>${escHtml(sec.label)} · kontrol listesi</h4><div class="cl">${items.map(c => `<span class="${c.ok ? 'ok' : ''}">${escHtml(c.label)}</span>`).join('')}</div>`
      : '';

    // Bulgular listesi
    const onlyFocus = $('#only-focus').checked;
    const shown = issues.filter(i => (filter === 'all' || i.level === filter) && (!onlyFocus || i.section === active));
    if (!shown.length) {
      $('#issues').innerHTML = anyText
        ? `<div class="empty-state"><b>✓ Bu filtrede bulgu yok</b>${onlyFocus ? 'Bu bölüm kurallara uygun görünüyor.' : 'Metniniz denetlenen kurallara uygun.'}</div>`
        : `<div class="empty-state">Yazdıkça hatalar ve eksikler burada listelenecek.</div>`;
      return;
    }
    const lvName = { error: 'Hata', warn: 'Uyarı', info: 'Öneri' };
    let html = '', lastSec = null;
    for (const i of shown) {
      if (i.section !== lastSec) { html += `<div class="group-h">${escHtml(SECTIONS.find(s => s.id === i.section).label)}</div>`; lastSec = i.section; }
      html += `<div class="issue ${i.level}" data-go="${issues.indexOf(i)}">
        <div class="it"><span class="lvl">${lvName[i.level]}</span><span>${escHtml(i.title)}</span></div>
        <div class="im">${escHtml(i.message)}</div>
        ${i.fix ? `<div class="fix">${escHtml(i.fix)}</div>` : ''}
        <div class="refs">${i.ref ? `<a class="ref" href="#${i.ref}">📖 ${escHtml(REFS[i.ref] || 'Rehber')}</a>` : ''}${(REF_SRC[i.ref] || []).length
          ? `<span class="srcs">Kaynak: ${REF_SRC[i.ref].map(k => `<a href="#k-${k}">${escHtml(SOURCES[k])}</a>`).join('; ')}</span>` : ''}</div>
      </div>`;
    }
    $('#issues').innerHTML = html;
  }

  function goTo(issue) {
    const el = fieldOf(issue.section);
    document.getElementById('sec-' + issue.section).scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      el.focus({ preventScroll: true });
      if (issue.range) {
        // Önce imleci başa koyup odaklamak, uzun metinlerde textarea'nın seçime kaymasını sağlar
        el.setSelectionRange(issue.range.start, issue.range.start);
        el.blur(); el.focus({ preventScroll: true });
        el.setSelectionRange(issue.range.start, issue.range.end);
      } else {
        el.setSelectionRange(el.value.length, el.value.length);
      }
    }, 250);
  }

  $('#panel').addEventListener('click', e => {
    if (e.target.closest('a')) return;
    const g = e.target.closest('[data-go]');
    if (g && result) goTo(result.issues[+g.dataset.go]);
  });
  document.querySelectorAll('.f').forEach(b => b.addEventListener('click', () => {
    filter = b.dataset.f;
    document.querySelectorAll('.f').forEach(x => x.classList.toggle('on', x === b));
    renderPanel();
  }));
  $('#only-focus').addEventListener('change', renderPanel);

  // ---------- araç çubuğu ----------
  const hasContent = () => SECTIONS.some(s => (doc[s.id] || '').trim());
  function load(key) {
    if (hasContent() && !confirm('Mevcut metniniz silinip örnek yüklenecek. Devam edilsin mi?')) return;
    doc = { ...EXAMPLES[key], _sample: key };
    fillFields(); save(); run();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  $('#btn-sample').addEventListener('click', () => load('fatih'));
  $('#btn-bad').addEventListener('click', () => load('bad'));
  $('#btn-clear').addEventListener('click', () => {
    if (!hasContent() || !confirm('Tüm bölümler temizlensin mi? Bu işlem geri alınamaz.')) return;
    doc = {}; fillFields(); save(); run();
  });
  $('#btn-export').addEventListener('click', () => {
    const parts = [];
    for (const s of SECTIONS) {
      const t = (doc[s.id] || '').trim();
      if (!t) continue;
      if (s.id === 'baslik') parts.push(t.toLocaleUpperCase('tr-TR'));
      else if (s.id === 'anahtar') parts.push('Anahtar Kelimeler: ' + t);
      else if (s.id === 'keywords') parts.push('Keywords: ' + t);
      else parts.push(s.label.toLocaleUpperCase('tr-TR') + '\n\n' + t);
    }
    const blob = new Blob([parts.join('\n\n\n')], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileBase() + '.txt';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  function fileBase() { return (doc.baslik || 'makale').trim().slice(0, 60).replace(/[\\/:*?"<>|]/g, '') || 'makale'; }
  $('#btn-pdf').addEventListener('click', exportPdf);
  $('#pv-pdf').addEventListener('click', exportPdf);

  // ---------- uygulama olarak yükleme (PWA) ----------
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  const installBtn = $('#btn-install');
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  let installEvent = null;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    installEvent = e;
    installBtn.hidden = false;
  });
  installBtn.addEventListener('click', async () => {
    if (installEvent) {
      installEvent.prompt();
      await installEvent.userChoice;
      installEvent = null;
      installBtn.hidden = true;
    } else $('#install-tip').hidden = false;
  });
  window.addEventListener('appinstalled', () => { installBtn.hidden = true; });
  // iOS Safari yükleme penceresi sunmaz; kullanıcıya yolu göster
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (ios && !standalone) installBtn.hidden = false;
  $('#tip-close').addEventListener('click', () => { $('#install-tip').hidden = true; });

  route();
  run();
})();
