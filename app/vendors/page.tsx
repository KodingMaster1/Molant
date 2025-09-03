'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { 
  Users, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Package, 
  Wrench,
  Calendar 
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Vendor {
  id: string
  name: string
  contact: string
  type: 'item' | 'service' | 'both'
  created_at: string
  updated_at: string
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([])

  useEffect(() => {
    fetchVendors()
  }, [])

  useEffect(() => {
    filterVendors()
  }, [searchTerm, vendors])

  const fetchVendors = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('name')

      if (error) throw error

      setVendors(data || [])
    } catch (error) {
      console.error('Error fetching vendors:', error)
      toast.error('Failed to fetch vendors')
    } finally {
      setLoading(false)
    }
  }

  const filterVendors = () => {
    if (!searchTerm.trim()) {
      setFilteredVendors(vendors)
      return
    }

    const filtered = vendors.filter(vendor =>
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.type.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredVendors(filtered)
  }

  const deleteVendor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vendor? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Vendor deleted successfully')
      fetchVendors()
    } catch (error) {
      console.error('Error deleting vendor:', error)
      toast.error('Failed to delete vendor')
    }
  }

  const getVendorTypeIcon = (type: string) => {
    switch (type) {
      case 'item':
        return <Package className="h-4 w-4 text-blue-600" />
      case 'service':
        return <Wrench className="h-4 w-4 text-green-600" />
      case 'both':
        return <div className="flex space-x-1">
          <Package className="h-3 w-3 text-blue-600" />
          <Wrench className="h-3 w-3 text-green-600" />
        </div>
      default:
        return <Package className="h-4 w-4 text-gray-600" />
    }
  }

  const getVendorTypeColor = (type: string) => {
    switch (type) {
      case 'item':
        return 'bg-blue-100 text-blue-800'
      case 'service':
        return 'bg-green-100 text-green-800'
      case 'both':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vendors</h1>
              <p className="text-gray-600">Manage your suppliers and service providers</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/vendors/new" className="btn-primary flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Add Vendor</span>
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
                  <Users className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                <p className="text-2xl font-semibold text-gray-900">{vendors.length}</p>
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
                <p className="text-sm font-medium text-gray-600">Item Vendors</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {vendors.filter(v => v.type === 'item' || v.type === 'both').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Service Vendors</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {vendors.filter(v => v.type === 'service' || v.type === 'both').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <div className="flex space-x-1">
                    <Package className="h-3 w-3 text-blue-600" />
                    <Wrench className="h-3 w-3 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Both Types</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {vendors.filter(v => v.type === 'both').length}
                </p>
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
                  placeholder="Search vendors by name, contact, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setSearchTerm('')}
                className="btn-secondary"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Vendors Table */}
        <div className="card">
          <div className="overflow-x-auto">
            {filteredVendors.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
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
                  {filteredVendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                              {getVendorTypeIcon(vendor.type)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {vendor.contact}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVendorTypeColor(vendor.type)}`}>
                          {vendor.type.charAt(0).toUpperCase() + vendor.type.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(vendor.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/vendors/${vendor.id}`}
                            className="text-primary-600 hover:text-primary-900"
                            title="View vendor"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/vendors/${vendor.id}/edit`}
                            className="text-warning-600 hover:text-warning-900"
                            title="Edit vendor"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => deleteVendor(vendor.id)}
                            className="text-danger-600 hover:text-danger-900"
                            title="Delete vendor"
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
                {searchTerm ? (
                  <div>
                    <p className="text-gray-500">No vendors found matching "{searchTerm}"</p>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div>
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No vendors</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating your first vendor.</p>
                    <div className="mt-6">
                      <Link href="/vendors/new" className="btn-primary">
                        <Plus className="h-5 w-5 mr-2" />
                        Add Vendor
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