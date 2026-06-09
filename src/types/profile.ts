// Data model profil perawat. Dipersist di AsyncStorage.
//
// Catatan deviasi dari TECH-STACK section 9: field `darkMode` di-pindah
// ke ThemeContext (state UI murni, bukan profil user). Profil cuma simpan
// data nurse-specific.

export type NotificationOffset = 30 | 60 | 120;

export interface UserProfile {
  nurseName: string;
  defaultWard?: string;
  notificationOffset: NotificationOffset;
  // Unix timestamp file Excel terakhir di-import. Pakai untuk tampilkan
  // "Diimport 2 jam lalu" di Settings.
  excelLastImported?: number;
}
