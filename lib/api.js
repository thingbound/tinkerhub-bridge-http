'use strict';

const th = require('tinkerhub');
const debug = require('debug')('th:bridge:http');
const values = require('abstract-things/values');

function pickThings(req) {
	const tags = req.params.tags;
	if(tags) {
		return th.get(...tags.split(','));
	} else {
		return th.all();
	}
}

function mapResults(results) {
	return results.toArray().map(r => {
		const md = r.source.metadata;
		let data = {
			thing: {
				id: md.id,
				name: md.name
			},
			isFulfilled: r.isFulfilled,
			isRejected: r.isRejected
		};

		if(r.isRejected) {
			data.error = values.toJSON('mixed', r.reason instanceof Error ? r.reason.message : r.reason);
		} else {
			data.value = values.toJSON('mixed', r.value);
		}

		return data;
	});
}

module.exports = function(instance) {
	instance.get([ '/v1/things', '/v1/things/:tags' ], function(req, res) {
		const things = pickThings(req);
		res.json(things.toArray().map(thing => {
			const md = thing.metadata;
			return {
				id: md.id,
				name: md.name,
				tags: Array.from(md.tags),
				actions: md.actions,
				state: md.state,
				events: md.events
			};
		}));
	});

	instance.get('/v1/things/:tags/call/:action', function(req, res, next) {
		const things = pickThings(req);

		things[req.params.action]()
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

	instance.post('/v1/things/:tags/call/:action', function(req, res, next) {
		const things = pickThings(req);

		things[req.params.action](...values.fromJSON('mixed', req.body))
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
