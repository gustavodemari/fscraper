// This is a template for a Node.js scraper on morph.io (https://morph.io)

const osmosis = require('osmosis');
var request = require("request");
var sqlite3 = require("sqlite3").verbose();

const URL = new Buffer('aHR0cDovL2ZvcnVtLmxvbGVzcG9ydGUuY29tLw==', 'base64').toString('ascii')

function initDatabase(callback) {
	// Set up sqlite database.
	var db = new sqlite3.Database("data.sqlite");
	db.serialize(function() {
		db.run("CREATE TABLE IF NOT EXISTS data (value TEXT, time TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
		callback(db);
	});
}

function updateRow(db, value) {
	// Insert some data.
	var statement = db.prepare("INSERT INTO data(value) VALUES (?)");
	statement.run(value);
	statement.finalize();
}

function readRows(db) {
	// Read some data.
	db.each("SELECT rowid AS id, value FROM data", function(err, row) {
		console.log(row.id + ": " + row.value);
	});
}

function fetchPage(url, callback) {
	// Use request to read in pages.
	request(url, function (error, response, body) {
		if (error) {
			console.log("Error requesting page: " + error);
			return;
		}

		callback(body);
	});
}

function run(db) {

	osmosis
	.get(URL)
	.set({'forum_title': ['.forumtitle']})
	.set({'forum_stats': ['.stats-wrapper']})
	.data(function(data){
		updateRow(db, JSON.stringify(data));
	})
	.done(function(){
		db.close();
	})
}

initDatabase(run);
