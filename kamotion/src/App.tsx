import React from 'react';
import Sidebar from './components/Sidebar';
import ContentArea from './components/ContentArea';
import RightSidebar from './components/RightSidebar';

function App() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <ContentArea />
      <RightSidebar />
    </div>
  );
}

export default App;
