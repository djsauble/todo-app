Ext.define('TodoApp.view.Main', {
    extend: 'Ext.Panel',
    alias: 'widget.todo-main',
    config: {
        layout: 'fit',
        items: { xtype: 'todo-list' }
    }
});