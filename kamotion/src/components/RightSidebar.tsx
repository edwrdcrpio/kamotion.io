import React from 'react';
import { authenticateGmail } from '../api/gmail';

const RightSidebar: React.FC = () => {
  const handleOptionClick = async (option: string) => {
    console.log(`Right sidebar option clicked: ${option}`);
    if (option === 'Add Inbox') {
      const user = await authenticateGmail();
      if (user) {
        console.log('Gmail inbox added successfully!', user);
        // TODO: Update application state to reflect the new inbox
      } else {
        console.log('Failed to add Gmail inbox.');
      }
    }
  };

  return (
    <div className="w-1/5 bg-gray-100 h-screen border-l border-gray-200 p-4">
      <ul>
        <li className="py-2 hover:bg-gray-200 rounded-md px-2 cursor-pointer" onClick={() => handleOptionClick('Account')}>Account</li>
        <li className="py-2 hover:bg-gray-200 rounded-md px-2 cursor-pointer" onClick={() => handleOptionClick('Add Inbox')}>Add Inbox</li>
        <li className="py-2 hover:bg-gray-200 rounded-md px-2 cursor-pointer" onClick={() => handleOptionClick('Settings')}>Settings</li>
        <li className="py-2 hover:bg-gray-200 rounded-md px-2 cursor-pointer" onClick={() => handleOptionClick('Send Feedback')}>Send Feedback</li>
        <li className="py-2 hover:bg-gray-200 rounded-md px-2 cursor-pointer" onClick={() => handleOptionClick('Help & Docs')}>Help & Docs</li>
      </ul>
    </div>
  );
};

export default RightSidebar;