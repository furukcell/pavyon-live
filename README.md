# PAVYON LIVE

**TikTok LIVE izleyicilerinin yorum, beğeni ve hediyelerle gerçek zamanlı olarak katıldığı 3D pavyon simülasyonu.**

> Durum: İlk prototip geliştirme aşamasında. TikTok LIVE bağlantısı henüz etkin değildir; oyun önce yerel test simülatörüyle çalışır.

## Ürün hedefi

PAVYON LIVE, dikey canlı yayın ekranında çalışan, üstten izometrik kameraya sahip bir 3D pavyon oyunudur. İzleyici yorumla mekâna katılır, kendi kullanıcı adına bağlı karakteriyle dans eder veya masaya geçer. Test edilen/bağlanan LIVE olayları, oyun motorundan ayrı bir adaptör üzerinden oyun aksiyonlarına dönüştürülür.

## Oyun dünyası

Tek mekânlı ilk sürümde dans pisti, müşteri masaları, VIP loca, sahne ve servis alanı bulunur. Görsel dil kırmızı kadife, altın detaylar ve sıcak gece kulübü ışıkları üzerine kuruludur. Müzik ve dans yaklaşımı Ankara havası ve bireysel oyun havasıdır; halay mekaniği yoktur.

## Karakter hedefleri

| Rol | İlk prototip | Nihai hedef |
|---|---:|---:|
| Müşteri | 10 test karakteri | Aynı anda en fazla 100 |
| Kons | 3 | 10 farklı karakter |
| Garson | 2 | 5 (aynı temel modelin kopyaları) |

Müşteri görünüm kütüphanesi 100 erkek ve 100 kadın varyantından oluşur. Bu 200 varyant aynı anda sahneye konmaz; aktif 100 müşteri görünümü bu havuzdan seçilir. Nihai sahne hedefi 100 müşteri + 10 kons + 5 garson = 115 aktif aktördür.

Görsel konsept çizimi tek başına animasyonlu, oyuna hazır 3D model değildir. Modellerin uygun formatta (tercihen glTF/GLB), rig ve animasyonlarıyla üretilmesi/optimize edilmesi gerekir. Kullanılan her modelin lisansı doğrulanmalıdır.

## İzleyici etkileşimleri

İlk komutlar:

| Komut | Davranış |
|---|---|
| `!gel` | İzleyiciyi oyuna alır (kapasite ve tekrar kontrolüyle). |
| `!dans` | İzleyici karakterini dans alanına gönderir. |
| `!masa` | Uygun masaya oturtur. |
| `!sahne` | Sahne isteği oluşturur. |

Beğeniler ortak atmosfer/ışık göstergesine katkı verir. Spam engeli ve komut bekleme süreleri sunucu tarafında uygulanır.

## Hediye aksiyonları

Hediye eşleştirmeleri konfigürasyonla belirlenir. Hediye olayı doğrulandıktan sonra:

- **Konsu masaya davet:** Müsait kons masaya yürür, oturur ve ayarlanmış süre sonunda boşta kalır.
- **Konsla dans:** Kons ve izleyici dans alanına gider; varsayılan etkileşim süresi 5 dakikadır. Ardından kons müşterinin masasına/boş bekleme noktasına döner.
- **İçecek:** Garson seçili masaya servis animasyonu yapar.
- **VIP daveti:** İzleyici ve müsait kons VIP locaya gider; süre sonunda kons serbest kalır.
- **Sahne gösterisi:** Sahne animasyonu tetiklenir.

Her kons aynı anda tek bir etkileşimde olabilir. İlk sürümde daha yüksek hediye ile devam eden etkileşimi kesen açık artırma/kapma mekaniği yoktur. Hediye karşılıkları ve süreleri yayın ekranında açıkça belirtilmelidir. Bunlar yalnızca sanal oyun içi eğlence aksiyonlarıdır; gerçek dünyada hizmet veya ürün vaadi değildir.

## Teknik mimari

