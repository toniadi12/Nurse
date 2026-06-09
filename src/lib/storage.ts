// Wrapper tipis di atas AsyncStorage.
//
// KENAPA di-wrap?
//   1. Tipe generic <T> — jadi caller dapat typed value, tidak perlu cast manual.
//   2. JSON serialization otomatis — caller pass object langsung, bukan string.
//   3. Satu titik untuk error handling — kalau gagal read/write,
//      log warn lalu return null. App jangan crash gara-gara storage error.
//   4. Satu titik kalau nanti migrasi ke MMKV — tinggal ganti implementasi di sini,
//      semua call-site tetap jalan tanpa diubah.
//
// Aturan key naming: pakai format `jaga:<domain>:<version>`, mis. `jaga:profile:v1`.
// Versioning di akhir memudahkan migrasi schema nanti tanpa hapus data lama.
//
// V2 multi-user: saat sync dengan server backend, key bisa di-namespace dengan
// user id, mis. `jaga:profile:v2:<userId>`. Wrapper ini tidak perlu diubah —
// caller cukup format key dengan id. Pertimbangkan juga migrasi ke MMKV
// (sync API + faster) lewat Expo Dev Client kalau payload makin besar.

import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      // Bisa kena kalau JSON corrupt — perlakukan sebagai "tidak ada data".
      console.warn(`storage.get("${key}") gagal:`, err);
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      // Kalau gagal nulis, biarkan dulu — UX lebih baik daripada crash.
      // Nanti bisa retry atau tampilkan toast warning.
      console.warn(`storage.set("${key}") gagal:`, err);
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (err) {
      console.warn(`storage.remove("${key}") gagal:`, err);
    }
  },

  // HATI-HATI — clear() menghapus SEMUA data, termasuk dari library lain
  // yang pakai AsyncStorage. Hanya pakai untuk "reset semua data" di settings.
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (err) {
      console.warn('storage.clear() gagal:', err);
    }
  },
};
