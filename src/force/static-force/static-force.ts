import * as d3 from 'd3';
import './static-force.css';

const width = 1000;
const height = 800;

const svg = d3.select('body').append('svg')
    .classed('point-force', true)
    .attr('height', height)
    .attr('width', width);

let n = 5000,
    nodes = d3.range(n).map(function (i) {
        return {index: i};
    }),
    links = d3.range(n).map(function (i) {
        return {source: i, target: (i + 3) % n};
    });

let simulation = d3.forceSimulation(nodes)
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('charge', d3.forceManyBody().strength(-80))
    .force('link', d3.forceLink(links).distance(20).strength(1).iterations(20))
    .force('x', d3.forceX())
    .force('y', d3.forceY())
    .stop();

// stop 手动调用仿真  (simulation.tick & simulation.stop 结合使用来创建 static force layout(静态力学布局))
for (let i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
    simulation.tick();
}

svg.append('g')
    .attr('stroke', '#000')
    .attr('stroke-width', 1.5)
    .selectAll('line')
    .data(links)
    .enter().append('line')
    .attr('x1', function (d) {
        // @ts-ignore
        return d.source.x;
    })
    .attr('y1', function (d) {
        // @ts-ignore
        return d.source.y;
    })
    .attr('x2', function (d) {
        // @ts-ignore
        return d.target.x;
    })
    .attr('y2', function (d) {
        // @ts-ignore
        return d.target.y;
    });

svg.append('g')
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.5)
    .selectAll('circle')
    .data(nodes)
    .enter().append('circle')
    .attr('cx', function (d) {
        // @ts-ignore
        return d.x;
    })
    .attr('cy', function (d) {
        // @ts-ignore
        return d.y;
    })
    .attr('r', 4.5);

