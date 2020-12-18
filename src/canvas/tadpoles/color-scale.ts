import './color-scale.css';
import * as d3 from 'd3';

const height = window.innerHeight;
const width = window.innerWidth;
const n = 200;
const m = 12;
const v = 2;
let i = 0;

const canvas = d3.select('body').append('canvas')
    .attr('height', height)
    .attr('width', width);

const cyclical = d3.scaleSequential(d3.interpolateRainbow);

// @ts-ignore
const context = canvas.node().getContext('2d');

const tadpoles = new Array(n).fill(0).map(() => ({
    vx: (Math.random() - 0.5) * v,
    vy: (Math.random() - 0.5) * v,
    px: new Array(m).fill(Math.random() * width),
    py: new Array(m).fill(Math.random() * height),
    count: 0,
    color: cyclical(Math.random()),
    i: 0
}));


d3.timer(elapsed => {
    context.clearRect(0, 0, width, height);
    renderer(elapsed);
});

function renderer(elapsed) {

    for (const t of tadpoles) {
        let dx = t.vx;
        let dy = t.vy;
        let x = t.px[0] += dx;
        let y = t.py[0] += dy;
        let speed = Math.sqrt(dx * dx + dy * dy);

        const count = speed * 10;

        // Bounce off the walls.
        if (x < 0 || x > width) t.vx *= -1;
        if (y < 0 || y > height) t.vy *= -1;

        // Swim!
        for (var j = 1; j < m; ++j) {
            const vx = x - t.px[j];
            const vy = y - t.py[j];
            t.count += count;
            t.px[j] = (x += (dx * (-5 - speed / 10)) / speed) - dy * (Math.sin(((t.count) + j * 3) / 300) / speed);
            t.py[j] = (y += (dy * (-5 - speed / 10)) / speed) + dx * (Math.sin(((t.count) + j * 3) / 300) / speed);
            speed = Math.sqrt((dx = vx) * dx + (dy = vy) * dy);
        }

        let color = d3.hsl(t.color);
        color.h = ((color.h + 5) % 360);
        t.color = d3.color(color).toString();
        // Head
        context.save();
        context.translate(t.px[0], t.py[0]);
        context.rotate(Math.atan2(t.vy, t.vx));
        context.beginPath();
        context.ellipse(0, 0, 6.5, 4, 0, 0, 2 * Math.PI);
        context.fillStyle = t.color;
        context.fill();
        context.restore();

        // Body
        context.beginPath();
        context.moveTo(t.px[0], t.py[0]);
        for (let i = 1; i < 3; ++i) context.lineTo(t.px[i], t.py[i]);
        context.lineWidth = 4;
        context.stroke();

        // Tail
        context.beginPath();
        context.moveTo(t.px[0], t.py[0]);
        for (let i = 1; i < m; ++i) {
            context.lineTo(t.px[i], t.py[i]);
            if (i === Math.floor(m / 2)) {
                let grd = context.createLinearGradient(t.px[0], t.py[0], t.px[m - 1], t.py[m - 1]);
                for (let i = 0; i < m; i++) {
                    grd.addColorStop(i / (m - 1), cyclical((i / (m - 1))));
                }
                context.strokeStyle = grd;
                context.lineWidth = 2;
                context.stroke();
                context.beginPath();
            }
            context.lineTo(t.px[i], t.py[i]);
        }

        context.lineWidth = 1;
        context.stroke();
    }
}




