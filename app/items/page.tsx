'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { 
  Package, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Item {
  id: string
  name: string
  vendor_id: string
  buy_price: number
  sell_price: number
  stock_qty: number
  warranty: string
  created_at: string
  updated_at: string
  vendors?: {
    name: string
  }
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all')

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    filterItems()
  }, [searchTerm, items, stockFilter])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          vendors(name)
        `)
        .order('name')

      if (error) throw error

      setItems(data || [])
    } catch (error) {
      console.error('Error fetching items:', error)
      toast.error('Failed to fetch items')
    } finally {
      setLoading(false)
    }
  }

  const filterItems = () => {
    let filtered = items

    // Apply stock filter
    if (stockFilter !== 'all') {
      filtered = filtered.filter(item => {
        switch (stockFilter) {
          case 'in-stock':
            return item.stock_qty > 10
          case 'low-stock':
            return item.stock_qty > 0 && item.stock_qty <= 10
          case 'out-of-stock':
            return item.stock_qty === 0
          default:
            return true
        }
      })
    }

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.vendors?.name && item.vendors.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.warranty?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredItems(filtered)
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Item deleted successfully')
      fetchItems()
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete item')
    }
  }

  const getStockStatus = (qty: number) => {
    if (qty === 0) {
      return {
        status: 'Out of Stock',
        color: 'bg-red-100 text-red-800',
        icon: <XCircle className="h-4 w-4 text-red-600" />
      }
    } else if (qty <= 10) {
      return {
        status: 'Low Stock',
        color: 'bg-yellow-100 text-yellow-800',
        icon: <AlertTriangle className="h-4 w-4 text-yellow-600" />
      }
    } else {
      return {
        status: 'In Stock',
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="h-4 w-4 text-green-600" />
      }
    }
  }

  const calculateProfitMargin = (buyPrice: number, sellPrice: number) => {
    if (buyPrice === 0) return 0
    return ((sellPrice - buyPrice) / buyPrice) * 100
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const totalValue = items.reduce((sum, item) => sum + (item.stock_qty * item.buy_price), 0)
  const totalProfit = items.reduce((sum, item) => sum + (item.stock_qty * (item.sell_price - item.buy_price)), 0)
  const lowStockItems = items.filter(item => item.stock_qty > 0 && item.stock_qty <= 10).length
  const outOfStockItems = items.filter(item => item.stock_qty === 0).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
              <p className="text-gray-600">Manage your product inventory and stock levels</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/items/new" className="btn-primary flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Add Item</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-semibold text-gray-900">{items.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalValue)}</p>
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
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-semibold text-gray-900">{lowStockItems}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-semibold text-gray-900">{outOfStockItems}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search items by name, vendor, or warranty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="input-field"
              >
                <option value="all">All Stock</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setStockFilter('all')
                }}
                className="btn-secondary"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="card">
          <div className="overflow-x-auto">
            {filteredItems.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pricing
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profit Margin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => {
                    const stockStatus = getStockStatus(item.stock_qty)
                    const profitMargin = calculateProfitMargin(item.buy_price, item.sell_price)
                    
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Package className="h-5 w-5 text-gray-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              {item.warranty && (
                                <div className="text-sm text-gray-500">Warranty: {item.warranty}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.vendors?.name || 'Unknown Vendor'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                              {stockStatus.icon}
                              <span className="ml-1">{item.stock_qty}</span>
                            </span>
                            <span className="text-xs text-gray-500">{stockStatus.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="text-gray-900">Buy: {formatCurrency(item.buy_price)}</div>
                            <div className="text-gray-600">Sell: {formatCurrency(item.sell_price)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            profitMargin > 20 ? 'bg-green-100 text-green-800' :
                            profitMargin > 10 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {profitMargin.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              href={`/items/${item.id}`}
                              className="text-primary-600 hover:text-primary-900"
                              title="View item"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/items/${item.id}/edit`}
                              className="text-warning-600 hover:text-warning-900"
                              title="Edit item"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => deleteItem(item.id)}
                              className="text-danger-600 hover:text-danger-900"
                              title="Delete item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                {searchTerm || stockFilter !== 'all' ? (
                  <div>
                    <p className="text-gray-500">No items found matching your criteria</p>
                    <button
                      onClick={() => {
                        setSearchTerm('')
                        setStockFilter('all')
                      }}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div>
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No items</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding your first inventory item.</p>
                    <div className="mt-6">
                      <Link href="/items/new" className="btn-primary">
                        <Plus className="h-5 w-5 mr-2" />
                        Add Item
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 