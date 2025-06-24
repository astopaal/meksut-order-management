import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/db';

const router = Router();

// Zod şemaları
const customerSchema = z.object({
  name: z.string().min(1, 'İsim zorunludur'),
  phone: z.string().min(10, 'Geçerli bir telefon numarası giriniz'),
  address: z.string().optional(),
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
    
    // Müşterinin var olup olmadığını kontrol et
    const existingCustomer = await db('customers').where('id', id).first();
    if (!existingCustomer) {
      return res.status(404).json({ error: 'Müşteri bulunamadı' });
    }
    
    // Telefon numarası değişiyorsa benzersizlik kontrolü yap
    if (validatedData.phone && validatedData.phone !== existingCustomer.phone) {
      const phoneExists = await db('customers')
        .where('phone', validatedData.phone)
        .whereNot('id', id)
        .first();
      
      if (phoneExists) {
        return res.status(400).json({ error: 'Bu telefon numarası zaten kayıtlı' });
      }
    }
    
    const [updatedCustomer] = await db('customers')
      .where('id', id)
      .update(validatedData)
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

export { router as customerRoutes };