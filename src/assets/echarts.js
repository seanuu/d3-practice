var data = [{
    id: '-1'
}];

var edges = [];

data = new Array(2000).fill(0).map(function (a, i) {
    return {
        id: i
    };
});

edges = new Array(data.length - 1).fill(0).map(function (a, i) {
    return {
        source: Math.floor(Math.sqrt(i)),
        target: i + 1
    };
});


option = {
    series: [{
        type: 'graph',
        layout: 'force',
        animation: false,
        data: data,
        roam: true,
        draggable: true,
        force: {
            // initLayout: 'circular'
            // gravity: 0
            repulsion: 100,
            edgeLength: 5
        },
        edges: edges
    }]
};
