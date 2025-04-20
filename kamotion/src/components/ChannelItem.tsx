import React from 'react';
import { Dot } from 'lucide-react'; // Assuming you have lucide-react for icons

interface ChannelItemProps {
  name: string;
  icon?: string;
  notifications?: number;
}

const ChannelItem: React.FC<ChannelItemProps> = ({ name, icon, notifications }) => {
  return (
    <div className="flex items-center justify-between py-2 px-2 hover:bg-gray-100 rounded-md">
      <div className="flex items-center">
        {icon && <img src={icon} alt={name} className="w-5 h-5 mr-2" />}
        <span className="text-sm">{name}</span>
      </div>
      {notifications && notifications > 0 && (
        <div className="flex items-center">
          <Dot className="text-blue-500" />
          <span className="text-xs text-gray-500 ml-1">{notifications}</span>
        </div>
      )}
    </div>
  );
};

export default ChannelItem;