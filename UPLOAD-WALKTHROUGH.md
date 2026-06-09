# Upload Walkthrough — Jaga to GitHub

Step-by-step rekap untuk push project ke GitHub. Simpan dokumen ini agar kalau nanti ada project lain, alur sama bisa di-replicate.

---

## 1. Sebelum push — checklist wajib

Jangan pernah push tanpa lewat 4 cek ini dulu.

### a. Health: TypeScript + Tests

```bash
npx tsc --noEmit       # harus tidak ada output (clean)
npm test               # semua suite harus PASS
```

Kalau ada error, **stop**. Push code rusak ke main branch = malu di GitHub + susah di-debug nanti.

### b. Cek `.gitignore` lengkap

Yang **wajib** masuk `.gitignore`:

```
node_modules/          # paket dependency — jumlahnya ribuan, jangan commit
.expo/                 # cache Expo
dist/                  # build output
.env, .env*.local      # rahasia (API keys, dst)
*.key, *.p12, *.jks    # iOS / Android signing keys
.DS_Store, Thumbs.db   # cruft OS
.claude/               # config Claude Code (per-developer, bukan app code)
.idea/, .vscode/       # IDE settings (opsional, beda per developer)
*.bak, *.tmp           # backup file
```

### c. Scan secrets manual

```bash
# Cari pola umum API key / token / password
grep -rEi "(api[_-]?key|secret|password|token|bearer)[\s:=]+['\"]\\w" . --exclude-dir=node_modules
```

Kalau ada hit, **stop**. Pindahin ke `.env`, tambah `.env` ke `.gitignore`, baru lanjut.

### d. Cek file yang tidak sengaja ke-track sebelumnya

Kadang file sensitive sudah ke-track sebelum `.gitignore` di-update. Untrack tanpa hapus:

```bash
git rm --cached <path>
```

Contoh nyata di Jaga: `.claude/settings.json` ter-track dari initial commit walau `.claude/` sudah di-gitignore — perlu `git rm --cached .claude/settings.json` supaya bener-bener hilang dari repo.

---

## 2. README.md — yang wajib ada

Professional README **bukan** panjang lebar — yang penting jelas:

1. **Judul + 1 kalimat deskripsi** (apa app-nya, untuk siapa)
2. **Quick start** (3 baris max — `npm install` + `npx expo start`)
3. **Scripts** (table kecil command + tujuannya)
4. **Tech stack** (bullet list — biar reviewer langsung tahu library apa)
5. **Project structure** (folder tree singkat dengan komentar 1 baris per folder)
6. **Status** (MVP / beta / production)
7. **License** (kalau private, tulis "Private / unreleased")

Hindari: emoji berlebihan, badges yang gak berfungsi, screenshot placeholder, "TODO: write docs" — itu kelihatan amatir.

---

## 3. Commit — pesan yang baik

Format: 1 baris singkat (50 char max), kosong, lalu detail kalau perlu.

```
Initial commit: Jaga MVP F1-F10 + UK English UI

- Expo SDK 54, React Native 0.81, TypeScript strict
- Bottom tabs: Home/Schedule/Swap/You
- Excel import (long + wide + real RS format)
- Local notifications + WhatsApp swap flow
- Light/dark theme with auto-switch
```

**Hindari:**
- `"update"`, `"fix"`, `"wip"` — terlalu generik
- Pesan dalam mixed languange (pilih EN atau ID, konsisten)
- Pesan > 72 karakter di baris pertama (di-truncate di GitHub UI)

---

## 4. Push ke GitHub

```bash
# 1. Init kalau belum pernah
git init                          # skip kalau sudah ada .git/

# 2. Add remote
git remote add origin https://github.com/USERNAME/REPO.git

# 3. Stage + commit
git add .
git commit -m "Initial commit"

# 4. Push — pakai -u sekali aja, lalu git push aja seterusnya
git push -u origin main
```

### Authentication

GitHub sudah **tidak menerima password** sejak 2021. Gunakan salah satu:

- **Personal Access Token (PAT)** — paling mudah. Buat di github.com/settings/tokens, pakai sebagai "password" saat git prompt.
- **SSH key** — generate sekali, taruh di github.com/settings/keys. Setelah itu push tanpa prompt.
- **GitHub CLI** (`gh auth login`) — auto-handle credential.

Untuk Windows: simpan credential ke Credential Manager supaya tidak prompt setiap push.

### Kalau push ditolak

```
! [rejected]   main -> main (fetch first)
```

Artinya repo di GitHub sudah ada commits (mungkin auto-generated README dari template). Solusi:

```bash
git pull --rebase origin main      # rebase commits lokal di atas remote
git push origin main
```

**Jangan pakai `--force` kecuali kamu yakin** — bisa overwrite kerja orang lain.

---

## 5. Setelah push — verifikasi

1. Buka URL repo di browser
2. Cek folder `node_modules/` **tidak ada** (kalau ada, .gitignore-mu salah — undo)
3. Cek file `.env` **tidak ada**
4. README tampil di halaman utama
5. Cek "About" section di kanan — kasih deskripsi singkat + topics (mis. `react-native`, `expo`, `healthcare`)

---

## 6. Workflow harian setelah initial push

```bash
# Pagi: tarik perubahan dari teman (kalau ada)
git pull

# Selesai fitur baru
git add .
git commit -m "Add: notification toggle in settings"
git push

# Sebelum push, ulangi checklist section 1!
```

---

## 7. Catatan khusus untuk Jaga

- **Branch utama:** `main` (rename dari `master` kalau perlu — sudah standar industri).
- **Tester** pakai Expo Go (download dari Play Store / App Store), tidak perlu build APK manual.
- **Untuk distribute ke nurse UK:** publish ke EAS (`eas update --branch production`) atau via `eas build` untuk standalone APK. Lihat dokumen Expo deployment terpisah.
- **Jangan push** kalau:
  - Lagi mid-refactor (commits half-done)
  - Test gagal
  - Ada `console.log` debug yang lupa di-hapus
  - File sensitive belum di-strip

---

*Dokumen ini bagian dari workflow Jaga. Update kalau ada proses baru yang dipelajari.*
