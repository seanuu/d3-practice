import './tick.css';
import * as d3 from 'd3';

const width = 800;
const height = 500;
const padding = 20;
const brushHeight = 30;
const brushTextHeight = 15;

// 添加svg容器
const svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height + brushHeight + brushTextHeight)
    .attr('overflow', 'visible')
    .classed('axis', true);

let zoom = d3.zoom()
    .scaleExtent([1, 40])
    // .translateExtent([[-100, -100], [width + 90, height + 100]])
    .on('zoom', zoomed);

function zoomed() {
    view.attr('transform', d3.event.transform);
    gX.call(xAxis.scale(d3.event.transform.rescaleX(x)));
    gY.call(yAxis.scale(d3.event.transform.rescaleY(y)));
}

let x = d3.scaleLinear()
    .domain([-1, width + 1])
    .range([-1, width + 1]);

let y = d3.scaleLinear()
    .domain([-1, height + 1])
    .range([-1, height + 1]);

let xAxis = d3.axisBottom(x)
    .ticks((width + 2) / (height + 2) * 10)
    .tickSize(20)
    .tickPadding(8);

let yAxis = d3.axisRight(y)
    .ticks(10)
    .tickSize(20)
    .tickPadding(8);

let view = svg.append('rect')
    .attr('class', 'view')
    .attr('x', 0.5)
    .attr('y', 0.5)
    .attr('width', width - 1)
    .attr('height', height - 1);

let gX = svg.append('g')
    .attr('class', 'axis axis--x')
    .call(xAxis);

let gY = svg.append('g')
    .attr('class', 'axis axis--y')
    .call(yAxis);

svg.call(zoom);

