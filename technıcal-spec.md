Teknik Doküman: Günlük Taze Süt Takip Uygulaması
Proje Özeti
Bu proje, evlere teslim günlük taze süt satışı yapan bir işletme için müşteri ve sipariş yönetimi sağlayan mobil öncelikli bir web uygulamasıdır. Kullanıcılar müşterileri ekleyip/silip/güncelleyebilir, günlük siparişleri kaydedebilir ve bir dashboard üzerinden durumu görüntüleyebilir. Uygulama, React ile frontend, Node.js/Express ile backend ve SQLite ile veritabanı kullanılarak geliştirilmiştir.
Teknoloji Yığını

Frontend:
React: Fonksiyonel bileşenler ve hook'lar ile UI geliştirme.
TypeScript: Tür güvenliği için.
Tailwind CSS: Mobil öncelikli, responsive stil için.
Zustand: Global durum yönetimi.
React Router: Sayfa yönlendirmeleri için.


Backend:
Node.js/Express: RESTful API sunucusu.
Knex.js: SQLite ile veritabanı işlemleri.
Zod: Giriş doğrulaması.


Veritabanı:
SQLite: Hafif, sunucusuz veritabanı, database.db dosyası proje kökünde.


Diğer:
Vite: Hızlı geliştirme ve build aracı.
Jest/React Testing Library: Birim testleri.



Mimari

Frontend:
Özellik bazlı dosya yapısı (src/features/customers, src/features/orders, src/features/dashboard).
Mobil öncelikli tasarım, Tailwind CSS ile utility-first stil.
Dashboard, sipariş ve müşteri verilerini görselleştirmek için tablo ve basit grafikler içerir.


Backend:
RESTful API endpoint'leri:
/api/customers: Müşteri ekleme, silme, güncelleme, listeleme.
/api/orders: Sipariş ekleme, listeleme, durum güncelleme.


SQLite veritabanı, customers ve orders tablolarını içerir.


Veritabanı Şeması:
customers:
id (INTEGER, PRIMARY KEY, AUTO_INCREMENT)
name (TEXT, NOT NULL)
phone (TEXT, NOT NULL, UNIQUE)


orders:
id (INTEGER, PRIMARY KEY, AUTO_INCREMENT)
customerId (INTEGER, FOREIGN KEY)
deliveryTime (TEXT, 'morning' | 'evening')
orderDate (TEXT, ISO format, örn. '2025-06-22')
status (TEXT, 'pending' | 'delivered')




Dosya Yapısı:project/
├── .cursor/
│   └── rules/
│       └── app-rules.mdc
├── src/
│   ├── features/
│   │   ├── customers/
│   │   │   ├── CustomerList.tsx
│   │   │   ├── CustomerForm.tsx
│   │   │   └── styles.ts
│   │   ├── orders/
│   │   │   ├── OrderList.tsx
│   │   │   ├── OrderForm.tsx
│   │   │   └── styles.ts
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   └── styles.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── server/
│   ├── routes/
│   │   ├── customers.ts
│   │   └── orders.ts
│   ├── db/
│   │   └── db.ts
│   └── index.ts
├── database.db
├── package.json
└── README.md



Kurulum ve Çalıştırma

Bağımlılıkları Yükleme:
npm install

Gerekli paketler: react, react-dom, react-router-dom, tailwindcss, zustand, axios, express, knex, sqlite3, zod, @testing-library/react, jest.

Veritabanını Başlatma:

knex ile veritabanı şemasını oluştur:npx knex migrate:latest




Backend'i Çalıştırma:
npm run server


Frontend'i Çalıştırma:
npm run dev


Testleri Çalıştırma:
npm test



Özellikler

Müşteri Yönetimi:
Ekleme: Form ile isim ve telefon numarası girilir, telefon numarasının benzersizliği kontrol edilir.
Silme: Müşteri silindiğinde ilgili siparişler kaskad silinir.
Güncelleme: Müşteri bilgileri form ile güncellenir.


Sipariş Yönetimi:
Sipariş ekleme: Müşteri seçilir, teslimat saati (sabah 11:00 veya akşam 20:00) belirtilir.
Sipariş listeleme: Tarih ve duruma göre filtrelenir.


Dashboard:
Günlük siparişlerin listesi ve durumu.
Müşteri bazlı sipariş özeti.
Toplam sipariş sayısı gibi basit istatistikler.



Erişilebilirlik ve Güvenlik

Erişilebilirlik:
Klavye navigasyonu desteklenir.
Semantik HTML ve ARIA etiketleri kullanılır.


Güvenlik:
Telefon numaraları ve diğer girişler Zod ile doğrulanır.
SQL enjeksiyonunu önlemek için knex ile parametreli sorgular kullanılır.



Gelecekteki İyileştirmeler

Yetkilendirme ekleme (ör. kullanıcı girişi).
Daha gelişmiş dashboard grafikleri (ör. Chart.js ile).
Sipariş durumu için bildirim sistemi.

Bakım ve İzleme

Google Analytics ile kullanıcı etkileşimlerini izleyin.
Vercel ile kolay deployment.
Hata izleme için Sentry entegrasyonu önerilir.
