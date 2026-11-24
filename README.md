# PAVYON LIVE

**TikTok LIVE izleyicilerinin yorum, beğeni ve hediyelerle katılacağı 3D pavyon oyunu.**

> **Proje durumu (24 Kasım 2026):** Görsel ve etkileşim prototipi geliştiriliyor. Oyun henüz gerçek TikTok LIVE hesabına bağlı değil. Bu depoda profesyonel harici 3D model dosyaları bulunmuyor; karakterler Three.js geometrileriyle kod üzerinden üretiliyor.

## İlk yayın sürümü (V1) — kapsam sabitlendi

> **18 Kasım 2026 itibarıyla V1 kapsamı donduruldu.** Bundan sonra yeni fikirler V1'e otomatik eklenmeyecek; ayrı bir V2 listesine alınacak. Böylece tamamlanan işler geriye dönük olarak kapsam genişlemesi yüzünden yüzde kaybetmeyecek.

### V1'de teslim edeceğimiz ürün

- Tarayıcıda açılan, mobil ve masaüstü ekranlara uyumlu 3D pavyon sahnesi.
- 10 seçilebilir kons, 5 garson, sahne orkestrası/solist ve kalabalık müşteri sistemi.
- İzleyici girişi ve `!gel`, `!dans`, `!masa`, `!sahne` komutları.
- Davet, konsla dans, VIP, içecek ve sahne hediye aksiyonlarının uçtan uca oyun akışı.
- Gerçek TikTok LIVE olaylarını alacak sunucu tarafı adaptör; olay doğrulama, tekrar olaylarını tekilleştirme ve hediye eşlemesi.
- OBS/TikTok LIVE Studio Browser Source üzerinden yayınlanabilir ekran.
- Hata, yük, mobil tarayıcı ve canlı prova kontrolleri.
- Yayın için gerekli hosting ve temel operasyon/güvenlik ayarları.

### V1 dışında — V2'ye alındı

- Profesyonel harici/gerçekçi rig'li karakter modelleri ve motion-capture.
- Ses dalga formuna göre gerçek zamanlı nota, dudak ve dans senkronizasyonu.
- Kalıcı, bulut tabanlı müzik kütüphanesi ve gelişmiş playlist yönetimi.
- Yeni enstrümanlar, yeni sahne dekorları ve ilave dans koreografileri.
- V1'in çalışması için zorunlu olmayan yeni oyun modları ve hediye türleri.

**Kabul edilen V1 görsel standardı:** Mevcut prosedürel Three.js karakterleri kullanılabilir; profesyonel 3D model şartı yoktur. Ancak karakterlerin temel animasyonları, etkileşimleri ve sahne okunabilirliği testlerden geçmelidir.

## İlerleme takibi — sabit hesap yöntemi

****Son doğrulama: 24 Kasım 2026.** GitHub Actions üzerinde `npm test` 94/94 test ile geçti, `npm run build` başarılı üretim derlemesi oluşturdu ve Playwright tarayıcı paketi 11 geçti / 1 atlandı sonucunu verdi. Masaüstü ve mobil komut/hediye akışları, OBS stream-only görünümü ve masaüstünde 10/25/50/100 eşzamanlı izleyici senaryosu doğrulandı. Mobil 100 izleyici yük testi bilinçli olarak atlanıyor. Gerçek cihaz, fiziksel OBS, Render dağıtımı ve yerel canlı olay provası henüz tamamlanmadı.

- **Etkileşimli prototip: %60** — mevcut temel oyun ve görsel prototipin yaklaşık durumu.
- **Mevcut teslim hedefi: yaklaşık %43 (gerçek TikTok bağlantısı hariç).** Bu oran, TikTok dışındaki altı iş paketinin kayıtlı yüzdelerinin eşit ağırlıklı ortalamasıdır (256 / 6 = %42,7; yuvarlanmış %43). TikTok bağlantısı ayrı ve ertelenmiş bir iş paketidir; bu çalışmanın kapsamına dahil değildir. Önceki %95 kaydı doğrulanabilir değildi ve kaldırıldı. Tarayıcı E2E, gerçek cihaz, performans, hosting ve OBS provası doğrulanmadan tamamlandı sayılmayacak.
- Yüzde yalnızca aşağıdaki V1 kabul kriterleri tamamlanıp doğrulandığında artar. Kodun yazılmış olması tek başına tamamlandı sayılmaz; ilgili akışın test edilmesi gerekir.
- Bir iş paketi tamamlandıktan sonra yeni fikir eklenmesi o paketin yüzdesini düşürmez. V1 için zorunlu yeni bir hata bulunursa yalnızca ilgili kriter yeniden açılır ve nedeni not edilir.

| V1 iş paketi | Başlangıç durumu | Tamamlanma kanıtı |
|---|---:|---|
| 3D mekân ve sahne | %68 | Mobil/masaüstü sahne kontrolü ve temel görsel kabul |
| Karakterler ve animasyon | %50 | Kons/müşteri/garson akışlarının cihazda kontrolü |
| Oyun kuralları ve hediye akışları | %68 | Tüm komut ve hediye senaryolarının uçtan uca testi |
| Sunucu ve olay altyapısı | %55 | Doğrulanmış olay, hata ve tekrar olay testleri |
| Gerçek TikTok LIVE bağlantısı (ertelendi) | %0 | Bu teslim kapsamı dışında; sonraki ayrı aşama |
| Performans, güvenlik ve canlı prova | %5 | Yük testi, mobil test ve başarılı yayın provası |
| Hosting/yayın hazırlığı | %10 | Dağıtım, sağlık kontrolü ve Browser Source doğrulaması |

### Sıradaki kilometre taşları

1. **M1 — CI ve tarayıcı doğrulaması: tamamlandı.** 24 Kasım 2026 CI çalışmasında 94/94 birim/sunucu testi, üretim derlemesi ve Playwright'ta 11 başarılı / 1 bilinçli atlanan test. Masaüstü ve mobil komut/hediye akışları, OBS stream-only görünümü ve masaüstünde 10/25/50/100 izleyici yükü geçti.
2. **M2 — Yerel simülatör provası:** yorum, hediye, beğeni ve yinelenen eventId senaryolarını çalışan sunucu üzerinde baştan sona doğrula.
3. **M3 — Gerçek cihaz ve performans:** fiziksel Android/iOS cihazlarda sahne, kontroller, FPS, bellek ve uzun süreli çalışma kontrolü.
4. **M4 — Hosting:** Render Blueprint dağıtımı, HTTPS, health/status ve üretim ortamı güvenlik kontrolleri.
5. **M5 — OBS yayın provası:** 1920×1080 yatay ve 1080×1920 dikey Browser Source, ses ve sahne geçişlerini gerçek OBS üzerinde kontrol et.

