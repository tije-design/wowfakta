# Setup Factboard

## 1. Buat Supabase Project

1. Buka [supabase.com](https://supabase.com) → **New Project**
2. Isi nama project (misal: `factboard`), pilih region terdekat
3. Tunggu project selesai dibuat (~1 menit)

## 2. Setup Database

1. Di Supabase dashboard → **SQL Editor**
2. Copy-paste isi file `supabase/schema.sql`
3. Klik **Run**

## 3. Ambil Credentials

Di Supabase dashboard → **Project Settings → API**:
- `Project URL` → untuk `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → untuk `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 4. Update .env.local

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

## 5. Jalankan Lokal

```bash
npm run dev
```

Buka http://localhost:3000

---

## Deploy ke Vercel

1. Push project ke GitHub
2. Buka [vercel.com](https://vercel.com) → **New Project** → import repo
3. Di bagian **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

Selesai! Share URL Vercel ke tim.

---

## Realtime (opsional tapi recommended)

Supaya halaman auto-update tanpa refresh:
1. Supabase dashboard → **Database → Replication**
2. Pastikan `supabase_realtime` publication include tabel `sessions`, `facts`, `votes`
3. Kalau belum, jalankan ini di SQL Editor:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE facts;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
```
