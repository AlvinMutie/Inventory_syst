# Children's Clothing Inventory & Social-Commerce System

A production-ready physical inventory management system and mobile-first online catalog designed specifically for small children's clothing businesses selling through **Instagram, TikTok, WhatsApp**, and direct in-person customers.

---

## Importance of the System

Small independent clothing businesses—especially those selling children's fleece hoodies, sweatpants, and joggers—face significant operational friction when trying to expand online:

1. **Transaction Fees & Gateway Friction**: Standard e-commerce platforms force online payment gateway integrations (M-Pesa API fees, card processing, merchant registrations) that small sellers do not need. In regions like Kenya, most social-commerce customers prefer to confirm stock first and pay via direct M-Pesa or cash upon delivery/pickup.
2. **Catalog Visibility**: Social media feeds (Instagram posts, TikTok videos) move fast, making it difficult for customers to see what physical pieces are currently available in specific sizes and colours.
3. **Inventory Management Overhead**: Managing physical stock across multiple social channels leads to double-selling, manual customer message back-and-forth, and lost sales.

This system bridges physical stock management with an online showcase catalog, allowing business owners to run a digital shop with **zero online payment gateway requirements**.

---

## Problem Solved

* **Eliminates Overselling & Inventory Chaos**: Tracks single-piece physical stock units per size (`2-3`, `4-5`, `6-7`, `8-10`, `11-12`) and colour. Stock automatically decreases when items are sold or reserved.
* **Removes Checkout Friction**: Replaces complex shopping carts and payment gateways with a **1-click WhatsApp order link** that pre-fills the exact product title, size, colour, price in KSh, and item SKU.
* **Empowers Non-Technical Store Owners**: Provides a clean admin panel for uploading photos from smartphones, auto-filling smart item descriptions, moving items between categories in 1 click, and tracking financial stock valuation.
* **Protects Admin Access**: Hides admin login links from public customer view and enables secret keyboard shortcut access (`Ctrl + Shift + M`).

---

## Key Features

### 1. Public Customer Storefront (Mobile-First)
* **Responsive Layout**: Features a left side navigation panel on desktop and a mobile drawer menu on smartphones.
* **Core Clothing Categories**: Organized into **Hoodies** and **Sweatpants & Joggers**.
* **Visual Colour Swatches**: Interactive colour selection buttons displaying exact visual swatch dots (`Black`, `Grey`, `Navy Blue`, `Pink`, `Red`, `Beige`, `Yellow`, `Sky Blue`).
* **Kids Size & Age Guide Popup**: Interactive modal providing age and height recommendations per size label (`2-3 yrs` -> 92-98cm, `4-5 yrs` -> 104-110cm, etc.).
* **1-Click WhatsApp Order Link Generator**: Pre-populates clean WhatsApp messages with item details and item SKU for instant delivery confirmation.
* **Progressive Web App (PWA) Manifest**: Mobile web manifest (`manifest.json`) and native lazy loading (`loading="lazy"`) for fast loading on mobile networks.

### 2. Admin Management Portal
* **Secret Access Shortcut (`Ctrl + Shift + M`)**: Hides visible admin links from customers while allowing store owners to press `Ctrl + Shift + M` (or `Cmd + Shift + M` on Mac) anywhere on the site to access the portal.
* **Full Product CRUD & Photo Upload**: Upload clothing photos directly from smartphones or laptops, create items, update details, or delete listings.
* **1-Click Category Mover**: Select box in the admin product table allowing owners to re-assign clothes to categories instantly.
* **Smart Auto-Descriptions**: Auto-generates category-specific descriptions (e.g. cozy fleece hoodie features) with options for custom editing.
* **1-Click Copy Link for Social Media**: Generate direct shareable URLs for individual items to paste into Instagram Stories, Instagram Bio, or TikTok.
* **Dynamic Website Name & Store Settings**: Edit business name, WhatsApp phone number, and currency symbol on the fly.
* **Financial Asset Valuation**: Real-time asset reporting calculating physical inventory cost value, potential retail revenue, and realized profit margins.
* **Reservation & Sales Workflow**: Reserve items during customer negotiations (`RESERVED`) and convert them to confirmed sales (`SOLD`) with automatic stock adjustment.

---

## Technology Stack

* **Frontend**: React 18, Vite, Tailwind CSS v4, Lucide Icons, React Router DOM, Axios.
* **Backend**: Python 3.11+, Flask REST API, Flask-SQLAlchemy (ORM), Flask-JWT-Extended, Flask-Cors.
* **Database**: PostgreSQL (Production) / SQLite (Local Dev Zero-Setup).
* **Media Handling**: Local static upload server / Pillow image optimization.

---

## Local Development Setup

### 1. Set Up Backend

```bash
# Navigate to server directory
cd server

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run backend server (Initializes DB and seeds 58 physical clothing pieces)
python run.py
```

The REST API will run on `http://127.0.0.1:5000`.

### 2. Set Up Frontend

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

The web application will open on `http://localhost:3000`.

### 3. Admin Access

* **Secret Shortcut**: Press `Ctrl + Shift + M` (or `Cmd + Shift + M` on Mac) anywhere on the site.
* **Direct URL**: `http://localhost:3000/admin/login`
* **Default Username**: `admin`
* **Default Password**: `admin123`

---

## Running Automated Tests

Run backend unit tests verifying authentication, product matrix creation, stock decrements, and reservation conversions:

```bash
PYTHONPATH=server ./server/.venv/bin/pytest server/tests/test_api.py -v
```

---

## Zero-Cost Deployment Architecture

This system is designed to run with zero monthly infrastructure cost:

| Component | Free Provider | Setup Instructions |
| :--- | :--- | :--- |
| **Frontend** | **Vercel** or **Netlify** | Set root to `client`, build command: `npm run build`, output directory: `dist`. |
| **Backend API** | **Render** or **Koyeb** | Build command: `pip install -r requirements.txt`, start command: `gunicorn run:app`. Set env vars (`SECRET_KEY`, `JWT_SECRET_KEY`). |
| **Database** | **Neon.tech** or **Supabase** | Free PostgreSQL database instance. Set `DATABASE_URL`. |
