import * as d3 from 'd3';

const height = 600;
const width = 800;

const canvas = d3.select('body').append('canvas')
    .attr('height', height)
    .attr('width', width);

// @ts-ignore
const context = canvas.node().getContext('2d');
const voro = d3.voronoi().extent([[1, 1], [width - 1, height - 1]]);

let n = 200,
    particles = new Array(n),
    fill = d3.interpolateCubehelix(d3.cubehelix(80, 1.50, 0.8), d3.cubehelix(-100, 0.75, 0.35)),
    radius = 10;

for (let i = 0; i < n; ++i) particles[i] = {0: Math.random() * width, 1: Math.random() * height, vx: 0, vy: 0};
for (let i = 0; i <= width; i += 80) particles.push([i, 0], [i, height]);
for (let i = 0; i <= height; i += 80) particles.push([0, i], [width, i]);

d3.timer(function (elapsed) {
    for (let i = 0; i < n; ++i) {
        let p = particles[i];
        p[0] += p.vx;
        if (p[0] < 0) p[0] += width; else if (p[0] > width) p[0] -= width;
        p[1] += p.vy;
        if (p[1] < 0) p[1] += height; else if (p[1] > height) p[1] -= height;
        p.vx += 0.1 * (Math.random() - .5) - 0.01 * p.vx;
        p.vy += 0.1 * (Math.random() - .5) - 0.01 * p.vy;
    }

    context.clearRect(0, 0, width, height);

    let triangles = voro.triangles(particles),
        links = voro.links(particles);

    triangles.forEach(function (t) {
        context.beginPath();
        let r = drawRoundedTriangle(t[0][0], t[0][1], t[1][0], t[1][1], t[2][0], t[2][1], radius);
        context.fillStyle = fill(Math.sqrt(r / 50));
        context.fill();
    });

    context.beginPath();
    triangles.forEach(function (t) {
        drawRoundedTriangle(t[0][0], t[0][1], t[1][0], t[1][1], t[2][0], t[2][1], radius);
    });
    context.lineWidth = 5;
    context.strokeStyle = '#ddd';
    context.stroke();

    context.beginPath();
    links.forEach(function (l) {
        drawLink(l.source[0], l.source[1], l.target[0], l.target[1]);
    });
    context.lineWidth = 1;
    context.strokeStyle = '#aaa';
    context.stroke();

    context.beginPath();
    particles.forEach(function (p) {
        drawParticle(p[0], p[1]);
    });
    context.fillStyle = '#000';
    context.fill();
});

function drawParticle(x, y) {
    context.moveTo(x + 2, y);
    context.arc(x, y, 2, 0, 2 * Math.PI);
}

function drawTriangle(x0, y0, x1, y1, x2, y2) {
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.lineTo(x2, y2);
    context.closePath();
}

function drawLink(x0, y0, x1, y1) {
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
}

function drawRoundedTriangle(x0, y0, x1, y1, x2, y2, r) {
    let circle = inscribeTriangle(x0, y0, x1, y1, x2, y2);
    if (circle['radius'] <= r) {
        context.moveTo(circle[0] + circle['radius'], circle[1]);
        context.arc(circle[0], circle[1], circle['radius'], 0, 2 * Math.PI);
    } else {
        let p0 = closestPoint(circle[0], circle[1], x0, y0, x1, y1),
            p1 = closestPoint(circle[0], circle[1], x1, y1, x2, y2),
            p2 = closestPoint(circle[0], circle[1], x2, y2, x0, y0);
        context.moveTo(p0[0], p0[1]);
        context.arcTo(x1, y1, p1[0], p1[1], r);
        context.arcTo(x2, y2, p2[0], p2[1], r);
        context.arcTo(x0, y0, p0[0], p0[1], r);
        context.closePath();
    }
    return circle['radius'];
}

function closestPoint(x2, y2, x0, y0, x1, y1) {
    let x10 = x1 - x0, y10 = y1 - y0,
        x20 = x2 - x0, y20 = y2 - y0,
        t = (x20 * x10 + y20 * y10) / (x10 * x10 + y10 * y10);
    return [x0 + t * x10, y0 + t * y10];
}

function inscribeTriangle(x0, y0, x1, y1, x2, y2) {
    let x01 = x0 - x1, y01 = y0 - y1,
        x02 = x0 - x2, y02 = y0 - y2,
        x12 = x1 - x2, y12 = y1 - y2,
        l01 = Math.sqrt(x01 * x01 + y01 * y01),
        l02 = Math.sqrt(x02 * x02 + y02 * y02),
        l12 = Math.sqrt(x12 * x12 + y12 * y12),
        k0 = l01 / (l01 + l02),
        k1 = l12 / (l12 + l01),
        center = segmentIntersection(x0, y0, x1 - k0 * x12, y1 - k0 * y12, x1, y1, x2 + k1 * x02, y2 + k1 * y02);
    center['radius'] = Math.sqrt((l02 + l12 - l01) * (l12 + l01 - l02) * (l01 + l02 - l12) / (l01 + l02 + l12)) / 2;
    return center;
}

function segmentIntersection(x0, y0, x1, y1, x2, y2, x3, y3) {
    let x02 = x0 - x2, y02 = y0 - y2,
        x10 = x1 - x0, y10 = y1 - y0,
        x32 = x3 - x2, y32 = y3 - y2,
        t = (x32 * y02 - y32 * x02) / (y32 * x10 - x32 * y10);
    return [x0 + t * x10, y0 + t * y10];
}
