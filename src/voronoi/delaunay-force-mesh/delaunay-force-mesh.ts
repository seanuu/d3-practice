import * as d3 from 'd3';

const height = 600;
const width = 800;
const maxLength = 50;
const maxLengthSquare = maxLength * maxLength;

let nodes = d3.range(200).map(d => {
    return {
        x: Math.random() * width,
        y: Math.random() * height
    };
});

const voronoi = d3.voronoi()
    .x(d => d['x'])
    .y(d => d['y']);

const canvas = d3.select('body').append('canvas')
    .classed('canvas', true)
    .attr('height', height)
    .attr('width', width)
    .on('ontouchstart' in document ? 'touchmove' : 'mousemove', moved);

// @ts-ignore
const context = canvas.node().getContext('2d');

const simulation = d3.forceSimulation(nodes.slice())
    .force('charge', d3.forceManyBody().strength((d, i) => {
        return i ? -30 : -1500;
    }))
    .force('radial', d3.forceRadial(0, width / 2, height / 2).strength(0.2))
    .on('tick', ticked);

let root = nodes[0];

function moved() {
    const p = d3.mouse(this);
    root['fx'] = p[0];
    root['fy'] = p[1];
    simulation.alpha(1).restart();
}

function ticked() {
    let links = voronoi.links(<any>nodes);

    context.clearRect(0, 0, width, height);

    context.beginPath();
    links.forEach(drawLink);
    context.lineWidth = 1;
    context.strokeStyle = '#bbb';
    context.stroke();

    context.beginPath();
    nodes.forEach(drawNode);
    context.lineWidth = 3;
    context.strokeStyle = '#fff';
    context.stroke();
    context.fillStyle = '#000';
    context.fill();
}

function drawNode(node) {
    if (node['index'] === 0) return;
    context.moveTo(node.x, node.y);
    context.arc(node.x, node.y, 2, 0, 2 * Math.PI);
}

function drawLink(link) {
    let dx = link.source['x'] - link.target['x'];
    let dy = link.source['y'] - link.target['y'];
    if (dx * dx + dy * dy < maxLengthSquare) {
        context.moveTo(link.source['x'], link.source['y']);
        context.lineTo(link.target['x'], link.target['y']);
    }
}

