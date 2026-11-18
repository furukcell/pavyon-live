# PAVYON LIVE

**TikTok LIVE izleyicilerinin yorum, beğeni ve hediyelerle gerçek zamanlı katıldığı 3D pavyon simülasyonu.**

> Durum: Mobil uyumlu oynanabilir prototip geliştirme aşamasında. TikTok LIVE entegrasyonu henüz etkin değildir; mevcut sürüm test paneli ve yerel olay köprüsü kullanır.

## Ürün hedefi

Üstten izometrik kameraya sahip 3D pavyon oyunu. İzleyici, kullanıcı adına bağlı karakteriyle mekâna katılır; dans eder, masaya oturur veya sahneye çıkar. Hediye olayları, açıkça tanımlanmış sanal oyun aksiyonlarını tetikler.

## Oyun dünyası

- Kırmızı kadife oturma grupları ve altın detaylar.
- Dans pisti, müşteri masaları, VIP loca, sahne ve servis alanı.
- Ankara havası / bireysel oyun havası yaklaşımı; halay mekaniği yok.
- İlk hedef dikey 9:16 yayın ekranı ve telefon tarayıcısıdır.

## Karakter hedefleri

| Rol | İlk prototip | Nihai hedef |
|---|---:|---:|
| Müşteri | 10 test karakteri | Aynı anda en fazla 100 |
| Kons | 10 | 10 farklı karakter |
| Garson | 5 | 5 (aynı temel modelin kopyaları) |

Müşteri görünüm kataloğunda 100 erkek ve 100 kadın olmak üzere 200 prosedürel görünüm tanımı bulunur (`characterCatalog.js`). Bunlar aynı anda sahneye konmaz; aktif 100 müşteri bu havuzdan sırayla seçilir. Bu katalog şu an renk, ten, saç stili, boy ve vücut oranı parametreleridir; henüz 200 ayrı profesyonel 3D model dosyası değildir. Nihai aktif sahne hedefi 115 aktördür: 100 müşteri + 10 kons + 5 garson.

Sahnede 10 ayrı renk/stil varyantlı kons ve aynı temel görünümden türetilen 5 garson örneği oluşturulur. Müşteri görünümü şu an prosedürel renk, ten, saç ve gövde varyasyonlarıyla çeşitlendirilir; bu henüz 100 ayrı, elle tasarlanmış model değildir. Sahnede 10 farklı renk/aksesuar varyantlı kons ve aynı temel görünümden türetilen 5 garson örneği oluşturulur. Müşteriler 200 girişli prosedürel görünüm kataloğundan beslenir. İlk prototipte kullanılan basit geometrik karakterler geçici placeholder'lardır. Nihai karakterler riglenmiş, optimize edilmiş 3D modeller ve animasyonlar gerektirir. Her modelin lisansı kontrol edilmelidir.

## İzleyici komutları

| Yorum | Aksiyon |
|---|---|
| `!gel` | Oyuncuyu mekâna alır. |
| `!dans` | Karakteri dans pistine gönderir. |
| `!masa` | Karakteri masaya gönderir. |
| `!sahne` | Karakteri sahneye gönderir. |

Komutlar sunucu tarafında doğrulanmalı ve spam sınırına tabi olmalıdır. Beğeniler ortak ışık/atmosfer göstergesini etkiler.

## Hediye aksiyonları

- **Konsu masaya davet:** Müsait kons müşterinin masasına gider. İlk prototip zamanlayıcısı 5 dakikadır.
- **Konsla dans:** İki karakter dans alanına gider. Varsayılan süre 5 dakikadır.
- **İçecek:** Garson servis animasyonu yapar.
- **VIP daveti:** Kons ve izleyici VIP locaya geçer.
- **Sahne gösterisi:** İzleyici sahneye gider.

Bir kons aynı anda tek etkileşimde olabilir. İlk sürümde daha yüksek hediyeyle mevcut etkileşimi kesen açık artırma mekaniği yoktur. Hediye karşılıkları ve süreleri yayında açıkça belirtilmelidir. Bunlar yalnızca sanal oyun içi eğlence aksiyonlarıdır.

## Teknik mimari

