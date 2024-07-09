import React, { useState } from 'react';
import axios from 'axios';
import './ChatInterface.css';

const ChatInterface = () => {
  const [inputText, setInputText] = useState('');
  const [oosNotHandledChat, setOosNotHandledChat] = useState([]);
  const [oosHandledChat, setOosHandledChat] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = { type: 'user', content: inputText };
    setOosNotHandledChat(prev => [...prev, newMessage]);
    setOosHandledChat(prev => [...prev, newMessage]);

    try {
      // OOS Not Handled API call
      const oosNotHandledResponse = await axios.post('http://127.0.0.1:5000/raw-query', { query_text: inputText });
      const oosNotHandledMessage = { type: 'bot', content: oosNotHandledResponse.data.response.response };
      setOosNotHandledChat(prev => [...prev, oosNotHandledMessage]);

      // Only after receiving the response from the first API, send request to the second API
      const oosHandledResponse = await axios.post('http://127.0.0.1:5000/query-rag', { query_text: inputText });
      const oosHandledMessage = { type: 'bot', content: oosHandledResponse.data.response.response };
      setOosHandledChat(prev => [...prev, oosHandledMessage]);
    } catch (error) {
      console.error('Error fetching response:', error);
      // You might want to add error messages to the chat windows here
    }

    setInputText('');
  };

  const renderChatWindow = (title, chatMessages) => (
    <div className="chat-window">
      <h2>{title}</h2>
      <div className="chat-messages">
        {chatMessages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            {msg.content}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="chat-container">
      <div className="chat-windows">
        {renderChatWindow("OOS Not Handled Chat", oosNotHandledChat)}
        {renderChatWindow("OOS Handled Chat", oosHandledChat)}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type here"
        />
        <button onClick={handleSubmit}>Send</button>
      </div>
    </div>
  );
};

export default ChatInterface;