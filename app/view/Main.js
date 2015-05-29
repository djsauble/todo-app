Ext.define('TodoApp.view.Main', {
    extend: 'Ext.Panel',
    xtype: 'main',
    alias: 'todo-main',
    requires: [
        'Ext.TitleBar',
        'Ext.form.Panel',
        'Ext.form.FieldSet',
        'Ext.field.Radio',
        'Ext.List',
        'TodoApp.view.New',
        'TodoApp.view.Edit',
        'TodoApp.view.List'
    ],
    config: {
        layout: 'fit',
        items: { xtype: 'todo-list' }
    }
});