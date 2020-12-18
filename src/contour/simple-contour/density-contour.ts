import * as d3 from 'd3';

const height = 600;
const width = 800;
const padding = 20;

const svg = d3.select('body').append('svg')
    .classed('simple-contour', true)
    .attr('height', height)
    .attr('width', width);

const xScale = d3.scaleLinear().rangeRound([0, width - 2 * padding]);
const yScale = d3.scaleLinear().rangeRound([height - 2 * padding, 0]);

const xAxis = d3.axisBottom(xScale);
const yAxis = d3.axisRight(yScale).tickSize(width - 2 * padding);

const contourDensity = d3.contourDensity()
    .x(d => xScale(d['waiting']))
    .y(d => yScale(d['eruptions']))
    .size([width, height])
    .bandwidth(40);

d3.tsv('assets/data/contour-data.tsv').then(data => {
    data.map(d => {
        // @ts-ignore
        d['waiting'] = Number(d['waiting']);
        // @ts-ignore
        d['eruptions'] = Number(d['eruptions']);
        return d;
    });

    xScale.domain(d3.extent(data, (d) => Number(d['waiting']))).nice();
    yScale.domain(d3.extent(data, (d) => Number(d['eruptions']))).nice();

    // 散点密度等值线
    const contourLine = svg.append('g').classed('contour-line', true)
        .attr('transform', `translate(${padding},${padding})`)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-linejoin', 'round')
        .selectAll('path')
        .data(contourDensity(<any>data))
        .enter().append('path')
        .attr('d', d3.geoPath());

    const dot = svg.append('g').classed('dots', true)
        .attr('transform', `translate(${padding},${padding})`)
        .selectAll('circle')
        .data(data)
        .enter().append('circle')
        .attr('cx', d => xScale(<any>d['waiting']))
        .attr('cy', d => yScale(<any>d['eruptions']))
        .attr('r', 1);

    const xAxisGroup = svg.append('g')
        .classed('xAxis', true)
        .attr('transform', `translate(${padding},${height - padding})`)
        .call(xAxis)
        .select('.tick:last-of-type text')
        .select(function () {
            // @ts-ignore
            return this.parentNode.appendChild(this.cloneNode());
        })
        .attr('y', -5)
        .attr('dx', 10)
        .attr('dy', 0)
        .attr('text-anchor', 'end')
        .attr('font-weight', 'bold')
        .text('Idle (min.)');

    const yAxisGroup = svg.append('g')
        .classed('yAxis', true)
        .attr('transform', `translate(${padding},${padding})`)
        .call(setAxisY)
        .select('.tick:last-of-type text')
        .select(function () {
            // @ts-ignore
            return this.parentNode.appendChild(this.cloneNode());
        })
        .attr('x', 30)
        .attr('text-anchor', 'start')
        .attr('font-weight', 'bold')
        .text('Erupting (min.)');

    function setAxisY(axis) {
        axis.call(yAxis);
        axis.select('.domain').remove();
        axis.selectAll('.tick text').attr('x', 4).attr('dy', -4);
    }

    let geo = d3.geoPath();
    console.log(geo.bounds ((contourDensity(<any>data)[0])))
});
