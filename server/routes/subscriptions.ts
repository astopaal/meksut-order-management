import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/db';

const router = Router();

// Abonelik şeması
const subscriptionSchema = z.object({
  customerId: z.number(),
  days: z.array(z.string()), // ['monday', 'wednesday', 'friday']
  deliveryTime: z.enum(['morning', 'evening']),
  quantity: z.number().min(1),
  isActive: z.boolean().default(true),
});

const subscriptionUpdateSchema = subscriptionSchema.partial();

// Tüm abonelikleri getir
router.get('/', async (req, res) => {
  try {
    const subscriptions = await db('subscriptions')
      .join('customers', 'subscriptions.customerId', 'customers.id')
      .select(
        'subscriptions.*',
        'customers.name as customerName',
        'customers.phone as customerPhone'
      )
      .orderBy('customers.name');
    
    // days alanlarını parse et
    const parsedSubscriptions = subscriptions.map(sub => ({
      ...sub,
      days: JSON.parse(sub.days)
    }));
    
    res.json(parsedSubscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Abonelikler getirilirken hata oluştu' });
  }
});

// Müşteri bazlı abonelikleri getir
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const subscriptions = await db('subscriptions')
      .where('customerId', customerId)
      .orderBy('created_at', 'desc');
    
    // days alanlarını parse et
    const parsedSubscriptions = subscriptions.map(sub => ({
      ...sub,
      days: JSON.parse(sub.days)
    }));
    
    res.json(parsedSubscriptions);
  } catch (error) {
    console.error('Error fetching customer subscriptions:', error);
    res.status(500).json({ error: 'Müşteri abonelikleri getirilirken hata oluştu' });
  }
});

// Yeni abonelik oluştur
router.post('/', async (req, res) => {
  try {
    const validatedData = subscriptionSchema.parse(req.body);
    
    // Müşterinin var olup olmadığını kontrol et
    const customer = await db('customers').where('id', validatedData.customerId).first();
    if (!customer) {
      return res.status(400).json({ error: 'Geçersiz müşteri ID\'si' });
    }
    
    // days array'ini JSON string'e çevir
    const insertData = {
      ...validatedData,
      days: JSON.stringify(validatedData.days)
    };
    
    const [subscription] = await db('subscriptions')
      .insert(insertData)
      .returning('*');
    
    // Response'da days'i parse et
    const responseData = {
      ...subscription,
      days: JSON.parse(subscription.days)
    };
    
    res.status(201).json(responseData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Abonelik oluşturulurken hata oluştu' });
  }
});

// Abonelik güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = subscriptionUpdateSchema.parse(req.body);
    
    // days array'ini JSON string'e çevir
    const updateData = {
      ...validatedData,
      days: validatedData.days ? JSON.stringify(validatedData.days) : undefined
    };
    
    const [updatedSubscription] = await db('subscriptions')
      .where('id', id)
      .update(updateData)
      .returning('*');
    
    if (!updatedSubscription) {
      return res.status(404).json({ error: 'Abonelik bulunamadı' });
    }
    
    // Response'da days'i parse et
    const responseData = {
      ...updatedSubscription,
      days: JSON.parse(updatedSubscription.days)
    };
    
    res.json(responseData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Abonelik güncellenirken hata oluştu' });
  }
});

// Abonelik sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db('subscriptions').where('id', id).del();
    
    if (deleted === 0) {
      return res.status(404).json({ error: 'Abonelik bulunamadı' });
    }
    
    res.json({ message: 'Abonelik başarıyla silindi' });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    res.status(500).json({ error: 'Abonelik silinirken hata oluştu' });
  }
});

// Abonelik siparişlerini oluştur (günlük çalıştırılacak)
export async function generateSubscriptionOrders(days: number = 7) {
  const activeSubscriptions = await db('subscriptions')
    .where('isActive', true)
    .join('customers', 'subscriptions.customerId', 'customers.id')
    .select('subscriptions.*', 'customers.name as customerName');

  const createdOrders: any[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + i);
    const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    for (const subscription of activeSubscriptions) {
      if (subscription.days.includes(dayName)) {
        // Bu tarihte zaten sipariş var mı kontrol et
        const existingOrder = await db('orders')
          .where({
            customerId: subscription.customerId,
            orderDate: targetDate.toISOString().split('T')[0],
            deliveryTime: subscription.deliveryTime
          })
          .first();

        if (!existingOrder) {
          const inserted = await db('orders')
            .insert({
              customerId: subscription.customerId,
              orderDate: targetDate.toISOString().split('T')[0],
              deliveryTime: subscription.deliveryTime,
              quantity: subscription.quantity,
              status: 'pending'
            })
            .returning('*');
          if (Array.isArray(inserted) && inserted.length > 0) {
            createdOrders.push(inserted[0]);
          }
        }
      }
    }
  }
  return createdOrders;
}

router.post('/generate-orders', async (req, res) => {
  try {
    const { days = 7 } = req.body;
    const orders = await generateSubscriptionOrders(days);
    res.json({ message: `${orders.length} yeni sipariş oluşturuldu`, orders });
  } catch (error) {
    console.error('Error generating subscription orders:', error);
    res.status(500).json({ error: 'Abonelik siparişleri oluşturulurken hata oluştu' });
  }
});

export default router; 