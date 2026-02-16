import { useState } from 'react';
import { BarChart3, TrendingUp, Users, FileText, RefreshCw } from 'lucide-react';
import { KPIWidgets } from '@/components/analytics/KPIWidgets';
import { OccupancyAnalytics } from '@/components/analytics/OccupancyAnalytics';
import { RevenueAnalytics } from '@/components/analytics/RevenueAnalytics';
import { GuestAnalytics } from '@/components/analytics/GuestAnalytics';
import { CustomReportBuilder } from '@/components/analytics/CustomReportBuilder';

type TabType = 'overview' | 'occupancy' | 'revenue' | 'guests' | 'reports';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const handleRefresh = () => {
    setLastRefreshed(new Date());
    window.location.reload();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'occupancy', label: 'Occupancy', icon: TrendingUp },
    { id: 'revenue', label: 'Revenue', icon: BarChart3 },
    { id: 'guests', label: 'Guests', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Last refreshed: {lastRefreshed.toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`
                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon
                    className={`
                      -ml-0.5 mr-2 h-5 w-5
                      ${activeTab === tab.id
                        ? 'text-blue-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                      }
                    `}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <KPIWidgets />
            
            {/* Quick Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab('occupancy')}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                  >
                    → View Occupancy Trends
                  </button>
                  <button
                    onClick={() => setActiveTab('revenue')}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                  >
                    → Analyze Revenue
                  </button>
                  <button
                    onClick={() => setActiveTab('guests')}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                  >
                    → Guest Insights
                  </button>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                  >
                    → Generate Reports
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Indicators</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Occupancy Target</span>
                      <span className="text-sm font-medium text-gray-900">75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Revenue Target</span>
                      <span className="text-sm font-medium text-gray-900">80%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Guest Satisfaction</span>
                      <span className="text-sm font-medium text-gray-900">90%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">ADR</span>
                    <span className="text-sm font-medium text-gray-900">$120.50</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">RevPAR</span>
                    <span className="text-sm font-medium text-gray-900">$85.75</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Stay</span>
                    <span className="text-sm font-medium text-gray-900">3.2 nights</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Repeat Rate</span>
                    <span className="text-sm font-medium text-gray-900">35%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'occupancy' && <OccupancyAnalytics />}
        {activeTab === 'revenue' && <RevenueAnalytics />}
        {activeTab === 'guests' && <GuestAnalytics />}
        {activeTab === 'reports' && <CustomReportBuilder />}
      </div>
    </div>
  );
}
