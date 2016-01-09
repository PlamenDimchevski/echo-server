(function(){
   var input = document.getElementsByName( 'input' )[0];
   var output = document.getElementsByName( 'output' )[0];
   
   var connection;
   var ws_location = 'ws://127.0.0.1:1337';           // WebSocket server address
   var interval;
   var period = 3000;
   
   function initWebSocket ( ws_location ) {
      connection = new WebSocket( ws_location );
      clearInterval( interval );
      
      connection.addEventListener( 'open', function () {
         input.addEventListener( 'keypress', sendCharacter );
      });
      
      
      connection.addEventListener( 'message', function ( message ) {
         // Parse the received 'message' object
         message = JSON.parse( message.data );
         
         // Resize the output input field if the message is bigger than it
         if ( output.size <= message.string.length ) {
            output.size = message.string.length;
         }
         
         output.value = message.string;
         
         if ( message.cmd ) {
            document.body.style.background   = message.cmd.background;
         }
      });
      
      // Add listener for WebSocket exit
      connection.addEventListener( 'close', function ( connection ) {
         input.removeEventListener( 'keypress', sendCharacter );
         
         // Try to reconnect
         interval = setInterval( function () {
            initWebSocket( connection.target.url );
         }, period );
      });
   };
   
   initWebSocket( ws_location );
   
   function sendCharacter ( event ) {
      // Send to the WebSocket server the entered character
      connection.send( String.fromCharCode( event.keyCode ) );
      this.value = '';
   }
})();