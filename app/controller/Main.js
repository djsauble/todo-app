Ext.define('TodoApp.controller.Main', {
	extend: 'Ext.app.Controller',
	config: {
		views: [
			'SignIn',
			'TodoApp.view.list.Lists',
			'TodoApp.view.list.New',
			'TodoApp.view.list.DataItem',
			'TodoApp.view.list.List',
			'TodoApp.view.item.New',
			'TodoApp.view.item.Edit',
			'TodoApp.view.item.Location',
			'TodoApp.view.item.DataItem',
			'TodoApp.view.collaborator.List',
			'TodoApp.view.collaborator.New',
			'TodoApp.view.collaborator.DataItem',
			'Ext.util.Geolocation'
		],
		models: [
			'User',
			'Item',
			'List',
			'Collaborator',
			'Position'
		],
		stores: [
			'User',
			'Item',
			'List',
			'Collaborator',
			'Position'
		],
		refs: {
			main: 'todo-main',
			mainPanel: '#todo-main-panel',
			listsPanel: {
				selector: 'todo-lists',
				xtype: 'todo-lists',
				autoCreate: true
			},
			listsDataView: 'todo-lists dataview',
			newListPanel: {
				selector: 'todo-list-new',
				xtype: 'todo-list-new',
				autoCreate: true
			},
			newListForm: 'todo-list-new formpanel',
			listPanel: {
				selector: 'todo-list',
				xtype: 'todo-list',
				autoCreate: true
			},
			listDataView: 'todo-list dataview',
			collaboratorsPanel: {
				selector: 'todo-collaborator-list',
				xtype: 'todo-collaborator-list',
				autoCreate: true
			},
			collaboratorsDataView: 'todo-collaborator-list dataview',
			newCollaboratorPanel: {
				selector: 'todo-collaborator-new',
				xtype: 'todo-collaborator-new',
				autoCreate: true
			},
			newCollaboratorForm: 'todo-collaborator-new formpanel',
			newPanel: {
				selector: 'todo-new',
				xtype: 'todo-new',
				autoCreate: true
			},
			newForm: 'todo-new formpanel',
			editPanel: {
				selector: 'todo-edit',
				xtype: 'todo-edit',
				autoCreate: true
			},
			editForm: 'todo-edit formpanel',
			locationPanel: {
				selector: 'todo-location',
				xtype: 'todo-location',
				autoCreate: true
			},
			signInPanel: {
				selector: 'todo-sign-in',
				xtype: 'todo-sign-in',
				autoCreate: true
			},
			signInForm: 'todo-sign-in formpanel'
		},
		control: {
			// HACK: Sencha says you shouldn’t define listeners in the config object, so don’t do this
			'todo-lists button[action=signin]': {
				tap: 'showSignInView'
			},
			'todo-lists button[action=signout]': {
				tap: 'signOut'
			},
			'todo-lists button[action=new]': {
				tap: 'showNewListView'
			},
			'todo-lists button[action=share]': {
				tap: 'shareList',
			},
			'todo-lists button[action=edit]': {
				tap: 'editList'
			},
			'todo-lists button[action=delete]': {
				tap: 'deleteList'
			},
			'todo-list-new button[action=back]': {
				tap: 'showListsView'
			},
			'todo-list-new button[action=create]': {
				tap: 'createList',
			},
			'todo-list button[action=back]': {
				tap: 'goBack'
			},
			'todo-list button[action=new]': {
				tap: 'showNewView'
			},
			'todo-list button[action=edit]': {
				tap: 'editTodoItem'
			},
			'todo-list button[action=delete]': {
				tap: 'deleteTodoItem'
			},
			'todo-collaborator-list button[action=back]': {
				tap: 'goBack'
			},
			'todo-collaborator-list button[action=add]': {
				tap: 'showNewCollaboratorView'
			},
			'todo-collaborator-list button[action=delete]': {
				tap: 'deleteCollaborator'
			},
			'todo-collaborator-new button[action=back]': {
				tap: 'goback'
			},
			'todo-collaborator-new button[action=share]': {
				tap: 'createCollaborator'
			},
			'todo-new button[action=create]': {
				tap: 'createTodoItem'
			},
			'todo-new button[action=back]': {
				tap: 'goBack'
			},
			'todo-edit button[action=save]': {
				tap: 'saveTodoItem'
			},
			'todo-edit button[action=back]': {
				tap: 'goBack'
			},
			'todo-map button[action=set]': {
				tap: 'showLocationView'
			},
			'todo-location button[action=back]': {
				tap: 'goBack'
			},
			'todo-location button[action=set]': {
				tap: 'setLocation'
			},
			'todo-sign-in button[action=back]': {
				tap: 'goBack'
			},
			'todo-sign-in button[action=submit]': {
				tap: 'signIn'
			}
		}
	},
	geo: null,
	syncHandler: null,
	init: function() {
		var me = this,
			store = Ext.getStore('List'),
			record = Ext.getStore('User').first(),
			data;

		store.localDB = new PouchDB('lists');

		if (record) {
			data = record.getData();
			store.username = data.username;
			me.connect(data.username, data.password);
		}

		me.predictBandwidth();

		me.checkForTurbulence();
	},
	predictBandwidth: function() {
		var me = this;
		me.geo = Ext.create('Ext.util.Geolocation', {
			listeners: {
				locationupdate: function(geo) {
					//console.log("Update location");
					// Are there any points in the database?
					var store = Ext.getStore('Position');
					//console.log(store.getCount() + " points in database");
					if (!store.getCount()) {
						store.add({
							latitude: geo._latitude,
							longitude: geo._longitude,
							offline: me.offline
						});
						return;
					}

					// Is the current location more than 10 meters away from the closest location? Save it.
					var records = store.getData().all,
						closest = null,
						closestDistance = null;
					records.forEach(function(e) {
						var distance = Math.sqrt(Math.pow((e.data.latitude - geo._latitude), 2) + Math.pow((e.data.longitude - geo._longitude), 2));
						if (!closest || distance < closestDistance) {
							closest = e.data;
							closestDistance = distance;
							return;
						}
					});
					//console.log(closestDistance);
					if (closestDistance > 10) {
						store.add({
							latitude: geo._longitude,
							longitude: geo._latitude,
							offline: me.offline
						});
					}

					// Is the current location less than 10 meters away from the closest location? Update it.
					if (closestDistance < 10 && closest.online != me.online) {
						var record = store.findRecord('id', closest.id);
						record.set('online', me.online);
						store.sync();
					}

					// Is the current positioning information accurate enough?
					if (!geo._accuracy || geo._accuracy > 50)
						return;

					// Is the current speed significant enough?
					if (!geo._speed || geo._speed < 1)
						return;

					// Determine where user will be in 10 seconds
					var R = 6367444.7, // Earth's radius in meters
						distance = geo._speed * 10, // Current velocity times 10 (seconds)
						dx = distance * (Math.sin(geo._heading * Math.PI / 180)),
						dy = distance * (-Math.cos(geo._heading * Math.PI / 180)),
						dlng = dx / (R * Math.cos(geo._latitude)),
						dlat = dy / R
						newLng = geo._longitude + dlng,
						newLat = geo._latitude + dlat;

					// What is the closest point to that location? (nearest neighbor search)
					closest = null;
					closestDistance = null;
					records.forEach(function(e) {
						var distance = Math.sqrt(Math.pow((e.data.latitude - newLat), 2) + Math.pow((e.data.longitude - newLng), 2));
						if (!closest || distance < closestDistance) {
							closest = e.data;
							closestDistance = distance;
							return;
						}
					});

					// Was the closest point offline? Post a warning…
					if (!closest.online) {
						this.setIndicator("Going offline soon. :-/");
					}
				}
			}
		});
	},
	oneTimeMessage: false,
	checkForTurbulence: function() {
		var me = this;

		return setInterval(function() {
			// Are we online and syncing?
			if (!me.online || !me.syncStarted || me.message.indexOf('offline soon') !== -1)
				return;

			// Have we been attempting to synchronize for at least 30 minutes?
			var duration = (new Date()).getTime() - me.syncStarted;
			if (duration > 30 * 60 * 1000 && me.oneTimeMessage === false) {
				Ext.Msg.show({
					title: "Fasten your seatbelt",
					message: "We've been trying to sync for 30 minutes, but no dice. Your data is safe, but you'll want to connect to better Internet eventually.",
					buttons: Ext.MessageBox.OK
				});
				me.oneTimeMessage = true;
			}
			// 10 minutes?
			else if (duration > 10 * 60 * 1000) {
				me.setIndicator("Are you on GPRS?");
			}
			// 1 minute?
			else if (duration > 60 * 1000) {
				me.setIndicator("Find faster Internet?");
			}
			// 30 seconds?
			else if (duration > 30 * 1000) {
				me.setIndicator("Still working…");
			}
			// 10 seconds?
			else if (duration > 10 * 1000 && me.oneTimeMessage === false) {
				me.setIndicator("Taking a bit longer…");
			}
		}, 1000);
	},
	createTodoItem: function(button, e, eOpts) {
		var store = Ext.getStore('Item');

		store.add(this.getNewForm().getValues());
		
		this.showListView();
	},
	createCollaborator: function(button, e, eOpts) {
		var store = Ext.getStore('Collaborator');

		store.add(this.getNewCollaboratorForm().getValues());

		this.showCollaboratorsView();
	},
	createList: function(button, e, eOpts) {
		var store = Ext.getStore('List');

		var model = new TodoApp.model.List(this.getNewListForm().getValues());
		model.setId(store.username + '_' + model.getId());
		model.set('owner', store.username);
		store.add(model);

		this.showListsView();
	},
	editTodoItem: function(button, e, eOpts) {
		var store = this.getListDataView().getStore(),
			editPanel = this.getEditPanel(),
			editForm = this.getEditForm(),
			imagePanel = editForm.down('todo-image'),
			record = store.findRecord('id', button.getData()),
			mediaData = record.get('media');

		editForm.setRecord(record);

		// Show the associated image
		if (mediaData) {
			imagePanel.down('panel').setHtml('<img src="' + record.get('media') + '" alt="todo image" width="100%"/>');
			imagePanel.down('button[text=Select]').setHidden(true);
			imagePanel.down('button[text=Remove]').setHidden(false);
		} else {
			imagePanel.down('panel').setHtml('No image loaded');
			imagePanel.down('button[text=Select]').setHidden(false);
			imagePanel.down('button[text=Remove]').setHidden(true);
		}

		this.showEditView();
	},
	editList: function(button, e, eOpts) {
		var listStore = Ext.getStore('List'),
			record = listStore.findRecord('_id', button.getData()),
			items = record.getData().items,
			listPanel = this.getListPanel(),
			listDataView = this.getListDataView(),
			itemStore = Ext.getStore('Item');

		listStore.currentListId = button.getData();
		itemStore.currentListStore = listStore;
		itemStore.currentListRecord = record;
		itemStore.removeAll();
		if (items) {
			itemStore.add(items);
		}

		listPanel.down('titlebar').setTitle(record.get('name'));
		this.showListView();
	},
	shareList: function(button, e, eOpts) {
		var listStore = Ext.getStore('List'),
			record = listStore.findRecord('_id', button.getData()),
			collaborators = record.getData().collaborators,
			collaboratorsPanel = this.getCollaboratorsPanel(),
			collaboratorsDataView = this.getCollaboratorsDataView(),
			collaboratorStore = Ext.getStore('Collaborator');

		listStore.currentListId = button.getData();
		collaboratorStore.currentListStore = listStore;
		collaboratorStore.currentListRecord = record;
		collaboratorStore.removeAll();
		if (collaborators) {
			collaboratorStore.add(collaborators.map(
				function(c) {
					return {id: c}
				}
			));
		}

		this.showCollaboratorsView();
	},
	deleteTodoItem: function(button, e, eOpts) {
		var dataview = this.getListDataView(),
			store = dataview.getStore(),
			record = store.findRecord('id', button.getData()).erase();

		store.remove(record);
	},
	deleteCollaborator: function(button, e, eOpts) {
		var dataview = this.getCollaboratorsDataView(),
			store = dataview.getStore(),
			record = store.findRecord('id', button.getData()).erase();

		store.remove(record);
	},
	deleteList: function(button, e, eOpts) {
		var dataview = this.getListsDataView(),
			store = dataview.getStore(),
			record = store.findRecord('_id', button.getData()).erase();

		store.remove(record);
	},
	saveTodoItem: function(button, e, eOpts) {
		var store = Ext.getStore('Item'),
			values = this.getEditForm().getValues(),
			record = store.findRecord('id', values.id);

		record.setData(values);
		record.setDirty(); // Needed otherwise update record will not sync
		store.sync();

		this.showListView();
	},
	showView: function(view, index) {
		this.createMapResource();
		this.unloadMapResource();

		for (var i = this.getMainPanel().getItems().length - 1; i >= index; --i) {
			this.getMainPanel().remove(this.getMainPanel().getAt(i), false);
		}
		this.getMainPanel().add(view);
		this.getMainPanel().setActiveItem(index);
		this.getMainPanel().activeIndex = index;

		this.loadMapResource();
	},
	goBack: function() {
		this.unloadMapResource();

		if (this.getMainPanel().activeIndex > 0) {
			this.getMainPanel().activeIndex--;
		}
		this.getMainPanel().setActiveItem(this.getMainPanel().activeIndex);

		this.loadMapResource();
	},
	showListsView: function() {
		this.showView(this.getListsPanel(), 0);
	},
	showCollaboratorsView: function() {
		this.showView(this.getCollaboratorsPanel(), 1);
	},
	showNewListView: function() {
		var newListPanel = this.getNewListPanel(),
			newListForm = this.getNewListForm();

		// Reset the new panel
		newListForm.reset();

		this.showView(newListPanel, 1);
	},
	showNewCollaboratorView: function() {
		this.showView(this.getNewCollaboratorPanel(), 2);
	},
	showNewView: function() {
		var newPanel = this.getNewPanel(),
			newForm = this.getNewForm();

		// Reset the new panel
		newForm.reset();
		newForm.down('todo-image').down('panel').setHtml('No image loaded');
		newForm.down('todo-image').down('button[text=Select]').setHidden(false);
		newForm.down('todo-image').down('button[text=Remove]').setHidden(true);

		this.showView(newPanel, 2);
	},
	showSignInView: function() {
		this.showView(this.getSignInPanel(), 1);
	},
	showEditView: function() {
		this.showView(this.getEditPanel(), 2);
	},
	showListView: function() {
		this.showView(this.getListPanel(), 1);
	},
	showLocationView: function() {
		this.showView(this.getLocationPanel(), 3);
	},
	setLocation: function() {
		var panel = this.getLocationPanel(),
			position,
			map;

		position = panel.down('map').getMap().mapMarker.getPosition();
		this.goBack();

		panel = this.getMainPanel().getActiveItem().down('todo-map');
		panel.down('hiddenfield[name=latitude]').setValue(position.lat());
		panel.down('hiddenfield[name=longitude]').setValue(position.lng());
		panel.hideMap(panel, false);
    	panel.setMarker(panel, position.lat(), position.lng());
	},
	createMapResource: function() {
		var me = this;
		if (!this.mapResource) {
			this.mapResource = Ext.create('widget.map', {
	            xtype: 'map',
	            mapOptions: {
	                zoom: 15,
	                disableDefaultUI: true
	            },
	            listeners: {
	            	maprender: function(obj, map) {
				        var mapPanel = obj.up('todo-map') || obj.up('todo-location');

						map.mapMarker = new google.maps.Marker({
							map: map
						});

						// Trigger a resize when the bounds of the map change
						google.maps.event.addListener(map, 'bounds_changed', function() {
							var panel = obj.up('todo-map') || obj.up('todo-location');
							panel.onMapAdd(obj, map);
						});

				        if (!mapPanel.mapRendered) {
				            map.mapRendered = true;
				            mapPanel.onMapAdd(obj, map);
				        }
				    }
	            }
	        });
		}
	},
	unloadMapResource: function() {
		var map = this.getMainPanel().down('map');

		if (map) {
			map.up('panel').remove(this.mapResource, false);
		}
	},
	loadMapResource: function() {
		var map = this.getMainPanel().getActiveItem().down('todo-map') || this.getMainPanel().down('todo-location');

		if (map) {
			map.down('panel').add(this.mapResource);
		}
	},
	signIn: function() {
		var values = this.getSignInForm().getValues();
		this.getSignInForm().down('passwordfield').reset();
		this.connect(values.username, values.password);
		this.showListsView();
	},
	signOut: function() {
		this.disconnect();
	},
	connect: function(username, password) {
		var listStore = Ext.getStore('List'),
			userStore = Ext.getStore('User');

		userStore.removeAll();
		userStore.add({
			username: username,
			password: password
		});

		listStore.username = username;
		listStore.password = password;

		if (this.syncHandler) {
			this.syncHandler.cancel();
		} else {
			this.startSyncing(this);
		}
	},
	disconnect: function() {
		var listStore = Ext.getStore('List'),
			userStore = Ext.getStore('User');

		if (this.syncHandler) {
			userStore.removeAll();
			listStore.removeAll();
			listStore.username = 'nobody';
			listStore.password = null;
			this.syncHandler.cancel();
		}
	},
	syncStarted: null,
	startSyncing: function(me) {
		var me = this,
			store = Ext.getStore('List');

		store.remoteDB = new PouchDB('https://' + store.username + ':' + store.password + '@djsauble.cloudant.com/lists');
		me.syncHandler = store.localDB.sync(store.remoteDB, {
			live: true,
			retry: true,
			back_off_function: function (delay) {
				me.online = false;
				me.setIndicator("offline :-(");
				return 1000;
			}
		}).on('change', function (change) {
			console.log("Sync change");
			if (change.direction == "pull" && change.change.docs.length > 0) {
				console.log("Change occurred. Synchronizing.");
				store.load();
			}
		}).on('paused', function (info) {
			console.log("Sync paused");
			me.online = true;
			me.syncStarted = null;
			me.oneTimeMessage = false;
			me.setIndicator("online :-)");
		}).on('active', function (info) {
			console.log("Sync active");
			me.syncStarted = (new Date()).getTime();
			me.setIndicator("Syncing…");
		}).on('error', function (err) {
			console.log("Sync error");
		});
		me.syncHandler.on('complete', function (info) {
			store.localDB.destroy().then(function() {
				store.localDB = new PouchDB('lists');
				me.syncHandler = null;
				me.getListsPanel().down('button[action=signin]').show();
				me.getListsPanel().down('button[action=signout]').hide();
				if (store.username && store.password) {
					me.startSyncing(me);
				}
			});
		});
		setTimeout(function() {
			me.getListsPanel().down('button[action=signin]').hide();
			me.getListsPanel().down('button[action=signout]').show();	
		}, 50);
	},
	online: null,
	message: null,
	setIndicator: function(message) {
		var me = this;

		if (me.message != message) {
			me.getMain().down('toolbar[docked=bottom]').setTitle(message);
			me.message = message;
		}
	}
});
