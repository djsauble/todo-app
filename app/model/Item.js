Ext.define('TodoApp.model.Item', {
	extend: 'Ext.data.Model',
	config: {
		identifier: {
			type: 'uuid'
		},
		fields: [
			'id',
			'description',
			'image',
			'location'
		],
		proxy: {
			type: 'localstorage',
			id: 'todoapp-items'
		}
	}
});