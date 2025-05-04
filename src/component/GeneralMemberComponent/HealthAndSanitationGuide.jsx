import { useState, useRef, useEffect } from 'react';
import SendIcon from '@mui/icons-material/Send';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CircularProgress from '@mui/material/CircularProgress';
import styled from '@emotion/styled';

const HealthAndSanitationGuide = () => {
    const [messages, setMessages] = useState([
        { text: "Hello! I'm your Health & Sanitation Assistant. How can I help you today?", sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const API_URL = 'https://health-and-sanitation-backend.vercel.app/chat'; // Replace with your actual API endpoint

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;
      
        // Add user message
        const userMessage = { text: inputValue, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
      
        try {
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: inputValue })
          });
      
          if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
          }
      
          const data = await response.json();
          
          if (!data.reply) {
            throw new Error('Empty response from API');
          }
      
          setMessages(prev => [...prev, { 
            text: data.reply, 
            sender: 'bot' 
          }]);
          
        } catch (error) {
          console.error('Chat Error:', error);
          setMessages(prev => [...prev, { 
            text: "I'm having trouble connecting to the health assistant. Please try again later.", 
            sender: 'bot' 
          }]);
        } finally {
          setIsLoading(false);
        }
      };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <ChatContainer>
                <ChatHeader>
                    <SmartToyOutlinedIcon style={{ color: '#fff', marginRight: '10px' }} />
                    <h3 style={{ color: '#fff', margin: 0 }}>Health & Sanitation Assistant</h3>
                </ChatHeader>
                
                <ChatMessages>
                    {messages.map((msg, index) => (
                        <Message key={index} sender={msg.sender}>
                            <MessageContent sender={msg.sender}>
                                {msg.sender === 'bot' ? (
                                    <SmartToyOutlinedIcon style={{ marginRight: '8px', color: '#008e48' }} />
                                ) : (
                                    <PersonOutlineIcon style={{ marginRight: '8px', color: '#0A3B1E' }} />
                                )}
                                {msg.text}
                            </MessageContent>
                        </Message>
                    ))}
                    {isLoading && (
                        <Message sender="bot">
                            <MessageContent sender="bot">
                                <SmartToyOutlinedIcon style={{ marginRight: '8px', color: '#008e48' }} />
                                <CircularProgress size={16} style={{ color: '#008e48', marginRight: '8px' }} />
                                Thinking...
                            </MessageContent>
                        </Message>
                    )}
                    <div ref={messagesEndRef} />
                </ChatMessages>
                
                <ChatInputContainer>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about health, sanitation, hygiene..."
                        disabled={isLoading}
                    />
                    <SendButton onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
                        <SendIcon style={{ color: '#fff' }} />
                    </SendButton>
                </ChatInputContainer>
            </ChatContainer>
        </div>
    );
};

// Styled components
const ChatContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 600px;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
`;

const ChatHeader = styled.div`
    background-color: #008e48;
    padding: 16px 20px;
    display: flex;
    align-items: center;
`;

const ChatMessages = styled.div`
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background-color: #f9f9f9;
    display: flex;
    flex-direction: column;
    gap: 15px;
`;

const Message = styled.div`
    display: flex;
    justify-content: ${props => props.sender === 'user' ? 'flex-end' : 'flex-start'};
`;

const MessageContent = styled.div`
    max-width: 80%;
    padding: 12px 16px;
    border-radius: 18px;
    background-color: ${props => props.sender === 'user' ? '#0A3B1E' : '#e5f5eb'};
    color: ${props => props.sender === 'user' ? '#fff' : '#333'};
    display: flex;
    align-items: center;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    word-break: break-word;
    line-height: 1.4;
`;

const ChatInputContainer = styled.div`
    display: flex;
    padding: 15px;
    background-color: #fff;
    border-top: 1px solid #eee;

    input {
        flex: 1;
        padding: 12px 16px;
        border: 1px solid #ddd;
        border-radius: 24px;
        outline: none;
        font-size: 16px;
        transition: all 0.3s;

        &:focus {
            border-color: #008e48;
            box-shadow: 0 0 0 2px rgba(0, 142, 72, 0.2);
        }
    }
`;

const SendButton = styled.button`
    margin-left: 12px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: #008e48;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover {
        background-color: #0A3B1E;
        transform: scale(1.05);
    }

    &:disabled {
        background-color: #ccc;
        cursor: not-allowed;
        transform: none;
    }
`;

export default HealthAndSanitationGuide;