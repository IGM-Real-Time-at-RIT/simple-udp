// import the user datagram module (udp) - dgram. This has all of the udp methods
const dgram = require('dgram');

// change port as you like
const SERVER_PORT = 22222; // port for client to listen to server on

const PORT = 22223; // port for client to send on

/**
 Broadcast address.
 The broadcast address is the address your network uses
 to send messages to everyone.
 Instead of sending a packet to each individual person
 you need to talk to, you can send one packet to
 everyone on the same network as you. That way the server
 does much less work by sending only one
 packet that everyone on your network can read.
 This is incredibly useful for LAN servers.
 NOTE: This only works on your local network.
     If it went beyond that, all of our machines would be constantly
     slammed with packets from people all over the world.
 You can look up your broadcast address with a broadcast
 address calculator online or by finding it on your machine
**/
const ADDRESS = '129.21.147.255'; // CHANGE TO YOUR NETWORK'S BROADCAST ADDRESS
//  const ADDRESS = '192.168.1.255'; //broadcast address for a lot of home routers

// Just aliasing stdin and stdout to variables.
// You could just use process.stdin and process.stdout in code anywhere
// stdin and stdout are the command line input/output just like in C++
// stdin is taking input from the command line
const stdin = process.stdin;

// Create a new udp4 socket. That is udp on IPv4. UDP on IPv6 is udp6.
// This will be our socket for sending data to the server
// reuseAddr allows you to reuse your IP/PORT combo so that
// other processes can use it
// This means you can test multiple clients on one machine,
// but it also means you could lose traffic sometimes
// especially if you are not using a broadcast or multicast
const sock = dgram.createSocket({
  reuseAddr: true,
  type: 'udp4',
});

// This will be our socket for receiving data from the server
// reuseAddr allows you to reuse your IP/PORT combo so that
// other processes can use it
// This means you can test multiple clients on one machine,
// but it also means you could lose traffic sometimes
// especially if you are not using a broadcast or multicast
const serverSock = dgram.createSocket({
  reuseAddr: true,
  type: 'udp4',
});

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
    if (err) {
     // check to see if an error was sent back to the callback
      throw err;
    }
  });
};

// set up the socket listening to the server's message event
// when the socket receives a message event,
// it will fire the callback here
// The message event sends two parameters,
// the message data and the remote client info (or just client info)
// rinfo holds all of the information about the
// client such as their ip, port, etc.
serverSock.on('message', (data, rinfo) => {
 // write out the data received converting the data buffer to a string
  console.log(`received ${data.toString()}`);
  console.dir(rinfo);
});

// Bind the udp4 socket to the server port to start listening for traffic.
// This is what actually starts the udp client listening for the server.
// You could actually put in the direct server address for the second
// argument to only listen for that address
// Once bound, the socket will listen for events and fire the event
// handlers specified such as sock.on('message') above
// Params - PORT to listen on, address to listen to
//          (optional, otherwise all addresses),
//          callback to run when server is up and running (optional).
//          Can be called as sock.bind(port); or sock.bind(port, callback);
//          or sock.bind(port, address, callback);
serverSock.bind(SERVER_PORT, '', () => {});

// Bind out sending socket to send messages to the server
// Bind the udp4 socket to the client port to start being able
// to send messages
// This is what actually starts the udp client able to send to the server
// Once bound, the socket will listen for events and fire the event handlers
// specified such as sock.on('message') above
// Params - PORT to listen on, address to listen to
//          (optional, otherwise all addresses),
//          callback to run when server is up and running (optional).
//          Can be called as sock.bind(port); or sock.bind(port, callback);
//          or sock.bind(port, address, callback);
sock.bind(PORT, '', () => {
 // once connnected tell the socket to send broadcasts.
 // This will make the packets look like broadcast packets
 // They will work as broadcast anyway in this case because
 // they are going to a broadcast address, but they won't
 // be flagged as broadcast packets unless you do this.
  sock.setBroadcast(true);

  console.log('please enter a username...\n');

 // listen for input from the command line.
 // The resume function allows the command line input
 // (stdin) to start taking input
  stdin.resume();

  let inputCounter = 0; // counter to know if we started taking in input
  let username = '';

 // when input is received from the command line input (Stdin),
 // call this function passing the data from the command line in
  stdin.on('data', (data) => {
   // check if input counter is still zero,
   // if so we'll take in a username
   // THIS IS POOR PRACTICE, but will work for the example
   // In reality, you'd want something more robust if you were
   // taking in command line input
    if (inputCounter === 0) {
     // increase input counter so it takes messages from now on instead of a username
      inputCounter++;
     // set username to data from command line
      username = data;
     // checking what the input was
      console.log(`username was ${username.toString()}`);
     // prompt the user to enter a message
      console.log('please enter a message...\n');
     // cancel out of function so it does not try to send anything
      return;
    }
    console.log('please enter a message...\n');
   // call to send a message to the server passing in whatever was typed on the command line
    sendMessage(data);
  });
});
