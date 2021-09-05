const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const api = require('./routes/api');

// express is a fancy listener func for our built in node http server
// the listen from app.listen is the same as the server.listen
const app = express();

// parse json from the incoming req
app.use(
	cors({
		origin: 'http://localhost:3000',
	})
);

app.use(morgan('combined'));

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// we can support multiple versions
app.use('/v1', api);
// app.use('/v2',v2Router)

app.get('/*', (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;
