import * as d3 from 'd3';

const width = 800;
const height = 800;

const innerRadius = 100;
const outerRadius = 300;
const cornerRadius = 10;

const data = [1, 1, 2, 3, 5, 8, 13, 21];

// pie函数生产带arc参数的数据(startAngle, endAngle, padAngle)
const pie = d3.pie();

// 使用带arc参数的数据算出path路径值
const arc = d3.arc()
    .cornerRadius(cornerRadius)
    .outerRadius(outerRadius);

// 添加svg容器const
const svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height)
    .classed('arc-timer', true);

// 添加pie group
const gPie = svg.append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`)
    .classed('pie', true)
    .selectAll('path')
    .data(data)
    .enter().append('path');

const ease = d3.easeCubicOut;
const duration = 2000;


d3.timer((elapsed) => {
    const t = ease(1 - Math.abs((elapsed % duration) / duration - .5) * 2),
        arcs = pie.padAngle(t * .1)(data);

    arc.innerRadius(outerRadius / (3 - t));

    gPie.data(arcs).attr('d', <any>arc);
});





