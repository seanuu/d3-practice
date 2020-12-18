importScripts("https://d3js.org/d3-collection.v1.min.js");
importScripts("https://d3js.org/d3-dispatch.v1.min.js");
importScripts("https://d3js.org/d3-quadtree.v1.min.js");
importScripts("https://d3js.org/d3-timer.v1.min.js");
importScripts("https://d3js.org/d3-force.v1.min.js");

onmessage = function (event) {
    var nodes = event.data.nodes,
        links = event.data.links;

    var simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody())
        .force("link", d3.forceLink(links).distance(20).strength(1))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .stop();

    var count = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()));

    for (var i = 0, n = count; i < n; ++i) {
        postMessage({type: "tick", progress: i / n});
        simulation.tick();
    }

    postMessage({type: "end", nodes: nodes, links: links});
};
