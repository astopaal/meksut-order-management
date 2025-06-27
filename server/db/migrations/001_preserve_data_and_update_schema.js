/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. Mevcut verileri geçici tablolara kopyala
  const hasCustomersTable = await knex.schema.hasTable('customers');
  const hasOrdersTable = await knex.schema.hasTable('orders');
  
  if (hasCustomersTable) {
    // customers tablosundan verileri geçici tabloya kopyala
    await knex.raw(`
      CREATE TABLE customers_temp AS 
      SELECT * FROM customers
    `);
    console.log('✅ Mevcut customers verileri geçici tabloya kopyalandı');
  }
  
  if (hasOrdersTable) {
    // orders tablosundan verileri geçici tabloya kopyala
    await knex.raw(`
      CREATE TABLE orders_temp AS 
      SELECT * FROM orders
    `);
    console.log('✅ Mevcut orders verileri geçici tabloya kopyalandı');
  }
  
  // 2. Eski tabloları sil
  if (hasOrdersTable) {
    await knex.schema.dropTable('orders');
    console.log('🗑️ Eski orders tablosu silindi');
  }
  
  if (hasCustomersTable) {
    await knex.schema.dropTable('customers');
    console.log('🗑️ Eski customers tablosu silindi');
  }
  
  // 3. Yeni şema ile tabloları oluştur
  await knex.schema.createTable('customer', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('phone').notNullable().unique();
    table.string('address');
    table.string('location'); // Yeni kolon
    table.timestamps(true, true);
  });
  console.log('✅ Yeni customer tablosu oluşturuldu');
  
  await knex.schema.createTable('order', (table) => {
    table.increments('id').primary();
    table.integer('customerId').unsigned().references('id').inTable('customer').onDelete('CASCADE');
    table.enum('deliveryTime', ['morning', 'evening']).notNullable();
    table.string('orderDate').notNullable();
    table.enum('status', ['pending', 'delivered', 'cancelled']).defaultTo('pending');
    table.integer('quantity').notNullable().defaultTo(1);
    table.timestamps(true, true);
  });
  console.log('✅ Yeni order tablosu oluşturuldu');
  
  // 4. Verileri yeni tablolara geri yükle
  if (hasCustomersTable) {
    await knex.raw(`
      INSERT INTO customer (id, name, phone, address, created_at, updated_at)
      SELECT id, name, phone, address, created_at, updated_at
      FROM customers_temp
    `);
    console.log('✅ Customer verileri yeni tabloya aktarıldı');
    
    // Geçici tabloyu sil
    await knex.schema.dropTable('customers_temp');
  }
  
  if (hasOrdersTable) {
    await knex.raw(`
      INSERT INTO \`order\` (id, customerId, deliveryTime, orderDate, status, quantity, created_at, updated_at)
      SELECT id, customerId, deliveryTime, orderDate, status, quantity, created_at, updated_at
      FROM orders_temp
    `);
    console.log('✅ Order verileri yeni tabloya aktarıldı');
    
    // Geçici tabloyu sil
    await knex.schema.dropTable('orders_temp');
  }
  
  console.log('🎉 Migration başarıyla tamamlandı! Veriler korundu.');
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  // Geri alma işlemi - sadece tabloları sil
  await knex.schema.dropTableIfExists('order');
  await knex.schema.dropTableIfExists('customer');
  console.log('⚠️ Tablolar silindi (geri alma)');
} 