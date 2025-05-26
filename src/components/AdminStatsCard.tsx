interface AdminStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function AdminStatsCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  className = '' 
}: AdminStatsCardProps) {
  return (
    <div className={`bg-white p-6 rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs. mês anterior</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4">
            <div className="p-3 rounded-lg bg-gray-100">
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 