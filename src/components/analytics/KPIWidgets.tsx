import { TrendingUp, TrendingDown, DollarSign, Users, Home, Clock } from 'lucide-react';
import { useKPIData } from '@/hooks/useAnalytics';

export function KPIWidgets() {
  const { data: kpiData, isLoading } = useKPIData();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const widgets = [
    {
      title: 'Occupancy Rate',
      value: `${kpiData?.occupancyRate.toFixed(1)}%`,
      subtext: `${kpiData?.occupiedRooms}/${kpiData?.totalRooms} rooms occupied`,
      icon: Home,
      color: 'blue',
      trend: kpiData && kpiData.occupancyRate >= 70 ? 'up' : 'down',
    },
    {
      title: "Today's Revenue",
      value: `$${kpiData?.todayRevenue.toLocaleString()}`,
      subtext: 'From all payments today',
      icon: DollarSign,
      color: 'green',
      trend: 'up',
    },
    {
      title: 'Check-ins Today',
      value: kpiData?.todayCheckIns || 0,
      subtext: `${kpiData?.pendingCheckIns || 0} pending`,
      icon: Users,
      color: 'purple',
      trend: null,
    },
    {
      title: 'Check-outs Today',
      value: kpiData?.todayCheckOuts || 0,
      subtext: 'Completed departures',
      icon: Clock,
      color: 'orange',
      trend: null,
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {widgets.map((widget, index) => {
        const Icon = widget.icon;
        const colorClass = colorClasses[widget.color as keyof typeof colorClasses];

        return (
          <div key={index} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${colorClass}`}>
                <Icon className="h-6 w-6" />
              </div>
              {widget.trend && (
                <div className={`flex items-center ${widget.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {widget.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{widget.title}</p>
              <p className="text-3xl font-bold text-gray-900">{widget.value}</p>
              <p className="text-sm text-gray-500 mt-2">{widget.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
