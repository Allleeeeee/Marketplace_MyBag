// import React, { useEffect, useState } from 'react';
// import io from 'socket.io-client';

// const socket = io('http://localhost:5000'); // Убедитесь, что адрес соответствует вашему серверу

// const Chat = () => {
//     const [messages, setMessages] = useState([]);
//     const [messageInput, setMessageInput] = useState('');

//     useEffect(() => {
//         socket.on('receiveMessage', (message) => {
//             setMessages((prevMessages) => [...prevMessages, message]);
//         });

//         return () => {
//             socket.off('receiveMessage');
//         };
//     }, []);

//     const sendMessage = () => {
//         const senderId = 1; // ID текущего пользователя
//         const receiverId = 2; // ID пользователя, которому отправляется сообщение

//         socket.emit('sendMessage', { senderId, receiverId, content: messageInput });
//         setMessageInput('');
//     };

//     return (
//         <div>
//             <div>
//                 {messages.map((msg, index) => (
//                     <div key={index}>
//                         <strong>User {msg.senderId}:</strong> {msg.content}
//                     </div>
//                 ))}
//             </div>
//             <input
//                 type="text"
//                 value={messageInput}
//                 onChange={(e) => setMessageInput(e.target.value)}
//                 placeholder="Type your message..."
//             />
//             <button onClick={sendMessage}>Send</button>
//         </div>
//     );
// };

// export default Chat;