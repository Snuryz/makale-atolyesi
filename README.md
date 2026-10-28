# Makale Atölyesi

Akademik yazım kurallarına göre makale yazmaya ve araştırma fişleri tutmaya yardım eden, tarayıcıda çalışan bir uygulama.

## Özellikler

**Makale Yaz**
- Başlık, öz, anahtar kelimeler, abstract, giriş, yöntem, bulgular, tartışma, sonuç ve kaynakça bölümleri
- Yazdıkça çalışan denetleyici: eksik bölümler, kaynaksız genellemeler, uzun cümleler, yazım ve noktalama uyarıları
- Canlı A4 önizleme (Times New Roman 12 pt, 1,5 satır, 2,5 cm kenar) ve PDF olarak indirme

**Fişler**
- Kaynak (bibliyografya) fişi: her eser için bir tane; künye APA 7'ye göre otomatik oluşturulur
- Not fişi: her bilgi için ayrı bir tane; türler **Doğrudan alıntı** (tırnak içinde), **Özet** (kendi cümlelerinle), **Yorum** ([Yorumum] ile işaretli)
- A5 ya da A6 yatay kâğıt önizlemesi ve fişleri tek tek ya da topluca PDF olarak indirme
- Not fişini atıfıyla birlikte makalenin ilgili bölümüne, künyeyi kaynakçaya aktarma

## Çalıştırma

Derleme gerekmez. Service worker kullandığı için dosyayı çift tıklamak yerine yerel bir sunucuyla açın:

```
python -m http.server 8000
```

Ardından tarayıcıda `http://localhost:8000` adresine gidin. Uygulama telefona ya da bilgisayara yüklenebilir (PWA) ve çevrimdışı çalışır. Yazılanlar yalnızca tarayıcınızda (localStorage) saklanır.

## Dosyalar

| Dosya | İçerik |
|---|---|
| `index.html` | Sayfa yapısı |
| `app.js` | Makale yazma ekranı, A4 önizleme, PDF |
| `rules.js` | Denetleyici kuralları |
| `examples.js` | Örnek makaleler |
| `fisler.js` | Fiş ekranı, künye ve atıf üretimi, A5/A6 önizleme |
| `styles.css` | Görünüm |
| `sw.js` | Çevrimdışı çalışma (dosya değişince `VERSION` artırılır) |
