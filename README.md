# Meksut Süt - Müşteri ve Sipariş Yönetimi

Mobil öncelikli React uygulaması ile evlere teslim günlük taze süt satışı için müşteri ve sipariş yönetimi sistemi.

## Özellikler

- **Müşteri Yönetimi**: Müşteri ekleme, düzenleme, silme
- **Sipariş Yönetimi**: Sipariş oluşturma, güncelleme, durum takibi
- **Dashboard**: Günlük siparişler ve istatistikler
- **Mobil Öncelikli Tasarım**: Tailwind CSS ile responsive tasarım
- **Telefon Numarası Benzersizliği**: Otomatik kontrol
- **SQLite Veritabanı**: Yerel veri saklama

## Teknolojiler

### Frontend
- React 18 + TypeScript
- Vite (Build tool)
- Tailwind CSS (Styling)
- React Router (Routing)
- Axios (HTTP client)

### Backend
- Node.js + Express
- SQLite (Veritabanı)
- Knex.js (Query builder)
- Zod (Veri doğrulama)

## Kurulum

1. **Projeyi klonlayın**
```bash
git clone <repository-url>
cd meksut-app
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Veritabanını başlatın**
```bash
npm run migrate
```

4. **Uygulamayı başlatın**
```bash
# Hem frontend hem backend'i başlatmak için
npm start

# Veya ayrı ayrı başlatmak için
npm run server  # Backend (port 3001)
npm run dev     # Frontend (port 5173)
```

## Kullanım

### Müşteri Yönetimi
- Müşteri listesini görüntüleyin
- Yeni müşteri ekleyin (telefon numarası benzersiz olmalı)
- Müşteri bilgilerini düzenleyin
- Müşteri silin (ilgili siparişler de silinir)

### Sipariş Yönetimi
- Sipariş listesini görüntüleyin
- Yeni sipariş oluşturun (müşteri seçimi zorunlu)
- Teslimat saati seçin (sabah/akşam)
- Sipariş durumunu güncelleyin (bekliyor/teslim edildi/iptal edildi)

### Dashboard
- Günlük siparişleri görüntüleyin
- Toplam istatistikleri inceleyin
- Sipariş durumlarını takip edin

## API Endpoints

### Müşteriler
- `GET /api/customers` - Tüm müşterileri getir
- `GET /api/customers/:id` - Tek müşteri getir
- `POST /api/customers` - Yeni müşteri ekle
- `PUT /api/customers/:id` - Müşteri güncelle
- `DELETE /api/customers/:id` - Müşteri sil

### Siparişler
- `GET /api/orders` - Tüm siparişleri getir
- `GET /api/orders/:id` - Tek sipariş getir
- `GET /api/orders/daily/:date` - Günlük siparişleri getir
- `POST /api/orders` - Yeni sipariş ekle
- `PUT /api/orders/:id` - Sipariş güncelle
- `DELETE /api/orders/:id` - Sipariş sil

## Veritabanı Şeması

### Customers Tablosu
- `id` (INTEGER, PRIMARY KEY, AUTO_INCREMENT)
- `name` (TEXT, NOT NULL)
- `phone` (TEXT, NOT NULL, UNIQUE)
- `created_at` (TEXT)
- `updated_at` (TEXT)

### Orders Tablosu
- `id` (INTEGER, PRIMARY KEY, AUTO_INCREMENT)
- `customerId` (INTEGER, FOREIGN KEY)
- `deliveryTime` (TEXT, 'morning' | 'evening')
- `orderDate` (TEXT, ISO format)
- `status` (TEXT, 'pending' | 'delivered' | 'cancelled')
- `created_at` (TEXT)
- `updated_at` (TEXT)

## Geliştirme

### Script'ler
- `npm run dev` - Frontend geliştirme sunucusu
- `npm run server` - Backend sunucusu
- `npm run build` - Production build
- `npm run migrate` - Veritabanı migrasyonu
- `npm run start` - Hem frontend hem backend'i başlat

### Dosya Yapısı
```
src/
├── features/
│   ├── customers/
│   │   ├── CustomerList.tsx
│   │   └── CustomerForm.tsx
│   ├── orders/
│   │   ├── OrderList.tsx
│   │   └── OrderForm.tsx
│   └── dashboard/
│       └── Dashboard.tsx
├── services/
│   └── api.ts
├── types/
│   └── index.ts
└── App.tsx

server/
├── routes/
│   ├── customers.ts
│   └── orders.ts
├── db/
│   └── db.ts
└── index.ts
```

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
