import { useState } from 'react';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { exportToCSV } from '@/lib/exportUtils';
import { useOccupancyTrends, useRevenueTrends, useGuestStats } from '@/hooks/useAnalytics';

type ReportType = 'occupancy' | 'revenue' | 'guests' | 'custom';
type DateRange = '7days' | '30days' | '90days' | 'custom';

export function CustomReportBuilder() {
  const [reportType, setReportType] = useState<ReportType>('occupancy');
  const [dateRange, setDateRange] = useState<DateRange>('30days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch data based on selected range
  const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90;
  const { data: occupancyData } = useOccupancyTrends(days);
  const { data: revenueData } = useRevenueTrends(days);
  const { data: guestData } = useGuestStats();

  const handleGenerate = async () => {
    setIsGenerating(true);

    // Simulate report generation delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let reportData: any = null;
    let filename = '';

    switch (reportType) {
      case 'occupancy':
        reportData = occupancyData;
        filename = `occupancy-report-${format(new Date(), 'yyyy-MM-dd')}`;
        break;
      case 'revenue':
        reportData = revenueData;
        filename = `revenue-report-${format(new Date(), 'yyyy-MM-dd')}`;
        break;
      case 'guests':
        reportData = guestData?.topGuests || [];
        filename = `guest-report-${format(new Date(), 'yyyy-MM-dd')}`;
        break;
      case 'custom':
        // Combine multiple data sources
        reportData = {
          occupancy: occupancyData,
          revenue: revenueData,
          guests: guestData,
          generatedAt: new Date().toISOString(),
        };
        filename = `custom-report-${format(new Date(), 'yyyy-MM-dd')}`;
        break;
    }

    if (reportData) {
      exportToCSV(Array.isArray(reportData) ? reportData : [reportData], filename);
    }

    setIsGenerating(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Custom Report Builder</h2>

      <div className="space-y-6">
        {/* Report Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: 'occupancy', label: 'Occupancy' },
              { value: 'revenue', label: 'Revenue' },
              { value: 'guests', label: 'Guests' },
              { value: 'custom', label: 'Custom' },
            ].map(type => (
              <button
                key={type.value}
                onClick={() => setReportType(type.value as ReportType)}
                className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                  reportType === type.value
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value as DateRange)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range Inputs */}
        {dateRange === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Metrics Selection (for custom reports) */}
        {reportType === 'custom' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Include Metrics</label>
            <div className="space-y-2">
              {[
                { id: 'occupancy', label: 'Occupancy Trends' },
                { id: 'revenue', label: 'Revenue Analytics' },
                { id: 'guests', label: 'Guest Statistics' },
                { id: 'adr', label: 'Average Daily Rate' },
                { id: 'revpar', label: 'Revenue Per Available Room' },
              ].map(metric => (
                <label key={metric.id} className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{metric.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            <p className="font-medium">Export Format</p>
            <p className="text-xs mt-1">Reports will be exported as CSV files</p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                Generate Report
              </>
            )}
          </button>
        </div>

        {/* Preview Section */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Report Preview</h3>
          <div className="text-sm text-gray-600">
            <p><strong>Type:</strong> {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</p>
            <p><strong>Period:</strong> {dateRange === 'custom' ? `${startDate} to ${endDate}` : dateRange.replace('days', ' Days')}</p>
            <p><strong>Format:</strong> CSV</p>
          </div>
        </div>
      </div>
    </div>
  );
}
