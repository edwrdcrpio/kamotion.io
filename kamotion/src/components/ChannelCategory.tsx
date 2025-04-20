import React from 'react';

interface ChannelCategoryProps {
  title: string;
}

const ChannelCategory: React.FC<ChannelCategoryProps> = ({ title }) => {
  return (
    <h3 className="text-base font-medium mt-2 mb-1">{title}</h3>
  );
};

export default ChannelCategory;