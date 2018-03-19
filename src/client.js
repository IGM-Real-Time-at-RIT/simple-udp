const dgram = require('dgram');

const SERVER_PORT = 22222; 
const PORT = 22223;
const ADDRESS = '129.21.147.255'; // CHANGE TO YOUR NETWORK'S BROADCAST ADDRESS
//  const ADDRESS = '192.168.1.255'; //broadcast address for a lot of home routers

const stdin = process.stdin;
