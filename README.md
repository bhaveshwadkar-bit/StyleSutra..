# Style Sutra — Full E-commerce Website

A complete online store built with Next.js, Supabase (database) and Cloudinary (photo/video storage).
Works on any phone, tablet, or computer — iPhone, iPad, MacBook, Android, Windows — through one link.

## What's included
- Storefront: sections (Chains, Rings, Charms, Full Chains — add more anytime), product pages with
  photo/video galleries, cart (supports 60+ items), checkout, coupon codes, customer reviews with photos.
- Admin panel (password-protected) to manage everything: products, photos/videos, sections, coupons,
  orders, support contact info, Instagram/WhatsApp, UPI ID, QR code, and the payment message — all editable
  anytime, unlimited times.
- UPI/QR payment flow with a 10-minute countdown (editable), after which the QR/UPI ID is hidden.

---

## Step 1 — Create your free accounts (10 minutes)

### A. Supabase (your database)
1. Go to https://supabase.com → Sign up (free) → **New Project**.
2. Choose a name, a database password (save it somewhere safe), and a region close to India.
3. Once created, go to **Project Settings → API**. Copy:
   - **Project URL**
   - **anon public** key
   - **service_role** key (keep this secret — never share it publicly)
4. Go to **SQL Editor → New Query**, paste the entire contents of `supabase/schema.sql` (in this
   project), and click **Run**. This creates all your tables.

### B. Cloudinary (photo & video storage)
1. Go to https://cloudinary.com → Sign up (free).
2. On your Dashboard, copy your **Cloud name**.
3. Go to **Settings (gear icon) → Upload → Upload presets → Add upload preset**.
   - Set **Signing Mode** to **Unsigned**.
   - Name it exactly: `stylesutra_unsigned`
   - Save.

### C. Vercel (free hosting + your free link)
1. Go to https://vercel.com → Sign up (free, you can use GitHub).
2. Keep this tab open — you'll import the project in Step 3.

---

## Step 2 — Add your keys

Open `.env.local.example` in this project, fill in your real values, and save it as `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=          (from Supabase Project Settings → API)
NEXT_PUBLIC_SUPABASE_ANON_KEY=     (from Supabase Project Settings → API)
SUPABASE_SERVICE_ROLE_KEY=         (from Supabase Project Settings → API — keep secret)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME= (from Cloudinary Dashboard)
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=stylesutra_unsigned
ADMIN_PASSWORD=StyleSutra@156890
ADMIN_SESSION_SECRET=              (make up any long random string, e.g. 40 random characters)
```

## Step 3 — Deploy for free (get your link)

**Easiest path — no coding tools needed:**
1. Upload this whole project folder to a new GitHub repository (github.com → New repository → upload files).
2. In Vercel: **Add New → Project → Import** your GitHub repo.
3. Before deploying, open **Environment Variables** and paste in every value from your `.env.local`
   (same names, same values).
4. Click **Deploy**. In about a minute you'll get a free link like `stylesutra.vercel.app`.
5. Anyone with that link can open the site on any phone or computer — no app install needed.

Later, if you buy a real domain (e.g. stylesutra.com) you can attach it for free in
Vercel → Project → Settings → Domains. A fully free custom domain name isn't available anywhere
(domains cost money to register), but a free `.vercel.app` link works exactly the same for customers.

## Step 4 — Log into your Admin Panel
Go to `https://your-link.vercel.app/admin/login` and enter your password:
```
StyleSutra@156890
```
From there you can add products, sections, coupons, edit support/payment info — everything.

---

## How the payment flow works
1. Customer checks out and lands on a payment page showing your QR code + UPI ID, with a countdown
   (default 10 minutes, editable in Admin → Settings).
2. Below it, your message is shown asking them to send a payment screenshot to your WhatsApp/Instagram.
3. If they tap "I've completed the payment," the order is marked **Payment Claimed** in your Admin →
   Orders page — check your bank/UPI app, then change the status to **Confirmed**.
4. If the timer runs out with no payment, the QR/UPI is automatically hidden and the order shows as
   **Expired**.

This app can't auto-verify UPI payments (that requires a paid payment gateway like Razorpay), so a manual
check-and-confirm step is the safest free option — matching how you described wanting it to work.

## Limits already built in
- Photos: max 5 per product, 10MB each
- Videos: max 2 per product, 50MB each, 20 seconds max
- Reviews: max 5 photos each
- Coupon codes: set any max-use count (2, 4, unlimited, etc.) per code

## If something looks broken after deploying
Copy the exact error message from Vercel's deployment log (or your browser console) and send it to me —
since I can't run a live server from this chat, testing happens on your deployment, and I'll fix any
issues you hit.
