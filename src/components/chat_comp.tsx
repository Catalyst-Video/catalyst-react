import React from 'react';
import Sidebar from 'react-sidebar';
import Draggable from 'react-draggable';

const chatStyles = {
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  sidebar: {
    zIndex: 2,
    position: 'absolute',
    top: 0,
    bottom: 0,
    transition: 'transform .3s ease-out',
    WebkitTransition: '-webkit-transform .3s ease-out',
    willChange: 'transform',
    overflowY: 'auto',
    background: 'white',
  },
  content: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    transition: 'left .3s ease-out, right .3s ease-out',
  },
  overlay: {
    zIndex: 0,
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    visibility: 'hidden',
    transition: 'opacity .3s ease-out, visibility .3s ease-out',
    backgroundColor: 'none',
  },
  dragHandle: {
    zIndex: 1,
    position: 'fixed',
    top: 0,
    bottom: 0,
  },
};

const ChatComponent = ({ showChat }: { showChat: boolean }) => {
  return (
    // <Sidebar
    //   sidebar={
    <div id="chat-entire" className={showChat ? '' : 'hide-chat'}>
      <div id="chat-zone">
        <div className="chat-messages"></div>
        <div id="chat-end" style={{ visibility: 'hidden' }}></div>
      </div>
      <textarea
        className="chat-compose"
        placeholder="Send Message"
        rows={2}
      ></textarea>
    </div>
    //   }
    //   open={showChat}
    //   docked={true}
    //   pullRight={true}
    //   onSetOpen={() => console.log('open')}
    //   styles={chatStyles}
    //   shadow={false}
    // ></Sidebar>

    // <Draggable>
    //   <div id="entire-chat" className={showChat ? '' : 'hide-chat'}>
    //     <div id="chat-zone">
    //       <div className="chat-messages"></div>
    //       <div id="chat-end" style={{ visibility: 'hidden' }}>
    //         end
    //       </div>
    //     </div>
    //     <textarea
    //       className="compose"
    //       placeholder="Send Message"
    //       rows={2}
    //     ></textarea>
    //   </div>
    // </Draggable>
  );
};

export default ChatComponent;
