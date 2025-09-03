'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { 
  Wrench, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  DollarSign,
  Users,
  Clock,
  TrendingUp
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Service {
  id: string
  name: string
  vendor_id: string
  cost: number
  created_at: string
  updated_at: string
  vendors?: {
    name: string
  }
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [costFilter, setCostFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all')

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    filterServices()
  }, [searchTerm, services, costFilter])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          vendors(name)
        `)
        .order('name')

      if (error) throw error

      setServices(data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
      toast.error('Failed to fetch services')
    } finally {
      setLoading(false)
    }
  }

  const filterServices = () => {
    let filtered = services

    // Apply cost filter
    if (costFilter !== 'all') {
      filtered = filtered.filter(service => {
        switch (costFilter) {
          case 'low':
            return service.cost < 100
          case 'medium':
            return service.cost >= 100 && service.cost < 500
          case 'high':
            return service.cost >= 500
          default:
            return true
        }
      })
    }

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.vendors?.name && service.vendors.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    setFilteredServices(filtered)
  }

  const deleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Service deleted successfully')
      fetchServices()
    } catch (error) {
      console.error('Error deleting service:', error)
      toast.error('Failed to delete service')
    }
  }

  const getCostCategory = (cost: number) => {
    if (cost < 100) {
      return {
        category: 'Low Cost',
        color: 'bg-green-100 text-green-800'
      }
    } else if (cost < 500) {
      return {
        category: 'Medium Cost',
        color: 'bg-yellow-100 text-yellow-800'
      }
    } else {
      return {
        category: 'High Cost',
        color: 'bg-red-100 text-red-800'
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const totalServices = services.length
  const totalCost = services.reduce((sum, service) => sum + service.cost, 0)
  const avgCost = totalServices > 0 ? totalCost / totalServices : 0
  const lowCostServices = services.filter(service => service.cost < 100).length
  const highCostServices = services.filter(service => service.cost >= 500).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Services</h1>
              <p className="text-gray-600">Manage your service catalog and pricing</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/services/new" className="btn-primary flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Add Service</span>
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
                  <Wrench className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Services</p>
                <p className="text-2xl font-semibold text-gray-900">{totalServices}</p>
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
                <p className="text-sm font-medium text-gray-600">Total Cost</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalCost)}</p>
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
                <p className="text-sm font-medium text-gray-600">Avg Cost</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(avgCost)}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Cost</p>
                <p className="text-2xl font-semibold text-gray-900">{lowCostServices}</p>
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
                  placeholder="Search services by name or vendor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <select
                value={costFilter}
                onChange={(e) => setCostFilter(e.target.value as any)}
                className="input-field"
              >
                <option value="all">All Costs</option>
                <option value="low">Low Cost (&lt;$100)</option>
                <option value="medium">Medium Cost ($100-$500)</option>
                <option value="high">High Cost (&gt;$500)</option>
              </select>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setCostFilter('all')
                }}
                className="btn-secondary"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Services Table */}
        <div className="card">
          <div className="overflow-x-auto">
            {filteredServices.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredServices.map((service) => {
                    const costCategory = getCostCategory(service.cost)
                    
                    return (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Wrench className="h-5 w-5 text-gray-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{service.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {service.vendors?.name || 'Unknown Vendor'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="font-medium">{formatCurrency(service.cost)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${costCategory.color}`}>
                            {costCategory.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(service.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              href={`/services/${service.id}`}
                              className="text-primary-600 hover:text-primary-900"
                              title="View service"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/services/${service.id}/edit`}
                              className="text-warning-600 hover:text-warning-900"
                              title="Edit service"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => deleteService(service.id)}
                              className="text-danger-600 hover:text-danger-900"
                              title="Delete service"
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
                {searchTerm || costFilter !== 'all' ? (
                  <div>
                    <p className="text-gray-500">No services found matching your criteria</p>
                    <button
                      onClick={() => {
                        setSearchTerm('')
                        setCostFilter('all')
                      }}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div>
                    <Wrench className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No services</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding your first service.</p>
                    <div className="mt-6">
                      <Link href="/services/new" className="btn-primary">
                        <Plus className="h-5 w-5 mr-2" />
                        Add Service
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