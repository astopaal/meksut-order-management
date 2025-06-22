import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { db } from './db/db';

class DatabaseBackup {
  private backupDir: string;
  private maxBackups: number = 30; // Son 30 günü tut

  constructor() {
    this.backupDir = path.join(process.cwd(), 'backups');
    this.ensureBackupDirectory();
  }

  private ensureBackupDirectory(): void {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  private async createBackup(): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `database-backup-${timestamp}.db`;
      const backupPath = path.join(this.backupDir, backupFileName);

      // SQLite veritabanını kopyala
      const sourcePath = path.join(process.cwd(), 'database.db');
      
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, backupPath);
        console.log(`✅ Veritabanı yedeği oluşturuldu: ${backupFileName}`);
        
        // Eski yedekleri temizle
        this.cleanOldBackups();
      } else {
        console.error('❌ Veritabanı dosyası bulunamadı');
      }
    } catch (error) {
      console.error('❌ Yedekleme hatası:', error);
    }
  }

  private cleanOldBackups(): void {
    try {
      const files = fs.readdirSync(this.backupDir);
      const backupFiles = files
        .filter(file => file.startsWith('database-backup-') && file.endsWith('.db'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          stats: fs.statSync(path.join(this.backupDir, file))
        }))
        .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

      // Son 30 dosyayı tut, gerisini sil
      if (backupFiles.length > this.maxBackups) {
        const filesToDelete = backupFiles.slice(this.maxBackups);
        
        filesToDelete.forEach(file => {
          try {
            fs.unlinkSync(file.path);
            console.log(`🗑️ Eski yedek silindi: ${file.name}`);
          } catch (error) {
            console.error(`❌ Yedek silme hatası (${file.name}):`, error);
          }
        });
        
        console.log(`🧹 ${filesToDelete.length} eski yedek temizlendi`);
      }
    } catch (error) {
      console.error('❌ Eski yedekleri temizleme hatası:', error);
    }
  }

  public startScheduledBackup(): void {
    // Her gün akşam 20:00'de yedek al
    cron.schedule('0 20 * * *', () => {
      console.log('🕐 Zamanlanmış yedekleme başlatılıyor...');
      this.createBackup();
    }, {
      timezone: "Europe/Istanbul"
    });

    console.log('📅 Otomatik yedekleme sistemi başlatıldı (Her gün 20:00)');
  }

  public async createManualBackup(): Promise<void> {
    console.log('🔧 Manuel yedekleme başlatılıyor...');
    await this.createBackup();
  }

  public getBackupInfo(): { totalBackups: number; oldestBackup?: string; newestBackup?: string } {
    try {
      const files = fs.readdirSync(this.backupDir);
      const backupFiles = files
        .filter(file => file.startsWith('database-backup-') && file.endsWith('.db'))
        .map(file => ({
          name: file,
          stats: fs.statSync(path.join(this.backupDir, file))
        }))
        .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

      return {
        totalBackups: backupFiles.length,
        newestBackup: backupFiles[0]?.name,
        oldestBackup: backupFiles[backupFiles.length - 1]?.name
      };
    } catch (error) {
      console.error('❌ Yedek bilgisi alma hatası:', error);
      return { totalBackups: 0 };
    }
  }
}

export const databaseBackup = new DatabaseBackup(); 