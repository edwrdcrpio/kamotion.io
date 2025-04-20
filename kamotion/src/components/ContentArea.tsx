import React from 'react';
import EmailContent from './EmailContent';
import AIChatbotContent from './AIChatbotContent';
import NotesContent from './NotesContent';
import SlackContent from './SlackContent'; // Import SlackContent

const ContentArea: React.FC = () => {
  const selectedChannel = 'slack'; // Hardcoded for testing Slack content

  let content;
  switch (selectedChannel) {
    case 'email':
      content = <EmailContent />;
      break;
    case 'ai_chatbot':
      content = <AIChatbotContent />;
      break;
    case 'notes':
      content = <NotesContent />;
      break;
    case 'slack': // Add case for Slack
      content = <SlackContent />;
      break;
    default:
      content = <div>Select a channel</div>;
  }

  return (
    <div className="flex-1 bg-white h-screen">
      {content}
    </div>
  );
};

export default ContentArea;