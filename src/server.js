const dgram = require('dgram');

const PORT = 22222;
const CLIENT_PORT = 22223;
const ADDRESS = '129.21.147.255'; // CHANGE TO YOUR NETWORK'S BROADCAST ADDRESS
// const ADDRESS = '192.168.1.255'; //Broadcast address for a lot of home routers




// trapping all sorts of different OS level process exiting signals/codes
['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS',
  'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'].forEach((element) => {
    process.on(element, () => {
      console.log('shutting down server');
      const shutdownMessage = 'WARNING: Server is shutting down';
      const shutdownBuffer = new Buffer(shutdownMessage);

      setTimeout(() => {
        process.exit(0);
      }, 2000);
    });
  });
