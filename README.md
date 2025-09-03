# MOLANT ICT Business System

A comprehensive, automated business management system for ICT companies selling items and services, with complete workflow automation, document management, and business intelligence.

## 🚀 Features

### Core Business Management
- **Client Management**: Credit limits, payment terms, order history
- **Vendor Management**: Item and service suppliers with performance tracking
- **Inventory Management**: Stock tracking, automatic updates, low-stock alerts
- **Service Management**: Technician assignment, job cards, service tracking
- **Order Processing**: Complete workflow from proforma to completion

### Automated Workflow
- **Document Generation**: Proforma → Delivery Note → Payment Statement → Receipt
- **Service Flow**: Diagnosis → Proforma → Job Card → Service Completion → Payment
- **Stock Management**: Automatic stock updates on delivery confirmation
- **Payment Processing**: Automatic receipt generation and balance tracking
- **Credit Control**: Automatic credit limit checking and approval workflows

### Business Intelligence
- **Real-time Dashboards**: Client performance, vendor metrics, inventory status
- **Financial Reports**: Revenue tracking, outstanding balances, payment history
- **Performance Analytics**: Vendor scorecards, technician productivity
- **Automated Alerts**: Low stock, overdue payments, warranty expirations

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Database**: PostgreSQL with advanced triggers and functions
- **Deployment**: Vercel (Frontend) + Supabase (Backend)
- **State Management**: React Hooks + Supabase real-time subscriptions

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd molant-ict-system
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create `.env.local` file:

```bash
cp env.example .env.local
```

4. Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set Up Database

1. Install Supabase CLI:

```bash
npm install -g supabase
```

2. Initialize Supabase:

```bash
supabase init
```

3. Start local development:

```bash
supabase start
```

4. Apply database schema:

```bash
supabase db push
```

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Schema

### Core Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `clients` | Client information and credit terms | Credit limits, payment terms |
| `vendors` | Supplier management | Item/service providers, performance tracking |
| `items` | Product inventory | Stock levels, pricing, warranty |
| `services` | Service catalog | Service costs, vendor assignment |
| `orders` | Order management | Status tracking, total calculation |
| `order_details` | Order line items | Quantity, pricing, subtotals |
| `documents` | Document workflow | Auto-generation, status tracking |
| `payments` | Payment tracking | Balance calculation, receipt generation |
| `technicians` | Service personnel | Skill mapping, availability tracking |

### Views for Business Intelligence

- `client_summary`: Client performance and financial overview
- `vendor_performance`: Supplier metrics and revenue analysis
- `inventory_status`: Stock levels and profit margin analysis

### Automated Triggers

- **Document Flow**: Auto-generates next document in workflow
- **Stock Updates**: Automatically updates inventory on delivery
- **Credit Control**: Prevents orders exceeding credit limits
- **Payment Processing**: Generates receipts and updates order status
- **Technician Assignment**: Auto-assigns available technicians

## 🔄 Workflow Automation

### Items Flow
```
Proforma → Delivery Note → Stock Update → Payment Statement → Payment → Receipt → Complete
```

### Services Flow
```
Diagnosis → Proforma → Job Card → Service → Delivery Note → Payment Statement → Payment → Receipt → Complete
```

## 📱 Application Structure

```
app/
├── layout.tsx          # Root layout with navigation
├── page.tsx            # Dashboard with overview and stats
├── globals.css         # Global styles and Tailwind config
├── clients/            # Client management pages
├── vendors/            # Vendor management pages
├── items/              # Inventory management pages
├── services/           # Service catalog pages
├── orders/             # Order processing pages
├── documents/          # Document workflow pages
└── payments/           # Payment tracking pages

components/              # Reusable UI components
lib/                    # Utility functions and configurations
types/                  # TypeScript type definitions
supabase/               # Database migrations and config
```

## 🚀 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Supabase Production

1. Create production project in Supabase
2. Update environment variables
3. Run production migrations:

```bash
supabase db push --db-url $PRODUCTION_DATABASE_URL
```

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Database
npm run db:generate     # Generate TypeScript types
npm run db:push         # Push schema changes
npm run db:reset        # Reset local database
```

## 📊 Business Intelligence Features

### Dashboard Metrics
- Total clients, items, services, and orders
- Revenue tracking and outstanding balances
- Recent order activity and status overview
- System health and automation status

### Reporting Capabilities
- Client credit analysis and payment history
- Vendor performance and revenue contribution
- Inventory status and profit margin analysis
- Technician productivity and service metrics

## 🔐 Security Features

- Row Level Security (RLS) policies
- User authentication and authorization
- API key management
- Secure file storage and access control

## 📈 Scalability

- Serverless architecture with Vercel
- PostgreSQL with connection pooling
- Real-time subscriptions for live updates
- Optimized database queries and indexing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation and FAQ

## 🔮 Roadmap

- [ ] Mobile app for technicians
- [ ] Advanced reporting and analytics
- [ ] Integration with payment gateways
- [ ] Multi-language support
- [ ] Advanced notification system
- [ ] API for third-party integrations

---

**Built with ❤️ for MOLANT ICT Business Operations** 