/* Fişler ekranı: kaynak (künye) fişleri ve bilgi (not) fişleri.
   Makaleye ve kaynakçaya aktarım, app.js'e "makale:ekle" ve "makale:kaynakca" olaylarıyla yapılır. */
(function () {
  'use strict';
  const KEY = 'makale-atolyesi:fisler';
  const $ = s => document.querySelector(s);
  const escHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, def) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } }
  };
  const words = s => ((s || '').trim().match(/\S+/g) || []).length;
  const lines = s => (s || '').split('\n').map(x => x.trim()).filter(Boolean);
  const trim = s => (s || '').trim();

  const TURLER = {
    alinti: { label: 'Doğrudan alıntı', kural: 'tırnak içinde', hint: 'Kaynaktaki ifadeyi hiç değiştirmeden yazın; tırnak işaretlerini uygulama ekler. Sayfa numarası zorunludur.' },
    ozet: { label: 'Özet', kural: 'kendi cümlelerinle', hint: 'Okuduğunuz bilgiyi kendi cümlelerinizle kısaca yazın; kaynak ve sayfa yine gösterilir.' },
    yorum: { label: 'Yorum', kural: '[Yorumum] ile işaretle', hint: 'Kendi düşüncenizi yazın; fişte [Yorumum] diye işaretlenir. Yorum bir kaynağa dairse kaynağı da seçebilirsiniz.' }
  };
  const BOLUMLER = [['', 'Henüz belli değil'], ['giris', 'Giriş'], ['yontem', 'Yöntem'], ['bulgular', 'Bulgular'], ['tartisma', 'Tartışma'], ['sonuc', 'Sonuç ve Öneriler']];
  const bolumAdi = id => (BOLUMLER.find(b => b[0] === id) || BOLUMLER[0])[1];
  const KAYNAK_TUR = { makale: 'Makale', kitap: 'Kitap', bolum: 'Kitapta bölüm', tez: 'Tez', web: 'Web' };

  let data = store.get(KEY, null) || { kaynaklar: [], bilgiler: [], kNo: 0, bNo: 0 };
  data.bilgiler.forEach(b => { if (!TURLER[b.tur]) b.tur = 'ozet'; });
  const kaynakOf = b => data.kaynaklar.find(k => k.id === b.kaynak);
  // Numaralar: kaynak fişi K-12; not fişi kaynak no / o kaynaktaki sırası (12/3), kaynaksızsa F-5
  const kNo = k => `K-${k.no}`;
  function fisNo(b) {
    const k = kaynakOf(b);
    if (!k) return `F-${b.no ?? data.bNo + 1}`;
    const once = data.bilgiler.filter(x => x.kaynak === k.id && x.id !== b.id && (b.no == null || x.no < b.no)).length;
    return `${k.no}/${once + 1}`;
  }

  let statusTimer = null;
  function status(msg) {
    const el = $('#fis-status');
    el.textContent = msg;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { el.textContent = 'Otomatik kaydedilir'; }, 2500);
  }
  function save(msg) {
    const ok = store.set(KEY, data);
    status(ok ? (msg || 'Kaydedildi ✓') : 'Bu tarayıcıda kayıt yapılamıyor');
  }

  // ---------- künye ve atıf (APA 7) ----------
  // "Buysse, Daniel J." → "Buysse, D. J."; virgülsüz girdiler (kurum, tek ad) olduğu gibi kalır
  function apaName(n) {
    const i = n.indexOf(',');
    if (i < 0) return n;
    const sur = n.slice(0, i).trim();
    const given = n.slice(i + 1).replace(/\./g, ' ').split(/\s+/).filter(Boolean)
      .map(p => p.split('-').filter(Boolean).map(x => x[0].toLocaleUpperCase('tr-TR') + '.').join('-')).join(' ');
    return given ? `${sur}, ${given}` : sur;
  }
  function authorList(names) {
    const a = names.map(apaName);
    if (a.length <= 1) return a[0] || '';
    if (a.length > 20) return a.slice(0, 19).join(', ') + ', … ' + a[a.length - 1];
    return a.slice(0, -1).join(', ') + ', & ' + a[a.length - 1];
  }
  // "Ruşen Sezer" → "R. Sezer" (APA'da çevirmen ve editör adı baş harfle önce yazılır)
  function initialsFirst(n) {
    const p = trim(n).split(/\s+/);
    return p.length < 2 ? trim(n) : p.slice(0, -1).map(x => x[0].toLocaleUpperCase('tr-TR') + '.').join(' ') + ' ' + p[p.length - 1];
  }
  // Not fişlerinin altındaki kısa kaynak adı: girilen kısa ad, yoksa başlığın iki noktadan önceki ilk dört kelimesi
  const kisaAd = k => trim(k.kisa) || trim(k.baslik).split(':')[0].split(/\s+/).slice(0, 4).join(' ');
  const endDot = s => /[.?!]$/.test(s) ? s : s + '.';
  const dash = s => trim(s).replace(/\s*[-–—]\s*/g, '–');
  const doiUrl = s => { s = trim(s); return /^10\./.test(s) ? 'https://doi.org/' + s : s.replace(/^doi:\s*/i, 'https://doi.org/'); };

  function kunye(k) {
    const au = authorList(lines(k.yazarlar));
    const yil = `(${trim(k.yil) || 't.y.'}).`;
    let t = trim(k.baslik);
    if (k.tur === 'tez') t += ` [${k.teztur || 'Tez'}${trim(k.universite) ? ', ' + trim(k.universite) : ''}]`;
    if ((k.tur === 'kitap' || k.tur === 'bolum') && trim(k.cevirmen)) t += ` (${initialsFirst(k.cevirmen)}, Çev.)`;
    t = t ? endDot(t) : '';
    const p = au ? [endDot(au), yil, t] : [t, yil];
    if (k.tur === 'makale') {
      let src = trim(k.dergi);
      if (trim(k.cilt)) src += (src ? ', ' : '') + trim(k.cilt) + (trim(k.sayi) ? `(${trim(k.sayi)})` : '');
      if (trim(k.sayfalar)) src += (src ? ', ' : '') + dash(k.sayfalar);
      if (src) p.push(src + '.');
    } else if (k.tur === 'bolum') {
      const eds = lines(k.editorler);
      let s = eds.length ? `${eds.length > 2 ? eds.slice(0, -1).join(', ') + ' ve ' + eds[eds.length - 1] : eds.join(' ve ')} (Ed.), ` : '';
      s += trim(k.kitap) + ' içinde' + (trim(k.bsayfalar) ? ` (ss. ${dash(k.bsayfalar)})` : '') + '.';
      p.push(s);
    } else if (k.tur === 'web' && trim(k.site)) p.push(endDot(trim(k.site)));
    if ((k.tur === 'kitap' || k.tur === 'bolum') && trim(k.yayinevi)) p.push(endDot(trim(k.yayinevi)));
    if (trim(k.doi)) p.push(doiUrl(k.doi));
    return p.filter(Boolean).join(' ');
  }

  // Metin içi atıf: (Soyad, Yıl) · (Soyad ve Soyad, Yıl) · (Soyad vd., Yıl); sayfa varsa s./ss. eklenir
  function atifIc(k, sayfa) {
    const s = lines(k.yazarlar).map(n => n.split(',')[0].trim());
    const who = !s.length ? (trim(k.baslik) || 'Anonim') : s.length === 1 ? s[0] : s.length === 2 ? `${s[0]} ve ${s[1]}` : `${s[0]} vd.`;
    let r = `${who}, ${trim(k.yil) || 't.y.'}`;
    if (trim(sayfa)) r += /[-–—]/.test(sayfa) ? `, ss. ${dash(sayfa)}` : `, s. ${trim(sayfa)}`;
    return r;
  }
  const atif = (k, sayfa) => `(${atifIc(k, sayfa)})`;

  // Fişin makaleye girecek hâli: alıntı tırnak içinde, atıf cümle sonundaki noktadan önce
  function metin(b) {
    const ic = trim(b.icerik).replace(/\s*\n+\s*/g, ' ');
    if (!ic) return '';
    const k = kaynakOf(b);
    if (b.tur === 'yorum') return ic;
    if (b.tur === 'alinti') {
      const q = `“${ic.replace(/^["“”']+|["“”']+$/g, '')}”`;
      return k ? `${q} ${atif(k, b.sayfa)}.` : q;
    }
    return k ? ic.replace(/[.\s]+$/, '') + ` ${atif(k, b.sayfa)}.` : ic;
  }

  // ---------- fiş kuralları ----------
  function kaynakSorunlari(k) {
    const out = [];
    const au = lines(k.yazarlar);
    if (!au.length) out.push(['warn', 'Yazar yok. Yazarı belli olmayan eserlerde kurum adını yazın.']);
    else if (au.some(n => !n.includes(',') && /\s/.test(n))) out.push(['info', 'Bir yazar “Soyad, Ad” biçiminde yazılmamış. Kurum adı değilse düzeltin.']);
    // Fişte soyadı zaten büyük harfe çevrilir; büyük yazılırsa kaynakçada da büyük çıkar
    if (au.some(n => { const s = n.split(',')[0].trim(); return n.includes(',') && s.length > 1 && s === s.toLocaleUpperCase('tr-TR'); }))
      out.push(['warn', 'Soyadını büyük harfle yazmayın (ör. “İnalcık, Halil”). Fişte otomatik büyük harfe çevrilir; kaynakçada APA’ya göre normal yazılmalıdır.']);
    if (!/^\d{4}[a-z]?$/.test(trim(k.yil))) out.push(['err', 'Yıl eksik ya da hatalı; dört haneli olmalı.']);
    if (!trim(k.baslik)) out.push(['err', 'Başlık eksik.']);
    if (k.tur === 'makale') {
      if (!trim(k.dergi)) out.push(['err', 'Dergi adı eksik.']);
      if (!trim(k.cilt)) out.push(['warn', 'Cilt numarası eksik.']);
      if (!trim(k.sayfalar)) out.push(['warn', 'Makalenin sayfa aralığı eksik.']);
      if (!trim(k.doi)) out.push(['info', 'Makalenin DOI numarası varsa ekleyin.']);
    }
    if (k.tur === 'kitap' && !trim(k.yayinevi)) out.push(['err', 'Yayınevi eksik.']);
    if (k.tur === 'bolum') {
      if (!trim(k.kitap)) out.push(['err', 'Bölümün yer aldığı kitabın adı eksik.']);
      if (!trim(k.bsayfalar)) out.push(['warn', 'Bölümün sayfa aralığı eksik.']);
      if (!trim(k.yayinevi)) out.push(['warn', 'Yayınevi eksik.']);
    }
    if (k.tur === 'tez' && !trim(k.universite)) out.push(['err', 'Tezin yapıldığı üniversite eksik.']);
    if (k.tur === 'web' && !trim(k.doi)) out.push(['err', 'Web kaynağının URL’si eksik.']);
    const same = data.kaynaklar.find(o => o.id !== k.id && ((trim(k.doi) && trim(o.doi).toLowerCase() === trim(k.doi).toLowerCase())
      || (trim(k.baslik) && trim(o.baslik).toLocaleLowerCase('tr-TR') === trim(k.baslik).toLocaleLowerCase('tr-TR'))));
    if (same) out.push(['warn', `Bu kaynak için zaten bir fiş var (${kNo(same)}). Her kaynak için tek kaynak fişi açılır.`]);
    return out;
  }

  function bilgiSorunlari(b) {
    const out = [];
    const wc = words(b.icerik);
    const k = kaynakOf(b);
    if (!wc) out.push(['err', 'İçerik boş.']);
    if (b.tur !== 'yorum' && !k) out.push(['err', 'Kaynak seçilmemiş. Doğrudan alıntı ve özette kaynak gösterilmesi zorunludur.']);
    if (b.tur === 'alinti' && !trim(b.sayfa)) out.push(['err', 'Doğrudan alıntıda sayfa numarası zorunludur.']);
    if (b.tur === 'ozet' && k && !trim(b.sayfa)) out.push(['info', 'Sayfa numarasını da yazın; bilgiye geri dönmeyi kolaylaştırır.']);
    if (b.tur === 'alinti' && wc > 40) out.push(['warn', `Alıntı ${wc} kelime. 40 kelimeden uzun alıntılar tırnaksız, ayrı ve girintili paragraf olarak verilir; alıntıyı kısaltmayı ya da özetlemeyi düşünün.`]);
    if (b.tur !== 'alinti' && /["“][^"”]{25,}["”]/.test(b.icerik || '')) out.push(['warn', 'Tırnak içinde uzun bir ifade var. Kaynaktan aynen aktarılan ifadeleri ayrı bir doğrudan alıntı fişine yazın.']);
    if (wc > 120) out.push(['warn', `Fiş ${wc} kelime. Her fişe tek bir bilgi yazılır; bu notu birkaç fişe bölmeyi düşünün.`]);
    if (!trim(b.konu)) out.push(['warn', 'Konu başlığı yok. Fişler konu başlığına göre sınıflanır.']);
    return out;
  }

  const sorunHtml = list => list.length
    ? `<ul class="fis-issues">${list.map(([lv, t]) => `<li class="${lv}">${escHtml(t)}</li>`).join('')}</ul>` : '';

  // ---------- liste ----------
  const fTur = $('#fis-f-tur'), fBolum = $('#fis-f-bolum'), fKaynak = $('#fis-f-kaynak'), fQ = $('#fis-q');
  fTur.innerHTML = '<option value="">Tüm türler</option>' + Object.entries(TURLER).map(([v, t]) => `<option value="${v}">${t.label}</option>`).join('');
  fBolum.innerHTML = '<option value="*">Tüm bölümler</option>' + BOLUMLER.map(([v, l]) => `<option value="${v}">${l}</option>`).join('');

  function kaynakOptions(sel, first) {
    sel.innerHTML = first + data.kaynaklar.map(k => `<option value="${k.id}">${kNo(k)} · ${escHtml(atifIc(k))}</option>`).join('');
  }

  function render() {
    const keep = fKaynak.value;
    kaynakOptions(fKaynak, '<option value="">Tüm kaynaklar</option><option value="-">Kaynaksız</option>');
    fKaynak.value = [...fKaynak.options].some(o => o.value === keep) ? keep : '';

    $('#fis-k-count').textContent = data.kaynaklar.length || '';
    $('#fis-kaynaklar').innerHTML = data.kaynaklar.length ? data.kaynaklar.map(k => {
      const n = data.bilgiler.filter(b => b.kaynak === k.id).length;
      return `<article class="fis-card kaynak" data-id="${k.id}">
        <header><span class="fis-no">${kNo(k)}</span><span class="fis-tag">${KAYNAK_TUR[k.tur] || ''}</span><span class="fis-side">${n ? `${n} not fişi` : 'not fişi yok'}</span></header>
        <p class="fis-kunye">${escHtml(kunye(k))}</p>
        ${trim(k.not) ? `<p class="fis-note">${escHtml(k.not)}</p>` : ''}
        ${sorunHtml(kaynakSorunlari(k))}
        <footer class="fis-actions">
          <button type="button" data-act="cite">Atıfı kopyala</button>
          ${n ? '<button type="button" data-act="show">Fişlerini göster</button>' : ''}
          <button type="button" data-act="add-b">+ Not fişi</button>
          <button type="button" data-act="pdf">PDF</button>
          <button type="button" data-act="edit">Düzenle</button>
          <button type="button" data-act="del" class="danger">Sil</button>
        </footer>
      </article>`;
    }).join('') : '<div class="empty-state">Henüz kaynak fişi yok.<br>Okuduğunuz her kaynak için bir kaynak fişi açın.</div>';

    const q = fQ.value.trim().toLocaleLowerCase('tr-TR');
    const shown = data.bilgiler.filter(b => (!fTur.value || b.tur === fTur.value)
      && (fBolum.value === '*' || (b.bolum || '') === fBolum.value)
      && (!fKaynak.value || (fKaynak.value === '-' ? !kaynakOf(b) : b.kaynak === fKaynak.value))
      && (!q || `${b.konu} ${b.icerik}`.toLocaleLowerCase('tr-TR').includes(q)));
    $('#fis-b-count').textContent = data.bilgiler.length ? (shown.length === data.bilgiler.length ? data.bilgiler.length : `${shown.length} / ${data.bilgiler.length}`) : '';
    $('#fis-bilgiler').innerHTML = shown.length ? shown.map(b => {
      const k = kaynakOf(b);
      const body = b.tur === 'alinti' ? `“${trim(b.icerik)}”` : trim(b.icerik);
      return `<article class="fis-card bilgi t-${b.tur}" data-id="${b.id}">
        <header><span class="fis-no">${fisNo(b)}</span><span class="fis-tag">${TURLER[b.tur].label}</span><span class="fis-side">${escHtml(bolumAdi(b.bolum))}</span></header>
        <h4>${trim(b.konu) ? escHtml(b.konu) : '<i>Konu başlığı yok</i>'}</h4>
        <p class="fis-body">${escHtml(body)}</p>
        <p class="fis-src">${k ? `${kNo(k)} · ${escHtml(atif(k, b.sayfa))}` : b.tur === 'yorum' ? 'Kendi düşüncem' : 'Kaynak seçilmemiş'}${b.kullanildi ? ' · <span class="fis-used">✓ makalede kullanıldı</span>' : ''}</p>
        ${sorunHtml(bilgiSorunlari(b))}
        <footer class="fis-actions">
          ${b.bolum ? `<button type="button" data-act="insert" class="go">→ ${escHtml(bolumAdi(b.bolum))} bölümüne ekle</button>` : ''}
          <button type="button" data-act="copy">Metni kopyala</button>
          <button type="button" data-act="pdf">PDF</button>
          <button type="button" data-act="edit">Düzenle</button>
          <button type="button" data-act="del" class="danger">Sil</button>
        </footer>
      </article>`;
    }).join('') : `<div class="empty-state">${data.bilgiler.length ? 'Bu filtrede fiş yok.' : 'Henüz not fişi yok.<br>Her bilgi ya da alıntı için ayrı bir not fişi açın.'}</div>`;
  }

  [fTur, fBolum, fKaynak].forEach(el => el.addEventListener('change', render));
  fQ.addEventListener('input', render);

  // ---------- kopyalama ve makaleye aktarım ----------
  function copy(text, what) {
    const done = () => status(`${what} kopyalandı ✓`);
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, () => status('Kopyalanamadı'));
    else status('Bu tarayıcı kopyalamayı desteklemiyor');
  }
  function toKaynakca(list) {
    const ev = new CustomEvent('makale:kaynakca', { detail: { lines: list, added: 0 } });
    document.dispatchEvent(ev);
    return ev.detail.added;
  }

  function onListClick(e) {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const card = btn.closest('.fis-card');
    const isK = card.classList.contains('kaynak');
    const item = (isK ? data.kaynaklar : data.bilgiler).find(x => x.id === card.dataset.id);
    const act = btn.dataset.act;
    if (act === 'edit') return isK ? openKaynak(item) : openBilgi(item);
    if (act === 'del') {
      const linked = isK ? data.bilgiler.filter(b => b.kaynak === item.id).length : 0;
      const msg = isK ? `${kNo(item)} kaynak fişi silinsin mi?${linked ? ` Bu kaynağa bağlı ${linked} not fişi kaynaksız kalacak.` : ''}` : `${fisNo(item)} numaralı not fişi silinsin mi?`;
      if (!confirm(msg)) return;
      if (isK) data.kaynaklar = data.kaynaklar.filter(x => x !== item);
      else data.bilgiler = data.bilgiler.filter(x => x !== item);
      save('Silindi'); render(); return;
    }
    if (act === 'pdf') return isK ? fisPdf([a5Kaynak(item)], `Kaynak fişi ${kNo(item)} ${kisaAd(item)}`)
      : fisPdf([a5Bilgi(item)], `Not fişi ${fisNo(item)} ${trim(item.konu)}`);
    if (act === 'cite') return copy(atif(item), 'Atıf');
    if (act === 'show') { fKaynak.value = item.id; fBolum.value = '*'; fTur.value = ''; fQ.value = ''; render(); return; }
    if (act === 'add-b') return openBilgi(null, item.id);
    if (act === 'copy') return copy(metin(item), 'Metin');
    if (act === 'insert') {
      const text = metin(item);
      if (!text) { status('Fişin içeriği boş'); return; }
      const errs = bilgiSorunlari(item).filter(s => s[0] === 'err');
      if (errs.length && !confirm(`Bu fişte eksik var: ${errs.map(s => s[1]).join(' ')}\nYine de eklensin mi?`)) return;
      document.dispatchEvent(new CustomEvent('makale:ekle', { detail: { sec: item.bolum, text } }));
      const k = kaynakOf(item);
      const added = k && item.tur !== 'yorum' ? toKaynakca([kunye(k)]) : 0;
      item.kullanildi = true;
      save(`${bolumAdi(item.bolum)} bölümüne eklendi${added ? ' · künye kaynakçaya eklendi' : ''} ✓`);
      render();
    }
  }
  $('#fis-kaynaklar').addEventListener('click', onListClick);
  $('#fis-bilgiler').addEventListener('click', onListClick);

  $('#fis-to-kaynakca').addEventListener('click', () => {
    if (!data.kaynaklar.length) { status('Önce kaynak fişi ekleyin'); return; }
    const added = toKaynakca(data.kaynaklar.map(kunye));
    status(added ? `${added} künye kaynakçaya eklendi ✓` : 'Tüm künyeler zaten kaynakçada');
  });
  // Tüm fişler: her kaynak fişinin arkasından o kaynağın not fişleri, en sonda kaynaksız not fişleri
  $('#fis-print').addEventListener('click', () => {
    if (!hasFis()) { status('İndirilecek fiş yok'); return; }
    const pages = [];
    for (const k of data.kaynaklar) {
      pages.push(a5Kaynak(k));
      data.bilgiler.filter(b => b.kaynak === k.id).forEach(b => pages.push(a5Bilgi(b)));
    }
    data.bilgiler.filter(b => !kaynakOf(b)).forEach(b => pages.push(a5Bilgi(b)));
    fisPdf(pages, 'Fişler');
  });

  // ---------- fiş oluşturma ekranı: listelerin yerine açılır, yanında A5 kâğıt önizlemesi ----------
  const edK = $('#fis-ed-kaynak'), edB = $('#fis-ed-bilgi'), formK = $('#fis-form-kaynak'), formB = $('#fis-form-bilgi');
  let openEd = null;
  function showEditor(ed) {
    openEd = ed;
    edK.hidden = ed !== edK;
    edB.hidden = ed !== edB;
    $('.fis-grid').hidden = !!ed;
    window.scrollTo({ top: 0 });
  }
  const closeEditor = () => { showEditor(null); render(); };
  [edK, edB].forEach(ed => {
    ed.querySelector('[data-act="cancel"]').addEventListener('click', closeEditor);
    ed.addEventListener('keydown', e => { if (e.key === 'Escape') closeEditor(); });
  });
  const today = () => new Date().toLocaleDateString('tr-TR');

  // Fiş kâğıdı yatay A5 (210 × 148 mm ≈ 794 × 559 px) ya da A4'ün dörtte biri A6 (148 × 105 mm ≈ 559 × 397 px).
  // İkisi de A5'e göre aynı oranda küçültülür; böylece A6 ekranda da A5'in yarısı kadar görünür. Taşma varsa uyarılır.
  const BOYUT_KEY = 'makale-atolyesi:fis-boyut';
  const BOYUTLAR = { a5: 'A5 yatay · 210 × 148 mm', a6: 'A6 yatay · 148 × 105 mm' };
  let boyut = BOYUTLAR[store.get(BOYUT_KEY, 'a5')] ? store.get(BOYUT_KEY, 'a5') : 'a5';
  document.querySelectorAll('.pv-size').forEach(g => g.addEventListener('click', e => {
    const b = e.target.closest('[data-size]');
    if (!b || b.dataset.size === boyut) return;
    boyut = b.dataset.size;
    store.set(BOYUT_KEY, boyut);
    if (openEd === edK) syncKaynakForm(); else if (openEd === edB) syncBilgiForm();
  }));
  // PDF: fişler ekran dışındaki #print-root'a seçili boyutta birer sayfa olarak dizilir ve tarayıcının
  // "PDF olarak kaydet" yazdırmasıyla alınır (sayfa boyutu styles.css'teki adlı @page kurallarından gelir)
  function fisPdf(pages, ad) {
    let root = $('#print-root');
    if (!root) { root = document.createElement('div'); root.id = 'print-root'; root.lang = 'tr'; document.body.append(root); }
    root.className = 'print-fis';
    root.innerHTML = pages.map(html => `<div class="a5${boyut === 'a6' ? ' a6' : ''}"><div class="a5-in">${html}</div></div>`).join('');
    const oldTitle = document.title;
    document.title = ad.replace(/[\\/:*?"<>|]/g, '-').trim(); // tarayıcı PDF dosya adını sayfa başlığından önerir
    const done = () => { document.title = oldTitle; root.textContent = ''; root.className = ''; window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    window.print();
  }
  // Önizlemedeki ⬇ PDF: formdaki (henüz kaydedilmemiş olabilecek) hâliyle indirir
  edK.querySelector('[data-act="pdf"]').addEventListener('click', () => {
    const k = { no: data.kNo + 1, ...editingK, ...readForm(formK) };
    fisPdf([a5Kaynak(k)], `Kaynak fişi ${kNo(k)} ${kisaAd(k)}`);
  });
  edB.querySelector('[data-act="pdf"]').addEventListener('click', () => {
    const b = { id: '', ...editingB, ...readBilgiForm() };
    fisPdf([a5Bilgi(b)], `Not fişi ${fisNo(b)} ${trim(b.konu)}`);
  });
  function renderA5(id, html) {
    const page = $('#fis-a5-' + id);
    page.innerHTML = `<div class="a5-in">${html}</div>`;
    page.classList.toggle('a6', boyut === 'a6');
    const bar = page.closest('.fis-pv');
    bar.querySelectorAll('[data-size]').forEach(b => b.classList.toggle('on', b.dataset.size === boyut));
    bar.querySelector('.pv-dim').textContent = BOYUTLAR[boyut];
    const sc = page.parentElement, w = sc.clientWidth, h = sc.clientHeight;
    if (w) page.style.zoom = Math.min(1, (w - 24) / 794, h > 200 ? (h - 32) / 559 : 1);
    const inner = page.firstElementChild;
    const over = inner.scrollHeight > inner.clientHeight + 1;
    page.classList.toggle('over', over);
    $('#fis-a5-note-' + id).textContent = over ? '⚠ Fiş bir sayfaya sığmıyor' : '';
  }
  const ph = (v, empty) => trim(v) ? escHtml(trim(v)) : `<span class="ph">${empty}</span>`;
  const sayfaYaz = s => /[-–—]/.test(s) ? `ss. ${dash(s)}` : `s. ${trim(s)}`;

  // Kitap fişi örneğine göre kaynak fişi: üst satırda konu/alan ve kaynak no; YAZAR SOYADI, Adı; eserin adı;
  // çevirmen; yayın bilgisi (yayınevi, yer yıl); en altta bulunduğu yer
  function a5Kaynak(k) {
    const has = v => !!trim(v);
    const it = v => `<i>${escHtml(trim(v))}</i>`;
    // Soyadı büyük harfle: yazarlardan birinin adında ya da eserin başlığında Türkçe harf varsa Türkçe kuralıyla
    // (İnalcık → İNALCIK, Demirci → DEMİRCİ), yoksa İngilizce kuralıyla (Czeisler → CZEISLER, CZEİSLER değil)
    const dil = /[çğıöşüÇĞİÖŞÜ]/.test((k.yazarlar || '') + (k.baslik || '')) ? 'tr-TR' : 'en-US';
    const au = lines(k.yazarlar).map(n => {
      const i = n.indexOf(',');
      return i < 0 ? escHtml(n) : `${escHtml(n.slice(0, i).trim().toLocaleUpperCase(dil))}, ${escHtml(n.slice(i + 1).trim())}`;
    });
    const yil = escHtml(trim(k.yil));
    const rows = [];
    // Kitap, tez ve web sayfasının adı italik; makale ve kitap bölümünün adı tırnak içinde
    if (!has(k.baslik)) rows.push('<span class="ph">Eserin adı</span>');
    else rows.push(k.tur === 'makale' || k.tur === 'bolum' ? `“${escHtml(trim(k.baslik))}”` : it(k.baslik));
    if ((k.tur === 'kitap' || k.tur === 'bolum') && has(k.cevirmen)) rows.push(`çev. ${escHtml(trim(k.cevirmen))}`);
    if (k.tur === 'makale') rows.push([has(k.dergi) ? it(k.dergi) : '', has(k.cilt) ? `C. ${escHtml(trim(k.cilt))}` : '', has(k.sayi) ? `S. ${escHtml(trim(k.sayi))}` : '', yil, has(k.sayfalar) ? sayfaYaz(k.sayfalar) : ''].filter(Boolean).join(', '));
    if (k.tur === 'bolum') rows.push([lines(k.editorler).length ? `ed. ${escHtml(lines(k.editorler).join(', '))}` : '', has(k.kitap) ? it(k.kitap) + ' içinde' : '', has(k.bsayfalar) ? sayfaYaz(k.bsayfalar) : ''].filter(Boolean).join(', '));
    if (k.tur === 'kitap' || k.tur === 'bolum') rows.push([escHtml(trim(k.yayinevi)), [escHtml(trim(k.yer_basim)), yil].filter(Boolean).join(' ')].filter(Boolean).join(', '));
    if (k.tur === 'tez') rows.push([escHtml(k.teztur || ''), escHtml(trim(k.universite)), yil].filter(Boolean).join(', '));
    if (k.tur === 'web') rows.push([escHtml(trim(k.site)), yil].filter(Boolean).join(', '));
    if (has(k.doi)) rows.push(`<span class="a5-url">${escHtml(doiUrl(k.doi))}</span>`);
    return `<div class="a5-bar"><span>${ph(k.konu, 'Konu / alan')}</span><span>Kaynak No: ${kNo(k)}</span></div>
      <div class="a5-main">
        <div class="a5-author">${au.length ? au.join('; ') : '<span class="ph">SOYADI, Adı</span>'}</div>
        ${rows.filter(Boolean).map(r => `<div class="a5-line">${r}</div>`).join('')}
        ${has(k.not) ? `<div class="a5-note">${escHtml(trim(k.not))}</div>` : ''}
      </div>
      <div class="a5-bar foot"><span>Bulunduğu yer: ${ph(k.bulundugu, '—')}</span></div>`;
  }

  // Not fişi: üstte konu ve fiş no; alt başlık; türü köşeli parantezle belirtilen metin; altta kısa kaynak adı ve sayfa
  const ETIKET = { ozet: '[Özet]', yorum: '[Yorumum]' };
  function a5Bilgi(b) {
    const k = kaynakOf(b);
    const ic = trim(b.icerik);
    const body = !ic ? '<span class="ph">Fişin içeriği burada görünecek.</span>'
      : b.tur === 'alinti' ? escHtml(`“${ic}”`) : `${ETIKET[b.tur]} ${escHtml(ic)}`;
    let src;
    if (k) {
      const s = lines(k.yazarlar).map(n => n.split(',')[0].trim());
      const who = s.length > 2 ? `${s[0]} vd.` : s.join(' ve ');
      src = escHtml([who, kisaAd(k)].filter(Boolean).join(', '));
    } else src = b.tur === 'yorum' ? 'Kendi düşüncem' : '<span class="ph">Yazar, kısa eser adı (formda “Kaynak” seçin)</span>';
    const sayfa = trim(b.sayfa) ? escHtml(sayfaYaz(b.sayfa)) : b.tur === 'yorum' ? '' : '<span class="ph">s. —</span>';
    return `<div class="a5-bar head"><b>Konu: ${ph(b.konu, 'Konu başlığı')}</b><span>Fiş No: ${fisNo(b)}</span></div>
      <div class="a5-main">
        ${trim(b.altbaslik) ? `<div class="a5-sub">Alt başlık: ${escHtml(trim(b.altbaslik))}</div>` : ''}
        <div class="a5-text">${body}</div>
      </div>
      <div class="a5-bar foot"><span>${src}</span><span>${sayfa}</span></div>`;
  }

  // ---------- kaynak fişi formu ----------
  let editingK = null;
  function syncKaynakForm() {
    const k = readForm(formK);
    formK.querySelectorAll('[data-for]').forEach(el => { el.hidden = !el.dataset.for.split(' ').includes(k.tur); });
    $('#fis-kunye-pv').textContent = kunye(k);
    renderA5('kaynak', a5Kaynak({ no: data.kNo + 1, ...editingK, ...k }));
  }
  // Radyo düğmeleri (fiş türü) ayrıca okunur
  const named = form => [...form.elements].filter(el => el.name && el.type !== 'radio');
  function readForm(form) {
    const o = {};
    for (const el of named(form)) o[el.name] = el.value;
    return o;
  }
  function fillForm(form, o) { for (const el of named(form)) el.value = o[el.name] ?? (el.tagName === 'SELECT' ? el.options[0]?.value ?? '' : ''); }
  function openKaynak(k) {
    if (!leaveOk()) return;
    editingK = k;
    fillForm(formK, k || { tur: 'makale' });
    formK.querySelector('h3').textContent = k ? `Kaynak fişi ${kNo(k)}` : 'Yeni kaynak fişi';
    showEditor(edK);
    syncKaynakForm();
    snap = formState();
    formK.elements.yazarlar.focus({ preventScroll: true });
  }
  formK.addEventListener('input', syncKaynakForm);
  function storeKaynak() {
    const o = readForm(formK);
    if (editingK) Object.assign(editingK, o);
    else data.kaynaklar.push({ id: 'k' + (++data.kNo), no: data.kNo, tarih: today(), ...o });
    save();
  }
  formK.addEventListener('submit', e => { e.preventDefault(); storeKaynak(); closeEditor(); });
  $('#fis-new-kaynak').addEventListener('click', () => openKaynak(null));

  // ---------- not fişi formu ----------
  let editingB = null;
  $('#fis-types').innerHTML = Object.entries(TURLER).map(([v, t]) =>
    `<label class="fis-type t-${v}"><input type="radio" name="tur" value="${v}"><span>${t.label} <small>→ ${t.kural}</small></span></label>`).join('');
  formB.elements.bolum.innerHTML = BOLUMLER.map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
  function syncBilgiForm() {
    const b = readBilgiForm();
    $('#fis-type-hint').textContent = TURLER[b.tur].hint;
    // Yazar ve eser adı not fişine yazılmaz; seçilen kaynak fişinden gelir
    const hint = $('#fis-kaynak-hint');
    hint.textContent = b.tur === 'yorum' ? 'İsteğe bağlı: yorum bir kaynağa dairse seçin.'
      : !data.kaynaklar.length ? 'Henüz kaynak fişi yok. Önce “+ Kaynak fişi” ile eseri kaydedin; yazar ve eser adı oradan gelir.'
      : !b.kaynak ? 'Yazar ve eser adı, buradan seçtiğiniz kaynak fişinden gelir.' : '';
    hint.className = b.tur !== 'yorum' && !b.kaynak ? 'bad' : '';
    const wc = words(b.icerik);
    $('#fis-wc').textContent = `${wc} kelime` + (b.tur === 'alinti' && wc > 40 ? ' · 40 kelimeden uzun alıntı' : wc > 120 ? ' · tek fiş için uzun' : '');
    $('#fis-wc').className = (b.tur === 'alinti' && wc > 40) || wc > 120 ? 'bad' : '';
    $('#fis-metin-pv').textContent = metin(b) || '—';
    renderA5('bilgi', a5Bilgi({ id: '', ...editingB, ...b }));
  }
  function readBilgiForm() {
    const o = readForm(formB);
    o.tur = formB.querySelector('input[name="tur"]:checked')?.value || 'ozet';
    return o;
  }
  function openBilgi(b, kaynakId) {
    if (!leaveOk()) return;
    editingB = b;
    kaynakOptions(formB.elements.kaynak, '<option value="">— Kaynak seçin —</option>');
    // Tek kaynak fişi varsa yeni not fişinde o kaynak hazır seçili gelir
    const tek = data.kaynaklar.length === 1 ? data.kaynaklar[0].id : '';
    fillForm(formB, b || { kaynak: kaynakId || tek, bolum: '' });
    formB.querySelectorAll('input[name="tur"]').forEach(r => { r.checked = r.value === (b ? b.tur : 'ozet'); });
    formB.querySelector('h3').textContent = b ? `Not fişi ${fisNo(b)}` : 'Yeni not fişi';
    showEditor(edB);
    syncBilgiForm();
    snap = formState();
    formB.elements.konu.focus({ preventScroll: true });
  }
  formB.addEventListener('input', syncBilgiForm);
  formB.addEventListener('change', syncBilgiForm);
  function storeBilgi() {
    const o = readBilgiForm();
    if (editingB) Object.assign(editingB, o);
    else data.bilgiler.push({ id: 'b' + (++data.bNo), no: data.bNo, tarih: today(), ...o });
    save();
  }
  formB.addEventListener('submit', e => { e.preventDefault(); storeBilgi(); closeEditor(); });
  $('#fis-new-bilgi').addEventListener('click', () => openBilgi(null));

  // Kaydedilmemiş fiş sessizce kaybolmasın: başka fişe geçerken sorup kaydeder, sayfadan çıkarken uyarır
  let snap = '';
  const formState = () => openEd === edK ? JSON.stringify(readForm(formK)) : openEd === edB ? JSON.stringify(readBilgiForm()) : '';
  const dirty = () => !!openEd && formState() !== snap;
  function leaveOk() {
    if (!dirty()) return true;
    const ad = openEd === edK ? 'Kaynak' : 'Bilgi';
    if (!confirm(`Açık olan ${ad.toLocaleLowerCase('tr-TR')} fişi henüz kaydedilmedi. Kaydedip devam edilsin mi?\n\nİptal derseniz bu fişte kalırsınız.`)) return false;
    if (openEd === edK) storeKaynak(); else storeBilgi();
    status(`Fiş kaydedildi ✓`);
    return true;
  }
  window.addEventListener('beforeunload', e => { if (dirty()) { e.preventDefault(); e.returnValue = ''; } });

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (openEd === edK) syncKaynakForm(); else if (openEd === edB) syncBilgiForm(); }, 150);
  });

  // ---------- örnek ve temizleme ----------
  const hasFis = () => data.kaynaklar.length || data.bilgiler.length;
  $('#fis-clear').addEventListener('click', () => {
    if (!hasFis() || !confirm('Tüm kaynak ve not fişleri silinsin mi? Bu işlem geri alınamaz.')) return;
    data = { kaynaklar: [], bilgiler: [], kNo: 0, bNo: 0 };
    showEditor(null);
    save('Tüm fişler silindi'); render();
  });
  $('#fis-sample').addEventListener('click', () => {
    if (hasFis() && !confirm('Mevcut fişleriniz silinip örnek fişler yüklenecek. Devam edilsin mi?')) return;
    const K = [
      { tur: 'makale', konu: 'Ekran kullanımı ve uyku', kisa: 'Screen time and sleep', bulundugu: 'Çevrim içi erişim (DOI)', yazarlar: 'Hale, Lauren\nGuan, Stanford', yil: '2015', baslik: 'Screen time and sleep among school-aged children and adolescents: A systematic literature review', dergi: 'Sleep Medicine Reviews', cilt: '21', sayfalar: '50-58', doi: '10.1016/j.smrv.2014.07.007' },
      { tur: 'makale', konu: 'Işık ve uyku', kisa: 'Evening use of eReaders', bulundugu: 'Çevrim içi erişim (DOI)', yazarlar: 'Chang, Anne-Marie\nAeschbach, Daniel\nDuffy, Jeanne F.\nCzeisler, Charles A.', yil: '2015', baslik: 'Evening use of light-emitting eReaders negatively affects sleep, circadian timing, and next-morning alertness', dergi: 'Proceedings of the National Academy of Sciences', cilt: '112', sayi: '4', sayfalar: '1232-1237', doi: '10.1073/pnas.1418490112' },
      { tur: 'makale', konu: 'Akıllı telefon kullanımı', kisa: 'Smartphone use severity', bulundugu: 'Çevrim içi erişim (DOI)', yazarlar: 'Demirci, Kadir\nAkgönül, Mehmet\nAkpinar, Abdullah', yil: '2015', baslik: 'Relationship of smartphone use severity with sleep quality, depression, and anxiety in university students', dergi: 'Journal of Behavioral Addictions', cilt: '4', sayi: '2', sayfalar: '85-92', doi: '10.1556/2006.4.2015.010' }
    ];
    data = { kaynaklar: K.map((k, i) => ({ id: 'k' + (i + 1), no: i + 1, ...k })), bilgiler: [], kNo: K.length, bNo: 0 };
    const B = [
      { tur: 'ozet', kaynak: 'k1', sayfa: '', konu: 'Ekran süresi ve uyku', altbaslik: 'Çocuk ve ergenler', bolum: 'giris', icerik: 'Okul çağındaki çocuk ve ergenlerle yapılan çalışmaları inceleyen sistematik derlemede, ekran süresinin artmasının daha geç yatma ve daha kısa uyku süresiyle ilişkili olduğu belirlenmiştir.' },
      { tur: 'ozet', kaynak: 'k2', sayfa: '1232', konu: 'Yatmadan önce ışık yayan cihazlar', altbaslik: 'Uykuya dalma süresi', bolum: 'tartisma', icerik: 'Yatmadan önce ışık yayan bir cihazla okuma yapan katılımcıların uykuya dalması, basılı kitap okuyanlara göre daha uzun sürmüş ve ertesi sabah uyanıklıkları daha düşük bulunmuştur.' },
      { tur: 'ozet', kaynak: 'k3', sayfa: '85', konu: 'Üniversite öğrencilerinde akıllı telefon kullanımı', altbaslik: 'Uyku kalitesi', bolum: 'giris', icerik: 'Üniversite öğrencileriyle yapılan çalışmada, akıllı telefon kullanım şiddeti yüksek olan öğrencilerin uyku kalitesinin daha düşük olduğu bulunmuştur.' },
      { tur: 'yorum', kaynak: '', sayfa: '', konu: 'Literatürdeki boşluk', bolum: 'giris', icerik: 'Öğrencilerle yapılan çalışmaların çoğu öz bildirime dayalı ölçekler kullanıyor. Telefonun kendi kaydettiği ekran süresini kullanmak bu çalışmanın katkısı olabilir.' },
      { tur: 'ozet', kaynak: '', sayfa: '', konu: '', bolum: '', icerik: 'Bu fiş bilerek eksik bırakıldı: kaynağı, sayfası, konu başlığı ve bölümü yok. Fiş kurallarının nasıl uyardığını görmek için örnektir.' }
    ];
    data.bilgiler = B.map((b, i) => ({ id: 'b' + (i + 1), no: i + 1, ...b }));
    data.bNo = B.length;
    showEditor(null);
    save('Örnek fişler yüklendi'); render();
  });

  render();
})();
