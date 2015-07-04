Ext.define('TodoApp.store.Item', {
  	extend: 'Ext.data.Store',
  	config: {
		model: 'TodoApp.model.Item',
		autoSync: true,
		listeners: {
			load: function(store, records, successful, operation) {
				this.doWithDoc(function(doc) {
					var toadd = [];
					for (var i = 0; i < records.length; ++i) {
						if (doc.items.every(function(e) { return e.id != records[i].getData().id })) {
							toadd.push(records[i].getData());	
						}
					}
					if (toadd.length > 0) {
						doc.items = doc.items.concat(toadd);
						store.localDB.put(doc);
					}
					store.setData(doc.items);
				});
			},
			addrecords: function(store, records) {
				this.doWithDoc(function(doc) {
					var toadd = [];
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
				this.doWithDoc(function(doc) {
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
				this.doWithDoc(function(doc) {
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
  	username: 'nobody',
  	password: null,
  	doWithDoc: function(func) {
  		var me = this;

  		me.localDB.get(me.username + '_1', function (error, doc) {
			if (error) {
				// Document doesn’t exist yet. Create it.
				me.localDB.put({
					'_id': me.username + '_1',
					'name': 'list',
					'owner': me.username,
					'items': []
				}).then(function() {
					me.localDB.get(me.username + '_1', function (error, doc) {
						console.log(doc);
						func(doc);
					});
				});
			} else {
				func(doc);
			}
		});
  	}
});