**Ayrı ertelenen kapsam:** Gerçek TikTok hesabı yetkilendirmesi, TikTok LIVE olay adaptörü ve gerçek TikTok yayını provası kullanıcı kararıyla bu teslimattan çıkarılmıştır; bunlar tamamlanma yüzdesini veya yukarıdaki kilometre taşlarını bloke etmez.

### TikTok bağlantısı hariç mevcut bitirme kapsamı

- Tarayıcı E2E altyapısı masaüstü ve mobil Chromium projelerinde doğrulandı: komut/hediye akışı, OBS stream görünümü ve 10/25/50/100 izleyici masaüstü yük senaryosu.
- Sunucu HTTP entegrasyon testleri: health/status, hediye eşlemesi, eventId tekilleştirme, imzalı provider webhook, hatalı imza reddi ve production ortamında geliştirme endpoint'inin kapalı olması.
- Mobilde 700px altı ekranda piksel oranı 1'e düşürülüyor; kalabalık 30 karakteri aşınca gölge haritası kapatılıp piksel oranı 1'e çekiliyor.
- HTTP güvenlik başlıkları, status/health için no-store, Socket.IO mesaj boyutu/zaman aşımı sınırları ve SIGTERM/SIGINT için kontrollü kapanış eklendi.
- CI doğrulaması 24 Kasım 2026 tarihinde yeşil: 94/94 birim/sunucu testi, üretim derlemesi ve 11 başarılı / 1 bilinçli atlanan tarayıcı testi. Gerçek cihaz, Render ve fiziksel OBS provası hâlâ bekliyor.
- Gerçek TikTok hesabına bağlanma ve gerçek TikTok olay kaynağı bu kapsamın dışında kalır.

### Canlı olay geçmişi ve yayın HUD

- Sunucu son 20 kabul edilmiş yorum/beğeni/hediye olayını bellekte tutar; eski kayıtlar otomatik düşürülür.
- `/api/status` ve Socket.IO `live:status` yanıtı `recentEvents` listesini içerir.
- Yayın HUD'unda son üç olay gösterilir; hediye adı ve eşlenmiş oyun aksiyonu birlikte görünür.
- Serbest yorum metni geçmişe yazılmaz. Yalnızca desteklenen oyun komutları (`!gel`, `!dans`, `!masa`, `!sahne`, `!cik`) kısa etiket olarak gösterilir.
- Kullanıcı adı ve hediye adı uzunluk sınırlarıyla özetlenir; geçmiş sunucu belleğindedir ve yeniden başlatmada sıfırlanır.
- Otomatik testler geçmiş sınırını, özetleme davranışını ve snapshot izolasyonunu doğrular.

## Şu an neredeyiz?

| Aşama | Durum | Açıklama |
|---|---|---|
| 3D mekân ve kamera | Prototip geliştiriliyor | Sahne, dans pisti, bar/servis, VIP alanı, 6 masa, mobil kamera, art-deco sahne, VIP ambiyansı, dekoratif giriş kapısı ve girişten salona yürüyen müşteri akışı |
| Kons karakterleri | Prototip geliştiriliyor | 10 ayrı görünüm varyantı; sahne kıyafeti, saç, aksesuar, makyaj, yüz detayları ve vücut oranı varyasyonu; yüz/saç geometrisinde daha yüksek segment, göz akı-iris-göz bebeği-küçük ışık yansıması katmanları, saç tutamları ve kumaşta fiziksel malzeme/clearcoat iyileştirmeleri |
| Kons tavırları | Prototip animasyonlar | Göz kırpma, gülümseme/kahkaha, hafif salınım, cilveli duruş, yürüyüş ve üç farklı prosedürel dans stili; pistte sürekli dans eden 3 sabit arka plan kons NPC'si |
| Müşteri görünüş kataloğu | Hazır (parametrik) | 100 kadın + 100 erkek görünüş profili; bunlar 200 ayrı model dosyası değildir; dans pistinde 3 sabit müşteri NPC'si konslarla eşli dans eder |
| Canlı müzik ekibi | İlk prototip hazır | Sahneye dört müzisyen yerleştirildi: bağlama, klavye, darbuka ve klarnet; enstrümanlar prosedürel geometrilerle oluşturuldu ve müzisyenlere temel çalma hareketleri verildi. Gerçek ses kaydı/performans senkronizasyonu henüz yok |
| Garsonlar | İlk prototip hazır | 5 karakter örneği ve müşteriye servis hareketi |
| Müşteri oturma/dans hareketi | İlk prototip hazır | Boş koltuğa yürüme, oturma pozu, kol/bacak hareketleri; müşterilerde ve garsonlarda yürüyüşe bağlı senkron adım fazı, dengeli kol salınımı ve daha yumuşak dans adımları; boşta ayakta duran ve oturan müşterilerde çok hafif nefes, baş yönü ve kol ağırlık değişimleri; yakındaki başka müşterilere kısa ve sınırlı sosyal bakışlar; 18 koltuk dolduğunda yeni oturma isteği reddedilir |
| Garson servis animasyonu | İlk prototip hazır | Tepsi/bardak taşıma görseli, servis pozisyonu, müşteriye gidip dönme; servis öncesi müşterinin dört yanındaki yaklaşma noktalarını mesafe ve çevredeki aktör yoğunluğuna göre puanlayıp daha uygun noktayı seçme; beş garson meşgulse FIFO servis kuyruğu (en fazla 30 talep) |
| VIP yerleşimi | İlk prototip hazır | Aynı locaya üst üste karakter yığılmasını azaltan dört ayrı çift konumu |
| Kons-müşteri etkileşimi | İlk prototip hazır | Masaya göre yaklaşma, müşteriye dönme; konsun müşterinin dört yanından daha uygun/boş yaklaşma noktasını seçmesi, eşli dans/VIP/davet öncesi müşterinin koltuğunu serbest bırakma ve oturma pozunu sıfırlama |
| Etkileşim rezervasyonları | Kural testleri eklendi | Dans pisti için altı çift noktası, VIP için dört çift noktası; tek izleyici/tek kons oturumu kuralı saf JS modülünde otomatik test ediliyor. Sahne yerleşimi ve süre sonu dönüşü ayrıca tarayıcıda doğrulanacak |
| Yorum ve hediye testleri | Prototip hazır | Komutlar ve normalize edilmiş test hediye olayları |
| Kons kullanım süresi | İlk akış hazır | Kons meşguliyet kontrolü; davet/dans 5 dk, VIP 3 dk; süre bitince dönüş ve test panelinde müsait/meşgul durumu. Zamanlayıcı başlatılamazsa kons ve izleyici rezervasyonu geri alınır; yarım kalmış oturum bırakılmaz |
| Gerçek TikTok bağlantısı | Başlanmadı | Olay kaynağı, izinler ve platforma uygun entegrasyon ayrıca yapılacak |
| Performans ve yayın testi | Bekliyor | 100 müşteri/115 aktör hedefi gerçek cihazlarda henüz ölçülmedi |

