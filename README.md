# PAVYON LIVE

**TikTok LIVE izleyicilerinin yorum, beğeni ve hediyelerle katılacağı 3D pavyon oyunu.**

> **Proje durumu (18 Kasım 2026):** Görsel ve etkileşim prototipi geliştiriliyor. Oyun henüz gerçek TikTok LIVE hesabına bağlı değil. Bu depoda profesyonel harici 3D model dosyaları bulunmuyor; karakterler Three.js geometrileriyle kod üzerinden üretiliyor.

## İlerleme tahmini

> Bu yüzdeler tamamlanmış bir ürünün ölçümü değil, ilk yayınlanabilir sürüme giden iş planının yaklaşık durumudur.

- **Etkileşimli oyun prototipi: %60** — mekân, karakterler, komutlar, hediye simülasyonu ve temel oyun döngüleri var; görsel kalite ve davranış testleri sürüyor.
- **İlk yayınlanabilir ürün hedefi: yaklaşık %32** — gerçek TikTok LIVE entegrasyonu, profesyonel karakter varlıkları, güvenlik, performans ve uçtan uca testler henüz tamamlanmadı.

| İş paketi | Tahmini tamamlanma |
|---|---:|
| 3D mekân ve dekor | %68 |
| Karakter model/animasyon kalitesi | %40 |
| Oyun kuralları ve etkileşimler | %58 |
| Sunucu ve test simülatörü | %45 |
| Gerçek TikTok LIVE entegrasyonu | %0 |
| Performans, güvenlik ve yayın testleri | %5 |
| Yayın/hosting hazırlığı | %10 |

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
| Etkileşim rezervasyonları | İlk prototip hazır | Dans pisti için altı çift noktası, VIP için dört çift noktası ve aynı izleyicinin eşzamanlı iki kons etkileşimine girmesini engelleme |
| Yorum ve hediye testleri | Prototip hazır | Komutlar ve normalize edilmiş test hediye olayları |
| Kons kullanım süresi | İlk akış hazır | Kons meşguliyet kontrolü; davet/dans 5 dk, VIP 3 dk; süre bitince dönüş ve test panelinde müsait/meşgul durumu |
| Gerçek TikTok bağlantısı | Başlanmadı | Olay kaynağı, izinler ve platforma uygun entegrasyon ayrıca yapılacak |
| Performans ve yayın testi | Bekliyor | 100 müşteri/115 aktör hedefi gerçek cihazlarda henüz ölçülmedi |

