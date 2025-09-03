'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  Wrench, 
  DollarSign,
  Calendar,
  Download,
  Filter,
  AlertTriangle
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ReportData {
  clients: any[]
  vendors: any[]
  items: any[]
  services: any[]
  orders: any[]
  payments: any[]
  documents: any[]
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData>({
    clients: [],
    vendors: [],
    items: [],
    services: [],
    orders: [],
    payments: [],
    documents: []
  })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month')

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      
      // Fetch all data for reports
      const [
        { data: clients },
        { data: vendors },
        { data: items },
        { data: services },
        { data: orders },
        { data: payments },
        { data: documents }
      ] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('vendors').select('*'),
        supabase.from('items').select('*'),
        supabase.from('services').select('*'),
        supabase.from('orders').select('*'),
        supabase.from('payments').select('*'),
        supabase.from('documents').select('*')
      ])

      setReportData({
        clients: clients || [],
        vendors: vendors || [],
        items: items || [],
        services: services || [],
        orders: orders || [],
        payments: payments || [],
        documents: documents || []
      })
    } catch (error) {
      console.error('Error fetching report data:', error)
      toast.error('Failed to fetch report data')
    } finally {
      setLoading(false)
    }
  }

  const getDateRangeData = (data: any[], dateField: string) => {
    const now = new Date()
    let startDate: Date

    switch (dateRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), quarter * 3, 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    return data.filter(item => {
      const itemDate = new Date(item[dateField])
      return itemDate >= startDate && itemDate <= now
    })
  }

  const calculateRevenueMetrics = () => {
    const periodOrders = getDateRangeData(reportData.orders, 'created_at')
    const periodPayments = getDateRangeData(reportData.payments, 'payment_date')
    
    const totalRevenue = periodOrders.reduce((sum, order) => sum + order.total_amount, 0)
    const totalReceived = periodPayments.reduce((sum, payment) => sum + payment.amount_paid, 0)
    const outstandingBalance = totalRevenue - totalReceived
    
    return { totalRevenue, totalReceived, outstandingBalance }
  }

  const calculateClientMetrics = () => {
    const periodClients = getDateRangeData(reportData.clients, 'created_at')
    const totalClients = reportData.clients.length
    const newClients = periodClients.length
    const activeClients = reportData.orders
      .filter(order => getDateRangeData([order], 'created_at').length > 0)
      .map(order => order.client_id)
      .filter((id, index, arr) => arr.indexOf(id) === index).length
    
    return { totalClients, newClients, activeClients }
  }

  const calculateInventoryMetrics = () => {
    const totalItems = reportData.items.length
    const totalValue = reportData.items.reduce((sum, item) => sum + (item.stock_qty * item.buy_price), 0)
    const lowStockItems = reportData.items.filter(item => item.stock_qty > 0 && item.stock_qty <= 10).length
    const outOfStockItems = reportData.items.filter(item => item.stock_qty === 0).length
    
    return { totalItems, totalValue, lowStockItems, outOfStockItems }
  }

  const calculateOrderMetrics = () => {
    const periodOrders = getDateRangeData(reportData.orders, 'created_at')
    const totalOrders = reportData.orders.length
    const periodOrdersCount = periodOrders.length
    const avgOrderValue = periodOrders.length > 0 
      ? periodOrders.reduce((sum, order) => sum + order.total_amount, 0) / periodOrders.length 
      : 0
    
    const itemOrders = periodOrders.filter(order => order.type === 'item').length
    const serviceOrders = periodOrders.filter(order => order.type === 'service').length
    
    return { totalOrders, periodOrdersCount, avgOrderValue, itemOrders, serviceOrders }
  }

  const generateReport = async (reportType: string) => {
    try {
      // This would typically generate and download a PDF/Excel report
      toast.success(`${reportType} report generated successfully`)
      // In a real implementation, you would:
      // 1. Generate report data
      // 2. Create PDF/Excel using jsPDF or similar
      // 3. Download the file
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate report')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const revenueMetrics = calculateRevenueMetrics()
  const clientMetrics = calculateClientMetrics()
  const inventoryMetrics = calculateInventoryMetrics()
  const orderMetrics = calculateOrderMetrics()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600">Business intelligence and performance insights</p>
            </div>
            <div className="flex space-x-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="input-field"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Revenue Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue ({dateRange})</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(revenueMetrics.totalRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Payments Received</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(revenueMetrics.totalReceived)}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Outstanding Balance</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(revenueMetrics.outstandingBalance)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-semibold text-gray-900">{clientMetrics.totalClients}</p>
                <p className="text-sm text-gray-500">+{clientMetrics.newClients} new</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inventory Items</p>
                <p className="text-2xl font-semibold text-gray-900">{inventoryMetrics.totalItems}</p>
                <p className="text-sm text-gray-500">Value: {formatCurrency(inventoryMetrics.totalValue)}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Services</p>
                <p className="text-2xl font-semibold text-gray-900">{reportData.services.length}</p>
                <p className="text-sm text-gray-500">Active catalog</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Orders ({dateRange})</p>
                <p className="text-2xl font-semibold text-gray-900">{orderMetrics.periodOrdersCount}</p>
                <p className="text-sm text-gray-500">Avg: {formatCurrency(orderMetrics.avgOrderValue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Order Analysis */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Order Analysis</h3>
              <button
                onClick={() => generateReport('orders')}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Orders</span>
                <span className="text-sm font-medium text-gray-900">{orderMetrics.totalOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Period Orders</span>
                <span className="text-sm font-medium text-gray-900">{orderMetrics.periodOrdersCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Item Orders</span>
                <span className="text-sm font-medium text-gray-900">{orderMetrics.itemOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Service Orders</span>
                <span className="text-sm font-medium text-gray-900">{orderMetrics.serviceOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Order Value</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(orderMetrics.avgOrderValue)}</span>
              </div>
            </div>
          </div>

          {/* Inventory Status */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Inventory Status</h3>
              <button
                onClick={() => generateReport('inventory')}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Items</span>
                <span className="text-sm font-medium text-gray-900">{inventoryMetrics.totalItems}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Value</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(inventoryMetrics.totalValue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Low Stock Items</span>
                <span className="text-sm font-medium text-yellow-600">{inventoryMetrics.lowStockItems}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Out of Stock</span>
                <span className="text-sm font-medium text-red-600">{inventoryMetrics.outOfStockItems}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Stock Health</span>
                <span className={`text-sm font-medium ${
                  inventoryMetrics.outOfStockItems === 0 ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {inventoryMetrics.outOfStockItems === 0 ? 'Good' : 'Needs Attention'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Client Performance */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Client Performance</h3>
            <button
              onClick={() => generateReport('clients')}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{clientMetrics.totalClients}</div>
              <div className="text-sm text-gray-600">Total Clients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{clientMetrics.activeClients}</div>
              <div className="text-sm text-gray-600">Active Clients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{clientMetrics.newClients}</div>
              <div className="text-sm text-gray-600">New This Period</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => generateReport('financial')}
              className="btn-secondary flex items-center justify-center space-x-2 py-3"
            >
              <DollarSign className="h-5 w-5" />
              <span>Financial Report</span>
            </button>
            <button
              onClick={() => generateReport('inventory')}
              className="btn-secondary flex items-center justify-center space-x-2 py-3"
            >
              <Package className="h-5 w-5" />
              <span>Inventory Report</span>
            </button>
            <button
              onClick={() => generateReport('clients')}
              className="btn-secondary flex items-center justify-center space-x-2 py-3"
            >
              <Users className="h-5 w-5" />
              <span>Client Report</span>
            </button>
            <button
              onClick={() => generateReport('performance')}
              className="btn-secondary flex items-center justify-center space-x-2 py-3"
            >
              <BarChart3 className="h-5 w-5" />
              <span>Performance Report</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
} 