import React, { useState, useEffect } from 'react';
import { authenticateGmail, fetchEmails } from '../api/gmail';

const EmailContent: React.FC = () => {
  const [emails, setEmails] = useState([]);

  useEffect(() => {
    const loadEmails = async () => {
      // For now, we're skipping authentication and directly fetching emails
      // In a real app, you'd likely have an authentication check here
      // const authClient = await authenticateGmail();
      // if (authClient) {
      const emailData = await fetchEmails();
      setEmails(emailData);
      // }
    };

    loadEmails();
  }, []);

  return (
    <div>
      {/* Placeholder: Display the number of emails */}
      <p>Number of emails: {emails.length}</p>
      {/* TODO: Display actual email list or content */}
    </div>
  );
};

export default EmailContent;