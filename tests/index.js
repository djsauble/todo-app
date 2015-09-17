var Harness = Siesta.Harness.Browser.SenchaTouch;

Harness.configure({
    title : 'Todo App',
    //testClass : 'TodoApp'
});

Harness.start(
    { 
        group : 'Todo app tests',
        hostPageUrl : '/',
        performSetup : false,
        items : [ 
            'sanity.t.js'
        ] 
    } 
);