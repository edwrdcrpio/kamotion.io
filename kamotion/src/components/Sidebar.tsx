import React from 'react';
import ChannelList from './ChannelList';

const Sidebar: React.FC = () => {
  return (
    <div className="w-1/4 bg-white h-screen border-r border-gray-200">
      <ChannelList />
    </div>
  );
};

export default Sidebar;