- **İstemci:** Vite + JavaScript + Three.js (WebGL 3D sahne).
- **Sunucu:** Node.js + Express.
- **Gerçek zamanlı iletişim:** Socket.IO.
- **Olay kaynağı:** İlk aşamada yerel Event Simulator; ileride ayrı TikTok LIVE adaptörü.
- **Dağıtım/yayın:** Tarayıcıda çalışan oyun, OBS veya uyumlu yayın yazılımına kaynak olarak verilir. Dikey 9:16 görünüm hedeflenir.

TikTok LIVE yorum/beğeni/hediye erişimi kullanılan entegrasyonun, hesap erişiminin ve platformun güncel koşullarının izin verdiği ölçüde uygulanabilir. Resmî API erişimi varmış gibi varsayılmaz. Oyun, TikTok bağlantısı olmadan test simülatörüyle oynanabilir kalacaktır.

## Repo yapısı

```text
pavyon-live/
├── README.md
├── package.json
├── .gitignore
├── .env.example
├── client/
│   ├── index.html
│   └── src/
│       ├── main.js
│       ├── style.css
│       └── game/
│           ├── createScene.js
│           └── demoWorld.js
└── server/
    └── index.js
```

## Yerel geliştirme

Gereksinim: Node.js 20 veya üzeri.

```bash
npm install
npm run dev
```

Tarayıcıda `http://localhost:5173` açılır. Vite istemciyi sunar; Express/Socket.IO sunucusu varsayılan olarak `http://localhost:3001` adresinde çalışır.

İlk prototipte ekrandaki test paneli yorum, beğeni ve hediye olaylarını simüle eder. Gerçek TikTok bağlantısı yapılandırılana kadar canlı yayın olayları gelmez.

## Güvenlik ve gizlilik

- Gizli anahtarlar, erişim token'ları ve gerçek yayın kimlik bilgileri repoya konmaz.
- Yerel sırlar `.env` dosyasında tutulur; `.env.example` yalnızca değişken adlarını içerir.
- LIVE kullanıcı adları yalnızca oyun içi eşleştirme için gereken ölçüde işlenir.
- İstemciden gelen komutlar sunucuda doğrulanır; istemci tek başına hediye/ödül kararı veremez.
- Olaylar tekilleştirilir ve tekrar gelen hediye bildirimleri ikinci kez çalıştırılmaz.

## Geliştirme yol haritası

1. **Sahne prototipi:** İzometrik kamera, pavyon yerleşimi, ışık ve temel UI.
2. **Aktörler:** İlk müşteri/kons/garson placeholder modelleri ve hareket.
3. **Oyun durumları:** Oturma, dans, servis, VIP ve süre/rezervasyon yönetimi.
4. **Simülatör:** Yorum, beğeni ve hediye olaylarını panelden çalıştırma.
5. **TikTok adaptörü:** Erişim ve platform koşulları doğrulandıktan sonra.
6. **Optimizasyon:** 100 müşteri + 10 kons + 5 garson hedefi, dikey yayın testi.

## İlk oynanabilir prototip kabul kriterleri

- Oyun tarayıcıda hatasız açılır.
- İzometrik kamera ile pavyon sahnesi görünür.
- Test panelinden izleyici eklenebilir.
- `!gel`, `!dans`, `!masa` ve `!sahne` komutları temel aksiyonları tetikler.
- Kons meşgul/müsait durumu çakışma yaratmadan yönetilir.
- Test hediyeleri masaya davet, dans, içecek ve VIP aksiyonlarını simüle eder.
- Sunucu ve istemci yeniden başlatılınca hata vermeden tekrar çalışır.

---

**Nihai hedef:** TikTok LIVE'da izleyicilerin karakterleriyle katıldığı, yorumlarla hareketlenen ve hediye olaylarıyla önceden tanımlı oyun içi animasyonlar başlatan, yayın sırasında sürekli çalışabilen 3D sosyal oyun.
