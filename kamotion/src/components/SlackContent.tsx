import React, { useState, useEffect } from 'react';
import { initializeSlack, fetchMessages } from '../api/slack';

const SlackContent: React.FC = () => {
  const [messages, setMessages] = useState([]);
  const [app, setApp] = useState(null);

  useEffect(() => {
    const loadMessages = async () => {
      const slackApp = await initializeSlack('xoxb-1234567890-PLACEHOLDER'); // Replace with a placeholder token
      setApp(slackApp)
      if (slackApp) {
        const messageData = await fetchMessages(slackApp);
        setMessages(messageData);
      }
    };

    loadMessages();
  }, []);

  return (
    <div>
      {/* Placeholder: Display the number of messages */}
      <p>Number of messages: {messages.length}</p>
      {/* TODO: Display actual message list or content */}
    </div>
  );
};

export default SlackContent;