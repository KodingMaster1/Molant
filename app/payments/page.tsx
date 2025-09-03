'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { 
  DollarSign, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Receipt
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Payment {
  id: string
  client_id: string
  order_id: string
  amount_paid: number
  balance: number
  payment_date: string
  created_at: string
  clients?: {
    name: string
  }
  orders?: {
    type: string
    total_amount: number
  }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')

  useEffect(() => {
    fetchPayments()
  }, [])

  useEffect(() => {
    filterPayments()
  }, [searchTerm, payments, dateFilter])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          clients(name),
          orders(type, total_amount)
        `)
        .order('payment_date', { ascending: false })

      if (error) throw error

      setPayments(data || [])
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast.error('Failed to fetch payments')
    } finally {
      setLoading(false)
    }
  }

  const filterPayments = () => {
    let filtered = payments

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.payment_date)
        switch (dateFilter) {
          case 'today':
            return paymentDate >= today
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            return paymentDate >= weekAgo
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
            return paymentDate >= monthAgo
          default:
            return true
        }
      })
    }

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(payment =>
        payment.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredPayments(filtered)
  }

  const deletePayment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Payment deleted successfully')
      fetchPayments()
    } catch (error) {
      console.error('Error deleting payment:', error)
      toast.error('Failed to delete payment')
    }
  }

  const generateReceipt = async (paymentId: string) => {
    try {
      // This would typically generate a PDF receipt
      toast.success('Receipt generated successfully')
      // In a real implementation, you would:
      // 1. Generate PDF using jsPDF
      // 2. Download or email the receipt
      // 3. Update document status
    } catch (error) {
      console.error('Error generating receipt:', error)
      toast.error('Failed to generate receipt')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const totalPayments = payments.length
  const totalAmountPaid = payments.reduce((sum, payment) => sum + payment.amount_paid, 0)
  const totalOutstanding = payments.reduce((sum, payment) => sum + payment.balance, 0)
  const todayPayments = payments.filter(payment => {
    const today = new Date()
    const paymentDate = new Date(payment.payment_date)
    return paymentDate.toDateString() === today.toDateString()
  }).length
  const recentPayments = payments.filter(payment => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return new Date(payment.payment_date) >= weekAgo
  }).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
              <p className="text-gray-600">Track payments and manage outstanding balances</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/payments/new" className="btn-primary flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Record Payment</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-2xl font-semibold text-gray-900">{totalPayments}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Received</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalAmountPaid)}</p>
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
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalOutstanding)}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-semibold text-gray-900">{todayPayments}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-semibold text-gray-900">{recentPayments}</p>
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
                  placeholder="Search payments by client name or payment ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="input-field"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setDateFilter('all')
                }}
                className="btn-secondary"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="card">
          <div className="overflow-x-auto">
            {filteredPayments.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount Paid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                              <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">#{payment.id.slice(0, 8)}</div>
                            <div className="text-sm text-gray-500">Payment</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.clients?.name || 'Unknown Client'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="text-gray-900">Order: #{payment.order_id.slice(0, 8)}</div>
                          <div className="text-gray-600">
                            {payment.orders?.type || 'Unknown'} - {formatCurrency(payment.orders?.total_amount || 0)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-medium text-green-600">{formatCurrency(payment.amount_paid)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payment.balance > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {payment.balance > 0 ? 'Outstanding' : 'Paid'}
                          <span className="ml-1">{formatCurrency(payment.balance)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.payment_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => generateReceipt(payment.id)}
                            className="text-primary-600 hover:text-primary-900"
                            title="Generate receipt"
                          >
                            <Receipt className="h-4 w-4" />
                          </button>
                          <Link
                            href={`/payments/${payment.id}`}
                            className="text-primary-600 hover:text-primary-900"
                            title="View payment"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/payments/${payment.id}/edit`}
                            className="text-warning-600 hover:text-warning-900"
                            title="Edit payment"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => deletePayment(payment.id)}
                            className="text-danger-600 hover:text-danger-900"
                            title="Delete payment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                {searchTerm || dateFilter !== 'all' ? (
                  <div>
                    <p className="text-gray-500">No payments found matching your criteria</p>
                    <button
                      onClick={() => {
                        setSearchTerm('')
                        setDateFilter('all')
                      }}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div>
                    <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No payments</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by recording your first payment.</p>
                    <div className="mt-6">
                      <Link href="/payments/new" className="btn-primary">
                        <Plus className="h-5 w-5 mr-2" />
                        Record Payment
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