import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  bgColor?: string;
  iconColor?: string;
}

export function StatCard({ title, value, icon: Icon, bgColor = 'bg-[#4CAF50]/10', iconColor = 'text-[#4CAF50]' }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-[#E0E0E0] hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 mb-2">{title}</p>
          <p className="text-3xl text-gray-900">{value}</p>
        </div>
        <div className={`${bgColor} p-3 rounded-xl`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}