**Önemli ayrım:** Şu anki konslar profesyonel, dışarıdan hazırlanmış, iskelet (skeletal) rig'li karakterler değildir. Son görsel kalite turunda yüz, saç ve kıyafet geometrilerinin pürüzsüzlüğü ile göz detayları ve kumaşın ışık tepkisi iyileştirildi; bunlar hâlâ prosedürel düşük/orta poligon oyun modelleridir. Sonraki model turunda kons elbisesine ayrı üst beden/bodice ve etek katmanı, topuklu ayakkabıya ayrı ayakkabı ve topuk geometrisi, kolye ucu ve elbise üzerinde küçük taş detayları eklendi; bunlar silüeti ve yakın plan okunabilirliğini artıran prosedürel ayrıntılardır. Son yüz/saç turunda baş oranı ve yanak formu düzenlendi; kulaklar, burun köprüsü/uç/nostril detayları, ayrı üst-alt dudak katmanları ve beş ince saç tutamı eklendi. Bunlar stilize yüz okunabilirliğini artırır; gerçekçi insan yüzü veya profesyonel saç simülasyonu değildir. Müşteri ve garson modellerine de sade göz/burun/ağız detayları eklendi; yan saç tutamları ve bazı müşteri saçlarında perçem varyasyonu oluşturuldu. Garsonlara koyu yelek panelleri, açık gömlek önü, papyon ve düğme detayları; bazı müşteri varyantlarına yaka detayı eklendi. Kalabalık sahne performansı gözetilerek bu detaylar kons yüzündeki kadar yoğun tutulmadı. Son anatomi turunda kol ve bacaklar tek parça kapsül yerine üst/alt segment, dirsek/diz ve el/ayak parçalarına ayrıldı; ellerde kısa parmak detayları, gövde ölçeğinde hafif oran düzeltmesi ve bel dikişi eklendi. Mevcut pivot animasyonları korunur; bu hâlâ tam iskelet rig'i değildir. Sonraki model turunda kons elbisesine ayrı üst beden/bodice ve etek katmanı, topuklu ayakkabıya ayrı ayakkabı ve topuk geometrisi, kolye ucu ve elbise üzerinde küçük taş detayları eklendi; bunlar silüeti ve yakın plan okunabilirliğini artıran prosedürel ayrıntılardır. Gövde, saç, kıyafet ve aksesuarları Three.js temel geometrilerinden oluşur. Kol ve bacaklarda pivot tabanlı hareket noktaları vardır; bu, tam vücut iskelet rig'i veya motion-capture animasyonu değildir.

## Yayın ekranı (OBS / TikTok LIVE Studio)

- Oyunu `?view=stream` parametresiyle açınca izleyiciye dönük sade yayın görünümü etkinleşir. Örnek: `https://oyun-adresin/?view=stream`.
- Yayın görünümünde test paneli, etkileşim günlüğü, müzik yükleme kontrolleri ve geliştirme alt bilgisi gizlenir; sahne, izleyici/kons/beğeni sayaçları ve son etkileşim bandı kalır.
- Son etkileşim bandı oyun olay günlüğüne gelen en güncel mesajı güvenli metin olarak gösterir.
- Normal URL test/kontrol panelini korur. Bu görünüm OBS Browser Source için arayüz hazırlığıdır; gerçek TikTok bağlantısı veya OBS üzerinde görsel doğrulama yapıldığı anlamına gelmez.

## Güvenli canlı olay adaptörü (provider bridge)

- Üretim ortamında `POST /integrations/events` endpoint'i imzalı JSON olaylarını kabul eder. `LIVE_PROVIDER_WEBHOOK_SECRET` ortam değişkeni tanımlı değilse endpoint kapalıdır.
- İstek başlıkları: `x-pavyon-timestamp` (Unix saniye veya milisaniye) ve `x-pavyon-signature` (`sha256=...`). İmza, UTF-8 ham gövde için `HMAC-SHA256(secret, timestamp + '.' + rawBody)` biçimindedir.
- Zaman damgası en fazla 5 dakika eski/ileri olabilir; imza sabit zamanlı karşılaştırmayla doğrulanır. Geçersiz imza reddedilir.
- Gövde, mevcut normalize olay şemasına uymalı ve tekrarları engellemek için benzersiz `eventId` içermelidir. Event kimliği 60 saniye saklanır; aynı olay ikinci kez yayınlanmaz.
- Desteklenen normalize olaylar `comment`, `like`, `gift`; hediye aksiyonları `invite`, `dance`, `drink`, `vip`, `stage`.
- Bu endpoint TikTok'a doğrudan bağlanmış değildir. İzinli/uyumlu bir LIVE olay sağlayıcısı veya yerel connector, sağlayıcı payload'ını bu şemaya dönüştürüp imzalı isteği göndermelidir. Gerçek TikTok hesabıyla uçtan uca test henüz yapılmadı.

## Canlı olay telemetrisi

