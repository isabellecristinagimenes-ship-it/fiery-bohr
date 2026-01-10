const express = require('express');
const app = express();
// Default to 3000 if PORT not in env, but log it clearly
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('HELLO WORLD - MINIMAl SERVER');
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Minimal server running on port ${PORT}`);
  console.log(`Env PORT: ${process.env.PORT}`);
  console.log(`Address: ${JSON.stringify(server.address())}`);
});
