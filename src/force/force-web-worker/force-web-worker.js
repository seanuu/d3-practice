import * as d3 from 'd3';
import './force-web-worker.css';

var nodes = d3.range(10000).map(function (i) {
    return {
        index: i
    };
});

var links = d3.range(nodes.length - 1).map(function (i) {
    return {
        source: Math.floor(Math.sqrt(i)),
        target: i + 1
    };
});

var width = window.innerWidth,
    height = window.innerHeight;

var meter = document.querySelector("#progress");
var canvas = d3.select('body').append('canvas');
canvas.attr('height', height).attr('width', width);
var context = canvas.node().getContext("2d");


var worker = new Worker("assets/worker.js");

worker.postMessage({
    nodes: nodes,
    links: links
});

worker.onmessage = function (event) {
    switch (event.data.type) {
        case "tick":
            return ticked(event.data);
        case "end":
            return ended(event.data);
    }
};

function ticked(data) {
    var progress = data.progress;

    meter.style.width = 100 * progress + "%";
}

function ended(data) {
    var nodes = data.nodes,
        links = data.links;

    meter.style.display = "none";

    context.clearRect(0, 0, width, height);
    context.save();
    context.translate(width / 2, height / 2);

    context.beginPath();
    links.forEach(drawLink);
    context.strokeStyle = "#aaa";
    context.stroke();

    context.beginPath();
    nodes.forEach(drawNode);
    context.fill();
    context.strokeStyle = "#fff";
    context.stroke();

    context.restore();
}

function drawLink(d) {
    context.moveTo(d.source.x, d.source.y);
    context.lineTo(d.target.x, d.target.y);
}

function drawNode(d) {
    context.moveTo(d.x + 3, d.y);
    context.arc(d.x, d.y, 3, 0, 2 * Math.PI);
}
