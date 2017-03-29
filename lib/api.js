'use strict';

const th = require('tinkerhub');
const debug = th.debug('http.api');

function pickDevices(req) {
	const tags = req.params.tags;
	if(tags) {
		return th.devices.tagged.apply(th.devices, tags.split(','));
	} else {
		return th.devices.all();
	}
}

function mapResults(results) {
	return results._items.map(r => {
		const md = r.device.metadata;
		let data = {
			device: {
				id: md.id,
				name: md.name
			}
		};

		if(typeof r.error !== 'undefined') {
			data.error = th.values.toJSON('mixed', r.error instanceof Error ? r.error.toString() : r.error);
		} else {
			data.value = th.values.toJSON('mixed', r.value);
		}

		return data;
	});
}

module.exports = function(instance) {
	instance.get([ '/v1/devices', '/v1/devices/:tags' ], function(req, res) {
		const devices = pickDevices(req);
		res.json(devices.listDevices().map(device => {
			const md = device.metadata;
			return {
				id: md.id,
				name: md.name,
				tags: md.tags,
				actions: md.actions,
				state: md.state,
				events: md.events
			};
		}));
	});

	instance.get('/v1/devices/:tags/call/:action', function(req, res, next) {
		const devices = pickDevices(req);

		devices[req.params.action]
			.apply(devices)
			.then(results => {
				res.json(mapResults(results));

				next();
			})
			.catch(err => {
				debug('Could not perform given action', err);
				res.status(500).send('Could not interact with the Tinkerhub network');
				next();
			});
	});

	instance.post('/v1/devices/:tags/call/:action', function(req, res, next) {
		const devices = pickDevices(req);

		devices[req.params.action]
			.apply(devices, th.values.fromJSON('mixed', req.body))
			.then(results => {
				res.json(mapResults(results));

				next();
			})
			.catch(err => {
				debug('Could not perform given action', err);
				res.status(500).send('Could not interact with the Tinkerhub network');
				next();
			});
	});
};
