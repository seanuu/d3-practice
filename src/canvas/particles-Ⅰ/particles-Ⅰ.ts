import './particles-Ⅰ.css';
import * as d3 from 'd3';

const width = 800;
const height = 500;

let x0 = width / 2;
let y0 = height / 2;
let x1 = x0;
let y1 = y0;
let r = 200;
let i = 0;
let τ = 2 * Math.PI;

const canvas = d3.select('body').append('canvas')
    .attr('width', width)
    .attr('height', height)
    .on('ontouchstart' in document ? 'touchmove' : 'mousemove', move);

const context = (<HTMLCanvasElement>canvas.node()).getContext('2d');
context.globalCompositeOperation = 'lighter';
context.lineWidth = 2;

d3.timer(function () {
    context.clearRect(0, 0, width, height);

    let z = d3.hsl(++i % 360, 1, .5).rgb(),
        c = 'rgba(' + z.r + ',' + z.g + ',' + z.b + ',',
        x = x0 += (x1 - x0) * .1,
        y = y0 += (y1 - y0) * .1;

    // @ts-ignore
    d3.select({}).transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .tween('circle', function () {
            return function (t) {
                context.strokeStyle = c + (1 - t) + ')';
                context.beginPath();
                context.arc(x, y, r * t, 0, τ);
                context.stroke();
            };
        });
});

function move() {
    let mouse = d3.mouse(this);
    x1 = mouse[0];
    y1 = mouse[1];
    d3.event.preventDefault();
}

