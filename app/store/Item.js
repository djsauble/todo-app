Ext.define('TodoApp.store.Item', {
  	extend: 'Ext.data.Store',
  	config: {
		model: 'TodoApp.model.Item',
		autoSync: true,
		listeners: {
			load: function(store, records, successful, operation) {
				store.localDB.get('1').then(function (doc) {
					// Add all documents to the store
					store.setData(doc.items);
				});
			},
			addrecords: function(store, records) {
				var toadd = [];
				// Get the document from the remote store
				store.localDB.get('1').then(function (doc) {
					for (var i = 0; i < records.length; ++i) {
						if (doc.items.every(function(e) { return e.id != records[i].getData().id })) {
							toadd.push(records[i].getData());	
						}
					}
					if (toadd.length > 0) {
						doc.items = doc.items.concat(toadd);
						store.localDB.put(doc);
					}
				});
			},
			removerecords: function(store, records, indices) {
				store.localDB.get('1').then(function (doc) {
					for (var i = 0; i < records.length; ++i) {
						doc.items = doc.items.filter(function(e) { return e.id != records[i].getData().id; });
					}
					store.localDB.put(doc);
				});
			},
			updaterecord: function(store, record, newIndex, oldIndex, modifiedFieldNames, modifiedValues) {
				if (modifiedFieldNames.length == 0) {
					// No changes, don’t bother updating the list
					return;
				}
				store.localDB.get('1').then(function (doc) {
					doc.items = doc.items.map(function(e) {
						if (e.id == record.getData().id) {
							return record.getData();
						} else {
							return e;	
						}
					});
					store.localDB.put(doc);
				});
			}
		}
  	},
  	remoteDB: null,
  	localDB: null,
	initialize: function() {
		var me = this;

		me.remoteDB = new PouchDB('https://ingleyourndingsterichema:6UC6w2bteE3Fqi1bnRMVFYco@djsauble.cloudant.com/lists');
		me.localDB = new PouchDB('lists');

		me.localDB.sync(me.remoteDB, {
			live: true,
			retry: true
		}).on('change', function (change) {
			if (change.direction == "pull" && change.change.docs.length > 0) {
				console.log("Change occurred. Synchronizing.");
				me.load();
			}
		}).on('paused', function (info) {
		}).on('active', function (info) {
		}).on('error', function (err) {
		});
	}
});