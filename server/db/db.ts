import knex from 'knex';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(process.cwd(), 'database.db');

export const db = knex({
  client: 'sqlite3',
  connection: {
    filename: dbPath,
  },
  useNullAsDefault: true,
  migrations: {
    directory: path.join(__dirname, 'migrations'),
  },
});

// Veritabanı tablolarını oluştur
export const initializeDatabase = async () => {
  try {
    // Customer tablosu
    const hasCustomerTable = await db.schema.hasTable('customer');
    if (!hasCustomerTable) {
      await db.schema.createTable('customer', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('phone').notNullable().unique();
        table.string('address');
        table.string('location'); // Koordinat bilgisi (lat,lon formatında)
        table.timestamps(true, true);
      });
      console.log('Customer table created');
    } else {
      // Mevcut tabloya eksik kolonları ekle
      const hasAddressColumn = await db.schema.hasColumn('customer', 'address');
      const hasLocationColumn = await db.schema.hasColumn('customer', 'location');
      
      if (!hasAddressColumn) {
        await db.schema.alterTable('customer', (table) => {
          table.string('address');
        });
        console.log('Address column added to customer table');
      }
      
      if (!hasLocationColumn) {
        await db.schema.alterTable('customer', (table) => {
          table.string('location'); // Koordinat bilgisi (lat,lon formatında)
        });
        console.log('Location column added to customer table');
      }
    }

    // Order tablosu
    const hasOrderTable = await db.schema.hasTable('order');
    if (!hasOrderTable) {
      await db.schema.createTable('order', (table) => {
        table.increments('id').primary();
        table.integer('customerId').unsigned().references('id').inTable('customer').onDelete('CASCADE');
        table.enum('deliveryTime', ['morning', 'evening']).notNullable();
        table.string('orderDate').notNullable(); // ISO format
        table.enum('status', ['pending', 'delivered', 'cancelled']).defaultTo('pending');
        table.integer('quantity').notNullable().defaultTo(1); // Süt miktarı
        table.timestamps(true, true);
      });
      console.log('Order table created');
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};