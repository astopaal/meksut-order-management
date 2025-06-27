import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/db';

const router = Router();

// Zod şemaları
const orderSchema = z.object({
  customerId: z.number().int().positive('Geçerli bir müşteri ID\'si giriniz'),
  deliveryTime: z.enum(['morning', 'evening'], {
    errorMap: () => ({ message: 'Teslimat saati morning veya evening olmalıdır' })
  }),
  orderDate: z.string().min(1, 'Sipariş tarihi zorunludur'),
  status: z.enum(['pending', 'delivered', 'cancelled']).optional().default('pending'),
  quantity: z.number().int().positive('Miktar pozitif bir sayı olmalıdır').optional().default(1),
});

const orderUpdateSchema = orderSchema.partial();

// Tüm siparişleri getir
router.get('/', async (req, res) => {
  try {
    const orders = await db('order')
      .select(
        'order.*',
        'customer.name as customerName',
        'customer.phone as customerPhone',
        'customer.address as customerAddress',
        'customer.location as customerLocation'
      )
      .join('customer', 'order.customerId', 'customer.id')
      .orderBy('order.orderDate', 'desc');
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Siparişler getirilirken hata oluştu' });
  }
});

// Günlük siparişleri getir
router.get('/daily/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const orders = await db('order')
      .select(
        'order.*',
        'customer.name as customerName',
        'customer.phone as customerPhone',
        'customer.address as customerAddress',
        'customer.location as customerLocation'
      )
      .join('customer', 'order.customerId', 'customer.id')
      .where('order.orderDate', date)
      .orderBy('order.deliveryTime')
      .orderBy('customer.name');
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching daily orders:', error);
    res.status(500).json({ error: 'Günlük siparişler getirilirken hata oluştu' });
  }
});

// Tek sipariş getir
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await db('order')
      .select(
        'order.*',
        'customer.name as customerName',
        'customer.phone as customerPhone',
        'customer.address as customerAddress',
        'customer.location as customerLocation'
      )
      .join('customer', 'order.customerId', 'customer.id')
      .where('order.id', id)
      .first();
    
    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Sipariş getirilirken hata oluştu' });
  }
});

// Yeni sipariş ekle
router.post('/', async (req, res) => {
  try {
    const validatedData = orderSchema.parse(req.body);
    
    // Müşterinin var olup olmadığını kontrol et
    const customer = await db('customer').where('id', validatedData.customerId).first();
    if (!customer) {
      return res.status(400).json({ error: 'Geçersiz müşteri ID\'si' });
    }
    
    const [newOrder] = await db('order')
      .insert(validatedData)
      .returning('*');
    
    // Müşteri bilgileriyle birlikte döndür
    const orderWithCustomer = await db('order')
      .select(
        'order.*',
        'customer.name as customerName',
        'customer.phone as customerPhone',
        'customer.address as customerAddress',
        'customer.location as customerLocation'
      )
      .join('customer', 'order.customerId', 'customer.id')
      .where('order.id', newOrder.id)
      .first();
    
    res.status(201).json(orderWithCustomer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Sipariş oluşturulurken hata oluştu' });
  }
});

// Sipariş güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = orderUpdateSchema.parse(req.body);
    
    // Siparişin var olup olmadığını kontrol et
    const existingOrder = await db('order').where('id', id).first();
    if (!existingOrder) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }
    
    // Müşteri ID değişiyorsa geçerliliğini kontrol et
    if (validatedData.customerId) {
      const customer = await db('customer').where('id', validatedData.customerId).first();
      if (!customer) {
        return res.status(400).json({ error: 'Geçersiz müşteri ID\'si' });
      }
    }
    
    const [updatedOrder] = await db('order')
      .where('id', id)
      .update(validatedData)
      .returning('*');
    
    // Müşteri bilgileriyle birlikte döndür
    const orderWithCustomer = await db('order')
      .select(
        'order.*',
        'customer.name as customerName',
        'customer.phone as customerPhone',
        'customer.address as customerAddress',
        'customer.location as customerLocation'
      )
      .join('customer', 'order.customerId', 'customer.id')
      .where('order.id', updatedOrder.id)
      .first();
    
    res.json(orderWithCustomer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Sipariş güncellenirken hata oluştu' });
  }
});

// Sipariş sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Siparişin var olup olmadığını kontrol et
    const existingOrder = await db('order').where('id', id).first();
    if (!existingOrder) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }
    
    await db('order').where('id', id).del();
    
    res.json({ message: 'Sipariş başarıyla silindi' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Sipariş silinirken hata oluştu' });
  }
});

export { router as orderRoutes };