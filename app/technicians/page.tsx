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
  Wrench,
  Clock,
  CheckCircle,
  XCircle,
  Star
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Technician {
  id: string
  name: string
  contact: string
  service_ids: string[]
  is_available: boolean
  created_at: string
  updated_at: string
}

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredTechnicians, setFilteredTechnicians] = useState<Technician[]>([])
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all')

  useEffect(() => {
    fetchTechnicians()
  }, [])

  useEffect(() => {
    filterTechnicians()
  }, [searchTerm, technicians, availabilityFilter])

  const fetchTechnicians = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('technicians')
        .select('*')
        .order('name')

      if (error) throw error

      setTechnicians(data || [])
    } catch (error) {
      console.error('Error fetching technicians:', error)
      toast.error('Failed to fetch technicians')
    } finally {
      setLoading(false)
    }
  }

  const filterTechnicians = () => {
    let filtered = technicians

    // Apply availability filter
    if (availabilityFilter !== 'all') {
      filtered = filtered.filter(tech => tech.is_available === (availabilityFilter === 'available'))
    }

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(tech =>
        tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tech.contact.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredTechnicians(filtered)
  }

  const deleteTechnician = async (id: string) => {
    if (!confirm('Are you sure you want to delete this technician? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('technicians')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Technician deleted successfully')
      fetchTechnicians()
    } catch (error) {
      console.error('Error deleting technician:', error)
      toast.error('Failed to delete technician')
    }
  }

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('technicians')
        .update({ is_available: !currentStatus })
        .eq('id', id)

      if (error) throw error

      toast.success(`Technician ${!currentStatus ? 'marked as available' : 'marked as unavailable'}`)
      fetchTechnicians()
    } catch (error) {
      console.error('Error updating technician availability:', error)
      toast.error('Failed to update technician availability')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const totalTechnicians = technicians.length
  const availableTechnicians = technicians.filter(tech => tech.is_available).length
  const unavailableTechnicians = technicians.filter(tech => !tech.is_available).length
  const avgServicesPerTech = technicians.length > 0 
    ? technicians.reduce((sum, tech) => sum + (tech.service_ids?.length || 0), 0) / technicians.length 
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Technicians</h1>
              <p className="text-gray-600">Manage your service personnel and skill assignments</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/technicians/new" className="btn-primary flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Add Technician</span>
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
                <p className="text-sm font-medium text-gray-600">Total Technicians</p>
                <p className="text-2xl font-semibold text-gray-900">{totalTechnicians}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-semibold text-gray-900">{availableTechnicians}</p>
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
                <p className="text-sm font-medium text-gray-600">Unavailable</p>
                <p className="text-2xl font-semibold text-gray-900">{unavailableTechnicians}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Services</p>
                <p className="text-2xl font-semibold text-gray-900">{avgServicesPerTech.toFixed(1)}</p>
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
                  placeholder="Search technicians by name or contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value as any)}
                className="input-field"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setAvailabilityFilter('all')
                }}
                className="btn-secondary"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Technicians Table */}
        <div className="card">
          <div className="overflow-x-auto">
            {filteredTechnicians.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Technician
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Services
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
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
                  {filteredTechnicians.map((technician) => (
                    <tr key={technician.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <Users className="h-5 w-5 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{technician.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {technician.contact}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <Wrench className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {technician.service_ids?.length || 0} services
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            technician.is_available 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {technician.is_available ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="ml-1">Available</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 text-red-600" />
                                <span className="ml-1">Unavailable</span>
                              </>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(technician.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleAvailability(technician.id, technician.is_available)}
                            className={`${
                              technician.is_available 
                                ? 'text-red-600 hover:text-red-900' 
                                : 'text-green-600 hover:text-green-900'
                            }`}
                            title={technician.is_available ? 'Mark as unavailable' : 'Mark as available'}
                          >
                            {technician.is_available ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </button>
                          <Link
                            href={`/technicians/${technician.id}`}
                            className="text-primary-600 hover:text-primary-900"
                            title="View technician"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/technicians/${technician.id}/edit`}
                            className="text-warning-600 hover:text-warning-900"
                            title="Edit technician"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => deleteTechnician(technician.id)}
                            className="text-danger-600 hover:text-danger-900"
                            title="Delete technician"
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
                {searchTerm || availabilityFilter !== 'all' ? (
                  <div>
                    <p className="text-gray-500">No technicians found matching your criteria</p>
                    <button
                      onClick={() => {
                        setSearchTerm('')
                        setAvailabilityFilter('all')
                      }}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div>
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No technicians</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding your first technician.</p>
                    <div className="mt-6">
                      <Link href="/technicians/new" className="btn-primary">
                        <Plus className="h-5 w-5 mr-2" />
                        Add Technician
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