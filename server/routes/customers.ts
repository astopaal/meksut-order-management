import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/db';

const router = Router();

// Zod şemaları
const customerSchema = z.object({
  name: z.string().min(1, 'İsim zorunludur'),
  phone: z.string().min(10, 'Geçerli bir telefon numarası giriniz'),
  address: z.string().optional(),
  location: z.string().optional(),
});

const customerUpdateSchema = customerSchema.partial();

// Tüm müşterileri getir
router.get('/', async (req, res) => {
  try {
    const customers = await db('customers').select('*').orderBy('name');
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Müşteriler getirilirken hata oluştu' });
  }
});

// Tek müşteri getir
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await db('customers').where('id', id).first();
    
    if (!customer) {
      return res.status(404).json({ error: 'Müşteri bulunamadı' });
    }
    
    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Müşteri getirilirken hata oluştu' });
  }
});

// Yeni müşteri ekle
router.post('/', async (req, res) => {
  try {
    const validatedData = customerSchema.parse(req.body);
    
    // Telefon numarası benzersizliğini kontrol et
    const existingCustomer = await db('customers')
      .where('phone', validatedData.phone)
      .first();
    
    if (existingCustomer) {
      return res.status(400).json({ error: 'Bu telefon numarası zaten kayıtlı' });
    }
    
    const [newCustomer] = await db('customers')
      .insert(validatedData)
      .returning('*');
    
    res.status(201).json(newCustomer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Müşteri oluşturulurken hata oluştu' });
  }
});

// Müşteri güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = customerUpdateSchema.parse(req.body);
    
    // Boş string'leri filtrele
    const updateData = Object.fromEntries(
      Object.entries(validatedData).filter(([_, value]) => 
        value !== undefined && value !== null && value !== ''
      )
    );
    
    // Eğer güncellenecek veri yoksa hata döndür
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Güncellenecek veri bulunamadı' });
    }
    
    // Müşterinin var olup olmadığını kontrol et
    const existingCustomer = await db('customers').where('id', id).first();
    if (!existingCustomer) {
      return res.status(404).json({ error: 'Müşteri bulunamadı' });
    }
    
    // Telefon numarası değişiyorsa benzersizlik kontrolü yap
    if (updateData.phone && updateData.phone !== existingCustomer.phone) {
      const phoneExists = await db('customers')
        .where('phone', updateData.phone)
        .whereNot('id', id)
        .first();
      
      if (phoneExists) {
        return res.status(400).json({ error: 'Bu telefon numarası zaten kayıtlı' });
      }
    }
    
    const [updatedCustomer] = await db('customers')
      .where('id', id)
      .update(updateData)
      .returning('*');
    
    res.json(updatedCustomer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Müşteri güncellenirken hata oluştu' });
  }
});

// Müşteri sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Müşterinin var olup olmadığını kontrol et
    const existingCustomer = await db('customers').where('id', id).first();
    if (!existingCustomer) {
      return res.status(404).json({ error: 'Müşteri bulunamadı' });
    }
    
    // Müşteri ve ilgili siparişleri sil (CASCADE ile otomatik)
    await db('customers').where('id', id).del();
    
    res.json({ message: 'Müşteri başarıyla silindi' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Müşteri silinirken hata oluştu' });
  }
});

// Müşteri detay analitik getir
router.get('/:id/analytics', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Müşterinin var olup olmadığını kontrol et
    const customer = await db('customers').where('id', id).first();
    if (!customer) {
      return res.status(404).json({ error: 'Müşteri bulunamadı' });
    }
    
    // Müşterinin siparişlerini getir
    const orders = await db('orders')
      .where('customerId', id)
      .orderBy('orderDate', 'desc');
    
    if (orders.length === 0) {
      return res.json({
        customer,
        analytics: {
          totalOrders: 0,
          totalQuantity: 0,
          firstOrderDate: null,
          lastOrderDate: null,
          daysSinceLastOrder: null,
          avgDaysBetweenOrders: null,
          morningOrders: 0,
          eveningOrders: 0,
          deliveredOrders: 0,
          pendingOrders: 0,
          cancelledOrders: 0
        }
      });
    }
    
    // İstatistikleri hesapla
    const totalOrders = orders.length;
    const totalQuantity = orders.reduce((sum, order) => sum + order.quantity, 0);
    const firstOrderDate = orders[orders.length - 1].orderDate;
    const lastOrderDate = orders[0].orderDate;
    
    // Son siparişten beri geçen gün
    const lastOrder = new Date(lastOrderDate);
    const today = new Date();
    
    // Sadece gün farkını hesapla (saat farkını göz ardı et)
    const lastOrderDateOnly = new Date(lastOrder.getFullYear(), lastOrder.getMonth(), lastOrder.getDate());
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const daysSinceLastOrder = Math.floor((todayDateOnly.getTime() - lastOrderDateOnly.getTime()) / (1000 * 60 * 60 * 24));
    
    // Ortalama sipariş aralığı
    let avgDaysBetweenOrders: number | null = null;
    if (orders.length > 1) {
      const firstOrder = new Date(firstOrderDate);
      const totalDays = Math.floor((lastOrder.getTime() - firstOrder.getTime()) / (1000 * 60 * 60 * 24));
      avgDaysBetweenOrders = Math.round(totalDays / (orders.length - 1));
    }
    
    // Teslimat saati analizi
    const morningOrders = orders.filter(order => order.deliveryTime === 'morning').length;
    const eveningOrders = orders.filter(order => order.deliveryTime === 'evening').length;
    
    // Durum analizi
    const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
    
    const analytics = {
      totalOrders,
      totalQuantity,
      firstOrderDate,
      lastOrderDate,
      daysSinceLastOrder,
      avgDaysBetweenOrders,
      morningOrders,
      eveningOrders,
      deliveredOrders,
      pendingOrders,
      cancelledOrders
    };
    
    res.json({ customer, analytics });
  } catch (error) {
    console.error('Error fetching customer analytics:', error);
    res.status(500).json({ error: 'Müşteri analitikleri getirilirken hata oluştu' });
  }
});

export { router as customerRoutes };