- Sunucu, kabul edilen olayları türlerine göre sayar: yorum, beğeni ve hediye.
- `/api/status` toplam kabul edilen olay, tür bazında sayaçlar, son olay zamanı/türü, bağlı oyun istemcisi sayısı ve yapılandırılmış hediye eşlemesi sayısını döndürür.
- Socket.IO istemcisine bağlantı anında `live:status` özeti gönderilir; her yeni kabul edilmiş olaydan sonra sayaçlar yayınlanır.
- Yayın HUD'ındaki olay sayacı ve son olay satırı bu telemetriden beslenir. Tekrarlanan `eventId` olayları sayaçları artırmaz.
- Sayaçlar bellekte tutulur; sunucu yeniden başladığında sıfırlanır. Kalıcı analitik/veritabanı değildir.

## Hediye eşlemesi ve bağlantı göstergesi

- Sağlayıcıdan gelen hediye adı, sunucu tarafında `LIVE_GIFT_MAP` ortam değişkenindeki JSON eşlemesine göre oyun aksiyonuna dönüştürülür. Örnek: `LIVE_GIFT_MAP={"Rose":"invite","Dance Gift":"dance","VIP Star":"vip"}`.
- Hediye adları Unicode uyumlu biçimde normalize edilir; büyük/küçük harf ve boşluk/tire/alt çizgi farkları eşlemeyi bozmaz.
- Eşlemede bulunmayan hediye otomatik olarak bir aksiyon çalıştırmaz; varsayılan eşleme boştur. Örnek hediye adları gerçek platform katalogundan alınmadığı için otomatik tanımlanmaz.
- `/api/status` imzalı sağlayıcı sırrının yapılandırılıp yapılandırılmadığını ve tanımlı hediye eşlemesi sayısını raporlar. Bu, gerçek TikTok bağlantısının aktif olduğunu kanıtlamaz.
- Oyun arayüzündeki durum rozeti Socket.IO sunucu bağlantısını bağlı/bağlantı yok olarak gösterir. Yayın görünümünde de görünür; bu TikTok bağlantısı değil, oyun sunucusu bağlantısıdır.

## Oyun dünyası

- Kırmızı/bordo tonlar, altın detaylar ve pavyon sahne atmosferi.
- Altı masada dekoratif mum ışığı, iki bardak ve içecek detayları.
- Sahne, dans pisti, servis alanı, VIP loca ve 6 müşteri masası.
- Sahne yanında hoparlör kuleleri, sahne önü LED şeridi ve servis barında şişe dekorları; ön girişte art-deco kapı çerçevesi ve sıcak eşik ışıkları.
- Her masada 3 koltuk olmak üzere 18 koltuk noktası; müşteriye en yakın boş koltuk atanır; oturan müşteri tekrar otur komutu verirse mevcut koltuğunu korur. Her koltuk kendi masa numarasını taşır; masa bazında dolu koltuk sayısı rezervasyon sırasında artar, müşteri koltuğu bırakınca azalır. Test arayüzünün üst çubuğunda altı masanın anlık doluluğu `dolu/3` biçiminde gösterilir. 3D sahnede rezerve koltuklar altın tonunda parlar; boşalan koltuklar bordo rengine döner. Yeni oturma isteğinde en yakın boş koltuk, masanın mevcut doluluğu da hesaba katılarak seçilir; böylece müşteriler yalnızca tek tek en yakın sandalyeye değil, daha dengeli masa gruplarına yönlendirilir.
- Üstten perspektif kamera; dar ekranlarda daha geniş dikey kadraj.
- Sahne üzerinde renkli, ritmik hareket eden dört spot ışığı.
- Oyun havası / bireysel dans yaklaşımı; halay mekaniği yok.

## Karakter sistemi

### Konslar

- 10 ayrı kons karakter örneği oluşturulur.
- Yetişkin, stilize sahne kostümleri: parlak renkler, kısa sahne elbisesi silüeti, altın kemer/etek ucu detayları ve topuklu ayakkabı.
- Saç rengi ve stil varyasyonları; uzun saç, at kuyruğu ve bob kesim detayları.
- Küpe, kolye, bileklik, sahne makyajı/yanak rengi, kaş, kirpik, burun, dudak ve gülümseme detayları.
- Konsların boy ve vücut oranları görünüş profiline göre hafif değişir.
- Kons seçme listesindeki her karakterin müsait/meşgul durumu gösterilir; meşgul karakterler test panelinden seçilemez.
- Boştayken hafif salınım ve ara sıra kahkaha; göz kırpma; davette cilveli duruş; dans sırasında kol/bacak pivot hareketleri. Kons yüz animasyonunda göz kırpmanın göz akı/iris/kirpik ölçeğine de yansıması, ifadeye göre kaş ve yanak tonunun hafif değişmesi, gülümseme/kahkaha ağız hareketi ve dans sırasında küçük baş-gövde salınımları eklendi. Uzun saç tutamları, yan saç kilitleri ve at kuyruğuna yürüyüş/dans temposuna göre küçük salınım; elbise gövdesi ve etek katmanına da hafif kumaş salınımı eklendi. Bunlar fizik simülasyonu değil, düşük genlikli prosedürel animasyonlardır. Dans döngülerine yaklaşık 12 saniyede bir değişen üç figürlük müzikal cümle yapısı eklendi; kol pozları yeni figüre ilk bölümde yumuşakça harmanlanır, bacak ritmi figüre göre değişir. Bu koreografi gerçek müzik vuruşu analizi değil, oyun içi zamanlayıcıyla ilerler. Bunlar prosedürel görsel ifadelerdir; gerçek yüz kası rig'i veya sesle senkronize mimik değildir. Konslar üç farklı ritim/kol-bacak kombinasyonundan biriyle dans eder. Yürüyüşte hareket mesafesine bağlı ayrı adım fazı, daha düşük hız, karşılıklı kol-bacak salınımı ve hafif gövde/baş tepkisi kullanılır; dans döngülerinde zıplama azaltılarak ayak adımı, kol ritmi ve kalça/gövde salınımı daha kontrollü tutulur. Yürüme komutundan dans/sahne pozuna geçişte gövde, baş, kollar ve bacaklar yaklaşık 0,42 saniyelik yumuşak poz harmanlamasıyla geçer; dans hareketi hedefe ulaşıldığında başlatılır. Müşteri masaya ulaştığında oturma hareketi yaklaşık 0,62 saniyede gövdeyi hafif öne alıp baş, kol ve bacakları oturma pozuna kademeli geçirir; oturmuş müşteri davet/dans/VIP etkileşimine alındığında koltuk serbest bırakılırken ayakta duruşa yaklaşık 0,42 saniyelik poz harmanlaması uygulanır.
- Yeni yürüyüş döngüsü: adım ritminde bacak ve kol salınımı, hafif gövde yükselmesi ve hedefe yumuşak dönüş.
- Müşteriyle etkileşimde hedefe dönük duruş; VIP locada kons ve müşterinin birbirine bakacak şekilde konumlanması.

