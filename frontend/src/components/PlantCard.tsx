import { Droplet, Sun, Leaf } from 'lucide-react';
import { Plant } from '../lib/mock-data';

interface PlantCardProps {
  plant: Plant;
  onClick?: () => void;
}

export function PlantCard({ plant, onClick }: PlantCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl overflow-hidden border border-[#E0E0E0] hover:shadow-lg transition-all cursor-pointer group"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={plant.image}
          alt={plant.commonName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="p-4">
        <h3 className="text-gray-900 mb-1">{plant.commonName}</h3>
        <p className="text-xs text-gray-500 italic mb-3">{plant.latinName}</p>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Sun className="h-4 w-4 text-yellow-500" />
            <span>{plant.season}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Droplet className="h-4 w-4 text-blue-500" />
            <span>{plant.watering}</span>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-[#E0E0E0]">
          <div className="flex items-center gap-2 text-[#4CAF50]">
            <Leaf className="h-4 w-4" />
            <span className="text-xs">Voir les détails</span>
          </div>
        </div>
      </div>
    </div>
  );
}