**Önemli ayrım:** Şu anki konslar profesyonel, dışarıdan hazırlanmış, iskelet (skeletal) rig'li karakterler değildir. Son görsel kalite turunda yüz, saç ve kıyafet geometrilerinin pürüzsüzlüğü ile göz detayları ve kumaşın ışık tepkisi iyileştirildi; bunlar hâlâ prosedürel düşük/orta poligon oyun modelleridir. Sonraki model turunda kons elbisesine ayrı üst beden/bodice ve etek katmanı, topuklu ayakkabıya ayrı ayakkabı ve topuk geometrisi, kolye ucu ve elbise üzerinde küçük taş detayları eklendi; bunlar silüeti ve yakın plan okunabilirliğini artıran prosedürel ayrıntılardır. Son yüz/saç turunda baş oranı ve yanak formu düzenlendi; kulaklar, burun köprüsü/uç/nostril detayları, ayrı üst-alt dudak katmanları ve beş ince saç tutamı eklendi. Bunlar stilize yüz okunabilirliğini artırır; gerçekçi insan yüzü veya profesyonel saç simülasyonu değildir. Müşteri ve garson modellerine de sade göz/burun/ağız detayları eklendi; yan saç tutamları ve bazı müşteri saçlarında perçem varyasyonu oluşturuldu. Garsonlara koyu yelek panelleri, açık gömlek önü, papyon ve düğme detayları; bazı müşteri varyantlarına yaka detayı eklendi. Kalabalık sahne performansı gözetilerek bu detaylar kons yüzündeki kadar yoğun tutulmadı. Son anatomi turunda kol ve bacaklar tek parça kapsül yerine üst/alt segment, dirsek/diz ve el/ayak parçalarına ayrıldı; ellerde kısa parmak detayları, gövde ölçeğinde hafif oran düzeltmesi ve bel dikişi eklendi. Mevcut pivot animasyonları korunur; bu hâlâ tam iskelet rig'i değildir. Sonraki model turunda kons elbisesine ayrı üst beden/bodice ve etek katmanı, topuklu ayakkabıya ayrı ayakkabı ve topuk geometrisi, kolye ucu ve elbise üzerinde küçük taş detayları eklendi; bunlar silüeti ve yakın plan okunabilirliğini artıran prosedürel ayrıntılardır. Gövde, saç, kıyafet ve aksesuarları Three.js temel geometrilerinden oluşur. Kol ve bacaklarda pivot tabanlı hareket noktaları vardır; bu, tam vücut iskelet rig'i veya motion-capture animasyonu değildir.

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
- Boştayken hafif salınım ve ara sıra kahkaha; göz kırpma; davette cilveli duruş; dans sırasında kol/bacak pivot hareketleri. Konslar üç farklı ritim/kol-bacak kombinasyonundan biriyle dans eder. Yürüyüşte hareket mesafesine bağlı ayrı adım fazı, daha düşük hız, karşılıklı kol-bacak salınımı ve hafif gövde/baş tepkisi kullanılır; dans döngülerinde zıplama azaltılarak ayak adımı, kol ritmi ve kalça/gövde salınımı daha kontrollü tutulur. Yürüme komutundan dans/sahne pozuna geçişte gövde, baş, kollar ve bacaklar yaklaşık 0,42 saniyelik yumuşak poz harmanlamasıyla geçer; dans hareketi hedefe ulaşıldığında başlatılır. Müşteri masaya ulaştığında oturma hareketi yaklaşık 0,62 saniyede gövdeyi hafif öne alıp baş, kol ve bacakları oturma pozuna kademeli geçirir; oturmuş müşteri davet/dans/VIP etkileşimine alındığında koltuk serbest bırakılırken ayakta duruşa yaklaşık 0,42 saniyelik poz harmanlaması uygulanır.
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
- Hedef aktif aktör sayısı: 100 izleyici müşterisi + 10 etkileşim konsu + 5 garson + 6 arka plan dans NPC'si = 121. Bu kapasite henüz performans testinden geçmedi.

## Sahne ve canlı müzik ekibi

- Sahne düzeni DJ kabini yerine pavyon orkestrası mantığına göre kuruldu: bağlama, klavye, darbuka ve klarnet çalan dört müzisyen.
- Müzisyenler sahnede sabit konumlarda durur; enstrümanları ve çalma hareketleri kodla üretilir. Bağlamada el/tezene hareketi, klavyede tuş vuruşları, darbukada ritmik el-vuruşu ve klarnette perde/tuşe hareketi canlandırılır.
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
- Geliştirme testleri: yorum/hediye simülatörü ve geliştirme amaçlı `/dev/event` uç noktası.
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
2. **Animasyon kalitesi:** Daha doğal yürüme, oturma, dans, gülme ve etkileşim geçişleri; mevcut pivot animasyonlarını iyileştirmek. Son eklenenler: kons ve müşteri yürüyüş/oturma/dans hareketleri; garson tepsi-servis pozu; VIP çiftlerinin yüz yüze yönlenmesi.
3. **Etkileşim yaşam döngüsü:** Masa/VIP konumları, daha güçlü çakışma önleme/navigasyon, kuyruk, dolu masa yönetimi ve her aksiyon sonrası doğru başlangıç konumuna dönüş. VIP için dört, dans pisti için altı çift konumu rezervasyonu; aynı izleyici için eşzamanlı kons etkileşimi engeli, müşteriye en yakın boş koltuk seçimi ve masa bazlı koltuk doluluk sayacı, mobilya/servis/VIP bölgelerinden kaçınan ve mevcut aktörlerden uzaklık puanlayan müşteri giriş konumları, yürüyen karakterler için uzamsal ızgara destekli hafif yerel ayrışma yönlendirmesi ve hedef ve hareket konumlarını oynanabilir salon sınırları içinde tutan hareket sınırlandırması eklendi. Genel fiziksel çarpışma ve kuyruk sistemi hâlâ yapılacak.
4. **Sahne ve arayüz cilası:** Işık, dekor, masa durumları, kons müsaitlik göstergesi, yayın overlay'i ve müzik paneli. Müzik panelinde Pavyon/Ankara Havaları/Favoriler listeleri ile yerel ses dosyası seçimi eklendi; kalıcı sunucu müzik kütüphanesi, otomatik çalma listesi ve lisanslı parça seçimi sonraki adımdır. Son eklenenler: pistin boş kalmaması için üç sabit kons-müşteri NPC dans çifti ve canlı hediye danslarına ayrılmış üç ek çift konumu; ana giriş kapısı/ışıklı eşik ve yedi şeritli kademeli müşteri girişi, dört hareketli sahne spotu ve görsel ışık huzmeleri, dokuz armatürlü üst ışık kirişi ve sahne yan LED barları, dans pistinde yumuşak renkli ışık havuzu, VIP locada dört ayrı sıcak/pembe ambiyans ışığı, art-deco sahne çerçevesi/arka paneli, bordo yan perdeler ve altın bağlar, sahne üstü ampul sırası ve beş dekoratif LED paneli, sahne hoparlörleri/LED şeridi, bar şişe dekorları ve detaylı tezgâh/ayaklı tabureler, katmanlı arka duvar panelleri ve aplik ışıkları, VIP locada döşemeli sedirler/yan sehpalar, masalarda altın ayak-pedestal ve üst yüzey kakması, minderli sırtlıklı altın ayaklı sandalyeler, zeminde ince geometrik hatlar ve halı bordürü. VIP mobilyaları ayrılmış ziyaretçi konumlarının çevresine yerleştirildi; garsonlar için müşteri çevresinde dört yönlü yaklaşma noktası puanlaması eklendi; boşta duran/oturan müşterilere düşük genlikli doğal bekleme hareketleri ve yakındaki müşterilere sınırlı sosyal bakış davranışı eklendi. Gerçek cihazda erişim/çakışma kontrolü ve ışık performansı henüz doğrulanmadı.
5. **Test ve optimizasyon:** 10/25/50/100 müşteri yük testi, mobil GPU ve bellek ölçümü, gerçek tarayıcı testleri.
6. **TikTok LIVE entegrasyonu:** Uygun ve izinli olay kaynağına bağlanma; hediye-adım eşlemesi ve güvenli sunucu doğrulaması.
7. **Yayın hazırlığı:** OBS/TikTok LIVE Studio Browser Source, hosting ve canlı prova.

