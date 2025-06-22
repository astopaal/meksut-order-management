import express from 'express';
import cors from 'cors';
import { customerRoutes } from './routes/customers';
import { orderRoutes } from './routes/orders';
import { reportRoutes } from './routes/reports';
import { databaseBackup } from './backup';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Backup endpoints
app.post('/api/backup/manual', async (req, res) => {
  try {
    await databaseBackup.createManualBackup();
    res.json({ message: 'Manuel yedekleme başarıyla tamamlandı' });
  } catch (error) {
    console.error('Manuel yedekleme hatası:', error);
    res.status(500).json({ error: 'Yedekleme sırasında hata oluştu' });
  }
});

app.get('/api/backup/info', (req, res) => {
  try {
    const backupInfo = databaseBackup.getBackupInfo();
    res.json(backupInfo);
  } catch (error) {
    console.error('Yedek bilgisi alma hatası:', error);
    res.status(500).json({ error: 'Yedek bilgisi alınamadı' });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  
  // Otomatik yedekleme sistemini başlat
  databaseBackup.startScheduledBackup();
}); 