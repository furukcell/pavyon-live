# PAVYON LIVE

**TikTok LIVE izleyicilerinin yorum, beğeni ve hediyelerle gerçek zamanlı olarak oyuna katıldığı 3D pavyon simülasyonu.**

- Proje adı: PAVYON LIVE
- Proje türü: 3D sosyal etkileşim / canlı yayın oyunu
- İlk hedef platform: Web tarayıcısı
- Yayın platformu: TikTok LIVE
- Kamera: Üstten izometrik görünüm
- Geliştirme yaklaşımı: Önce oynanabilir prototip, ardından tam özellikli oyun

---

## 1. Projenin amacı

PAVYON LIVE, TikTok LIVE yayını sırasında izleyicilerin oyunun içinde bir karakter olarak yer alabildiği, diğer izleyicilerle etkileşim kurabildiği ve TikTok hediyeleriyle özel oyun aksiyonları başlatabildiği interaktif bir 3D oyun olacaktır.

Yayıncı oyunu açtığında pavyon ortamı sürekli çalışır. İzleyiciler yorum yazarak mekâna katılır, karakterleriyle hareket eder, dans eder ve masalara oturur. Hediye gönderen izleyiciler ise belirlenmiş özel etkileşimleri başlatabilir.

Oyunun temel amacı:
- İzleyiciyi yayının pasif seyircisi olmaktan çıkarmak.
- Her izleyiciye oyunda kendisini temsil eden bir karakter sunmak.
- Pavyon ortamını sürekli canlı tutmak.
- Hediyeleri görsel ve oyun içi karşılığı olan aksiyonlara dönüştürmek.
- Yayında uzun süre izlenebilir, eğlenceli bir oyun döngüsü oluşturmak.

## 2. Oyun dünyası ve mekân

Oyun tek bir 3D pavyon mekânında başlayacaktır.

### Mekân bölümleri

- **Dans pisti:** İzleyicilerin bireysel dans edebileceği ana alan.
- **Müşteri masaları:** İzleyici karakterlerinin oturabileceği masalar.
- **VIP localar:** Özel hediye etkileşimleri için ayrılmış alanlar.
- **Sahne:** Özel dans ve gösteri animasyonlarının yapılacağı bölüm.
- **Servis alanı:** Garsonların içecek taşıdığı bölüm.

### Görsel tasarım

- Kırmızı kadife koltuklar.
- Altın detaylar.
- Pavyon tarzı masa ve loca düzeni.
- Sıcak ve renkli gece kulübü ışıklandırması.
- Türk pavyon atmosferi.
- Ankara havası ve oyun havası konseptine uygun müzik ve danslar.

**Halay mekaniği bulunmayacaktır.** Danslar bireysel veya iki karakterin birlikte yaptığı gösteriler şeklinde olacaktır.

## 3. Karakter sistemi

Karakterler üç ana gruba ayrılacaktır.

### 3.1. Müşteri karakterleri

Oyunda aynı anda en fazla 100 müşteri karakteri bulunması hedeflenmektedir.

Karakter çeşitliliği için bir görünüm kütüphanesi hazırlanacaktır:

- 100 farklı erkek müşteri görünümü.
- 100 farklı kadın müşteri görünümü.

Bu 200 görünüm aynı anda sahnede bulunmayacaktır. Sistem, aktif 100 müşteri için bu kütüphaneden karakter görünümü seçecektir.

Karakterler arasında yüz, saç, kıyafet ve aksesuar farklılıkları bulunacaktır.

Her izleyici karakteri TikTok kullanıcı adıyla ilişkilendirilecektir.

### 3.2. Kons karakterleri

Toplam 10 farklı kons karakteri bulunacaktır.

Her kons:
- Kendine özgü yüz ve görünüşe sahip olacaktır.
- Farklı saç ve kıyafet tasarımına sahip olacaktır.
- Masaya yürüyebilecektir.
- Müşteriyle oturabilecektir.
- Dans pistine gidebilecektir.
- Müşteriyle dans edebilecektir.
- VIP locaya geçebilecektir.
- Etkileşim süresi bitince uygun durumuna dönebilecektir.

Kons karakterlerinin durumları:

