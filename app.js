// Türk alfabesi (A-Z) + Tümü
const harfler = [
    "Tümü","A","B","C","Ç","D","E","F","G","Ğ","H","I","İ","J","K","L","M","N","O","Ö","P","R","S","Ş","T","U","Ü","V","Y","Z"
];

// Uygulama durumu
let aktifHarf = "Tümü";
let aramaSorgu = "";
let sozlukVerisi = [];

// DOM referansları
const lettersEl = document.getElementById("letters");
const resultsEl = document.getElementById("results");
const emptyEl = document.getElementById("empty");
const searchInput = document.getElementById("searchInput");

// Harf butonlarını oluşturur
function olusturHarfButonlari() {
    lettersEl.innerHTML = "";
    harfler.forEach(harf => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = harf;
        btn.className = harf === aktifHarf ? "active" : "";
        btn.setAttribute("aria-pressed", harf === aktifHarf ? "true" : "false");
        btn.addEventListener("click", () => {
            aktifHarf = harf;
            guncelle();
        });
        lettersEl.appendChild(btn);
    });
}

// Türkçe küçük harfe dönüşüm (i/I/İ farkını doğru işler)
function kucukTR(s) {
    return (s || "").toLocaleLowerCase("tr");
}

// Filtreleme mantığı: harf + arama sorgusu birlikte uygulanır
function filtrele(kayit) {
    const kelime = kayit.kelime || "";
    const anlam = kayit.anlam || "";

    const harfUygun = aktifHarf === "Tümü"
        ? true
        : kucukTR(kelime).startsWith(kucukTR(aktifHarf));

    const sorgu = kucukTR(aramaSorgu).trim();
    const aramaUygun = !sorgu
        ? true
        : kucukTR(kelime).includes(sorgu) || kucukTR(anlam).includes(sorgu);

    return harfUygun && aramaUygun;
}

// Sonuçları çizer
function render(sonuclar) {
    resultsEl.innerHTML = "";

    if (!sonuclar.length) {
        emptyEl.hidden = false;
        return;
    }
    emptyEl.hidden = true;

    sonuclar.forEach(k => {
        const card = document.createElement("article");
        card.className = "card";
        card.setAttribute("role", "listitem");

        const title = document.createElement("div");
        title.className = "kelime";
        title.textContent = k.kelime;

        const anlam = document.createElement("div");
        anlam.className = "anlam";
        anlam.textContent = k.anlam;

        const ornek = document.createElement("div");
        ornek.className = "ornek";
        ornek.textContent = k.ornek;

        card.appendChild(title);
        card.appendChild(anlam);
        card.appendChild(ornek);
        resultsEl.appendChild(card);
    });
}

// Durumu günceller ve yeniden çizer
function guncelle() {
    // Harf butonlarında aktif durumu yenile
    Array.from(lettersEl.children).forEach(btn => {
        const aktif = btn.textContent === aktifHarf;
        btn.classList.toggle("active", aktif);
        btn.setAttribute("aria-pressed", aktif ? "true" : "false");
    });

    const sonuclar = sozlukVerisi
        .filter(filtrele)
        .sort((a, b) => kucukTR(a.kelime).localeCompare(kucukTR(b.kelime), "tr"));

    render(sonuclar);
}

// Etkinlikler: gerçek zamanlı arama
searchInput.addEventListener("input", (e) => {
    aramaSorgu = e.target.value;
    guncelle();
});

// Başlat
olusturHarfButonlari();

// İlk durumda yükleniyor mesajı
emptyEl.hidden = false;
emptyEl.textContent = "Yükleniyor…";

// Veriyi yükle
fetch('data.json')
    .then(r => r.json())
    .then(data => {
        sozlukVerisi = Array.isArray(data) ? data : [];
        emptyEl.textContent = "Hiçbir kelime bulunamadı. Yeni kelime önerin!";
        guncelle();
    })
    .catch(() => {
        emptyEl.hidden = false;
        emptyEl.textContent = "Veri yüklenemedi. Lütfen daha sonra tekrar deneyin.";
    });


