# 🗄️ Supabase Setup Guide for MOLANT ICT System

## 🚀 **Step-by-Step Database Setup**

### **Phase 1: Create Supabase Project**

1. **Visit [supabase.com](https://supabase.com)**
2. **Sign in with GitHub**
3. **Click "New Project"**
4. **Fill in project details:**
   - Organization: Choose or create
   - Project name: `molant-ict-system`
   - Database password: `Choose a strong password`
   - Region: Select closest to you
5. **Click "Create new project"**
6. **Wait for setup** (2-3 minutes)

### **Phase 2: Get Project Credentials**

1. **Go to Settings → API**
2. **Copy these values:**
   ```
   Project URL: https://your-project-id.supabase.co
   Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### **Phase 3: Set Environment Variables**

1. **Create `.env.local` file** in your project root
2. **Add your credentials:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### **Phase 4: Apply Database Schema**

#### **Option A: Using Supabase Dashboard (Recommended)**

1. **Go to SQL Editor** in your Supabase dashboard
2. **Copy the entire content** from `supabase/migrations/001_initial_schema.sql`
3. **Paste into SQL Editor**
4. **Click "Run"**
5. **Verify tables are created** in Table Editor

#### **Option B: Using Supabase CLI**

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Link your project:**
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **Apply schema:**
   ```bash
   supabase db push
   ```

### **Phase 5: Test Connection**

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Check for errors** in the console
3. **Verify dashboard loads** without database errors

## 🎯 **What You'll Get After Setup**

✅ **Complete Database**: 9 tables with relationships  
✅ **Automated Triggers**: Workflow automation  
✅ **Business Intelligence Views**: Reporting ready  
✅ **Sample Data**: Test data for immediate use  
✅ **Real-time Updates**: Live data synchronization  

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **"supabaseUrl is required"**
   - Check `.env.local` file exists
   - Verify environment variables are correct
   - Restart development server

2. **"Invalid API key"**
   - Copy the correct anon key (not service role)
   - Check for extra spaces or characters

3. **"Connection failed"**
   - Verify project is active in Supabase
   - Check if you're in the correct region

### **Need Help?**

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Community**: [github.com/supabase/supabase](https://github.com/supabase/supabase)
- **Discord**: [discord.supabase.com](https://discord.supabase.com)

## 🎉 **Success Indicators**

After successful setup, you should see:
- ✅ **Dashboard loads** without errors
- ✅ **Stats cards** show real numbers
- ✅ **Client management** works
- ✅ **Database tables** visible in Supabase
- ✅ **Automated triggers** functioning

---

**🚀 Ready to connect your database? Follow these steps and your MOLANT ICT System will be fully operational!** 