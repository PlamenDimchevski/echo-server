window.EchoConnection = (function () {
   
   var callbacks;
   
   function EchoConnection ( ws_location ) {
      
      /*------------- DOM Elements references --------------------------------*/
      this.container = document.getElementById( 'main-container');
      this.input     = document.getElementById( 'input' );
      this.output    = document.getElementById( 'output' );
      this.status    = document.getElementById( 'status' );
      this.alert_box = document.getElementById( 'alert-box' );
      
      this.ws_location = ws_location || 'ws://127.0.0.1:1337';     // WebSocket server address
      this.connection  = null;                                     // WebSocket.Client instance
      this.interval    = null;                                     // The value of setInterval
      this.period      = 3000;                                     // The time on which the client would try to connect
                                                                   // to the server when the connection is down
      
      init.call( this );
   }
   
   // Initialize the WebSocket connection
   function init () {
      // Check if the browser supports WebSockets
      if ( ! 'WebSocket' in window ) {
         this.alert_box.style.display = 'block';
         this.alert_box.innerHTML = "Your browser doesn't support WebSockets. Please try to open this page with a newer browser."
         return;
      }
      
      try {
         // Open WebSocket connection
         this.connection = new WebSocket( this.ws_location );
      } catch ( e ) {
         console.log( e.message );
      }
      
      clearInterval( this.interval );
      this.container.style.display = 'block';
      
      initCallbacks.call( this );
      initEvents.call( this );
   }
   
   // Initialize callback functions
   function initCallbacks () {
      callbacks = {
         open            : open.bind( this ),
         close           : close.bind( this ),
         receiveMessage  : receiveMessage.bind( this ),
         sendMessage     : sendMessage.bind( this ),
         closeConnection : closeConnection.bind( this )
      }
   }
   
   // Initialize all needed events
   function initEvents () {
      // Add WebSocket event listeners
      this.connection.addEventListener( 'open', callbacks.open );
      this.connection.addEventListener( 'close', callbacks.close );
      this.connection.addEventListener( 'message', callbacks.receiveMessage );
      
      // Close the WebSocket connection on window unload because Firefox
      // https://bugzilla.mozilla.org/show_bug.cgi?id=712329
      window.addEventListener( 'beforeunload', callbacks.closeConnection );
   }
   
   // Executes when we are connected successfully to the server
   function open () {
      resetFields.call( this );
      
      this.status.innerHTML = 'Connected';
      this.status.classList.remove( 'disconnected' );
      this.status.classList.add( 'connected' );
      this.input.addEventListener( 'keypress', callbacks.sendMessage );
      
      // Enable the input field
      this.input.disabled = false;
      this.input.focus();
   }
   
   // Handles 'close' event of the WebSocket
   function close ( connection ) {
      this.status.innerHTML = 'Disconnected';
      this.status.classList.remove( 'connected' );
      this.status.classList.add( 'disconnected' );
      this.input.removeEventListener( 'keypress', callbacks.sendMessage );
      window.removeEventListener( 'beforeunload', callbacks.closeConnection );
      
      // Disable the input field
      this.input.disabled = true;
      
      // Try to reconnect
      this.interval = setInterval( init.bind( this ), this.period );
   }
   
   // Executes on every new message received from the server
   function receiveMessage ( message ) {
      try {
         // Parse the received 'message' object
         message = JSON.parse( message.data );
      } catch ( e ) {
         console.error( e.message );
      }
      
      // Set the message as output field value
      // Parse the value `toString` because Safari
      this.output.innerHTML = message.string.toString();
      
      // Check for a received command
      if ( message.cmd ) {
         document.body.style.background = message.cmd.background;
      }
   }
   
   // Send message to the WebSocket server
   function sendMessage ( event ) {
      // Use `charCode` property to get the character code (because Firefox)
      var code = event.charCode || event.keyCode;
      
      // Send to the WebSocket server the entered character
      this.connection.send( String.fromCharCode( code ) );
      this.input.value = '';
   }
   
   // Clear the values of the input and output text fields
   function resetFields () {
      this.input.value = '';
      this.output.value = '';
   }
   
   // Manually close the WebSocket connection
   function closeConnection () {
      this.connection.close();
   }
   
   EchoConnection.prototype = {
      getWebSocketAddress : function () {
         return this.ws_location;
      }
   };
   
   return EchoConnection;
   
})();