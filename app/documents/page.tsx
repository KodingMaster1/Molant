'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { 
  FileText, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  File
} from 'lucide-react'
import { formatDate, getStatusColor } from '@/lib/utils'

interface Document {
  id: string
  order_id: string
  client_id: string
  vendor_id: string | null
  type: 'proforma' | 'delivery_note' | 'payment_statement' | 'receipt' | 'job_card' | 'diagnosis'
  status: 'pending' | 'approved' | 'delivered' | 'paid'
  due_date: string | null
  file_path: string | null
  document_number: string
  created_at: string
  updated_at: string
  clients?: {
    name: string
  }
  orders?: {
    type: string
    total_amount: number
  }
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'delivered' | 'paid'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'proforma' | 'delivery_note' | 'payment_statement' | 'receipt' | 'job_card' | 'diagnosis'>('all')

  useEffect(() => {
    fetchDocuments()
  }, [])

  useEffect(() => {
    filterDocuments()
  }, [searchTerm, documents, statusFilter, typeFilter])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          clients(name),
          orders(type, total_amount)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setDocuments(data || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast.error('Failed to fetch documents')
    } finally {
      setLoading(false)
    }
  }

  const filterDocuments = () => {
    let filtered = documents

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(doc => doc.status === statusFilter)
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(doc => doc.type === typeFilter)
    }

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(doc =>
        doc.document_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredDocuments(filtered)
  }

  const deleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Document deleted successfully')
      fetchDocuments()
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Failed to delete document')
    }
  }

  const updateDocumentStatus = async (id: string, newStatus: Document['status']) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error

      toast.success(`Document status updated to ${newStatus}`)
      fetchDocuments()
    } catch (error) {
      console.error('Error updating document status:', error)
      toast.error('Failed to update document status')
    }
  }

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'proforma':
        return <FileText className="h-4 w-4 text-blue-600" />
      case 'delivery_note':
        return <FileText className="h-4 w-4 text-green-600" />
      case 'payment_statement':
        return <FileText className="h-4 w-4 text-yellow-600" />
      case 'receipt':
        return <FileText className="h-4 w-4 text-green-600" />
      case 'job_card':
        return <FileText className="h-4 w-4 text-purple-600" />
      case 'diagnosis':
        return <FileText className="h-4 w-4 text-red-600" />
      default:
        return <File className="h-4 w-4 text-gray-600" />
    }
  }

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'proforma':
        return 'bg-blue-100 text-blue-800'
      case 'delivery_note':
        return 'bg-green-100 text-green-800'
      case 'payment_statement':
        return 'bg-yellow-100 text-yellow-800'
      case 'receipt':
        return 'bg-green-100 text-green-800'
      case 'job_card':
        return 'bg-purple-100 text-purple-800'
      case 'diagnosis':
        return 'bg-red-100 text-red-800'
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

  const totalDocuments = documents.length
  const pendingDocuments = documents.filter(doc => doc.status === 'pending').length
  const approvedDocuments = documents.filter(doc => doc.status === 'approved').length
  const completedDocuments = documents.filter(doc => doc.status === 'paid').length
  const overdueDocuments = documents.filter(doc => 
    doc.due_date && new Date(doc.due_date) < new Date() && doc.status !== 'paid'
  ).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
              <p className="text-gray-600">Manage document workflow and track status</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/documents/new" className="btn-primary flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Create Document</span>
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
                  <FileText className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                <p className="text-2xl font-semibold text-gray-900">{totalDocuments}</p>
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
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{pendingDocuments}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">{approvedDocuments}</p>
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
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{completedDocuments}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-semibold text-gray-900">{overdueDocuments}</p>
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
                  placeholder="Search documents by number, client, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="input-field"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="delivered">Delivered</option>
                <option value="paid">Paid</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="input-field"
              >
                <option value="all">All Types</option>
                <option value="proforma">Proforma</option>
                <option value="delivery_note">Delivery Note</option>
                <option value="payment_statement">Payment Statement</option>
                <option value="receipt">Receipt</option>
                <option value="job_card">Job Card</option>
                <option value="diagnosis">Diagnosis</option>
              </select>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setTypeFilter('all')
                }}
                className="btn-secondary"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Documents Table */}
        <div className="card">
          <div className="overflow-x-auto">
            {filteredDocuments.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
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
                  {filteredDocuments.map((document) => (
                    <tr key={document.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                              {getDocumentTypeIcon(document.type)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{document.document_number}</div>
                            <div className="text-sm text-gray-500">Order: #{document.order_id.slice(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {document.clients?.name || 'Unknown Client'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDocumentTypeColor(document.type)}`}>
                          {getDocumentTypeIcon(document.type)}
                          <span className="ml-1">{document.type.replace('_', ' ').charAt(0).toUpperCase() + document.type.replace('_', ' ').slice(1)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                            {document.status === 'pending' && <Clock className="h-4 w-4 text-yellow-600" />}
                            {document.status === 'approved' && <CheckCircle className="h-4 w-4 text-blue-600" />}
                            {document.status === 'delivered' && <CheckCircle className="h-4 w-4 text-green-600" />}
                            {document.status === 'paid' && <CheckCircle className="h-4 w-4 text-green-600" />}
                            <span className="ml-1">{document.status.charAt(0).toUpperCase() + document.status.slice(1)}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {document.due_date ? formatDate(document.due_date) : 'No due date'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(document.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {document.file_path && (
                            <button
                              onClick={() => window.open(document.file_path!, '_blank')}
                              className="text-primary-600 hover:text-primary-900"
                              title="Download document"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                          <Link
                            href={`/documents/${document.id}`}
                            className="text-primary-600 hover:text-primary-900"
                            title="View document"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/documents/${document.id}/edit`}
                            className="text-warning-600 hover:text-warning-900"
                            title="Edit document"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => deleteDocument(document.id)}
                            className="text-danger-600 hover:text-danger-900"
                            title="Delete document"
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
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' ? (
                  <div>
                    <p className="text-gray-500">No documents found matching your criteria</p>
                    <button
                      onClick={() => {
                        setSearchTerm('')
                        setStatusFilter('all')
                        setTypeFilter('all')
                      }}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div>
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating your first document.</p>
                    <div className="mt-6">
                      <Link href="/documents/new" className="btn-primary">
                        <Plus className="h-5 w-5 mr-2" />
                        Create Document
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