- AVAILABLE: Müsait.
- WALKING: Bir noktaya gidiyor.
- AT_TABLE: Müşteri masasında.
- DANCING: Dans ediyor.
- VIP: VIP locada.
- RETURNING: Başlangıç veya bekleme alanına dönüyor.

Bir kons aynı anda yalnızca bir müşteriye atanabilecektir.

### 3.3. Garson karakterleri

Toplam 5 garson bulunacaktır.

- Tek bir temel garson karakter tasarımı kullanılacaktır.
- Aynı modelden 5 karakter üretilecektir.
- Garsonlar masalara servis götürecektir.
- Hediye ile başlatılan içecek servislerinde animasyon yapacaktır.

## 4. Ücretsiz izleyici etkileşimleri

İzleyiciler yorum yazarak oyuna katılabilecektir.

İlk komut sistemi:

| Yorum | Oyun aksiyonu |
|---|---|
| `!gel` | İzleyiciyi oyuna dahil eder. |
| `!dans` | Karakterini dans pistine gönderir. |
| `!masa` | Karakterini uygun bir masaya oturtur. |
| `!sahne` | Sahneye çıkma isteği oluşturur. |

Komutlar spam ve kötüye kullanımı engellemek için bekleme süresi ve kontrol mekanizmasına sahip olacaktır.

### Beğeni sistemi

TikTok LIVE beğenileri oyunun ortak atmosfer göstergesine katkıda bulunacaktır.

Örnek mekanikler:
- Beğeni sayısı arttıkça ortam ışıkları hareketlenir.
- Belirli eşiklerde sahne ışıkları değişir.
- Pavyonun genel hareketliliği artar.
- Eşiklere ulaşıldığında ortak görsel efektler çalışır.

Beğeni eşikleri ve etkileri oyun ayarlarından değiştirilebilir olacaktır.

## 5. TikTok hediye sistemi

Hediyeler, oyunda otomatik olarak özel aksiyonlar başlatacaktır.

### 5.1. Konsu masaya davet etme

İzleyici uygun hediyeyi gönderdiğinde:
1. Seçilen konsun müsaitliği kontrol edilir.
2. Kons karakteri müşterinin masasına yürür.
3. Masaya oturma animasyonu oynatılır.
4. Etkileşim süresi başlatılır.
5. Süre bittiğinde kons müsait durumuna döner.

### 5.2. Konsla dans etme

İzleyici ayrı bir dans hediyesi gönderdiğinde:
1. Konsun müsaitliği kontrol edilir.
2. Kons müşterinin yanına gider.
3. İki karakter dans pistine geçer.
4. Birlikte dans animasyonu oynatılır.
5. Beş dakikalık etkileşim tamamlandığında kons müşterinin masasına geri döner.

### 5.3. İçecek gönderme

İzleyici içecek hediyesi gönderdiğinde:
1. Hedef masa veya izleyici belirlenir.
2. Garson uygun servis animasyonunu başlatır.
3. Garson tepsiyle masaya yürür.
4. Servis animasyonu oynatılır.
5. Garson servis alanına geri döner.

### 5.4. VIP loca daveti

VIP hediye aksiyonu:
1. Kons ve müşteri belirlenir.
2. İki karakter VIP locaya gider.
3. VIP oturma ve etkileşim animasyonları oynatılır.
4. Süre tamamlandığında kons uygun durumuna döner.

### 5.5. Sahne gösterisi

Özel hediye gönderildiğinde sahnede özel bir dans veya gösteri animasyonu başlatılır.

Bu aksiyonlar gerçek dünyada bir hizmet veya ürün satın alımı anlamına gelmez. Tamamı oyun içi eğlence ve görsel etkileşimdir.

### Hediye kuralları

- Her hediye türünün karşılığı önceden açıkça tanımlanacaktır.
- Kullanıcıya hangi hediyenin hangi aksiyonu başlatacağı gösterilecektir.
- Müsait olmayan karakterler için sistemin davranışı önceden belirlenmiş olacaktır.
- Tek bir kons aynı anda iki farklı etkileşimde bulunamayacaktır.
- Süreler ve hediye eşleştirmeleri ayarlanabilir olacaktır.