## Test durumu ve bilinen eksikler

- Son geliştirme turunda dans pisti/VIP konum rezervasyonları, dolu alan için güvenli ret, konsun müşteriye yaklaşırken dört yöndeki noktaları mesafe/çevre açıklığına göre değerlendirmesi, aynı izleyicinin eşzamanlı kons etkileşimine girmesini engelleme, dolu 18 koltuk için açık ret, beş garson için 30 taleplik FIFO servis kuyruğu ve kuyrukta geçersiz müşteri kaydından sonra otomatik devam/garsonu boşa çıkarma akışı, hedef noktaları ve yürüyen karakterlerin gerçek konumlarını salon sınırları içinde tutan sınırlandırma, hedef ve hareket konumlarını zemin sınırlarında tutan oda sınırlandırması, masa üstü mum/bardak dekoru, sahne hoparlörleri/LED şeridi, bar şişe dekorları, üç farklı kons dans stili ve etkileşim sürerken izleyicinin komutla görev bozmasının önlenmesi GitHub'a yazıldı. Ancak bu oturumda `npm install`, `npm run build` veya gerçek cihaz tarayıcı testi çalıştırılmadı.
- Kons animasyonları prosedürel Three.js hareketleridir; sesli kahkaha, gerçekçi yüz kasları, dudak senkronu ve profesyonel dans koreografisi yoktur.
- Karakterlerin gerçekçi/kaliteli hale gelmesi için ileride lisanslı veya özgün hazırlanmış rig'li 3D varlıklar kullanılabilir. Bu dosyaların lisans ve optimizasyonu kontrol edilmelidir.
- TikTok LIVE bağlantısı, canlı yayın performansı ve 115 aktör hedefi henüz doğrulanmadı.

## Güvenlik notları

- API anahtarı, token veya yayın kimlik bilgisi repoya eklenmemelidir.
- İstemci tarafından gelen bir hediye aksiyonu tek başına ödeme/hediye kanıtı sayılmaz.
- Gerçek hediye entegrasyonu sunucu tarafında kaynak doğrulaması ve olay tekilleştirmesi yapmalıdır.
- Kullanıcı adları HTML'e yazılmadan önce kaçışlanmalıdır.
