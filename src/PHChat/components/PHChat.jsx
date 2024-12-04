import { ProChat } from '@ant-design/pro-chat';
import axios from 'axios';
import React from 'react';

export const PHChat = () => {
  return (
    <div style={{ backgroundColor: '#1f25331a' }}>
      <ProChat
        helloMessage={'Hello! How can I help you today?'}
        locale="en"
        request={async messages => {
          // Extract the latest message (user's input)
          const userMessage = messages[messages.length - 1];

          try {
            // Get the current URL
            const queryString = window.location.search;

            // Create an instance of URLSearchParams
            const params = new URLSearchParams(queryString);

            // Get the value of a specific parameter
            const userSessionIdValue = params.get('user_session_id');
            if (!userSessionIdValue) {
              alert(
                'Please add the following query parameter to the URL: user_session_id. for example - https://chat-qa1.web-dev.ph.augury.com/?user_session_id=12345'
              );
              return 'Sorry, missing user_session_id query parameter in the URL.';
            }
            const customerValue = params.get('customer');
            let customerId = 1;
            if(customerValue === 'sss'){
              customerId = 2;
            }
            // Call the OpenAI GPT API with the user's message
            const response = await axios.post(
              `${window.platform.servicesUrls.PH_CHAT_BASE_URL}/query?user_session_id=${userSessionIdValue}&customerId=${customerId}`,
              {
                prompt: userMessage.content,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                },
                responseType: 'json', // Ensure you're expecting JSON response
              }
            );

            // Extract response text from the API
            const assistantMessage = response?.data?.result?.output || 'Sorry, something went wrong.';

            // Return the assistant's message to the ProChat component
            return assistantMessage;
          } catch (error) {
            console.error('Error fetching GPT response:', error);
            return 'Sorry, something went wrong.';
          }
        }}
      />
    </div>
  );
};
