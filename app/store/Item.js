Ext.define('TodoApp.store.Item', {
 	extend: 'Ext.data.Store',
  	config: {
		model: 'TodoApp.model.Item',
		autoSync: true,
		listeners: {
			load: 'onLoad',
			addrecords: 'onAddRecords',
			removerecords: 'onRemoveRecords',
			updaterecord: 'onUpdateRecord'
		}
  	},
  	remoteMetaDB: null,
  	remoteTextDB: null,
  	remoteMapsDB: null,
  	remoteImagesDB: null,
  	localMetaDB: null,
  	localTextDB: null,
  	localMapsDB: null,
  	localImagesDB: null,
  	username: 'nobody',
  	password: null,
  	currentListId: null,
  	doWithDocs: function(store, func) {
  		var me = this;

  		store.allDocs({
					include_docs: true,
					attachments: true,
					startKey: me.currentListId + "_",
					endKey: me.currentListId + "_\uffff"
				}, function (error, result) {
					func(store, result.rows.map(function(e) {
						return e.doc;
					}));
				});
  	},
  	loadDocsAttributes: function(me, store, docsArray, attributes, callback) {
		me.doWithDocs(store, function(pouchdb, docs) {
			for (var i = 0; i < docs.length; ++i) {
				var indexOf = -1;
				for (var j = 0; j < docsArray.length; ++j) {
					if (docsArray[j]._id == docs[i]._id) {
						indexOf = j;
						break;
					}
				}
				if (indexOf === -1) {
					docsArray.push(docs[i]);
				} else {
					Ext.each(attributes, function(attr) {
						docsArray[indexOf][attr] = docs[i][attr];
					});
				}
  			}
  			callback(docsArray);
		});
  	},
  	onLoad: function(store, records, successful, operation) {
  		var me = this;
  		var updateImages = function(docsArray) {
  			me.loadDocsAttributes(me, store.localImagesDB, docsArray, ['media'], function(docs) {
  				store.setData(docs);
  			});
  		};
  		var updateMaps = function(docsArray) {
  			me.loadDocsAttributes(me, store.localMapsDB, docsArray, ['latitude', 'longitude'], function(docs) {
  				store.setData(docs);
  				updateImages(docs);
  			});
  		};
		var updateText = function(docsArray) {
			me.loadDocsAttributes(me, store.localTextDB, docsArray, ['description'], function(docs) {
				store.setData(docs);
				updateMaps(docs);
			});
		};
		updateText(records.map(
			function(r) {
				return r.getData();
			})
		);
	},
  	addDocsAttributes: function(me, store, docsArray, attributes, flag, callback) {
		me.doWithDocs(store, function(pouchdb, docs) {
			var toadd = [];
	  		for (var i = 0; i < docsArray.length; ++i) {
	  			var exists = docs.some(function(d) { return d._id == docsArray[i]._id; });
	  			if (!exists) {
	  				var obj = {
	  					'_id': docsArray[i]._id,
	  					'list': me.currentListId
	  				};
	  				var change = false;
	  				Ext.each(attributes, function(attr) {
	  					if (docsArray[i][attr]) {
	  						obj[attr] = docsArray[i][attr];
	  						change = true;
	  					}
	  				});
	  				if (change) {
	  					toadd.push(obj);
	  				}
	  			}
	  		}
	  		if (toadd.length > 0) {
	  			store.bulkDocs(toadd, function() {
	  				me.flagStoreForSync(flag);
	  				callback(docsArray);
	  			})
	  		} else {
	  			callback(docsArray);
	  		}
		});
  	},
	onAddRecords: function(store, records) {
		var me = this;

		var addImages = function(docsArray) {
			me.addDocsAttributes(me, store.localImagesDB, docsArray, ['media'], 'images', Ext.emptyFn);
		};
		var addMaps = function(docsArray) {
			me.addDocsAttributes(me, store.localMapsDB, docsArray, ['latitude', 'longitude'], 'maps', function(docs) {
				addImages(docs);
			});
		};
		var addText = function(docsArray) {
			me.addDocsAttributes(me, store.localTextDB, docsArray, ['description'], 'text', function(docs) {
				addMaps(docs);
			});
		};
		addText(records.map(
			function(r) {
				return r.getData();
			})
		);
	},
	onRemoveRecords: function(store, records, indices) {
		var me = this;
		var func = function(pouchdb, lists) {
			for (var i = 0; i < records.length; ++i) {
				lists = lists.filter(function(e) { return e._id == records[i].getData()._id; });
			}
			for (var i = 0; i < lists.length; ++i) {
				lists[i]._deleted = true;
			}
			if (lists.length > 0) {
				pouchdb.bulkDocs(lists, function() {
					if (pouchdb === store.localTextDB) {
						me.flagStoreForSync('text');
					} else if (pouchdb === store.localMapsDB) {
						me.flagStoreForSync('maps');
					} else if (pouchdb === store.localImagesDB) {
						me.flagStoreForSync('images');
					}
				});
			}
		};

		me.doWithDocs(store.localTextDB, func);
		me.doWithDocs(store.localMapsDB, func);
		me.doWithDocs(store.localImagesDB, func);
	},
	onUpdateRecord: function(store, record, newIndex, oldIndex, modifiedFieldNames, modifiedValues) {
		var me = this;
		if (modifiedFieldNames.length == 0) {
			// No changes, don’t bother updating the list
			return;
		}
		var data = record.getData();
		if (modifiedValues['description']) {
			store.localTextDB.get(data['_id'], function(error, doc) {
				if (!doc) {
					doc = {
						'_id': data['_id'],
						'list': me.currentListId
					}
				}
				if (doc.description != data.description) {
					doc.description = data.description;
					store.localTextDB.put(doc, function() {
						store.flagStoreForSync('text');
					});
				}
			});
		}
		if (modifiedValues['media'] !== null) {
			store.localImagesDB.get(data['_id'], function(error, doc) {
				if (!doc) {
					doc = {
						'_id': data['_id'],
						'list': me.currentListId
					}
				}
				if (!doc.media) {
					doc.media = "";
				}
				if (doc.media != data.media) {
					doc.media = data.media;
					store.localImagesDB.put(doc, function() {
						store.flagStoreForSync('images');
					});
				}
			});
		}
		store.localMapsDB.get(data['_id'], function(error, doc) {
			if (!doc) {
				doc = {
					'_id': data['_id'],
					'list': me.currentListId
				}
			}
			if (doc.latitude != data.latitude || doc.longitude != data.longitude) {
				doc.latitude = data.latitude;
				doc.longitude = data.longitude;
				store.localMapsDB.put(doc, function() {
					store.flagStoreForSync('maps');
				});
			}
		});
	},
	flagStoreForSync: function(store) {
		var me = this;
		me.localMetaDB.get(store + '_' + me.username, function(error, doc) {
			if (!doc) {
				me.localMetaDB.put({
					'_id': store + '_' + me.username
				});
			} else {
				me.localMetaDB.put(doc);
			}
		});
	}
});