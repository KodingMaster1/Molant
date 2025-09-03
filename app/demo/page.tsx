'use client'

import { useState } from 'react'
import { 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Users, 
  Package, 
  Wrench,
  FileText,
  DollarSign,
  ArrowRight,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import Link from 'next/link'

export default function DemoPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [step, setStep] = useState(1)

  const workflowSteps = [
    {
      id: 1,
      title: 'Client Order',
      description: 'Client places order for items or services',
      icon: Users,
      status: 'completed'
    },
    {
      id: 2,
      title: 'Proforma Invoice',
      description: 'System generates proforma invoice automatically',
      icon: FileText,
      status: 'completed'
    },
    {
      id: 3,
      title: 'Approval Process',
      description: 'Order approved with credit limit check',
      icon: CheckCircle,
      status: 'completed'
    },
    {
      id: 4,
      title: 'Document Generation',
      description: 'Next document (delivery note/job card) created',
      icon: FileText,
      status: 'completed'
    },
    {
      id: 5,
      title: 'Stock Update',
      description: 'Inventory automatically updated on delivery',
      icon: Package,
      status: 'pending'
    },
    {
      id: 6,
      title: 'Payment Processing',
      description: 'Payment recorded and receipt generated',
      icon: DollarSign,
      status: 'pending'
    }
  ]

  const features = [
    {
      title: 'Automated Workflows',
      description: 'Complete document flow from order to completion',
      icon: TrendingUp,
      color: 'bg-primary-100 text-primary-600'
    },
    {
      title: 'Real-time Dashboard',
      description: 'Live business intelligence and performance metrics',
      icon: TrendingUp,
      color: 'bg-success-100 text-success-600'
    },
    {
      title: 'Credit Management',
      description: 'Automatic credit limit checking and approval',
      icon: DollarSign,
      color: 'bg-warning-100 text-warning-600'
    },
    {
      title: 'Inventory Control',
      description: 'Automatic stock updates and low-stock alerts',
      icon: Package,
      color: 'bg-info-100 text-info-600'
    },
    {
      title: 'Service Management',
      description: 'Technician assignment and job tracking',
      icon: Wrench,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Document Automation',
      description: 'Auto-numbering and status tracking',
      icon: FileText,
      color: 'bg-gray-100 text-gray-600'
    }
  ]

  const startDemo = () => {
    setIsRunning(true)
    let currentStep = 1
    const interval = setInterval(() => {
      if (currentStep <= workflowSteps.length) {
        setStep(currentStep)
        currentStep++
      } else {
        clearInterval(interval)
        setIsRunning(false)
        setStep(1)
      }
    }, 2000)
  }

  const resetDemo = () => {
    setIsRunning(false)
    setStep(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Demo</h1>
              <p className="text-gray-600">See the MOLANT ICT System in action</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/" className="btn-secondary">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Experience the Power of Automation
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Watch how the MOLANT ICT System automatically handles your entire business workflow, 
            from order placement to payment completion, with zero manual intervention.
          </p>
        </div>

        {/* Interactive Workflow Demo */}
        <div className="card mb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Automated Workflow Demo
            </h3>
            <div className="flex justify-center space-x-4">
              <button
                onClick={startDemo}
                disabled={isRunning}
                className="btn-primary flex items-center space-x-2"
              >
                <Play className="h-5 w-5" />
                <span>Start Demo</span>
              </button>
              <button
                onClick={resetDemo}
                className="btn-secondary flex items-center space-x-2"
              >
                <RotateCcw className="h-5 w-5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflowSteps.map((workflowStep) => (
              <div
                key={workflowStep.id}
                className={`p-6 rounded-lg border-2 transition-all duration-500 ${
                  step >= workflowStep.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                    step >= workflowStep.id
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <workflowStep.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {workflowStep.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {workflowStep.description}
                    </p>
                  </div>
                </div>
                
                {step >= workflowStep.id && (
                  <div className="flex items-center text-primary-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* System Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <div key={index} className="card hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${feature.color}`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                {feature.description}
              </p>
              <Link
                href="/"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Learn More
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="card bg-gradient-to-r from-primary-50 to-primary-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Business?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              The MOLANT ICT System is designed to automate your entire business workflow, 
              reduce manual errors, and provide real-time insights into your operations.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link href="/" className="btn-primary">
                Explore Dashboard
              </Link>
              <Link href="/clients" className="btn-secondary">
                Manage Clients
              </Link>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-success-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">System Ready</h4>
            <p className="text-gray-600">All components are operational</p>
          </div>
          
          <div className="card text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-primary-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Performance</h4>
            <p className="text-gray-600">Optimized for speed and efficiency</p>
          </div>
          
          <div className="card text-center">
            <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-warning-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Real-time</h4>
            <p className="text-gray-600">Live updates and notifications</p>
          </div>
        </div>
      </main>
    </div>
  )
} 