/*
 * Makale denetim kuralları
 * Her kural, "Kaynaklar" sayfasında listelenen açık erişimli kaynaklara dayanır (SOURCES / REF_SRC).
 * Her bulgu: { section, level: 'error'|'warn'|'info', title, message, ref, range, fix }
 */
(function (root) {
  'use strict';

  const SECTIONS = [
    { id: 'baslik', label: 'Başlık', kind: 'input', lang: 'tr', ref: 'g-baslik',
      hint: 'Çalışmanın ana konusunu doğru, kısa ve açık biçimde yansıtın; anahtar kavramları başlığa koyun.',
      placeholder: 'Örn. Üniversite Öğrencilerinde Akademik Yazma Kaygısı ile Öz Yeterlik Arasındaki İlişki' },
    { id: 'ozet', label: 'Özet', kind: 'area', rows: 8, lang: 'tr', ref: 'g-ozet-yapi',
      hint: 'Amaç → yöntem → bulgular → sonuç. Ana metinden bağımsız anlaşılmalı; kaynağa, tabloya veya şekle atıf yapılmaz. Kelime sınırı için hedef derginin talimatına uyun.',
      placeholder: 'Bu çalışmanın amacı, …' },
    { id: 'anahtar', label: 'Anahtar Kelimeler', kind: 'input', lang: 'kw', ref: 'g-anahtar',
      hint: 'Çalışmanın temel kavramları; virgülle ayırın. Başlık ve özetteki önemli terimlerle uyumlu olmalı.',
      placeholder: 'akademik yazma, yazma kaygısı, öz yeterlik' },
    { id: 'abstract', label: 'Abstract', kind: 'area', rows: 7, lang: 'en', optional: true, ref: 'g-abstract',
      hint: 'İngilizce özet: Türkçe özetle aynı bilgileri, İngilizce akademik yazım alışkanlıklarına uygun biçimde verin.',
      placeholder: 'This study examined …' },
    { id: 'keywords', label: 'Keywords', kind: 'input', lang: 'kw-en', optional: true, ref: 'g-anahtar',
      hint: 'İngilizce anahtar kelimeler, virgülle ayırın.',
      placeholder: 'academic writing, writing anxiety, self-efficacy' },
    { id: 'giris', label: 'Giriş', kind: 'area', rows: 10, lang: 'tr', ref: 'g-giris',
      hint: 'Konunun önemini, bilinenleri ve literatürdeki boşluğu kaynaklarla ortaya koyun; sonda çalışmanın amacını belirtin.',
      placeholder: 'Konuyu tanıtın, bilinenleri kaynaklarla özetleyin, boşluğu ve amacı belirtin…' },
    { id: 'yontem', label: 'Yöntem', kind: 'area', rows: 9, lang: 'tr', ref: 'g-yontem',
      hint: 'Araştırma deseni, ortam ve katılımcılar, veri toplama, veri analizi ve etik onay. Yapılmış işi anlattığı için geçmiş zamanla yazılır.',
      placeholder: 'Araştırmada … deseni kullanılmıştır…' },
    { id: 'bulgular', label: 'Bulgular', kind: 'area', rows: 9, lang: 'tr', ref: 'g-bulgular',
      hint: 'Verileri sunun; yorumu ve literatürle karşılaştırmayı Tartışma’ya bırakın. Ayrıntılı sayısal verileri tablo ve şekillerle verin.',
      placeholder: 'Tablo 1’de … sunulmuştur…' },
    { id: 'tartisma', label: 'Tartışma', kind: 'area', rows: 9, lang: 'tr', ref: 'g-tartisma',
      hint: 'Ana bulguları kısaca özetleyin, önceki çalışmalarla karşılaştırın, sınırlılıkları ve alana katkıyı belirtin.',
      placeholder: 'Bu bulgu, … çalışmasının sonuçlarıyla örtüşmektedir…' },
    { id: 'sonuc', label: 'Sonuç ve Öneriler', kind: 'area', rows: 7, lang: 'tr', ref: 'g-sonuc',
      hint: 'Ana bulguları ve okuyucunun aklında kalması gereken mesajı verin; gerekirse öneriler sunun.',
      placeholder: 'Bu çalışmada … sonucuna ulaşılmıştır…' },
    { id: 'kaynakca', label: 'Kaynakça', kind: 'area', rows: 8, lang: 'ref', ref: 'g-kaynakca',
      hint: 'Her kaynak ayrı satırda. Metinde atıf yapılan her eser kaynakçada, kaynakçadaki her eser metinde yer almalı.',
      placeholder: 'Soyad, A. (Yıl). Eser adı. Yayınevi.' }
  ];

  // Rehber bölümleri (bulgulardaki "Rehberde gör" bağlantıları)
  const REFS = {
    'g-ilkeler': 'Bilimsel düşünmenin ilkeleri',
    'g-sorumluluk': 'Yazarın etik sorumlulukları',
    'g-uslup': 'Resmî ve nesnel üslup',
    'g-oznel': 'Yazar sesi: ben, biz ve edilgen yapı',
    'g-terim': 'Terim tutarlılığı',
    'g-cumle': 'Açık ve odaklı cümleler',
    'g-dil-hatalar': 'Kaçınılacak dil kullanımları',
    'g-problem': 'Araştırma sorusu',
    'g-literatur': 'Literatür taraması',
    'g-imrad': 'IMRAD yapısı',
    'g-baslik': 'Başlık',
    'g-giris': 'Giriş',
    'g-yontem': 'Yöntem',
    'g-bulgular': 'Bulgular',
    'g-tartisma': 'Tartışma',
    'g-sonuc': 'Sonuç',
    'g-kaynakca': 'Kaynakça',
    'g-zaman': 'Zaman kullanımı',
    'g-noktalama': 'Noktalama',
    'g-buyuk': 'Büyük harf',
    'g-birlik': 'Kısaltmalar ve yabancı sözcükler',
    'g-imla-hatalar': 'Sık yapılan yazım hataları',
    'g-ozet': 'Özetin nitelikleri',
    'g-ozet-yapi': 'Özetin unsurları',
    'g-abstract': 'Abstract',
    'g-anahtar': 'Anahtar kelimeler'
  };

  // Kaynak kısaltmaları → Kaynaklar sayfasındaki kimlik (#k-…)
  const SOURCES = {
    andrade: 'Andrade, 2011', aydin: 'Aydın, 2022', eldawlatly: 'Eldawlatly ve Meo, 2019', fowler: 'Fowler vd., 2013',
    fyfe: 'Fyfe vd., 2017', grech: 'Grech, 2019', guclu: 'Güçlü, 2025', jawaid: 'Jawaid ve Jawaid, 2019',
    mallia: 'Mallia, 2019', mcmurrey: 'McMurrey, t.y.', mensh: 'Mensh ve Kording, 2017', meo: 'Meo ve Eldawlatly, 2019',
    pautasso: 'Pautasso, 2013', prisma: 'Page vd., 2021', ratan: 'Ratan vd., 2019', riad: 'Riad, 2019',
    'openstax-wg': 'Robinson vd., 2021', snyder: 'Snyder, 2019', spielman: 'Spielman vd., 2014', tullu: 'Tullu, 2019',
    tumin: 'Tumin ve Tobias, 2019', wfs: 'Writing for Success, t.y.', tdk: 'TDK, t.y.', 'tdk-sozluk': 'TDK Güncel Türkçe Sözlük',
    yok: 'YÖK, 2025'
  };
  // Her rehber bölümünün dayandığı kaynaklar
  const REF_SRC = {
    'g-ilkeler': ['fowler', 'spielman'], 'g-sorumluluk': ['mallia', 'yok'], 'g-uslup': ['wfs', 'openstax-wg'],
    'g-oznel': ['guclu', 'aydin', 'openstax-wg'], 'g-terim': ['mensh'], 'g-cumle': ['mensh', 'openstax-wg'],
    'g-dil-hatalar': ['wfs', 'openstax-wg', 'meo'], 'g-problem': ['ratan'], 'g-literatur': ['pautasso', 'jawaid', 'snyder'],
    'g-imrad': ['jawaid', 'mensh', 'meo'], 'g-baslik': ['tullu', 'meo'], 'g-giris': ['jawaid', 'mensh'],
    'g-yontem': ['eldawlatly'], 'g-bulgular': ['riad', 'meo'], 'g-tartisma': ['jawaid', 'mensh'], 'g-sonuc': ['meo', 'jawaid'],
    'g-kaynakca': ['openstax-wg'], 'g-zaman': ['eldawlatly', 'openstax-wg'], 'g-noktalama': ['tdk'], 'g-buyuk': ['tdk'],
    'g-birlik': ['openstax-wg', 'tdk', 'tdk-sozluk'], 'g-imla-hatalar': ['tdk'], 'g-ozet': ['andrade', 'tullu'],
    'g-ozet-yapi': ['andrade', 'tullu'], 'g-abstract': ['andrade', 'tullu'], 'g-anahtar': ['tullu']
  };

  // Hedef dergiye göre değiştirilebilen sınırlar (uygulama varsayılanları)
  const DEFAULT_LIMITS = { absMin: 150, absMax: 300, kwMin: 3, kwMax: 6 };

  // ---------- yardımcılar ----------
  const LN = '\\p{L}\\p{N}';
  const lower = s => s.toLocaleLowerCase('tr-TR'); // tr-TR'de uzunluk korunur (İ→i, I→ı)
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+');
  const wordRe = list => new RegExp(`(?<![${LN}])(?:${list.map(esc).join('|')})(?![${LN}])`, 'gu');
  const stemRe = list => new RegExp(`(?<![${LN}])(?:${list.map(esc).join('|')})[${LN}]*`, 'gu');

  function findAll(text, re, onLower = true) {
    const src = onLower ? lower(text) : text;
    const out = [];
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(src))) {
      out.push({ start: m.index, end: m.index + m[0].length, text: text.slice(m.index, m.index + m[0].length), groups: m });
      if (m[0].length === 0) re.lastIndex++;
    }
    return out;
  }
  const has = (text, re) => findAll(text, re).length > 0;

  function wordCount(text) {
    return (text.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu) || []).length;
  }

  function sentences(text) {
    const out = [];
    const re = /[.!?…]+["”’)]*(?=\s+["“]?[\p{Lu}\d]|\s*$)|[?!]+(?=\s+\()|\n\s*\n/gu;
    let last = 0, m;
    const push = (s, e) => {
      while (s < e && /\s/.test(text[s])) s++;
      while (e > s && /\s/.test(text[e - 1])) e--;
      if (e > s) out.push({ start: s, end: e, text: text.slice(s, e) });
    };
    while ((m = re.exec(text))) {
      push(last, m.index + m[0].length);
      last = m.index + m[0].length;
      if (m[0].length === 0) re.lastIndex++;
    }
    push(last, text.length);
    return out;
  }

  const sentenceAt = (sents, pos) => sents.find(s => pos >= s.start && pos < s.end);

  // ---------- atıf ayıklama ----------
  const YEAR = '(?:1[5-9]\\d\\d|20\\d\\d)[a-zğ]?';
  const NAME = '\\p{Lu}[\\p{L}’\'\\-]+';

  function citations(text) {
    const out = [];
    const par = new RegExp(`\\(([^()]*?${YEAR}[^()]*?)\\)`, 'gu');
    const yr = new RegExp(YEAR, 'u');
    const onlyYear = new RegExp(`^\\s*${YEAR}\\s*(?:[,:]\\s*(?:s|ss|pp|p)\\.?\\s*[\\d–\\-]+)?\\s*$`, 'u');
    const narrative = new RegExp(`(${NAME})(?:\\s+(?:vd\\.|ve ark\\.|ve\\s+${NAME}|&\\s+${NAME}))?\\s*$`, 'u');
    let m;
    while ((m = par.exec(text))) {
      const s = m.index, e = s + m[0].length;
      for (const p of m[1].split(';')) {
        const y = p.match(yr);
        if (!y) continue;
        const nm = p.match(new RegExp(NAME, 'u'));
        if (nm && p.indexOf(nm[0]) < p.indexOf(y[0])) {
          out.push({ surname: nm[0].split(/[’']/)[0], year: y[0], start: s, end: e });
        } else if (onlyYear.test(p)) {
          const before = text.slice(Math.max(0, s - 80), s);
          const nb = before.match(narrative);
          if (nb) out.push({ surname: nb[1].split(/[’']/)[0], year: y[0], start: s - before.length + nb.index, end: e });
        }
      }
    }
    return out;
  }
  const numericCite = /\[\d+(?:\s*[-–,]\s*\d+)*\]/g;
  const hasCitation = t => citations(t).length > 0 || /\[\d+(?:\s*[-–,]\s*\d+)*\]/.test(t);

  function numbersIn(t) {
    const out = [];
    const re = /\d+(?:[.,]\d+)?/g;
    let m;
    while ((m = re.exec(t))) {
      const v = m[0], n = parseFloat(v.replace(',', '.'));
      if (/^\d{4}$/.test(v) && n >= 1500 && n <= 2099) continue; // yıl
      if (!/[.,]/.test(v) && n < 10) continue;                   // küçük sayılar
      out.push({ v, start: m.index, end: m.index + v.length });
    }
    return out;
  }
  const containsNumber = (body, v) =>
    body.includes(v) || body.includes(v.replace(',', '.')) || body.includes(v.replace('.', ','));

  // ---------- dil kuralları (Türkçe bölümler) ----------
  const SUBJECTIVE = {
    words: ['bence', 'bana göre', 'bize göre', 'bizce', 'kanaatimce', 'kanımca', 'kanaatime göre', 'şahsen', 'kişisel olarak',
      'açıkçası', 'ben', 'biz', 'benim', 'bizim', 'bana', 'bize', 'beni', 'bizi', 'düşünüyorum', 'düşünüyoruz', 'inanıyorum',
      'inanıyoruz', 'sanırım', 'sanıyorum', 'zannediyorum', 'zannımca', 'kanısındayım', 'kanısındayız'],
    fix: 'Kişisel kanaati kanıta bağlayın (“Bulgular … göstermektedir.”) ya da yazarı geri plana alan bir yapı kullanın (“Bu çalışmada …”).'
  };
  const FIRST_PERSON_VERB = new RegExp(
    `(?<![${LN}])(?:${['incele', 'topla', 'analiz et', 'hesapla', 'değerlendir', 'belirle', 'gözlemle', 'uygula', 'yap', 'bul', 'var', 'ulaş',
      'elde et', 'gör', 'kullan', 'seç', 'tespit et', 'karşılaştır', 'yorumla', 'oluştur', 'gerçekleştir', 'ele al', 'tara', 'oku', 'yaz',
      'sun', 'göster', 'amaçla', 'hedefle', 'düşün', 'sor', 'ölç', 'çalış', 'derle', 'getir', 'saptat', 'sapta', 'kodla'].map(esc).join('|')})` +
    `(?:d|t)(?:ı|i|u|ü)(?:m|k)(?![${LN}])` +
    `|(?<![${LN}])[${LN}]{2,}(?:ıyorum|iyorum|uyorum|üyorum|ıyoruz|iyoruz|uyoruz|üyoruz|maktayız|mekteyiz|maktayım|mekteyim)(?![${LN}])` +
    `|(?<![${LN}])[${LN}]+m(?:a|e)(?:mız|miz)(?:da|de|ın|in|a|e|ı|i|la|le|dan|den)?(?![${LN}])`, 'gu');

  const COLLOQUIAL = {
    'yani': 'Kaldırın ya da “diğer bir deyişle” kullanın.', 'işte': 'Kaldırın.', 'falan': '“vb.” kullanın ya da öğeleri sayın.',
    'filan': '“vb.” kullanın ya da öğeleri sayın.', 'şey': 'Kastedilen kavramı adıyla belirtin.', 'şeyler': 'Kastedilen kavramları adıyla belirtin.',
    'bayağı': '“oldukça” ya da ölçülebilir bir ifade kullanın.', 'baya': '“oldukça” ya da ölçülebilir bir ifade kullanın.',
    'acayip': '“belirgin biçimde” gibi nesnel bir ifade kullanın.', 'süper': 'Nesnel bir nitelendirme kullanın.',
    'mesela': '“örneğin” kullanın.', 'hani': 'Kaldırın.', 'zaten': 'Kaldırın ya da “esasen” kullanın.', 'resmen': 'Kaldırın.',
    'tabii ki': 'Kaldırın; iddiayı kanıtla destekleyin.', 'tabi ki': 'Kaldırın; iddiayı kanıtla destekleyin.', 'bi': '“bir” yazın.',
    'harbiden': 'Kaldırın.', 'valla': 'Kaldırın.', 'vallahi': 'Kaldırın.', 'bir sürü': '“birçok” kullanın.', 'kafa yor': '“üzerinde çalış-” kullanın.',
    'okey': 'Kaldırın.', 'tamam': 'Kaldırın.'
  };
  const EMOTIONAL = ['muhteşem', 'harika', 'inanılmaz', 'müthiş', 'korkunç', 'berbat', 'mükemmel', 'kesinlikle', 'şüphesiz', 'şüphesizdir',
    'tartışmasız', 'tartışmasızdır', 'apaçık', 'maalesef', 'malesef', 'ne yazık ki', 'ne mutlu ki', 'çok güzel', 'olağanüstü', 'mucizevi', 'felaket'];
  const VAGUE = ['bazı şeyler', 'bir şeyler', 'vs.', 'vs', 'vesaire', 'bir nevi', 'bir bakıma', 'az çok', 'aşağı yukarı', 'epey', 'şöyle böyle',
    'birtakım şeyler', 'gibi gibi', 'çok fazla', 'en büyük sorun', 'her şey'];
  const GENERAL = ['bilindiği gibi', 'bilindiği üzere', 'herkesçe bilinen', 'herkesçe bilinmektedir', 'herkes bilir', 'herkes', 'her zaman',
    'hiçbir zaman', 'hiç kimse', 'tüm insanlar', 'bütün insanlar', 'araştırmalar göstermektedir', 'araştırmalar göstermiştir',
    'yapılan araştırmalara göre', 'uzmanlara göre', 'bilim insanlarına göre', 'genel kabul görmektedir', 'kabul edilen bir gerçektir'];
  const SPELLING = {
    'herşey': 'her şey', 'birşey': 'bir şey', 'hiçbirşey': 'hiçbir şey', 'bir çok': 'birçok', 'hiç bir': 'hiçbir', 'yada': 'ya da',
    've ya': 'veya', 'herhangibir': 'herhangi bir', 'pekçok': 'pek çok', 'bir kaç': 'birkaç', 'şuan': 'şu an', 'herzaman': 'her zaman',
    'hergün': 'her gün', 'malesef': 'maalesef', 'yanlız': 'yalnız', 'yalnış': 'yanlış', 'orjinal': 'orijinal', 'süpriz': 'sürpriz',
    'tabiki': 'tabii ki', 'öyleki': 'öyle ki', 'deyil': 'değil', 'herkez': 'herkes', 'birsürü': 'birçok', 'hiç birşey': 'hiçbir şey',
    'birtek': 'bir tek', 'yinede': 'yine de', 'eyer': 'eğer', 'bir takım': 'birtakım', 'şimdiye kadar ki': 'şimdiye kadarki'
  };

  const KI_ATTACHED = new RegExp(`(?<![${LN}])[\\p{L}]+(?:yor|yorlar|dır|dir|dur|dür|tır|tir|tur|tür|dı|di|du|dü|tı|ti|tu|tü|mış|miş|muş|müş|cak|cek|malı|meli)ki(?![${LN}])`, 'gu');
  const KI_OK = new Set(['şimdiki', 'önceki', 'sonraki', 'yukarıdaki', 'aşağıdaki', 'dünkü', 'bugünkü', 'yarınki']);
  const MI_ATTACHED = new RegExp(`(?<![${LN}])[\\p{L}]{3,}(?:mı|mi|mu|mü)(?=\\s*\\?)`, 'gu');

  const FOREIGN = {
    'data': 'veri', 'dizayn': 'tasarım', 'konsept': 'kavram', 'spesifik': 'belirli / özgül', 'efektif': 'etkili', 'prosedür': 'işlem / süreç',
    'faktör': 'etken', 'entegre': 'bütünleşik / tümleşik', 'implementasyon': 'uygulama', 'feedback': 'geri bildirim', 'online': 'çevrim içi',
    'metot': 'yöntem', 'metod': 'yöntem', 'adapte': 'uyarlan-', 'kriter': 'ölçüt', 'optimal': 'en uygun', 'enformasyon': 'bilgi'
  };

  const TERM_PAIRS = [
    ['yöntem', 'metot|metod'], ['veri', 'data'], ['katılımcı', 'denek'], ['öğrenci', 'talebe'], ['etken', 'faktör'],
    ['kavram', 'konsept'], ['tasarım', 'dizayn'], ['kuram', 'teori'], ['ölçüt', 'kriter'], ['alanyazın', 'literatür']
  ];

  const CONCEPT_CAP = /(?<![\p{L}])(?:Bilimsel|Yöntem|Araştırma|Analiz|Veri|Nitel|Nicel|Literatür|Sonuç|Bulgu|Kavram|Kuram|Hipotez|Örneklem|Akademik Yazı|Eleştirel)[\p{L}]*(?:\s+\p{Lu}[\p{L}]*)?/gu;

  const PASSIVE_END = /(?:ıl|il|ul|ül|n)(?:mış|miş|muş|müş|makta|mekte|acak|ecek|ır|ir|ur|ür|dı|di|du|dü)/u;

  // ---------- ana analiz ----------
  function analyze(doc, limits) {
    const L = { ...DEFAULT_LIMITS, ...(limits || {}) };
    const issues = [];
    const checklists = {};
    const raw = id => doc[id] || '';
    const filled = id => raw(id).trim().length > 0;
    const add = (section, level, title, message, ref, range, fix) =>
      issues.push({ section, level, title, message, ref, range: range || null, fix: fix || null });
    const cl = (section, items) => { checklists[section] = items.map(([label, ok]) => ({ label, ok: !!ok })); };
    const absRange = `${L.absMin}–${L.absMax}`;

    const trSections = SECTIONS.filter(s => s.lang === 'tr').map(s => s.id);
    const bodyIds = ['giris', 'yontem', 'bulgular', 'tartisma', 'sonuc'];
    const body = bodyIds.map(raw).join('\n');

    // ---- Başlık ----
    {
      const t = raw('baslik'), wc = wordCount(t);
      if (!filled('baslik')) add('baslik', 'error', 'Başlık eksik', 'Başlık, editörün, hakemin ve okuyucunun ilk okuduğu kısımdır; makaleyi okuyup okumamaya çoğu zaman buna bakarak karar verilir.', 'g-baslik');
      else {
        if (wc > 20) add('baslik', 'warn', 'Başlık çok uzun', `Başlık ${wc} kelime. Çok uzun başlıklar odağı dağıtır; ana konuyu yansıtmayan sözcükleri çıkarın.`, 'g-baslik');
        if (wc < 4) add('baslik', 'warn', 'Başlık çok kısa olabilir', 'Çok kısa başlıklar çalışmanın içeriğini yansıtmayabilir ve dizinlemede gereken anahtar terimleri içermeyebilir.', 'g-baslik');
        for (const m of findAll(t, wordRe(['hakkında', 'üzerine bir', 'bazı', 'çeşitli', 'genel bir', 'bir bakış', 'bir inceleme', 'bir araştırma', 'her yönüyle', 'önemi', 'her şey'])))
          add('baslik', 'warn', 'Belirsiz / gereksiz sözcük', `“${m.text}” başlığa bilgi eklemiyor. Belirsiz başlıklar çalışmanın ana fikrini okuyucuya iletmez; neyin, kimde ve hangi bağlamda incelendiğini yazın.`, 'g-baslik', m,
            'Örn. “Eğitim Hakkında Bir Araştırma” yerine “Ortaokul Öğrencilerinde Okuma Motivasyonu ile Akademik Başarı İlişkisi”.');
        for (const m of findAll(t, /(?<![\p{L}\p{N}])\p{Lu}{2,6}(?![\p{L}\p{N}])/gu, false)) {
          if (/^[IVXLCDM]+$/.test(m.text) || t.trim() === t.trim().toLocaleUpperCase('tr-TR')) continue;
          add('baslik', 'info', 'Başlıkta kısaltma', `“${m.text}” — yaygın olarak bilinmeyen kısaltmalar başlıkta okuyucuyu uzaklaştırabilir ve dizinlemeyi zorlaştırabilir.`, 'g-baslik', m, 'Kısaltmayı açık yazın.');
        }
      }
      cl('baslik', [['Başlık yazıldı', filled('baslik')], ['Kısa ve odaklı (4–20 kelime)', wc >= 4 && wc <= 20],
        ['Anahtar kavramları içeriyor', filled('anahtar') && keywordAligned(raw('anahtar'), t)]]);
    }

    // ---- Özet ----
    {
      const t = raw('ozet'), wc = wordCount(t);
      const parts = {
        amac: stemRe(['amaç', 'amac', 'hedefle', 'incelemek', 'araştırmaktır', 'belirlemek', 'ortaya koymak', 'incelenmesi']),
        yontem: stemRe(['yöntem', 'model', 'desen', 'örneklem', 'çalışma grubu', 'katılımcı', 'veri', 'anket', 'ölçe', 'görüşme', 'gözlem', 'analiz', 'nitel', 'nicel', 'deney', 'tarama', 'doküman', 'belge', 'arşiv']),
        bulgu: stemRe(['bulgu', 'bulunmuş', 'bulunduğu', 'tespit', 'saptan', 'belirlenmiş', 'belirlendi', 'ortaya çık', 'ortaya kon', 'göstermiş', 'gözlenmiş', 'anlamlı']),
        sonuc: stemRe(['sonuç', 'sonuc', 'öneril', 'çıkarım', 'işaret etmekte', 'söylenebilir', 'katkı'])
      };
      const got = {};
      for (const k in parts) got[k] = filled('ozet') && has(t, parts[k]);
      const cites = citations(t);
      const tableRefs = findAll(t, new RegExp(`(?<![${LN}])(?:tablo|şekil|grafik|ek)\\s*\\d+`, 'gu'));

      if (!filled('ozet')) add('ozet', 'error', 'Özet eksik', 'Özet çoğu zaman makalenin okunan tek kısmıdır: veri tabanlarında, kongre kitaplarında ve hakem davetlerinde yalnızca özet görünür.', 'g-ozet');
      else {
        if (wc < L.absMin) add('ozet', 'warn', `Özet kısa (${wc} kelime)`, `Bilgi eksik kalmış olabilir. Dergiler çoğunlukla 200–250 ya da 200–300 kelimelik özet ister; geçerli sınırınız ${absRange}. Hedef derginin talimatına bakın.`, 'g-ozet');
        if (wc > L.absMax) add('ozet', 'warn', `Özet uzun (${wc} kelime)`, `Geçerli sınırınız ${absRange} kelime. Özetteki her kelime önemlidir; gereksiz ayrıntıları ana metne bırakın.`, 'g-ozet');
        const names = { amac: ['Amaç', 'Çalışma neyi araştırdı?', 'Bu çalışmanın amacı, … incelemektir.'], yontem: ['Yöntem', 'Araştırma nasıl yapıldı?', 'Araştırmada … deseni kullanılmış; veriler … ile toplanmıştır.'],
          bulgu: ['Bulgular', 'En önemli sonuçlar neler?', 'Bulgular, … olduğunu göstermiştir.'], sonuc: ['Sonuç', 'Bulgular ne anlama geliyor?', 'Sonuç olarak … söylenebilir.'] };
        for (const k in names) if (!got[k]) add('ozet', 'warn', `Özette “${names[k][0]}” unsuru bulunamadı`, `Özet; amaç (arka plan), yöntem, bulgular ve sonuç kısımlarından oluşur. Şu soruyu yanıtlayan bir cümle ekleyin: ${names[k][1]}`, 'g-ozet-yapi', null, names[k][2]);
        for (const c of cites) add('ozet', 'error', 'Özette kaynağa atıf var', `“${t.slice(c.start, c.end)}” — özette kaynağa atıf yapmak neredeyse her zaman uygunsuzdur.`, 'g-ozet', c, 'Atfı özetten çıkarın; ana metinde kullanın.');
        for (const m of findAll(t, numericCite, false)) add('ozet', 'error', 'Özette kaynağa atıf var', `“${m.text}” — özette kaynağa atıf yapılmaz.`, 'g-ozet', m);
        for (const m of tableRefs) add('ozet', 'warn', 'Özette tablo/şekle atıf var', `“${m.text}” — özet ana metni okumadan anlaşılabilmeli; tablo, şekil veya eke yönlendirme bu bağımsızlığı bozar.`, 'g-ozet', m);
        if (wordCount(body) > 80) for (const n of numbersIn(t)) if (!containsNumber(body, n.v))
          add('ozet', 'warn', 'Metinde olmayan bilgi', `Özetteki “${n.v}” değeri ana metinde geçmiyor. Özette yer alan her bilgi ana metinde de bulunmalıdır.`, 'g-ozet', n);
      }
      cl('ozet', [['Amaç', got.amac], ['Yöntem', got.yontem], ['Bulgular', got.bulgu], ['Sonuç', got.sonuc], [`${absRange} kelime`, wc >= L.absMin && wc <= L.absMax],
        ['Kaynak/tablo atfı yok', filled('ozet') && !cites.length && !tableRefs.length]]);
    }

    // ---- Anahtar kelimeler ----
    function checkKeywords(id, en) {
      const t = raw(id);
      const list = t.split(/[,;]/).map(s => s.trim()).filter(Boolean);
      if (!filled(id)) {
        if (!en) add(id, 'error', 'Anahtar kelimeler eksik', 'Veri tabanları ve arama motorları makaleyi anahtar terimlerle bulur; anahtar kelimeleri özetten sonra listeleyin.', 'g-anahtar');
        else if (filled('abstract')) add(id, 'info', 'Keywords eklenmemiş', 'Abstract yazdıysanız İngilizce anahtar kelimeleri (Keywords) de ekleyin.', 'g-anahtar');
        return list;
      }
      if (list.length < L.kwMin) add(id, 'warn', `Az anahtar kelime (${list.length})`, `Geçerli sınırınız ${L.kwMin}–${L.kwMax}. Sayı dergiden dergiye değişir; hedef derginin talimatına bakın. Virgülle ayırdığınızdan emin olun.`, 'g-anahtar');
      if (list.length > L.kwMax) add(id, 'warn', `Fazla anahtar kelime (${list.length})`, `Geçerli sınırınız ${L.kwMin}–${L.kwMax}. Yalnızca çalışmayı en iyi temsil eden terimleri bırakın.`, 'g-anahtar');
      const seen = new Set();
      for (const k of list) {
        const lk = lower(k);
        if (seen.has(lk)) add(id, 'warn', 'Tekrarlanan anahtar kelime', `“${k}” birden fazla kez yazılmış.`, 'g-anahtar');
        seen.add(lk);
        if (wordCount(k) > 4) add(id, 'info', 'Uzun anahtar kelime öbeği', `“${k}” bir terimden çok cümleye benziyor. Kısa, terim niteliğinde ifadeler seçin.`, 'g-anahtar');
      }
      if (!en && filled('baslik') && !keywordAligned(t, raw('baslik')))
        add(id, 'warn', 'Anahtar kelimeler başlıkla uyumsuz', 'Dizinleme için en önemli terimler hem başlıkta hem özette yer almalıdır; başlıktaki temel kavramlardan en az biri listede bulunmalı.', 'g-anahtar');
      return list;
    }
    {
      const list = checkKeywords('anahtar', false);
      cl('anahtar', [[`${L.kwMin}–${L.kwMax} kelime`, list.length >= L.kwMin && list.length <= L.kwMax], ['Başlıkla uyumlu', filled('baslik') && keywordAligned(raw('anahtar'), raw('baslik'))]]);
      const en = checkKeywords('keywords', true);
      cl('keywords', [[`${L.kwMin}–${L.kwMax} keywords`, en.length >= L.kwMin && en.length <= L.kwMax]]);
    }

    // ---- Abstract ----
    {
      const t = raw('abstract'), wc = wordCount(t);
      const trChars = (t.match(/[ğşıİçöüĞŞÇÖÜ]/g) || []).length;
      if (!filled('abstract')) add('abstract', 'info', 'Abstract eklenmemiş', 'Türkçe makale yayımlayan dergilerin çoğu İngilizce özet de ister; hedef derginin talimatına bakın.', 'g-abstract');
      else {
        if (trChars > 3) add('abstract', 'warn', 'Abstract’ta Türkçe karakterler var', 'Abstract İngilizce yazılmalıdır. Çevrilmemiş kısımlar olabilir.', 'g-abstract');
        if (wc < L.absMin || wc > L.absMax) add('abstract', 'info', `Abstract ${wc} kelime`, `Abstract için de genellikle aynı kelime sınırı geçerlidir (şu an ${absRange}).`, 'g-ozet');
        for (const m of findAll(t, /\b\w+n't\b|\b\w+'(re|ve|ll|d)\b/gi, false))
          add('abstract', 'warn', 'Kısaltılmış biçim', `“${m.text}” resmî yazıda kullanılmaz; açık yazın (do not, it is…).`, 'g-uslup', m);
        for (const c of citations(t)) add('abstract', 'warn', 'Abstract’ta kaynağa atıf', 'Özette olduğu gibi abstract’ta da kaynak gösterilmez.', 'g-ozet', c);
        if (filled('ozet') && wc < wordCount(raw('ozet')) * 0.6)
          add('abstract', 'info', 'Abstract özete göre çok kısa', 'Abstract, Türkçe özetle aynı bilgileri (amaç, yöntem, bulgular, sonuç) içermelidir.', 'g-abstract');
      }
      cl('abstract', [['Yazıldı', filled('abstract')], [`${absRange} kelime`, filled('abstract') && wc >= L.absMin && wc <= L.absMax],
        ['Kaynak atfı yok', filled('abstract') && !citations(t).length]]);
    }

    // ---- Giriş ----
    {
      const t = raw('giris'), wc = wordCount(t);
      const cites = citations(t).length + findAll(t, numericCite, false).length;
      const amac = has(t, stemRe(['amaç', 'amac', 'hedefle', 'hedef']));
      const onem = has(t, stemRe(['önem', 'katkı', 'gerekli', 'ihtiyaç', 'gereksinim', 'boyut']));
      const bosluk = has(t, stemRe(['boşluk', 'sınırlı sayıda', 'sınırlıdır', 'yeterince', 'az sayıda', 'ele alınmamış', 'ihmal', 'eksik', 'henüz', 'incelenmemiş', 'rastlanmamış']));
      const problem = has(t, stemRe(['problem', 'sorun', 'soru', 'hipotez', 'denence']));
      if (!filled('giris')) add('giris', 'error', 'Giriş eksik', 'Giriş, konunun önemini, bilinenleri ve literatürdeki boşluğu ortaya koyar; çalışmanın amacıyla biter.', 'g-giris');
      else {
        if (wc < 150) add('giris', 'info', `Giriş kısa (${wc} kelime)`, 'Giriş kısa olmalıdır, ancak bilinenleri, boşluğu ve amacı karşılayacak kadar bilgi içermelidir.', 'g-giris');
        if (cites === 0) add('giris', 'warn', 'Girişte literatüre atıf yok', 'Giriş, alandaki güncel bilgiyi özetler ve iyi kaynaklandırılmalıdır.', 'g-literatur', null, 'Örn. “… konusu çeşitli çalışmalarda ele alınmıştır (Yılmaz, 2020; Kaya, 2021).”');
        else if (cites < 3) add('giris', 'info', 'Literatür çerçevesi zayıf olabilir', `Girişte ${cites} atıf var. Konuyla ilgili önemli ve güncel çalışmalara da değinin.`, 'g-literatur');
        if (!amac) add('giris', 'warn', 'Amaç cümlesi bulunamadı', 'Girişin sonunda çalışmanın amacı açıkça belirtilmelidir.', 'g-giris', null, 'Bu çalışmanın amacı, … ortaya koymaktır.');
        if (!onem) add('giris', 'info', '“Neden önemli?” sorusu', 'Okuyucuya çalışmanın neden yapıldığını ve sorunun boyutunu anlatın.', 'g-giris', null, 'Bu çalışma, … açısından önem taşımaktadır.');
        if (!bosluk) add('giris', 'info', '“Hangi boşluğu dolduruyor?” sorusu', 'Literatürde eksik olanı ve bunun neden önemli olduğunu belirtin; çalışmanın katkısı buradan anlaşılır.', 'g-giris', null, 'Literatürde … konusunu ele alan sınırlı sayıda çalışma bulunmaktadır.');
        if (!problem) add('giris', 'info', 'Araştırma sorusu', 'Araştırma sorusu, incelenecek problemi tanımlar ve yöntemi yönlendirir. Gerekirse soruları veya hipotezleri sıralayın.', 'g-problem', null, 'Bu doğrultuda araştırmada şu sorulara yanıt aranmıştır: …');
      }
      cl('giris', [['Amaç', amac], ['Önem / gerekçe', onem], ['Literatürdeki boşluk', bosluk], ['Araştırma sorusu', problem], ['Literatüre atıf', cites > 0]]);
    }

    // ---- Yöntem ----
    {
      const t = raw('yontem'), wc = wordCount(t);
      const model = has(t, stemRe(['model', 'desen', 'nitel', 'nicel', 'karma', 'deneysel', 'tarama', 'durum çalışması', 'olgubilim', 'yaklaşım', 'betimsel', 'ilişkisel']));
      const orneklem = has(t, stemRe(['örneklem', 'evren', 'katılımcı', 'çalışma grubu', 'çalışma grubunu', 'denek', 'veri seti', 'kaynak', 'doküman', 'belge', 'öğrenci', 'öğretmen', 'ortam']));
      const arac = has(t, stemRe(['anket', 'ölçe', 'görüşme', 'form', 'gözlem', 'test', 'arşiv', 'doküman', 'belge', 'veri toplama', 'envanter']));
      const analiz = has(t, stemRe(['analiz', 'çözümle', 'istatist', 'spss', 'korelasyon', 'regresyon', 'kodla', 'içerik analizi', 'betimsel', 't-test', 'anova']));
      const etik = has(t, stemRe(['etik', 'onam', 'izin', 'gönüllü']));
      if (!filled('yontem')) add('yontem', 'error', 'Yöntem eksik', 'Yöntem bölümü çalışmanın nasıl yapıldığını anlatır.', 'g-yontem');
      else {
        if (wc < 100) add('yontem', 'warn', `Yöntem kısa (${wc} kelime)`, 'Yöntem; desen, katılımcılar, veri toplama, analiz ve etik onayı içermelidir. İstatistiksel yöntemler ayrıntılı anlatılmalıdır.', 'g-yontem');
        if (!model) add('yontem', 'warn', 'Araştırma deseni belirtilmemiş', 'Çalışmanın desenini (nitel, nicel, tarama, deneysel…) yazın.', 'g-yontem', null, 'Araştırmada ilişkisel tarama deseni kullanılmıştır.');
        if (!orneklem) add('yontem', 'warn', 'Ortam ve katılımcılar belirtilmemiş', 'Çalışmanın nerede ve kimlerle (ya da hangi kaynaklarla) yapıldığını açıklayın.', 'g-yontem', null, 'Çalışma grubunu … oluşturmaktadır.');
        if (!arac) add('yontem', 'warn', 'Veri toplama yolu belirtilmemiş', 'Verilerin nasıl toplandığını (ölçek, anket, görüşme, arşiv belgesi…) belirtin.', 'g-yontem', null, 'Veriler, … aracılığıyla toplanmıştır.');
        if (!analiz) add('yontem', 'warn', 'Veri analizi belirtilmemiş', 'Kullanılan analiz yöntemlerini ve testleri, gerekiyorsa yazılımı belirtin.', 'g-yontem', null, 'Verilerin analizinde … kullanılmıştır.');
        if (!etik) add('yontem', 'info', 'Etik onay belirtilmemiş', 'İnsanlarla yapılan çalışmalarda etik kurul onayı ve katılımcı onamı yöntem bölümünde belirtilir.', 'g-yontem', null, 'Araştırma için … Etik Kurulundan onay alınmıştır.');
        for (const s of sentences(t).filter(s => /(?:ıyor|iyor|uyor|üyor|yor|acak|ecek|acağız|eceğiz)(?:lar|uz|ız)?[.!?…]*$/u.test(lower(s.text))))
          add('yontem', 'info', 'Zaman kullanımı', 'Yöntem, yapılmış işi anlattığı için geçmiş zamanla yazılır.', 'g-zaman', s, 'Örn. “toplanıyor / toplanacak” → “toplanmıştır”.');
      }
      cl('yontem', [['Araştırma deseni', model], ['Ortam ve katılımcılar', orneklem], ['Veri toplama', arac], ['Veri analizi', analiz], ['Etik onay', etik]]);
    }

    // ---- Bulgular ----
    {
      const t = raw('bulgular');
      const interp = findAll(t, stemRe(['düşündürmekte', 'düşünülmekte', 'yorumlanabilir', 'muhtemelen', 'sanırım', 'ilginç', 'şaşırtıcı', 'beklendiği gibi',
        'beklenmedik', 'literatürle', 'alanyazınla', 'ile uyumlu', 'ile tutarlı', 'ile örtüşmekte', 'desteklemekte', 'açıklanabilir', 'kaynaklanıyor olabilir',
        'işaret etmekte', 'olumlu bir', 'olumsuz bir', 'anlaşılmaktadır', 'göstermesi açısından']));
      const cites = citations(t);
      const data = /\d/.test(t) || has(t, stemRe(['tablo', 'şekil', 'grafik']));
      if (!filled('bulgular')) add('bulgular', 'error', 'Bulgular eksik', 'Bulgular, sonuçları dayandıracağınız verileri sunar.', 'g-bulgular');
      else {
        for (const m of interp) add('bulgular', 'warn', 'Bulgularda yorum', `“${m.text}” bir yorum ifadesi. Bulguları tartışmak veya yorumlamak bu bölümde yapılan, makalenin reddine yol açabilen yaygın bir hatadır.`, 'g-bulgular', m, 'Bu cümleyi Tartışma bölümüne taşıyın; burada yalnızca veriyi verin.');
        for (const c of cites) add('bulgular', 'warn', 'Bulgularda literatür karşılaştırması', `“${t.slice(c.start, c.end)}” — sonuçların önceki çalışmalarla karşılaştırılması Tartışma bölümünde yapılır.`, 'g-tartisma', c);
        if (!data) add('bulgular', 'info', 'Veri sunumu', 'Ayrıntılı sayısal verileri ve gruplar arası farkları tablo ya da şekille verin; istatistiksel testin sonucunu yalnızca p değeriyle değil, test değeriyle birlikte yazın.', 'g-bulgular', null, 'Tablo 1’de … dağılımı sunulmuştur.');
      }
      cl('bulgular', [['Yorum içermiyor', filled('bulgular') && !interp.length], ['Literatür karşılaştırması yok', filled('bulgular') && !cites.length], ['Veri / tablo sunumu', filled('bulgular') && data]]);
    }

    // ---- Tartışma ----
    {
      const t = raw('tartisma'), wc = wordCount(t);
      const cites = citations(t).length + findAll(t, numericCite, false).length;
      const sinir = has(t, stemRe(['sınırlılık', 'sınırlı', 'kısıtlılık', 'kısıt', 'genellenebilir', 'genelleme']));
      const yorum = has(t, stemRe(['açıklanabilir', 'neden', 'göstermekte', 'işaret', 'düşündürmekte', 'anlamına', 'yorumlan', 'örtüş', 'uyumlu', 'tutarlı', 'farklı']));
      if (!filled('tartisma')) add('tartisma', 'error', 'Tartışma eksik', 'Tartışma, bulguların girişte belirtilen boşluğu nasıl doldurduğunu açıklar ve bulguları önceki çalışmalarla karşılaştırır.', 'g-tartisma');
      else {
        if (cites === 0) add('tartisma', 'warn', 'Bulgular literatürle karşılaştırılmamış', 'Kaynakların çoğu bu bölümde yer alır: bulgularınızı yerel ve uluslararası çalışmalarla karşılaştırın.', 'g-tartisma', null, 'Bu bulgu, … (Yazar, Yıl) çalışmasının sonuçlarıyla örtüşmektedir.');
        if (!sinir) add('tartisma', 'info', 'Sınırlılıklar belirtilmemiş', 'Yorumunuzun sınırlılıklarını ve bulguların genellenebilirliğini tartışın.', 'g-tartisma', null, 'Araştırmanın bazı sınırlılıkları bulunmaktadır: …');
        if (!yorum) add('tartisma', 'info', 'Yorum ve olası açıklamalar', 'Bulguların anlamını ve olası açıklamalarını ele alın.', 'g-tartisma', null, 'Elde edilen sonuç, … ile açıklanabilir.');
        if (wc < 120) add('tartisma', 'info', `Tartışma kısa (${wc} kelime)`, 'Bulguların anlamı, sınırlılıkları ve literatürle ilişkisi daha ayrıntılı ele alınabilir.', 'g-tartisma');
      }
      cl('tartisma', [['Literatürle karşılaştırma', cites > 0], ['Yorum / açıklamalar', yorum], ['Sınırlılıklar', sinir]]);
    }

    // ---- Sonuç ----
    {
      const t = raw('sonuc');
      const cites = citations(t);
      const oneri = has(t, stemRe(['öneril', 'öneri', 'önerilmekte', 'tavsiye', 'gelecek araştırma', 'ileride', 'incelenebilir', 'yapılabilir', 'gerekmektedir']));
      const ref = bodyIds.filter(id => id !== 'sonuc').map(raw).join('\n');
      const newNums = wordCount(ref) > 80 ? numbersIn(t).filter(n => !containsNumber(ref, n.v)) : [];
      if (!filled('sonuc')) add('sonuc', 'error', 'Sonuç eksik', 'Sonuç, ana bulguları kapsar ve okuyucunun aklında kalacak mesajı verir.', 'g-sonuc');
      else {
        for (const c of cites) add('sonuc', 'warn', 'Sonuçta kaynak', `“${t.slice(c.start, c.end)}” — sonuç, çalışmanın kendi ana bulgularını özetler; literatür karşılaştırması Tartışma’nın işidir.`, 'g-sonuc', c, 'Karşılaştırmayı Tartışma bölümüne taşıyın.');
        for (const n of newNums) add('sonuc', 'warn', 'Sonuçta bulgularda olmayan veri', `“${n.v}” değeri Bulgular/Tartışma’da geçmiyor. Sonuç, sunulmuş bulgulara dayanmalıdır; kanıtlanmamış bulguları öne çıkarmak yaygın bir hatadır.`, 'g-sonuc', n);
        if (!oneri) add('sonuc', 'info', 'Öneri yok', 'Gerekirse uygulamaya veya gelecek araştırmalara yönelik öneriler sunun.', 'g-sonuc', null, 'Bulgular doğrultusunda … önerilmektedir.');
      }
      cl('sonuc', [['Kaynak atfı yok', filled('sonuc') && !cites.length], ['Yalnızca sunulan bulgular', filled('sonuc') && !newNums.length], ['Öneriler', oneri]]);
    }

    // ---- Kaynakça ve atıf denetimi ----
    {
      const t = raw('kaynakca');
      const lines = [];
      { let pos = 0; for (const line of t.split('\n')) { if (line.trim()) lines.push({ text: line, start: pos, end: pos + line.length }); pos += line.length + 1; } }
      const numeric = bodyIds.some(id => findAll(raw(id), numericCite, false).length);
      const allCites = [];
      for (const id of ['ozet', ...bodyIds]) for (const c of citations(raw(id))) allCites.push({ ...c, section: id });
      const kLow = lower(t);
      let missing = 0, noYear = 0;

      if (!filled('kaynakca')) {
        add('kaynakca', 'error', 'Kaynakça eksik', 'Metinde atıf yapılan her kaynak kaynakçada yer almalıdır. Başkasının bilgisini kaynak göstermeden kullanmak intihaldir.', 'g-sorumluluk');
      } else {
        for (const l of lines) {
          if (!new RegExp(YEAR, 'u').test(l.text) && !/t\.y\.|n\.d\./i.test(l.text)) { noYear++; add('kaynakca', 'warn', 'Kaynakta yıl bilgisi yok', `“${l.text.trim().slice(0, 60)}…” — künyede yayın yılı bulunmalıdır (yılı yoksa “t.y.” yazılır).`, 'g-kaynakca', l); }
          else if (wordCount(l.text) < 5) add('kaynakca', 'info', 'Eksik künye olabilir', `“${l.text.trim()}” — yazar, yıl, eser adı ve yayın bilgisi eksiksiz olmalıdır.`, 'g-kaynakca', l);
        }
        if (!numeric) {
          const sur = lines.map(l => (l.text.trim().match(/^\p{Lu}[\p{L}\-]+/u) || [''])[0]);
          for (let i = 1; i < sur.length; i++) if (sur[i] && sur[i - 1] && sur[i].localeCompare(sur[i - 1], 'tr') < 0) {
            add('kaynakca', 'info', 'Kaynakça alfabetik değil', `“${sur[i]}”, “${sur[i - 1]}” kaynağından önce gelmeli. APA’da kaynakça yazar soyadına göre alfabetik sıralanır.`, 'g-kaynakca', lines[i]);
            break;
          }
          const cited = new Set(allCites.map(c => lower(c.surname)));
          lines.forEach((l, i) => { if (sur[i] && !cited.has(lower(sur[i])) && !citedCoauthor(l.text, cited)) add('kaynakca', 'info', 'Metinde atıf yapılmamış kaynak', `“${sur[i]}” kaynakçada var ama metinde atıf bulunamadı. Kaynakçadaki her eser metinde de anılmalıdır.`, 'g-kaynakca', l); });
        }
      }
      if (filled('kaynakca') && !numeric) {
        const reported = new Set();
        for (const c of allCites) {
          const key = lower(c.surname) + c.year;
          if (reported.has(key)) continue;
          if (!kLow.includes(lower(c.surname))) {
            reported.add(key); missing++;
            add(c.section, 'error', 'Atıf kaynakçada yok', `“${c.surname} (${c.year})” metinde atıf olarak geçiyor ama kaynakçada bulunamadı.`, 'g-kaynakca', c, 'Kaynağı kaynakçaya ekleyin ya da atfı düzeltin.');
          } else if (!kLow.includes(c.year)) {
            reported.add(key);
            add(c.section, 'warn', 'Atıf yılı kaynakçayla uyuşmuyor', `“${c.surname} (${c.year})” — kaynakçada bu yazar için ${c.year} yılı bulunamadı.`, 'g-kaynakca', c);
          }
        }
      }
      cl('kaynakca', [['Kaynakça yazıldı', filled('kaynakca')], ['Tüm atıflar kaynakçada', filled('kaynakca') && missing === 0], ['Künyelerde yıl var', filled('kaynakca') && noYear === 0]]);
    }

    // ---- Türkçe bölümlerde dil, üslup ve imla ----
    for (const id of trSections) {
      const t = raw(id);
      if (!t.trim()) continue;
      const sents = sentences(t);

      for (const m of findAll(t, wordRe(SUBJECTIVE.words)))
        add(id, 'warn', 'Öznel / kişisel ifade', `“${m.text}” — Türkçe makalelerde yazar çoğunlukla örtük yapılarla geri planda kalır; “ben/biz” zamirleri ve kişisel kanaat bildiren ifadeler seyrektir. Alanınızda yaygınsa bilinçli olarak kullanabilirsiniz.`, 'g-oznel', m, SUBJECTIVE.fix);
      for (const m of findAll(t, FIRST_PERSON_VERB))
        add(id, 'info', 'Birinci kişi anlatım', `“${m.text}” — Türkçe makalelerde yazar çoğunlukla öznesi belirtilmemiş edilgen yapılarla anlatır. Bu bir tercih meselesidir; dergi ve alan alışkanlığına göre karar verin.`, 'g-oznel', m, 'Örn. “Verileri analiz ettik.” → “Veriler analiz edilmiştir.”');
      for (const m of findAll(t, wordRe(Object.keys(COLLOQUIAL)))) {
        const k = Object.keys(COLLOQUIAL).find(w => new RegExp(`^${esc(w)}$`, 'u').test(lower(m.text))) || lower(m.text);
        add(id, 'warn', 'Gündelik dil', `“${m.text}” gündelik konuşmaya ait; resmî akademik yazıda kaçınılmalıdır.`, 'g-uslup', m, COLLOQUIAL[k] || 'Resmî bir ifade kullanın.');
      }
      for (const m of findAll(t, wordRe(EMOTIONAL)))
        add(id, 'warn', 'Değer yargısı / abartı', `“${m.text}” — çözümleyici yazıda yazar kişisel değer yargılarından kaçınır; nitelendirmeyi veriyle destekleyin.`, 'g-uslup', m, 'İfadeyi kaldırın ya da veriyle destekleyin.');
      for (const m of findAll(t, wordRe(VAGUE)))
        add(id, 'warn', 'Belirsiz / genel ifade', `“${m.text}” — fazla genel sözcükler anlamı belirsizleştirir; neyi kastettiğinizi somut olarak yazın.`, 'g-dil-hatalar', m, 'Neyi kastettiğinizi somut olarak belirtin.');
      for (const m of findAll(t, wordRe(GENERAL))) {
        const s = sentenceAt(sents, m.start);
        if (!s || !hasCitation(s.text)) add(id, 'warn', 'Kaynaksız genelleme', `“${m.text}” — bu iddia bir kaynağa dayanmıyor. Önceki çalışmalardan kaynak göstermeden söz etmek, makale değerlendirmesinde sık rastlanan bir kusurdur.`, 'g-dil-hatalar', m, 'İddiayı bir kaynakla destekleyin (Yazar, Yıl) ya da kapsamını daraltın.');
      }
      for (const m of findAll(t, /!+/g, false))
        add(id, 'warn', 'Ünlem işareti', 'Ünlem duygu ve heyecan bildirir; resmî akademik yazıda kullanılmaz.', 'g-uslup', m, 'Noktayla bitirin.');
      for (const s of sents) {
        const wc = wordCount(s.text);
        if (wc > 40) add(id, 'warn', `Çok uzun cümle (${wc} kelime)`, 'Uzun ve çok yüklü cümleler okumayı zorlaştırır. Her cümlede tek bir ana düşünce verin.', 'g-cumle', s, 'Cümleyi ikiye bölün.');
      }
      for (const m of findAll(t, new RegExp(`(?<![${LN}])([\\p{L}]+)\\s+\\1(?![${LN}])`, 'gu'))) {
        const w = lower(m.groups[1]);
        // Türkçede doğru olan ikilemeler (ayrı ayrı, teker teker, grup grup…)
        if (['zaman', 'yavaş', 'adım', 'ara', 'kat', 'yer', 'gün', 'yıl', 'tek', 'sık', 'kısım', 'parça', 'aşama', 'yan', 'iki', 'üç', 'birer', 'ikişer', 'kimi', 'bile',
          'ayrı', 'teker', 'çeşit', 'türlü', 'sıra', 'grup', 'bölüm', 'tane', 'dönem', 'kişi', 'madde', 'derece', 'basamak', 'katman', 'satır', 'soru', 'konu', 'ay', 'hafta', 'saat',
          'üçer', 'dörder', 'beşer', 'onar', 'azar', 'çift', 'baştan', 'öbek', 'küme'].includes(w)) continue;
        add(id, 'warn', 'Tekrarlanan sözcük', `“${m.text}” — yazım hatası ya da gereksiz tekrar.`, 'g-cumle', m, 'Sözcüklerden birini silin.');
      }
      for (const m of findAll(t, wordRe(Object.keys(SPELLING))))
        add(id, 'warn', 'Yazım hatası', `“${m.text}” yanlış yazılmış.`, 'g-imla-hatalar', m, `Doğrusu: “${SPELLING[lower(m.text).replace(/\s+/g, ' ')] || '—'}”.`);
      for (const m of findAll(t, KI_ATTACHED)) {
        if (KI_OK.has(lower(m.text))) continue;
        add(id, 'warn', '“ki” bağlacı bitişik yazılmış', `“${m.text}” — bağlaç olan “ki” ayrı yazılır.`, 'g-imla-hatalar', m, `“${m.text.slice(0, -2)} ki”`);
      }
      for (const m of findAll(t, MI_ATTACHED))
        add(id, 'warn', 'Soru eki “mi” bitişik olabilir', `“${m.text}” — soru eki “mi” ayrı yazılır.`, 'g-imla-hatalar', m, `“${m.text.slice(0, -2)} ${m.text.slice(-2)}”`);
      for (const m of findAll(t, stemRe(Object.keys(FOREIGN)))) {
        const k = Object.keys(FOREIGN).find(w => lower(m.text).startsWith(w));
        add(id, 'info', 'Yabancı kökenli sözcük', `“${m.text}” — yerleşik bir Türkçe karşılığı varsa onu kullanmayı düşünün.`, 'g-birlik', m, `Önerilen: “${FOREIGN[k]}”.`);
      }
      if (id !== 'baslik') for (const m of findAll(t, CONCEPT_CAP, false)) {
        const before = t.slice(0, m.start);
        if (!/[\p{Ll}\d,;:]\s+$/u.test(before)) continue;
        add(id, 'info', 'Gereksiz büyük harf?', `“${m.text}” — büyük harf cümle başında ve özel adlarda kullanılır; genel kavram adları cümle içinde küçük harfle yazılır. Kurum, ölçek veya özel ad ise doğrudur.`, 'g-buyuk', m);
      }
      if (sents.length >= 5) {
        const passive = sents.filter(s => { const w = lower(s.text).match(/[\p{L}]+(?=[^\p{L}]*$)/u); return w && PASSIVE_END.test(w[0]); }).length;
        if (passive / sents.length >= 0.85) add(id, 'info', 'Edilgen yapı yoğunluğu', `Cümlelerin ${passive}/${sents.length} kadarı edilgen. Edilgen yapı Türkçe makalelerde yaygındır; ancak art arda gelen edilgen cümleler okumayı ağırlaştırabilir. Bazı cümlelerde “Bu çalışma … göstermektedir.” gibi etken yapılar kullanabilirsiniz.`, 'g-oznel');
      }
    }

    // ---- Kısaltmalar: ilk geçtiği yerde açık yazılmalı ----
    {
      const seen = new Set();
      for (const id of ['ozet', ...bodyIds]) {
        const t = raw(id);
        for (const m of findAll(t, /(?<![\p{L}\p{N}])\p{Lu}{2,6}(?![\p{L}\p{N}])/gu, false)) {
          const ab = m.text;
          if (/^[IVXLCDM]+$/.test(ab) || seen.has(ab)) continue;
          const ctx = t.slice(Math.max(0, m.start - 25), m.end + 25);
          if ((ctx.match(/\p{Lu}{2,}/gu) || []).length > 3) continue; // tamamı büyük harfle yazılmış metin
          seen.add(ab);
          const prev = t.slice(0, m.start).trimEnd().slice(-1);
          const after = t.slice(m.end).match(/^\s*\(([^)]*)\)/);
          const expanded = prev === '(' || (after && /\p{Ll}/u.test(after[1]));
          if (!expanded) add(id, 'warn', 'Kısaltma açılmamış', `“${ab}” ilk kez burada geçiyor. Kısaltmayı ilk kullanımda açık adıyla birlikte verin, sonrasında kısaltmayı kullanın.`, 'g-birlik', m, `Örn. “Millî Eğitim Bakanlığı (MEB)” biçiminde: “… (${ab})”.`);
        }
      }
    }

    // ---- Terim tutarlılığı (tüm metin) ----
    {
      const all = trSections.map(raw).join('\n');
      for (const [a, b] of TERM_PAIRS) {
        const ra = findAll(all, stemRe([a])), rb = findAll(all, new RegExp(`(?<![${LN}])(?:${b})[${LN}]*`, 'gu'));
        if (ra.length && rb.length) {
          const loc = trSections.find(id => has(raw(id), new RegExp(`(?<![${LN}])(?:${b})[${LN}]*`, 'gu')));
          const r = findAll(raw(loc), new RegExp(`(?<![${LN}])(?:${b})[${LN}]*`, 'gu'))[0];
          add(loc, 'warn', 'Terim tutarsızlığı', `Aynı kavram için hem “${ra[0].text}” hem “${r.text}” kullanılmış. Farklı sözcük kullanmak okuyucuda ikinci sözcüğün başka bir anlamı olup olmadığı sorusunu doğurur.`, 'g-terim', r, `Tek bir terim seçin (tercihen “${a}”).`);
        }
      }
    }

    // ---- Puan ----
    const order = SECTIONS.map(s => s.id);
    const lv = { error: 0, warn: 1, info: 2 };
    issues.sort((x, y) => order.indexOf(x.section) - order.indexOf(y.section) || lv[x.level] - lv[y.level] || ((x.range && x.range.start) || 0) - ((y.range && y.range.start) || 0));
    const count = l => issues.filter(i => i.level === l).length;
    const stats = { errors: count('error'), warns: count('warn'), infos: count('info'), words: SECTIONS.filter(s => s.lang === 'tr').reduce((n, s) => n + wordCount(raw(s.id)), 0) };
    const anyFilled = SECTIONS.some(s => filled(s.id));
    const score = anyFilled ? Math.max(0, Math.round(100 - stats.errors * 9 - stats.warns * 3 - stats.infos * 0.5)) : 0;
    return { issues, checklists, stats, score };
  }

  function keywordAligned(kwText, title) {
    const tl = lower(title);
    return kwText.split(/[,;]/).map(s => lower(s.trim())).filter(Boolean)
      .some(k => k.split(/\s+/).some(w => w.length >= 3 && tl.includes(w.slice(0, Math.max(3, Math.min(w.length, 5))))));
  }

  function citedCoauthor(line, cited) {
    // "Demir, A. ve Kaya, B." gibi künyelerde ikinci yazar atıfta geçiyorsa sayılır
    return (line.match(/\p{Lu}[\p{L}\-]+(?=,\s*\p{Lu}\.)/gu) || []).some(n => cited.has(lower(n)));
  }

  const api = { SECTIONS, REFS, SOURCES, REF_SRC, DEFAULT_LIMITS, analyze, wordCount, sentences, citations };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MakaleRules = api;
})(typeof window !== 'undefined' ? window : globalThis);
