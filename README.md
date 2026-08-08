# Children's Clothing Inventory & Social-Commerce System

A production-ready inventory management and mobile-first storefront built specifically for children's clothing social-commerce businesses selling through **Instagram, TikTok, WhatsApp**, and direct sales.

> **IMPORTANT BUSINESS RULE**: This system contains **ZERO online payment processing integration** (No Stripe, No M-Pesa API, No PayPal). Payments happen externally (Cash/M-Pesa Direct) and sales are recorded manually by the business owner.

---

## Key Features

### 1. Public Storefront (Mobile-First)
* **Mobile-Optimized Catalogue**: High-density product display for customers visiting from social media links.
* **Matrix Variant Selection**: Allows customers to view available stock per size (`2-3`, `4-5`, `6-7`, `8-10`, `11-12`) and colour (`Black`, `Pink`, `Navy Blue`, `Grey`, `Red`, `Yellow`).
* **Live Stock Indicators**: Real-time availability badges (`Available`, `Low Stock`, `Sold Out`).
* **"Order via WhatsApp" Integration**: 1-click button generating pre-populated WhatsApp messages with item details and selected variant.

### 2. Admin Dashboard & Inventory System
* **Variant-Level Inventory Tracking**: Physical stock tracked at the `Product + Size + Colour` level.
* **Automatic Stock Decrement**: Stock automatically decreases when a sale is recorded or when a reservation is converted to `SOLD`.
* **Reservation System**: Claim stock (`RESERVED` status) while communicating with customers without releasing available units. Convert to `SOLD` or `CANCEL` in 1-click.
* **Matrix Variant Generator**: Quickly generate stock matrix across sizes and colours when adding new products.
* **Real-time Profit Preview**: Calculates potential revenue, goods cost, and net profit margins automatically.
* **Transaction Audit Trail**: Immutable log of every stock movement (`STOCK_IN`, `SALE`, `RESERVATION_CREATED`, `RESERVATION_CANCELLED`, `RESERVATION_CONVERTED`, `MANUAL_ADJUSTMENT`).
* **Financial Reporting**: Dashboard analytics for daily sales, monthly revenue, net profit, and inventory asset valuation.

---

## Technology Stack

* **Frontend**: React 18, Vite, Tailwind CSS v4, Lucide Icons, React Router DOM, Axios.
* **Backend**: Python 3.11+, Flask REST API, Flask-SQLAlchemy (ORM), Flask-JWT-Extended, Flask-Cors.
* **Database**: PostgreSQL (Production) / SQLite (Local Dev Zero-Setup).
* **Media Handling**: Cloudinary API (Free Tier) / Web-optimized image storage.

---

## Local Development Setup

### 1. Clone & Set Up Backend

```bash
# Navigate to server directory
cd server

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run backend server (Automatically initializes DB and seeds sample data)
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

### 3. Default Admin Credentials

* **URL**: `http://localhost:3000/admin/login`
* **Username**: `admin`
* **Password**: `admin123`

---

## Running Automated Tests

Run backend unit tests verifying authentication, product matrix creation, stock decrements, and reservation conversions:

```bash
PYTHONPATH=server ./server/.venv/bin/pytest server/tests/test_api.py -v
```

---

## Zero-Cost Hosting Deployment Guide

This system is designed to be hosted with **$0 monthly infrastructure cost**:

| Component | Free Provider | Setup Instructions |
| :--- | :--- | :--- |
| **Frontend** | **Vercel** or **Netlify** | Connect GitHub repo, set root to `client`, build command: `npm run build`, output directory: `dist`. |
| **Backend API** | **Render** or **Koyeb** | Connect GitHub repo, environment: `Python 3`, build command: `pip install -r requirements.txt`, start command: `gunicorn run:app`. Set env vars (`DATABASE_URL`, `SECRET_KEY`, `JWT_SECRET_KEY`). |
| **Database** | **Neon.tech** or **Supabase** | Create free PostgreSQL database instance. Copy connection string to `DATABASE_URL` env var. |
| **Image Storage** | **Cloudinary** | Free tier offers 25,000 monthly transformations and storage. Add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` to server `.env`. |

---

## Repository

* **GitHub Repository**: [https://github.com/AlvinMutie/Inventory_syst.git](https://github.com/AlvinMutie/Inventory_syst.git)
