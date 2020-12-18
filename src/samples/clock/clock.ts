import * as d3 from 'd3';
import {transition} from 'd3';

const height = 400;
const width = 400;

let radius = Math.min(width, height) / 1.9;
let armRadius = radius / 12;
let dotRadius = armRadius - 6;

let color = d3.scaleSequential(d3.interpolateRainbow)
    .domain([0, 2 * Math.PI]);

const svg = d3.select('body')
    .append('svg')
    .attr('height', height)
    .attr('width', width)
    .classed('clock-sample', true);

let fields = [
    {radius: 0.4 * radius, interval: d3.timeWeek, subinterval: d3.timeDay, format: d3.timeFormat('%a')},
    {radius: 0.6 * radius, interval: d3.timeHour, subinterval: d3.timeMinute, format: d3.timeFormat('%M')},
    {radius: 0.8 * radius, interval: d3.timeMinute, subinterval: d3.timeSecond, format: d3.timeFormat('%S')}
];

let interval = d3.timeWeek(new Date(2018, 9, 21));
console.log(interval);