- İstemci: Vite + JavaScript + Three.js.
- Sunucu: Node.js + Express.
- Gerçek zamanlı iletişim: Socket.IO.
- Geliştirme olayı: Test paneli ve `/dev/event` yerel köprüsü.
- Üretim: Express, `dist/` klasöründeki istemciyi ve Socket.IO'yu aynı origin üzerinden sunar.

TikTok LIVE olay erişimi entegrasyon yöntemine, hesap izinlerine ve platformun güncel koşullarına bağlıdır. Resmî erişim garanti varsayılmaz. Oyun TikTok bağlantısı olmadan test edilebilir kalmalıdır.

## Repo yapısı

```text
pavyon-live/
├── README.md
├── package.json
├── vite.config.js
├── .gitignore
├── .env.example
├── client/
│   ├── index.html
│   └── src/
│       ├── main.js
│       ├── style.css
│       └── game/createScene.js
├── server/index.js
└── dist/                 # build çıktısı; repoya eklenmez
```

## Geliştirme

Gereksinim: Node.js 20.19+.

```bash
npm install
npm run dev
```

- Oyun: `http://localhost:5173`
- Sunucu sağlık kontrolü: `http://localhost:3001/health`
- Vite, Socket.IO bağlantısını geliştirme sırasında 3001 portuna proxy eder.

Üretim derlemesi ve tek sunucu üzerinde çalıştırma:

```bash
npm run build
npm start
```

Sunucu varsayılan olarak `http://localhost:3001` üzerinde hem oyunu hem Socket.IO bağlantısını sunar. Hosting ortamında PORT değişkeni desteklenir.

## Test olay köprüsü

Geliştirme modunda sunucuya HTTP POST gönderilebilir:

```bash
curl -X POST http://localhost:3001/dev/event ^
  -H "Content-Type: application/json" ^
  -d "{\"type\":\"comment\",\"username\":\"test_user\",\"comment\":\"!gel\"}"
```

Desteklenen olay türleri `comment`, `like`, `gift`. Hediye olayında `action` alanı `invite`, `dance`, `drink`, `vip` veya `stage` değerlerinden biri olursa istemci ilgili oyun aksiyonunu başlatır. Örnek: `{ "type": "gift", "username": "test_user", "giftName": "Rose", "action": "dance", "konsId": "kons-1" }`. Bu uç nokta geliştirme içindir; production ortamında kapalıdır ve TikTok webhook'u değildir.

## Güvenlik

- Token, API anahtarı veya gerçek yayın kimlik bilgisi repoya eklenmez.
- `.env` dosyası Git tarafından yok sayılır.
- İstemci tarafındaki komutlar güvenilir ödeme/hediye kanıtı sayılmaz.
- Gerçek hediye olayları gelecekte kaynak doğrulaması ve olay tekilleştirmesi yapan adaptörden geçirilmelidir.
- İzleyici adları ekranda HTML olarak basılmadan önce kaçışlanır.

## Yol haritası

1. Mobil görünüm ve 3D mekân prototipi.
2. Müşteri/kons/garson hareketleri ve animasyonları.
3. Kons meşguliyet, süre ve dönüş yönetimi.
4. Gelişmiş test paneli ve olay simülatörü.
5. 10 kons + 5 garson + 100 müşteri kapasitesi.
6. TikTok LIVE adaptörü ve platform uygunluk kontrolü.
7. Hosting, OBS ve telefon tarayıcısı testleri.

## İlk prototip kabul kriterleri

- Tarayıcıda 3D sahne açılır.
- Mobil ekranda arayüz taşmadan kullanılabilir.
- Test panelindeki yorum simülatörüyle `!gel`, `!dans`, `!masa`, `!sahne` komutları denenebilir.
- +10 ve +25 test müşteri butonlarıyla 100 kişilik kapasite denenebilir.
- +10 ve +25 test müşteri butonlarıyla 100 kişilik kapasite denenebilir.
- Müşteriler boş masa koltuklarına oturabilir; dolu koltuklar yeniden atanmaz.
- +10 ve +25 test müşteri butonlarıyla kapasite yükü denenebilir.
- Sahne başlangıcında 10 kons ve 5 garson yer alır.
- Kons aynı anda iki izleyiciye atanamaz.
- Hediye testleri davet, dans, servis, VIP ve sahne aksiyonlarını tetikler.
- Sunucu ve istemci aynı origin üzerinden production modunda çalışabilir.
