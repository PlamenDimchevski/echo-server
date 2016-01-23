var WebSocketServer = require('ws').Server;

function EchoServer ( options ) {
   this.history = [];                                                     // Array with all entered characters
   this.wss     = new WebSocketServer( options );                         // Initialize WebSocket.Server
   
   this.full_message = '';                                                // Store the full message string
   this.last_10secs  = '';                                                // Store the last ten minutes message string
   
   this.color_regex = /#(?:[a-f\d]{6}|[a-f\d]{3})|rgb\((?:(?:\s*\d+\s*,){2}\s*\d+|(?:\s*\d+(?:\.\d+)?%\s*,){2}\s*\d+(?:\.\d+)?%)\s*\)|rgba\((?:(?:\s*\d+\s*,){3}|(?:\s*\d+(?:\.\d+)?%\s*,){3})\s*\d+(?:\.\d+)?\s*\)|transparent|aliceblue|antiquewhite|aquamarine|aqua|azure|beige|bisque|black|blanchedalmond|blueviolet|blue|brown|burlywood5|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|goldenrod|gold|gray|greenyellow|green|grey|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|limegreen|lime|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olivedrab|olive|orangered|orange|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|whitesmoke|white|yellowgreen|yellow/gi;
   
   this.wss.on( 'connection', this.initConnection.bind( this ) );
}

EchoServer.prototype = {
   initConnection : function ( ws ) {
      var data = {
         string : this.full_message,
         cmd    : null
      };
      
      // Send the current string on every new connection
      if ( this.history.length ) {
         ws.send( JSON.stringify( data ) );
      }
      
      ws.on( 'message', this.onMessage.bind( this ) );
   },
   
   onMessage : function ( message ) {
      this.history.push({
         timestamp : Date.now(),
         char      : message
      });
      
      this.full_message = this.generateMessage();
      this.getLast10Secs();
      
      var data = {
         string : this.full_message,
         cmd    : {
            background : this.checkColor()
         }
      };
      
      // Broadcast the message to all connected to the WebSocket clients
      this.wss.clients.forEach( function ( client ) {
         client.send( JSON.stringify( data ) );
      });
   },
   
   generateMessage : function ( array ) {
      array = array || this.history;
      return array.map( message => message.char ).join('');    // ES6 style yeah
   },
   
   getLast10Secs : function () {
      // Get only the characters that has been enetered in the last 10 seconds
      // and generate string from them
      this.last_10secs = this.generateMessage(
            this.history.filter(
                  elem => ( elem.timestamp >= Date.now() - 10000 )
            )
      );
   },
   
   checkColor : function () {
      var match = this.last_10secs.match( this.color_regex );
      return match ? match.pop() : null;
   }
};

module.exports = EchoServer;