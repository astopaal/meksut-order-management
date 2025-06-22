import { Router } from 'express';
import { db } from '../db/db';

const router = Router();

// Müşteri sipariş analizi
router.get('/customer-analysis', async (req, res) => {
  try {
    const customerAnalysis = await db.raw(`
      SELECT 
        c.id,
        c.name,
        c.phone,
        COUNT(o.id) as total_orders,
        COUNT(CASE WHEN o.status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN o.status = 'pending' THEN 1 END) as pending_orders,
        MIN(o.orderDate) as first_order_date,
        MAX(o.orderDate) as last_order_date,
        CASE 
          WHEN COUNT(o.id) > 1 THEN 
            ROUND(
              (JULIANDAY(MAX(o.orderDate)) - JULIANDAY(MIN(o.orderDate))) / (COUNT(o.id) - 1), 
              1
            )
          ELSE NULL 
        END as avg_days_between_orders,
        CASE 
          WHEN MAX(o.orderDate) IS NOT NULL THEN 
            ROUND(JULIANDAY('now') - JULIANDAY(MAX(o.orderDate)), 0)
          ELSE NULL 
        END as days_since_last_order
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customerId
      GROUP BY c.id, c.name, c.phone
      ORDER BY total_orders DESC, last_order_date DESC
    `);

    res.json(customerAnalysis);
  } catch (error) {
    console.error('Error fetching customer analysis:', error);
    res.status(500).json({ error: 'Müşteri analizi getirilirken hata oluştu' });
  }
});

// Son 30 günde en çok sipariş veren müşteriler
router.get('/top-customers-30days', async (req, res) => {
  try {
    const topCustomers = await db.raw(`
      SELECT 
        c.name,
        c.phone,
        COUNT(o.id) as order_count,
        COUNT(CASE WHEN o.deliveryTime = 'morning' THEN 1 END) as morning_orders,
        COUNT(CASE WHEN o.deliveryTime = 'evening' THEN 1 END) as evening_orders
      FROM customers c
      INNER JOIN orders o ON c.id = o.customerId
      WHERE o.orderDate >= date('now', '-30 days')
      GROUP BY c.id, c.name, c.phone
      ORDER BY order_count DESC
      LIMIT 10
    `);

    res.json(topCustomers);
  } catch (error) {
    console.error('Error fetching top customers:', error);
    res.status(500).json({ error: 'En çok sipariş veren müşteriler getirilirken hata oluştu' });
  }
});

// Günlük ortalama sipariş sayısı (son 30 gün)
router.get('/daily-average', async (req, res) => {
  try {
    const dailyStats = await db.raw(`
      SELECT 
        COUNT(*) as total_orders_30days,
        ROUND(COUNT(*) / 30.0, 1) as daily_average,
        COUNT(CASE WHEN deliveryTime = 'morning' THEN 1 END) as morning_orders,
        COUNT(CASE WHEN deliveryTime = 'evening' THEN 1 END) as evening_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders
      FROM orders 
      WHERE orderDate >= date('now', '-30 days')
    `);

    res.json(dailyStats[0]);
  } catch (error) {
    console.error('Error fetching daily average:', error);
    res.status(500).json({ error: 'Günlük ortalama getirilirken hata oluştu' });
  }
});

// Haftalık sipariş trendi (son 8 hafta)
router.get('/weekly-trend', async (req, res) => {
  try {
    const weeklyTrend = await db.raw(`
      SELECT 
        strftime('%Y-%W', orderDate) as week,
        COUNT(*) as order_count,
        COUNT(CASE WHEN deliveryTime = 'morning' THEN 1 END) as morning_orders,
        COUNT(CASE WHEN deliveryTime = 'evening' THEN 1 END) as evening_orders
      FROM orders 
      WHERE orderDate >= date('now', '-56 days')
      GROUP BY strftime('%Y-%W', orderDate)
      ORDER BY week DESC
      LIMIT 8
    `);

    res.json(weeklyTrend);
  } catch (error) {
    console.error('Error fetching weekly trend:', error);
    res.status(500).json({ error: 'Haftalık trend getirilirken hata oluştu' });
  }
});

// Aylık sipariş trendi (son 12 ay)
router.get('/monthly-trend', async (req, res) => {
  try {
    const monthlyTrend = await db.raw(`
      SELECT 
        strftime('%Y-%m', orderDate) as month,
        COUNT(*) as order_count,
        COUNT(CASE WHEN deliveryTime = 'morning' THEN 1 END) as morning_orders,
        COUNT(CASE WHEN deliveryTime = 'evening' THEN 1 END) as evening_orders
      FROM orders 
      WHERE orderDate >= date('now', '-365 days')
      GROUP BY strftime('%Y-%m', orderDate)
      ORDER BY month DESC
      LIMIT 12
    `);

    res.json(monthlyTrend);
  } catch (error) {
    console.error('Error fetching monthly trend:', error);
    res.status(500).json({ error: 'Aylık trend getirilirken hata oluştu' });
  }
});

// Sipariş vermeyen müşteriler (son 7, 14, 30 gün)
router.get('/inactive-customers', async (req, res) => {
  try {
    const inactiveCustomers = await db.raw(`
      SELECT 
        c.id,
        c.name,
        c.phone,
        MAX(o.orderDate) as last_order_date,
        ROUND(JULIANDAY('now') - JULIANDAY(MAX(o.orderDate)), 0) as days_inactive,
        COUNT(o.id) as total_orders
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customerId
      GROUP BY c.id, c.name, c.phone
      HAVING last_order_date IS NULL OR days_inactive > 7
      ORDER BY days_inactive DESC
    `);

    res.json(inactiveCustomers);
  } catch (error) {
    console.error('Error fetching inactive customers:', error);
    res.status(500).json({ error: 'Pasif müşteriler getirilirken hata oluştu' });
  }
});

// Teslimat saati analizi
router.get('/delivery-time-analysis', async (req, res) => {
  try {
    const deliveryAnalysis = await db.raw(`
      SELECT 
        deliveryTime,
        COUNT(*) as order_count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM orders), 1) as percentage
      FROM orders 
      GROUP BY deliveryTime
      ORDER BY order_count DESC
    `);

    res.json(deliveryAnalysis);
  } catch (error) {
    console.error('Error fetching delivery time analysis:', error);
    res.status(500).json({ error: 'Teslimat saati analizi getirilirken hata oluştu' });
  }
});

// Günlük sipariş dağılımı (son 7 gün)
router.get('/daily-distribution', async (req, res) => {
  try {
    const dailyDistribution = await db.raw(`
      SELECT 
        orderDate,
        COUNT(*) as order_count,
        COUNT(CASE WHEN deliveryTime = 'morning' THEN 1 END) as morning_orders,
        COUNT(CASE WHEN deliveryTime = 'evening' THEN 1 END) as evening_orders
      FROM orders 
      WHERE orderDate >= date('now', '-7 days')
      GROUP BY orderDate
      ORDER BY orderDate DESC
    `);

    res.json(dailyDistribution);
  } catch (error) {
    console.error('Error fetching daily distribution:', error);
    res.status(500).json({ error: 'Günlük dağılım getirilirken hata oluştu' });
  }
});

export { router as reportRoutes }; 