### Müşteriler ve garsonlar

- `characterCatalog.js` içinde 100 kadın ve 100 erkek parametrik görünüş profili bulunur.
- Profiller saç, ten, kıyafet rengi, boy, yapı ve aksesuar parametreleri sağlar. 200 ayrı elle modellenmiş karakter dosyası değildir.
- Oyuncu girişlerinde aynı anda en fazla 100 müşteri kabul edilir. Yeni müşteri dekoratif ana kapıdan, aynı anda gelenleri üst üste bindirmemek için yedi giriş şeridine dağıtılmış başlangıç noktalarından salona yürür; hedef konum sahne, bar, VIP ve masa çevresinden kaçınan adaylar arasından seçilir. Mümkünse mevcut aktörlerden en az 1,05 birim uzaklık korunur; salon kalabalıksa en az sıkışık geçerli aday seçilir. Bu kesin boşluk veya tam yol bulma garantisi değildir.
- 5 garson örneği sahneye eklenir; aynı temel placeholder modelinden türetilir.
- Müşteriler kendisine en yakın boş koltuğa yürür; varışta gövde alçalması, hafif öne eğilme ve bacak/kol pozisyonuyla oturma pozu alır. Boşta bekleyen ayakta ve oturan müşterilere çok düşük genlikli nefes, baş yönü ve kol ağırlık değişimleri eklendi. Yakın çevredeki diğer müşterilere ara sıra sınırlı baş çevirme/sosyal bakış davranışı da eklendi; komşu araması kare başına kurulan uzamsal ızgaradan yapılıyor, bakış açısı küçük tutuluyor ve hareket yumuşatılıyor. Amaç kalabalığın tamamen donmuş görünmesini azaltmak; bu davranış sohbet animasyonu veya sesli etkileşim değildir. Zaten oturuyorsa tekrar komutunda koltuğunu değiştirmez. Dans sırasında kollar ve bacaklar ritmik hareket eder. 18 koltuk doluysa müşteri rastgele dolaştırılmaz; açık kapasite mesajı verilir. Oturan müşteri tekrar otur komutu verirse kendi koltuğunu korur.
- Kons etkileşimi devam eden izleyici `!dans`, `!masa`, `!sahne` komutlarıyla görevini yarıda kesemez; etkileşim süresi tamamlanınca normal komutları kullanabilir.
- Garsonların eline tepsi ve bardak görseli eklendi; servis sırasında kol pozisyonu değişir ve garson müşteriye gidip başlangıç noktasına döner. Beş garsonun tamamı meşgulse talepler FIFO sıraya alınır; sıra 30 istekte sınırlıdır. Garson, servis öncesi müşterinin dört yanındaki yaklaşma noktalarını yürüyüş mesafesi ve çevredeki aktör yoğunluğuna göre puanlayarak daha uygun bir noktaya yönelir; bu yerel bir hedef seçimidir, tam yol bulma değildir. Sırası gelen müşteri silinmişse atlanır; servis başlatılamayan geçersiz talepten sonra garson kuyruğu işlemeye devam eder. Servis bitince sıradaki geçerli müşteri alınır, kuyruk boşsa garson evine döner.
- VIP locada dört ayrı çift konumu ayrıldı; dolu konumlar yeni VIP çiftine atanmaz. Bu ilk seviye konum ayırmadır, genel fiziksel çarpışma motoru değildir. Yürüyen karakterlere yakındaki aktörlerden uzaklaşmaları için hafif yerel yönlendirme eklendi; bu tam navigasyon/çarpışma motoru değildir. Yakın komşu araması kare başına oluşturulan hücre tabanlı uzamsal ızgarayla sınırlandırıldı; böylece her yürüyen aktörün tüm karakterleri taraması yerine yalnızca çevresindeki hücreler kontrol edilir. Bu optimizasyonun gerçek cihaz performans kazanımı henüz ölçülmedi.
- Kons davetinde yaklaşma noktası müşterinin baktığı yöne göre hesaplanır; kons müşteriye doğru döner. Eşli dans aksiyonunda müşteri ve kons pistte yan yana ayrı noktalara gider ve birbirlerine dönük dans eder.
- Kons daveti, dansı veya VIP etkileşimi başlarken müşteri varsa mevcut koltuk rezervasyonu serbest bırakılır ve oturma pozu sıfırlanır; böylece müşteri başka alana geçtiğinde boş koltuk gereksiz yere dolu kalmaz. Kons davetinde dört yaklaşma noktası önce değerlendirilir; geçerli bir nokta bulunmadan müşterinin koltuk/pozisyon durumu değiştirilmez.
- Garsonların yürüyüş sırasında bacak salınımı da eklendi; kons davetinde hafif baş hareketi kullanılır.
- Dans pisti için altı ayrı çift noktası rezerve edilir; üçü sürekli dans eden arka plan NPC çiftlerine ayrılır, kalan üçü canlı hediye etkileşimlerine açık tutulur. VIP ve dans alanı doluysa aksiyon reddedilir, kons gereksiz yere meşgul gösterilmez.
- Aynı izleyici başka bir kons etkileşimi sürerken ikinci bir konsla eşzamanlı davet/dans/VIP başlatamaz. Süre bitince izleyici ve kons serbest bırakılır.
- Dans pistinin boş görünmemesi için 3 sabit arka plan dans çifti oluşturulur: 3 NPC kons + 3 NPC müşteri sürekli dans eder. Bu NPC konslar izleyici hediyesiyle seçilen 10 gerçek kons listesinden ayrıdır; üç dans çifti için pistteki altı çift konumunun üçü rezerve edilir, böylece canlı hediye etkileşimleri kalan üç konumu kullanabilir. Bu NPC'ler izleyici/müşteri kapasitesine dahil değildir.
- Hedef aktif aktör sayısı: 100 izleyici müşterisi + 10 etkileşim konsu + 5 garson + 6 pist arka plan NPC'si + 4 müzisyen + 1 solist + 2 sahne dansçısı = 128. Bu kapasite henüz performans testinden geçmedi.

