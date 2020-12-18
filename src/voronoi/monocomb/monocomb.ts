import './monocomb.css';


import * as d3 from 'd3';

const height = 600;
const width = 800;
const number = 400;

const canvas = d3.select('body').append('canvas')
    .attr('height', height)
    .attr('width', width);

let voronoi = d3.voronoi()
    .x(d => d['x'])
    .y(d => d['y']);
// @ts-ignore
let context = canvas.node().getContext('2d');

let particles = new Array(number).fill(0).map(_ => {
    return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0
    };
});

d3.timer((elapsed) => {
    // context.clearRect(0, 0, width, height);

    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        p.vx += 0.2 * (Math.random() - 0.5) - 0.01 * p.vx;
        p.vy += 0.2 * (Math.random() - 0.5) - 0.01 * p.vy;

        if (p.x < 0 || p.x > width) p.vx = -p.vx;
        if (p.y < 0 || p.y > height) p.vy = -p.vy;
    });

// @ts-ignore
    let polygons = voronoi(particles).polygons();

    context.beginPath();
    polygons.forEach(drawCell);
    context.globalAlpha = 0.2;
    context.lineWidth = 4;
    context.strokeStyle = '#000';
    context.stroke();

    context.beginPath();
    polygons.forEach(drawCell);
    context.globalAlpha = 1;
    context.strokeStyle = '#fff';
    context.lineWidth = 1;
    context.stroke();

});

function drawCell(cell) {
    let moveTo = false;
    cell.forEach((data, index) => {
        if (!moveTo && data) {
            context.moveTo(data[0], data[1]);
            moveTo = true;
        } else if (data) {
            context.lineTo(data[0], data[1]);
        }
    });
    context.closePath();
}
