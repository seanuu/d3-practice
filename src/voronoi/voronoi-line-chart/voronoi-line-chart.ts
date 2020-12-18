import './voronoi-line-chart.css';
import * as d3 from 'd3';

const width = 800;
const height = 500;
const padding = 20;

// 添加svg容器
const svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('overflow', 'visible')
    .classed('voronoi-line-chart', true);

// 设置x轴比例尺
const xScale = d3.scaleTime()
    .range([0, width - padding * 2]);

// 设置y轴比例尺
const yScale = d3.scaleLinear()
    .range([height - padding * 2, 0]);

// 设置x轴
const xAxis = d3.axisBottom(xScale);
// .tickFormat(d3.timeFormat('%y-%m'));

// 设置y轴
const yAxis = d3.axisRight(yScale)
    .tickSize(width - 2 * padding);

// 设置d3预设line函数
const line = d3.line()
    .x(d => xScale(d['date']))
    .y(d => yScale(d['close']));

const voronoi = d3.voronoi()
    .x(d => xScale(d['date']))
    .y(d => yScale(d['close']))
    .extent([[-0, -0], [width - 2 * padding, height - 2 * padding]]);

d3.csv('assets/data/data.csv').then(data => {

    // 处理原始数据格式
    data.forEach(d => {
        // @ts-ignore
        d['date'] = d3.timeParse('%d-%b-%y')(d['date']);
    });

    // 设置x, y比例尺值域
    // @ts-ignore
    xScale.domain(d3.extent(data, d => d.date));
    yScale.domain(d3.extent(data, d => parseFloat(d['close']))).nice();

    // 向svg添加x轴
    const xAxisGroup = svg.append('g')
        .classed('x-axis', true)
        .attr('transform', `translate(${padding},${height - padding})`)
        .call(setAxisX);

    function setAxisX(axis) {
        axis.call(xAxis);
        // axis.select('.domain').remove();
    }

    // 向svg添加y轴
    const yAxisGroup = svg.append('g')
        .classed('y-axis', true)
        .attr('transform', `translate(${padding},${padding})`)
        .call(setAxisY);

    function setAxisY(axis) {
        axis.call(yAxis);
        axis.select('.domain').remove();
        axis.selectAll('.tick text').attr('x', 4).attr('dy', -4);
    }

    // 数据曲线Group
    const dataLineGroup = svg.append('g')
        .attr('transform', `translate(${padding}, ${padding})`)
        .classed('data-line', true);

    dataLineGroup.append('path')
        .classed('stroke-line', true)
        .datum(data)
        .attr('d', <any>line)
        .attr('fill', 'none');

    const focus = svg.append('g')
        .attr('transform', `translate(${padding}, ${padding})`)
        .attr('class', 'focus');

    focus.append('circle')
        .attr('r', 3.5);

    const voronoiGroup = svg.append('g')
        .attr('transform', `translate(${padding}, ${padding})`)
        .attr('class', 'voronoi');

    voronoiGroup.selectAll('path')
        .data(voronoi(<any>data).polygons())
        .enter().append('path')
        .classed('voronoi-path', true)
        .attr('d', function (d) {
            return d ? 'M' + d.join('L') + 'Z' : null;
        })
        .on('mouseover', mouseover)
        .on('mouseout', mouseout);

    function mouseover(d) {
        focus.select('circle').attr('transform', `translate(${xScale(d.data.date)},${yScale(d.data.close)})`);
    }

    function mouseout(d) {
        focus.select('circle').attr('transform', `translate(${-padding - 10},${-padding - 10})`);
    }


});