## Sahne ve canlı müzik ekibi

- Sahne düzeni DJ kabini yerine pavyon orkestrası mantığına göre kuruldu: bağlama, klavye, darbuka ve klarnet çalan dört müzisyen.
- Solist sahne arkasından öne doğru yaklaşık 3,2 saniyelik yumuşak bir giriş yapar; sahne önüne ulaştıktan sonra mikrofonla şarkı performansını sürdürür. Performans döngüsünde serbest koluyla seyirciye seslenme, ritmik el hareketi ve orkestraya dönük kısa jestler yapar. Ağız geometrisi şarkı ritmi hissi verecek şekilde açılıp kapanır; bu gerçek ses analizi veya fonem/dudak senkronizasyonu değildir.
- Solistin iki yanında iki yetişkin NPC sahne dansçısı bulunur; düşük genlikli gövde/kol hareketleriyle müziğe eşlik ederler. Bunlar hediye ile seçilebilen 10 kons listesinden ayrı dekoratif sahne karakterleridir.
- Müzisyenler sahnede sabit konumlarda durur; enstrümanları ve çalma hareketleri kodla üretilir. Her müzikal cümlenin sonunda kısa bir bölümde baş ve gövde hareketleriyle soliste bakıp karşılık verirler; bu görsel çağrı-cevap jestidir, gerçek ses/tempo analizi değildir. Bağlama, klavye ve darbuka müzisyenlerine tabure/oturma pozu; klarnetçiye ayakta performans pozu verildi. Sahne ekibine koyu ceket, yaka, papyon ve altın düğme detayları eklendi. Bağlamada el/tezene hareketi, klavyede tuş vuruşları, darbukada ritmik el-vuruşu ve klarnette perde/tuşe hareketi canlandırılır.
- Ankara Havaları seçildiğinde sahne spotları daha hızlı tarar, ışık renkleri sıcak pembe/amber tonlarına geçer ve ışık nabzı hızlanır; Pavyon modunda daha yumuşak altın/bordo sahne ışığı kullanılır.
- Şu an müzisyen animasyonları ritim hissi verir; seçilen gerçek ses kaydıyla nota/performans senkronizasyonu veya canlı müzisyen sesi entegrasyonu henüz bulunmaz.

## Müzik sistemi

- Oyun arayüzünde `MÜZİK` paneli bulunur; Pavyon, Ankara Havaları ve Favoriler listeleri arasında geçiş yapılabilir. Seçilen listenin türü oyun sahnesine aktarılır; pistteki sabit NPC çiftlerinin dans temposu Ankara havasında hızlanır ve her çiftin ritmi/figür stili farklı kalır.
- Kullanıcı kendi cihazından birden fazla ses dosyası seçerek ilgili listeye ekleyebilir; çalma/duraklatma, önceki/sonraki parça ve ses seviyesi kontrolleri vardır.
- Şu an depoda hazır MP3/WAV şarkı bulunmaz; dosyalar kullanıcı tarafından tarayıcı oturumuna yüklenir ve sayfa yenilendiğinde tekrar seçilmeleri gerekir. Bu nedenle gerçek pavyon/Ankara havası repertuvarı henüz projeye gömülmüş değildir.
- Yayın ve dağıtım öncesi her parçanın oyun içinde ve canlı yayında kullanılmasına izin veren lisans/izin kontrol edilmelidir. Ticari kayıtlar izinsiz şekilde depoya eklenmeyecek; lisanslı, telifsiz veya özel izin alınmış kayıtlar kullanılacaktır.

## İzleyici komutları

| Yorum | Aksiyon |
|---|---|
| `!gel` | Kullanıcıyı mekâna alır. |
| `!dans` | Karakteri dans pistine gönderir. |
| `!masa` | Boş koltuklardan birine oturtur. |
| `!sahne` | Karakteri sahneye gönderir. |

Yorum simülatörü ve test paneli oyun içinde kullanılabilir. Komutlarda kullanıcı başına kısa bir bekleme süresi vardır.

## Hediye aksiyonları

| Aksiyon | Davranış | Süre |
|---|---|---:|
| Kons daveti | Müsait kons izleyicinin yanına/masasına gider | 5 dk |
| Konsla dans | Kons ve izleyici dans eder | 5 dk |
| VIP daveti | Kons ve izleyici VIP locaya geçer | 3 dk |
| İçecek | Müsait garson müşteriye servis yapar | Yaklaşık 4,5 sn servis turu |
| Sahne | İzleyici sahneye çıkar | Otomatik süre tanımlı değil |

- Bir kons aynı anda yalnızca bir izleyiciyle etkileşimde olabilir.
- Zamanlı kons etkileşimi bitince kons ve ilgili müşteri başlangıç konumlarına döndürülür.
- Daha yüksek hediyeyle devam eden etkileşimi kesen açık artırma/kons kapma sistemi uygulanmadı.
- Bunlar yalnızca sanal oyun içi aksiyonlardır; gerçek içecek veya gerçek hizmet satışı değildir.

## Teknik mimari

- İstemci: Vite + JavaScript + Three.js.
- Sunucu: Node.js + Express.
- Gerçek zamanlı iletişim: Socket.IO.
- Geliştirme testleri: yorum/hediye simülatörü ve geliştirme amaçlı `/dev/event` uç noktası; olay doğrulaması `server/eventValidation.js` üzerinden yapılır, otomatik testler `npm test` ile çalışır.
- Üretimde Express, `dist/` klasöründeki istemciyi ve Socket.IO'yu aynı origin üzerinden sunacak şekilde yapılandırılmıştır.

### Repo yapısı

```text
pavyon-live/
├── README.md
├── package.json
├── vite.config.js
├── render.yaml
├── .github/workflows/build.yml
├── client/
│   ├── index.html
│   └── src/
│       ├── main.js
│       ├── style.css
│       └── game/
│           ├── createScene.js
│           └── characterCatalog.js
└── server/index.js
```

## Yerel çalıştırma

Gereksinim: Node.js 20.19+.

```bash
npm install
npm run dev
```

- Oyun istemcisi: `http://localhost:5173`
- Sunucu sağlık kontrolü: `http://localhost:3001/health`
- Üretim derlemesi: `npm run build`
- Üretim sunucusu: `npm start`

## Test olay biçimi