Kons kapma veya daha yüksek hediyeyle mevcut etkileşimi kesme fikri ilk sürümde varsayılan mekanik olmayacaktır. Öncelikle şeffaf süre ve sabit hediye kuralları uygulanacaktır. Sonradan platform kuralları ve teknik imkânlar incelenerek değerlendirilebilir.

## 6. Teknik mimari

### Ön yüz ve oyun motoru

**Three.js**

3D pavyon ortamı, karakterler, kameralar, animasyonlar ve oyun içi görsel efektler için kullanılacaktır.

### Sunucu

**Node.js**

Oyun olaylarının işlenmesi, karakterlerin durumlarının yönetilmesi ve izleyici etkileşimlerinin kontrol edilmesi için kullanılacaktır.

### Gerçek zamanlı iletişim

**Socket.IO**

Sunucu ile oyun ekranı arasındaki gerçek zamanlı iletişimde kullanılacaktır.

### Veri saklama

İlk prototipte mümkün olduğunca basit bir oyun durumu kullanılacaktır. İlerleyen sürümlerde gerekli görülürse Firebase veya başka bir veritabanı ile kullanıcı ve oyun verileri saklanacaktır.

### TikTok bağlantısı

TikTok LIVE yorum, beğeni ve hediye olayları ayrı bir entegrasyon katmanından oyuna aktarılacaktır.

Oyun motoru TikTok bağlantısından bağımsız tasarlanacaktır. Böylece TikTok entegrasyonu olmadan da test paneliyle oyun çalıştırılabilecektir.

TikTok LIVE olaylarına erişim, kullanılacak entegrasyon yöntemine ve platformun güncel erişim/izin koşullarına bağlıdır. Resmî erişim garanti kabul edilmeyecektir.

## 7. Proje klasör yapısı

İlk hedeflenen klasör düzeni:

```text
pavyon-live/
│
├── README.md
├── package.json
├── .gitignore
├── .env.example
│
├── client/
│   ├── index.html
│   ├── src/
│   │   ├── main.js
│   │   ├── game/
│   │   │   ├── Game.js
│   │   │   ├── Scene.js
│   │   │   ├── Camera.js
│   │   │   └── Lighting.js
│   │   ├── characters/
│   │   │   ├── Customer.js
│   │   │   ├── Kons.js
│   │   │   └── Waiter.js
│   │   ├── systems/
│   │   │   ├── MovementSystem.js
│   │   │   ├── AnimationSystem.js
│   │   │   ├── GiftSystem.js
│   │   │   └── InteractionSystem.js
│   │   └── ui/
│   │       ├── Hud.js
│   │       └── ViewerList.js
│   └── public/
│       ├── models/
│       ├── textures/
│       ├── audio/
│       └── animations/
│
├── server/
│   ├── index.js
│   ├── socket.js
│   ├── gameState.js
│   ├── events/
│   │   ├── comments.js
│   │   ├── likes.js
│   │   └── gifts.js
│   └── integrations/
│       └── tiktok/
│           └── TikTokAdapter.js
│
└── tests/
    └── eventSimulator.js
```

Bu yapı başlangıç mimarisidir; geliştirme sırasında ihtiyaçlara göre düzenlenebilir.

## 8. Test sistemi

TikTok bağlantısı tamamlanmadan önce oyunun bütün özellikleri test edilebilmelidir.

Bu nedenle bir test paneli oluşturulacaktır.

Test panelinden:
- İzleyici ekleme.
- İzleyiciye karakter atama.
- Yorum gönderme.
- Beğeni gönderme.
- Hediye gönderme.
- Kons seçme.
- Konsun müsaitlik durumunu değiştirme.
- İçecek servisi başlatma.
- VIP daveti başlatma.
- Etkileşim sürelerini hızlandırma.

işlemleri yapılabilecektir.

Test paneli sayesinde TikTok'a bağlanmadan oyun mekanikleri geliştirilebilecektir.

## 9. Yayın sistemi

Oyun ilk aşamada yerel bilgisayarda tarayıcı üzerinden çalıştırılacaktır.

Yayın akışı:

