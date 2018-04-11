// import the user datagram module (udp) - dgram.
// This has all of the udp methods
const dgram = require('dgram');

// change ports as you like
const PORT = 22222; // port for server to send on
// port for server to listen for clients on
const CLIENT_PORT = 22223;

/**
  Broadcast address. The broadcast address is the
  address your network uses to send messages to everyone
  Instead of sending a packet to each individual person
  you need to talk to, you can send one packet to
  everyone on the same network as you. That way the server
  does much less work by sending only one packet that
  everyone on your network can read. This is incredibly
  useful for LAN servers.
  NOTE: This only works on your local network.
  If it went beyond that, all of our machines would be constantly
  slammed with packets from people all over the world.
  You can look up your broadcast address with a broadcast
  address calculator online or by finding it on your machine
**/
const ADDRESS = '129.21.147.255'; // CHANGE TO YOUR NETWORK'S BROADCAST ADDRESS
// const ADDRESS = '192.168.1.255'; //Broadcast address for a lot of home routers

/**
  Create a new udp4 socket.
  That is udp on IPv4. UDP on IPv6 is udp6.
  reuseAddr allows you to reuse your IP/PORT combo
  so that other processes can use it
  This means you can test multiple clients on one machine,
  but it also means you could lose traffic sometimes
  especially if you are not using a broadcast or multicast
**/
const sock = dgram.createSocket({ reuseAddr: true, type: 'udp4' });

// function to send out a broadcast message.
// If you were not using broadcasts
// or were going across more than your local network,
// you would probably loop through a series of addresses
const sendMessage = (data) => {
  // use the udp4 socket's send method
  // Params - data to send, starting at position in data,
  //          ending at position in data, PORT to send on,
  //          address to send to, callback when completed
  sock.send(data, 0, data.length, PORT, ADDRESS, (err) => {
    // check to see if an error was sent back to the callback
    if (err) {
      throw err;
    }
  });
};

// set the udp4 socket's 'message' event to this function
// The message event sends two parameters, the message data
// and the remote client info (or just client info)
// rinfo holds all of the information about the client
// such as their ip, port, etc.
sock.on('message', (data, rinfo) => {
  // print out the data. This will be a binary buffer
  // because that's what's coming in from the network
  // When printed it will likely say buffer and give
  // you the hex encoding of the information
  console.log(data);

  // Check if the client's port was equal to the port
  // we are expecting client data on
  // If so, we will just assume the packets are for us.
  // Normally you should validate somehow.
  if (rinfo.port === CLIENT_PORT) {
    console.log('\nreceived');

    // call function to broadcast the data out to
    // everyone on the local network
    sendMessage(data);
  }

  /** This next part you wouldn't do in a real server most likely
      unless you need to modify or store information before
      sending it out. This part is just an example of converting
      from buffers to strings and back in Node
  **/

  // Get the string data from the data buffer. You can also use toJSON
  // to convert it into JSON or a valid object-oriented JS object
  const stringData = data.toString(); // also could be toJSON()
  console.log(stringData);

  // Convert that string back into a buffer by making a new Buffer
  // and passing it in.
  // The buffer class can take a string, an array or just a number
  // of bytes to allocate to memory
  // can take a string, array or just a size to allocate
  const backToBuffer = new Buffer(stringData);
  console.log(backToBuffer);
});

/**
  Bind the udp4 socket to the client port to start listening for traffic.
  This is what actually starts the udp server listening for clients
  Once bound, the socket will listen for events and fire the event handlers
  specified such as sock.on('message') above
  Params - PORT to listen on, address to listen to
  (optional, otherwise all addresses),
  callback to run when server is up and running (optional).
  Can be called as sock.bind(port); or sock.bind(port, callback);
  or sock.bind(port, address, callback);
**/
sock.bind(CLIENT_PORT, '', () => {
  // once connnected tell the socket to send broadcasts.
  // This will make the packets look like broadcast packets
  // They will work as broadcast anyway in this case because
  // they are going to a broadcast address, but they won't
  // be flagged as broadcast packets unless you do this.
  sock.setBroadcast(true);
  console.log(`listening on port ${PORT}\n`);
});

// trapping all sorts of different OS level process exiting signals/codes
['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS',
  'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'].forEach((element) => {
    process.on(element, () => {
      console.log('shutting down server');
      const shutdownMessage = 'WARNING: Server is shutting down';
      const shutdownBuffer = new Buffer(shutdownMessage);
      sendMessage(shutdownBuffer);
      setTimeout(() => {
        process.exit(0);
      }, 2000);
    });
  });
