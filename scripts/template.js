/* global Promise, Handlebars */
/* eslint no-var:0 */
'use strict';

function addScript(url) {
	return new Promise(function (resolve, reject) {
		var script = document.createElement('script');
		script.setAttribute('src', url);
		document.head.appendChild(script);
		script.onload = resolve;
		script.onerror = reject;
	});
}

function isOk(response) {
	if (!response.ok) {
		return Promise.resolve(response)
			.then(getBody)
			.then(parseHTML)
			.then(function (range) {
				var message = range.querySelector('#message');
				throw Error(message.textContent || ('Bad response: ' + response.statusText + ' (' + response.status + ')'));
			});
	}
	return response;
}

function getJSON(response) {
	return response.json();
}

function getBody(response) {
	return response.body();
}

function parseHTML(string) {
	return document.createRange().createContextualFragment(string);
}

var currentScript = document.currentScript || (function () {
	var scripts = document.getElementsByTagName( 'script' );
	return scripts[ scripts.length - 1 ];
} ());

document.addEventListener('DOMContentLoaded', function () {

	// Load the template and the contents
	var self = this;
	Promise.all([
		fetch(self.src).then(isOk).then(getJSON),
		!(Handlebars.templates && Handlebars.templates[self.template]) ? addScript('scripts/compiled-templates/' + self.template + '.js') : Promise.resolve()
	])
	.then(function (args) {
		var json = args[0].reverse().splice(0, self.max ? Number(self.max) : Infinity);
		self.parentNode.innerHTML = Handlebars.templates[self.template]({ items: json });
	})
	.catch(function (e) {
		console.log(e);
	});
}.bind({
	src: currentScript.getAttribute('data-src'),
	max: currentScript.getAttribute('data-max'),
	parentNode: currentScript.parentNode,
	template: currentScript.getAttribute('data-template')
}));
