import Pusher from "pusher-js" // Importing Pusher for real-time communication
import { useState, useEffect, useRef } from "react" // Importing React's useState hook for managing state

export default function Chat() {
  const [isChatOpen, setIsChatOpen] = useState(false) // State to manage chat visibility
  const [unreadCount, setUnreadCount] = useState(0) // State to manage unread messages count
  const [socketId, setSocketId] = useState() // State to manage socket ID
  const [messageLog, setMessageLog] = useState ([]) // State to manage message log
  const [userMessage, setUserMessage] = useState("")
  const chatField = useRef(null) // Ref to manage focus on the input field
  const chatLogElement = useRef(null) // Ref to manage scroll position in the chat log

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHERKEY, {
      cluster: "eu" // Pusher cluster
    })

    pusher.connection.bind("connected", () => {
      setSocketId(pusher.connection.socket_id) // Set socket ID when connected
    })

    const channel = pusher.subscribe("private-petchat") // Subscribe to the private channel
    channel.bind("message", data => {
      setMessageLog(prev => [...prev, data]) // Append new message to the message log
    })
  }, [])

  useEffect( () => {
    if (messageLog.length) {
      chatLogElement.current.scrollTop = chatLogElement.current.scrollHeight // Scroll to the bottom of the chat log when a new message is added
      if (!isChatOpen) {
        setUnreadCount(prev => prev + 1) // Increment unread messages count if chat is not open
  
      }
    }
    
  }, [messageLog])

  function openChatClick() {
    setIsChatOpen(true) // Set chat to open when clicked
    setUnreadCount(0) // Reset unread messages count to 0 when chat is opened
    setTimeout(() => {
      chatField.current.focus() // Focus on the input field after a short delay
    }, 350)
  }

  function closeChatClick() {
    setIsChatOpen(false) // Set chat to close when clicked
  }

  function handleChatSubmit(e) { // Function to handle chat submission
    e.preventDefault() // Prevent default form submission behavior
    fetch("/admin/send-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json" // Set content type to JSON
      },
      body: JSON.stringify({ message: userMessage.trim(), socket_id: socketId }) // Send message and socket ID in the request body
    })
    setMessageLog(prev => [...prev, {selfMessage: true, message: userMessage.trim()}]) // Append user message to the message log
    setUserMessage("") // Clear the input field after submission
  }

  function handleInputChange(e) {
    setUserMessage(e.target.value) // Update user message state on input change
  }

  return (
    <>
      <div className="open-chat" onClick={openChatClick}>
        {unreadCount > 0 && <span className="chat-unread-badge">{unreadCount}{/* Display unread messages count */}</span>}

        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-chat-text-fill" viewBox="0 0 16 16">
          <path d="M16 8c0 3.866-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7M4.5 5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1z" />
        </svg>
        
      </div>

      <div className={isChatOpen ? "chat-container chat-container--visible" : "chat-container"}> {/* Conditional className based on isChatOpen state */}

        <div className="chat-title-bar">
          <h4>Staff Team Chat</h4>
          <svg onClick={closeChatClick} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-square-fill" viewBox="0 0 16 16">
            <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm3.354 4.646L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 1 1 .708-.708" />
          </svg>
        </div>

        <div ref={chatLogElement} className="chat-log">

          {messageLog.map((item, index) => {
            return (
              <div key={index} className={item.selfMessage ? "chat-message chat-message--self" : "chat-message"}>
                <div className="chat-message-inner">{item.message}</div>
              </div>
            )
          })}

        </div>

        <form onSubmit={handleChatSubmit}>
          <input value={userMessage} ref={chatField} onChange={handleInputChange} type="text" autoComplete="off" placeholder="Your message here" />
        </form>

      </div>
    </>
  )
}