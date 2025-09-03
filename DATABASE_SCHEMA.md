# 🗄️ MOLANT ICT System - Database Schema Overview

## 🎯 **Complete Database Architecture**

Your MOLANT ICT System will have **9 core tables** with **automated workflows** and **business intelligence views**.

## 📊 **Core Tables**

### **1. Clients Table**
```sql
clients (
  id: UUID (Primary Key)
  name: VARCHAR(255)
  contact: VARCHAR(255)
  address: TEXT
  credit_limit: DECIMAL(15,2)
  credit_days: INTEGER
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
)
```
**Purpose**: Store client information and credit terms

### **2. Vendors Table**
```sql
vendors (
  id: UUID (Primary Key)
  name: VARCHAR(255)
  contact: VARCHAR(255)
  type: ENUM('item', 'service', 'both')
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
)
```
**Purpose**: Manage suppliers of items and services

### **3. Items Table**
```sql
items (
  id: UUID (Primary Key)
  name: VARCHAR(255)
  vendor_id: UUID (Foreign Key)
  buy_price: DECIMAL(15,2)
  sell_price: DECIMAL(15,2)
  stock_qty: INTEGER
  warranty: VARCHAR(255)
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
)
```
**Purpose**: Track inventory with automatic stock updates

### **4. Services Table**
```sql
services (
  id: UUID (Primary Key)
  name: VARCHAR(255)
  vendor_id: UUID (Foreign Key)
  cost: DECIMAL(15,2)
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
)
```
**Purpose**: Manage service catalog and pricing

### **5. Orders Table**
```sql
orders (
  id: UUID (Primary Key)
  client_id: UUID (Foreign Key)
  type: ENUM('item', 'service')
  total_amount: DECIMAL(15,2)
  status: ENUM('pending', 'approved', 'delivered', 'completed')
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
)
```
**Purpose**: Central order management with status tracking

### **6. Order Details Table**
```sql
order_details (
  id: UUID (Primary Key)
  order_id: UUID (Foreign Key)
  item_id: UUID (Nullable)
  service_id: UUID (Nullable)
  quantity: INTEGER
  unit_price: DECIMAL(15,2)
  subtotal: DECIMAL(15,2) [Generated]
  created_at: TIMESTAMP
)
```
**Purpose**: Line items for orders with automatic calculations

### **7. Documents Table**
```sql
documents (
  id: UUID (Primary Key)
  order_id: UUID (Foreign Key)
  client_id: UUID (Foreign Key)
  vendor_id: UUID (Nullable)
  type: ENUM('proforma', 'delivery_note', 'payment_statement', 'receipt', 'job_card', 'diagnosis')
  status: ENUM('pending', 'approved', 'delivered', 'paid')
  due_date: DATE
  file_path: TEXT
  document_number: VARCHAR(50) [Auto-generated]
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
)
```
**Purpose**: Automated document workflow management

### **8. Payments Table**
```sql
payments (
  id: UUID (Primary Key)
  client_id: UUID (Foreign Key)
  order_id: UUID (Foreign Key)
  amount_paid: DECIMAL(15,2)
  balance: DECIMAL(15,2) [Generated]
  payment_date: TIMESTAMP
  created_at: TIMESTAMP
)
```
**Purpose**: Track payments with automatic balance calculation

### **9. Technicians Table**
```sql
technicians (
  id: UUID (Primary Key)
  name: VARCHAR(255)
  contact: VARCHAR(255)
  service_ids: JSONB
  is_available: BOOLEAN
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
)
```
**Purpose**: Manage service personnel and assignments

## 🔄 **Automated Workflows**

### **Document Flow Automation**
- **Proforma Approved** → Auto-generate Delivery Note/Job Card
- **Delivery Note Confirmed** → Auto-update stock quantities
- **Payment Recorded** → Auto-generate receipt and update order status

### **Business Logic Triggers**
- **Credit Limit Checking**: Prevents orders exceeding client credit
- **Stock Management**: Automatic inventory updates
- **Order Totals**: Real-time calculation of order amounts
- **Document Numbering**: Auto-generated sequential numbers

## 📊 **Business Intelligence Views**

### **1. Client Summary View**
```sql
client_summary (
  total_orders, outstanding_balance, total_revenue, last_order_date
)
```

### **2. Vendor Performance View**
```sql
vendor_performance (
  total_orders, total_revenue, avg_order_value, total_items, total_services
)
```

### **3. Inventory Status View**
```sql
inventory_status (
  stock_qty, profit_margin, stock_status (Out of Stock/Low Stock/In Stock)
)
```

## 🔐 **Security Features**

- **Row Level Security (RLS)**: Database-level access control
- **Authentication**: Supabase Auth integration ready
- **API Security**: Secure API endpoints with key management
- **Data Validation**: Input validation and constraints

## 📈 **Performance Features**

- **Indexes**: Optimized for fast queries
- **Real-time**: Live updates via Supabase subscriptions
- **Caching**: Built-in caching for better performance
- **Scalability**: Handles growth from startup to enterprise

## 🎯 **What This Enables**

✅ **Complete Business Management**: End-to-end workflow automation  
✅ **Real-time Operations**: Live updates and notifications  
✅ **Business Intelligence**: Comprehensive reporting and analytics  
✅ **Scalable Architecture**: Grows with your business  
✅ **Professional System**: Enterprise-grade features  

---

## 🚀 **Ready to Set Up?**

Follow the **setup-supabase.md** guide to:
1. Create your Supabase project
2. Apply this database schema
3. Connect your MOLANT ICT System
4. Start using automated workflows

**Your complete ICT business management system is just a few steps away!** 