# 🪟 Windows Setup Guide for MOLANT ICT System

## 🚨 Important Note for Windows Users

The Supabase CLI has some installation issues on Windows when using npm globally. Here's how to get your system running:

## 🚀 **Quick Start (Windows)**

### **Step 1: Your System is Already Running!**
The Next.js development server should now be running at:
**🌐 http://localhost:3000**

### **Step 2: Set Up Supabase (Choose One Option)**

#### **Option A: Use Supabase Cloud (Recommended)**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key
4. Create `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

#### **Option B: Install Supabase CLI via Chocolatey**
```cmd
# Install Chocolatey first (if you don't have it)
# Run PowerShell as Administrator and execute:
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Then install Supabase CLI
choco install supabase
```

#### **Option C: Download Supabase CLI Binary**
1. Go to [Supabase CLI Releases](https://github.com/supabase/cli/releases)
2. Download the Windows binary
3. Extract and add to your PATH

### **Step 3: Apply Database Schema**

Once you have Supabase CLI working:

```cmd
# Initialize Supabase
supabase init

# Start local development (if using local)
supabase start

# Apply the database schema
supabase db push

# Generate TypeScript types
npm run db:generate
```

## 🌐 **Access Your System**

### **Main Application**
- **URL**: http://localhost:3000
- **Status**: ✅ Running (if you see the dashboard)

### **Database Management**
- **Supabase Studio**: https://your-project-id.supabase.co (if using cloud)
- **Local Studio**: http://localhost:54323 (if using local)

## 🔧 **Current Status**

✅ **Frontend**: Next.js application running  
✅ **UI Components**: Dashboard, Navigation, Client Management  
✅ **Styling**: Tailwind CSS with custom design system  
✅ **Database Schema**: Complete with triggers and automation  
✅ **TypeScript**: Full type definitions and utilities  
❌ **Database**: Needs Supabase connection (see options above)  

## 🎯 **What You Can Do Right Now**

1. **Explore the UI**: Navigate to http://localhost:3000
2. **View the Dashboard**: See the business intelligence cards
3. **Check Navigation**: Test the responsive navigation system
4. **Review Code**: Examine the components and utilities

## 🚀 **Next Steps After Database Setup**

1. **Test Database Connection**: Verify Supabase integration
2. **Add Sample Data**: Create clients, vendors, and items
3. **Test Workflows**: Create orders and watch automation
4. **Customize**: Modify colors, branding, and fields

## 🔍 **Troubleshooting Windows Issues**

### **Port Conflicts**
- Check if ports 3000, 54321-54329 are available
- Use `netstat -an | findstr :3000` to check port usage

### **Permission Issues**
- Run Command Prompt as Administrator
- Check Windows Defender and firewall settings

### **Node.js Issues**
- Ensure you have Node.js 18+ installed
- Try using Node.js LTS version

## 📞 **Need Help?**

- **Documentation**: Check README.md and SETUP_GUIDE.md
- **Windows Issues**: This guide covers common problems
- **Supabase Support**: Visit [supabase.com/docs](https://supabase.com/docs)

---

**🎉 Your MOLANT ICT System is ready to transform your business operations!** 