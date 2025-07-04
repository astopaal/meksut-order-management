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
});

// Veritabanı tablolarını oluştur
export const initializeDatabase = async () => {
  try {
    // Customers tablosu
    const hasCustomersTable = await db.schema.hasTable('customers');
    if (!hasCustomersTable) {
      await db.schema.createTable('customers', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('phone').notNullable().unique();
        table.string('address');
        table.timestamps(true, true);
      });
      console.log('Customers table created');
    }

    // Orders tablosu
    const hasOrdersTable = await db.schema.hasTable('orders');
    if (!hasOrdersTable) {
      await db.schema.createTable('orders', (table) => {
        table.increments('id').primary();
        table.integer('customerId').unsigned().references('id').inTable('customers').onDelete('CASCADE');
        table.enum('deliveryTime', ['morning', 'evening']).notNullable();
        table.string('orderDate').notNullable(); // ISO format
        table.enum('status', ['pending', 'delivered', 'cancelled']).defaultTo('pending');
        table.integer('quantity').notNullable().defaultTo(1); // Süt miktarı
        table.timestamps(true, true);
      });
      console.log('Orders table created');
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};