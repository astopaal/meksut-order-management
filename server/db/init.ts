import { initializeDatabase } from './db';
import { db } from './db';

async function init() {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully!');

    // Abonelik tablosu
    await db.schema.createTable('subscriptions', (table) => {
      table.increments('id').primary();
      table.integer('customerId').notNullable().references('id').inTable('customers').onDelete('CASCADE');
      table.json('days').notNullable(); // ['monday', 'wednesday', 'friday'] gibi
      table.enum('deliveryTime', ['morning', 'evening']).notNullable();
      table.integer('quantity').notNullable().defaultTo(1);
      table.boolean('isActive').notNullable().defaultTo(true);
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
    });

    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

init(); 