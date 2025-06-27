// Konum servisi
export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export class LocationService {
  // Konum izni iste ve koordinatları al
  static async getCurrentLocation(): Promise<LocationCoords> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation bu tarayıcıda desteklenmiyor'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error('Konum izni reddedildi'));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error('Konum bilgisi mevcut değil'));
              break;
            case error.TIMEOUT:
              reject(new Error('Konum alma zaman aşımına uğradı'));
              break;
            default:
              reject(new Error('Bilinmeyen konum hatası'));
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  // Koordinatları string formatına çevir
  static formatLocation(latitude: number, longitude: number): string {
    return `${latitude},${longitude}`;
  }

  // String formatındaki konumu koordinatlara çevir
  static parseLocation(locationString: string): LocationCoords | null {
    try {
      const [lat, lon] = locationString.split(',').map(Number);
      if (isNaN(lat) || isNaN(lon)) {
        return null;
      }
      return { latitude: lat, longitude: lon };
    } catch {
      return null;
    }
  }

  // Apple Maps URL'i oluştur
  static getAppleMapsUrl(latitude: number, longitude: number): string {
    return `https://maps.apple.com/?q=${latitude},${longitude}`;
  }

  // Harita URL'i döndür (her zaman Apple Maps)
  static getMapsUrl(latitude: number, longitude: number): string {
    return this.getAppleMapsUrl(latitude, longitude);
  }
} 