1. Node.js oyun sunucusu başlatılır.
2. Three.js oyun ekranı açılır.
3. OBS veya uygun yayın aracı açılır.
4. Oyun ekranı yayın kaynağı olarak eklenir.
5. TikTok LIVE yayını başlatılır.
6. TikTok olayları entegrasyon katmanından oyuna aktarılır.

Yayın için 9:16 dikey ekran düzeni hedeflenecektir.

Oyun ekranı, izleyicilerin karakterlerini ve önemli etkileşimleri rahat görebileceği şekilde tasarlanacaktır.

## 10. Performans hedefleri

- Aynı anda 100 müşteri karakteri.
- 10 kons karakteri.
- 5 garson karakteri.
- Toplam 115 aktif karakter kapasitesi.
- Gereksiz animasyonların sınırlandırılması.
- Karakter modellerinin optimize edilmesi.
- Uygun yerlerde animasyon ve model paylaşımı.
- Gerçek zamanlı olayların kontrollü işlenmesi.

100 erkek ve 100 kadın müşteri görünümü, aktif karakter sayısına eklenmiş değildir; bunlar görünüm kütüphanesidir.

Performans testleri yapılarak cihazın gücüne göre karakter detayları ve animasyon yükü ayarlanacaktır.

## 11. Geliştirme aşamaları

### Aşama 1 — Temel prototip
- Proje kurulumu.
- Three.js sahnesi.
- Üstten kamera.
- Pavyon mekânının ilk taslağı.
- Karakter hareket sistemi.

### Aşama 2 — Karakterler
- Müşteri karakterleri.
- Kons karakterleri.
- Garson karakterleri.
- Yürüme, oturma ve dans animasyonları.

### Aşama 3 — Oyun mekaniği
- Masalara oturma.
- Dans pistine gitme.
- Kons atama.
- Garson servisleri.
- VIP loca etkileşimleri.
- Süre yönetimi.

### Aşama 4 — Test paneli
- Yorum simülasyonu.
- Beğeni simülasyonu.
- Hediye simülasyonu.
- Hata ve durum kontrolleri.

### Aşama 5 — TikTok entegrasyonu
- LIVE olaylarının alınması.
- Kullanıcı eşleştirme.
- Yorum komutları.
- Hediye eşleştirmeleri.
- Beğeni olayları.

### Aşama 6 — Yayına hazırlık
- Dikey ekran düzeni.
- Performans optimizasyonu.
- OBS/LIVE yayın testi.
- Hata düzeltmeleri.

## 12. İlk oynanabilir sürümün kapsamı

İlk prototipte tüm karakter çeşitliliğini ve 115 karakter kapasitesini tamamlamaya çalışmayacağız.

İlk sürümde:
- 1 pavyon mekânı.
- 3 kons.
- 2 garson.
- 10 test müşterisi.
- 3 masa.
- 1 dans pisti.
- 1 VIP loca.
- Temel yürüme ve oturma animasyonları.
- Yorum ve hediye test paneli.

bulunacaktır.

Bu prototip çalıştıktan sonra karakter sayısı, mekân detayları ve etkileşimler büyütülecektir.

## 13. Temel proje prensipleri

1. Önce çalışan oyun, sonra görsel detaylar.
2. TikTok bağlantısı olmadan da oyun test edilebilmeli.
3. Bütün hediye aksiyonları otomatik çalışmalı.
4. Her karakterin aynı anda yalnızca bir geçerli görevi olmalı.
5. Oyun mimarisi yeni karakter ve hediye türleri eklemeye uygun olmalı.
6. Kaynak kodu GitHub üzerinde sürüm kontrolüyle tutulmalı.
7. API anahtarları ve özel erişim bilgileri GitHub'a yüklenmemeli.
8. Kullanılan 3D modellerin ve animasyonların lisansları kontrol edilmeli.
9. TikTok entegrasyonu platformun güncel kurallarına uygun olmalı.

---

**Projenin nihai hedefi:** TikTok LIVE'da açıldığında kendi kendine çalışan, izleyicilerin karakterleriyle katıldığı, yorumlarla hareketlenen ve hediyelerle özel animasyonlar başlatan gerçek zamanlı bir 3D pavyon oyunu oluşturmak.
