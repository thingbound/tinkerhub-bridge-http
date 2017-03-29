'use strict';

const th = require('tinkerhub');
const debug = th.debug('http');
const express = require('express');
const bodyParser = require('body-parser');

const instance = express();

instance.use(bodyParser.json());

require('./api')(instance);

const httpServer = instance.listen(10000);
const port = httpServer.address().port;

debug('Started at port ' + port);