Geliştirme modunda `/dev/event` uç noktasına normalize edilmiş olaylar gönderilebilir. Örnek hediye olayı:

```json
{
  "type": "gift",
  "username": "test_user",
  "giftName": "Rose",
  "action": "dance",
  "konsId": "kons-1"
}
```

Desteklenen hediye aksiyonları: `invite`, `dance`, `drink`, `vip`, `stage`. Bu örnek yalnızca test formatıdır; TikTok'tan otomatik hediye alındığı anlamına gelmez. Gerçek yayın olayları için ayrıca kaynak adaptörü, doğrulama, tekrar olaylarını tekilleştirme ve platform izinleri gerekir.

## Yol haritası

1. **Karakter görsel kalitesi:** Kons yüzü, saç, kıyafet ve aksesuar detaylarını geliştirmek; garson ve müşteri modellerini tutarlılaştırmak. Son eklenenler: at kuyruğu/bob saç varyantı, iki taraflı küpe, kolye, bileklik, etek ucu detayı, sahne makyajı, kaş/kirpik/burun/dudak ve vücut oranı varyasyonu.
2. **Animasyon kalitesi:** Daha doğal yürüme, oturma, dans, gülme ve etkileşim geçişleri; mevcut pivot animasyonlarını iyileştirmek. Son turda konsların göz kırpma, kaş/yanak tepkisi, gülümseme ve kahkaha ifadeleri ile dans sırasında küçük baş-gövde hareketleri geliştirildi. Son eklenenler: kons ve müşteri yürüyüş/oturma/dans hareketleri; garson tepsi-servis pozu; VIP çiftlerinin yüz yüze yönlenmesi.
3. **Etkileşim yaşam döngüsü:** Masa/VIP konumları, daha güçlü çakışma önleme/navigasyon, kuyruk, dolu masa yönetimi ve her aksiyon sonrası doğru başlangıç konumuna dönüş. VIP için dört, dans pisti için altı çift konumu rezervasyonu; aynı izleyici için eşzamanlı kons etkileşimi engeli, müşteriye en yakın boş koltuk seçimi ve masa bazlı koltuk doluluk sayacı, mobilya/servis/VIP bölgelerinden kaçınan ve mevcut aktörlerden uzaklık puanlayan müşteri giriş konumları; yoğun girişlerde kapı ve giriş koridoru için 7×14 adaylı en açık başlangıç noktası seçimi, salon içindeki müşteri hedefleri için de rastgele adaylara ek deterministik yerleşim ızgarası kullanımı (tam çarpışma garantisi değil), yürüyen karakterler için uzamsal ızgara destekli hafif yerel ayrışma yönlendirmesi ve hedef ve hareket konumlarını oynanabilir salon sınırları içinde tutan hareket sınırlandırması eklendi. Genel fiziksel çarpışma ve kuyruk sistemi hâlâ yapılacak.
4. **Sahne ve arayüz cilası:** Işık, dekor, masa durumları, kons müsaitlik göstergesi, yayın overlay'i ve müzik paneli. Müzik panelinde Pavyon/Ankara Havaları/Favoriler listeleri ile yerel ses dosyası seçimi eklendi; kalıcı sunucu müzik kütüphanesi, otomatik çalma listesi ve lisanslı parça seçimi sonraki adımdır. Son eklenenler: pistin boş kalmaması için üç sabit kons-müşteri NPC dans çifti ve canlı hediye danslarına ayrılmış üç ek çift konumu; ana giriş kapısı/ışıklı eşik ve yedi şeritli kademeli müşteri girişi, dört hareketli sahne spotu ve görsel ışık huzmeleri, dokuz armatürlü üst ışık kirişi ve sahne yan LED barları, dans pistinde yumuşak renkli ışık havuzu, VIP locada dört ayrı sıcak/pembe ambiyans ışığı, art-deco sahne çerçevesi/arka paneli, bordo yan perdeler ve altın bağlar, sahne üstü ampul sırası ve beş dekoratif LED paneli, sahne hoparlörleri/LED şeridi, bar şişe dekorları ve detaylı tezgâh/ayaklı tabureler, katmanlı arka duvar panelleri ve aplik ışıkları, VIP locada döşemeli sedirler/yan sehpalar, masalarda altın ayak-pedestal ve üst yüzey kakması, minderli sırtlıklı altın ayaklı sandalyeler, zeminde ince geometrik hatlar ve halı bordürü. VIP mobilyaları ayrılmış ziyaretçi konumlarının çevresine yerleştirildi; garsonlar için müşteri çevresinde dört yönlü yaklaşma noktası puanlaması eklendi; boşta duran/oturan müşterilere düşük genlikli doğal bekleme hareketleri ve yakındaki müşterilere sınırlı sosyal bakış davranışı eklendi. Gerçek cihazda erişim/çakışma kontrolü ve ışık performansı henüz doğrulanmadı.
5. **Test ve optimizasyon:** 10/25/50/100 müşteri yük testi, mobil GPU ve bellek ölçümü, gerçek tarayıcı testleri.
6. **TikTok LIVE entegrasyonu:** Uygun ve izinli olay kaynağına bağlanma; hediye-adım eşlemesi ve güvenli sunucu doğrulaması.
7. **Yayın hazırlığı:** OBS/TikTok LIVE Studio Browser Source, hosting ve canlı prova.

## Test durumu ve bilinen eksikler

- Sunucu olay normalizasyonu testleri: geçerli yorum/Türkçe kullanıcı adı, boş/uzun alanlar, sayısal beğeni sınırları, hediye aksiyonu/kons kimliği ve eventId doğrulaması.
- İzleyici kimlik doğrulama yardımcı testi: Türkçe karakter/digit/alt çizgi/tire korunur, desteklenmeyen karakterler temizlenir, ad 20 karakterle sınırlandırılır; boş veya geçersiz kimlikler ortak `misafir` hesabına dönüştürülmeden reddedilir. Ana oyun akışında giriş, komut, ayrılış ve hediye işlemleri bu normalizasyonu kullanır.
- Oyun oturum kuralı testleri: aynı konsun iki izleyiciye verilmesini, bir izleyicinin aynı anda iki konsla eşleşmesini ve geçersiz kons/boş izleyici rezervasyonunu engelleme; kons veya izleyici serbest bırakıldığında rezervasyonun tekrar kullanılabilmesi.
- Etkileşim güvenliği: kons rezervasyonu, 3D sahne aksiyonu başlamadan önce alınır; sahne aksiyonu reddedilir veya hata verirse rezervasyon geri bırakılır. Aktif kons oturumu sırasında aynı izleyicinin içecek/sahne gibi yeni hediye aksiyonlarıyla hareketinin bozulması engellenir.
- Garson kuyruğu ve aktif servis testleri: FIFO sıralaması, aynı müşterinin kuyrukta veya aktif serviste ikinci kez talep açmasının engellenmesi, bir garsonun aynı anda iki müşteriye atanmaması, servis tamamlanınca veya müşteri ayrılınca iki taraflı atamanın serbest kalması, 30 kişilik kuyruk kapasitesi, müşteri talebini kuyruktan çıkarma ve kuyruk temizleme.
- Kalabalık müşteri girişinde başlangıç konumları: yeni müşteri için kapı/giriş koridorunda 7×14 aday taranır ve mevcut aktörlerden en açık nokta seçilir; salon içindeki hedef konumda rastgele adaylar yetersiz kalırsa deterministik ızgara da taranır. Bu, aynı noktaya yığılmayı azaltır ancak genel fiziksel çarpışma veya yol bulma garantisi vermez.
- Müşteri ayrılış akışı: `!cik` komutu aktif kons oturumunu ve zamanlayıcısını kapatır; masa koltuğunu, bekleyen/aktif garson servisini ve müşteri sahne nesnesini temizler. Aynı isim tekrar `!gel` ile katılabilir.
- Garson servis zamanlayıcıları sahne kapatılırken temizlenir; bekleyen servis kuyruğu da dispose sırasında boşaltılır.
- `npm test` sunucu doğrulama testleriyle birlikte oyun oturum, garson kuyruğu ve izleyici kimlik kurallarını da çalıştırır. GitHub Actions istemci derlemesinden önce bu testleri yürütür.
- Sınırlama: Three.js sahnesinin görsel animasyonları, gerçek tarayıcıdaki zamanlayıcılar ve garsonların hareketli servis kuyruğu henüz otomatik tarayıcı testinden geçmedi; bunlar M1'in kalan manuel/entegrasyon doğrulamasıdır.

- Önceki geliştirme turlarında dans pisti/VIP konum rezervasyonları, dolu alan için güvenli ret, konsun müşteriye yaklaşırken dört yöndeki noktaları değerlendirmesi, aynı izleyicinin eşzamanlı kons etkileşimine girmesinin engellenmesi, 18 koltuk, beş garson/30 taleplik FIFO servis kuyruğu, aktif servis eşleşmesi, kons oturum zamanlayıcısı ve ayrılış temizliği, kısmi rezervasyon rollback'i, salon sınırlandırması ve sahne dekorları eklendi. 23 Kasım 2026 tarihli CI çalışmasında tüm 91 test ve üretim derlemesi geçti; gerçek cihaz ve tarayıcı E2E testleri hâlâ yapılmadı.
- Kons animasyonları prosedürel Three.js hareketleridir; sesli kahkaha, gerçekçi yüz kasları, dudak senkronu ve profesyonel dans koreografisi yoktur.
- Karakterlerin gerçekçi/kaliteli hale gelmesi için ileride lisanslı veya özgün hazırlanmış rig'li 3D varlıklar kullanılabilir. Bu dosyaların lisans ve optimizasyonu kontrol edilmelidir.
- TikTok LIVE bağlantısı, canlı yayın performansı ve 128 aktör hedefi henüz doğrulanmadı.

## Güvenlik notları

- API anahtarı, token veya yayın kimlik bilgisi repoya eklenmemelidir.
- İstemci tarafından gelen bir hediye aksiyonu tek başına ödeme/hediye kanıtı sayılmaz.
- Gerçek hediye entegrasyonu sunucu tarafında kaynak doğrulaması ve olay tekilleştirmesi yapmalıdır.
- Kullanıcı adları HTML'e yazılmadan önce kaçışlanmalıdır.


### Müşteri girişinin atomik hâle getirilmesi
- Geçersiz kimlik/ad alanı olan veya aynı sahne kimliğini kullanan müşteri eklenmesi reddedilir.
- Sahneye başarılı ekleme açık bir `true` sonucu döndürür; istemci yalnızca bu onaydan sonra izleyici kaydını oluşturur.
- Sahneye ekleme hata verirse giriş iptal edilir; HUD sayısı ile gerçek 3D aktör sayısının ayrışması önlenir.
- Tanımsız hediye aksiyonları, izleyici otomatik oluşturulmadan önce reddedilir.


### Hediye aksiyon kuralları
- Desteklenen beş aksiyon (`invite`, `dance`, `drink`, `vip`, `stage`) tek bir istemci kural modülünde tanımlıdır.
- Davet ve dans 5 dakika, VIP 3 dakika sürer; içecek ve sahne aksiyonları süreli kons rezervasyonu gerektirmez.
- Ana oyun akışı aynı kural modülünü kullanır; testler aksiyon listesini, süreleri, kons gereksinimini ve bilinmeyen aksiyonların reddini doğrular.


### Kons oturum zamanlayıcısı
- Kons oturum süreleri ayrı bir test edilebilir zamanlayıcı yöneticisiyle tutulur.
- Müşteri ayrıldığında ilgili zamanlayıcı iptal edilir; uygulama kapanırken tüm oturum zamanlayıcıları temizlenir.
- Süre dolumu, müşteri ayrılışı ve zamanlayıcı başlatma hatası aynı yaşam döngüsünden geçer; bitiş işlemi idempotenttir ve eski oturumun callback'i yeni oturumu kapatamaz.
- Timer, rezervasyon veya sahne temizleme adımlarından biri hata verse bile kalan temizleme adımları denenir; dört hedefli yaşam döngüsü testi geçti.
- Aynı kons için yeni zamanlayıcı kurulursa eski zamanlayıcı iptal edilir; eski oturumun geç gelen callback'i yeni oturumu bitiremez.
- Süre dolunca zamanlayıcı kaydı callback çalıştırılmadan önce silinir; aynı oturum iki kez tamamlanmaz.
- Testler süre dolumu, müşteri ayrılışı, zamanlayıcı değiştirme, toplu temizleme ve geçersiz girdileri kapsar.
