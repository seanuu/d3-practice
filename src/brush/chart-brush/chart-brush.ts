import * as d3 from 'd3';
import './chart-brush.css';

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
    .classed('brush-sample1', true);


// 设置x轴比例尺
const xScale = d3.scaleTime()
    .range([0, width - padding * 2]);

// 设置y轴比例尺
const yScale = d3.scaleLinear()
    .range([height - padding * 2, 0]);

// 设置brush-x轴比例尺
const xBrushScale = d3.scaleTime()
    .range([0, width - padding * 2]);

// 设置brush-y轴比例尺
const yBrushScale = d3.scaleTime()
    .range([brushHeight, 0]);


// 设置x轴
const xAxis = d3.axisBottom(xScale);
// .tickFormat(d3.timeFormat('%y-%m'));

// 设置y轴
const yAxis = d3.axisRight(yScale)
    .tickSize(width - 2 * padding);

// 设置brush x轴
const xBrushAxis = d3.axisBottom(xScale)
    .tickSize(brushHeight);
// .tickFormat(d => null);


d3.csv('assets/data/data.csv').then(data => {

    let dataArray = [];

    // 处理原始数据格式
    data.forEach(d => {
        // @ts-ignore
        d['date'] = d3.timeParse('%d-%b-%y')(d['date']);
    });

    // 设置x, y比例尺值域
    // @ts-ignore
    xScale.domain(d3.extent(data, d => d.date));
    yScale.domain(d3.extent(data, d => parseFloat(d['close'])));
    // @ts-ignore
    xBrushScale.domain(d3.extent(data, d => d['date']));
    yBrushScale.domain(d3.extent(data, d => parseFloat(d.close)));

    // 向svg添加x轴
    const gxAxis = svg.append('g')
        .classed('x-axis', true)
        .attr('transform', `translate(${padding},${height - padding})`)
        .call(setAxisX);

    function setAxisX(axis) {
        axis.call(xAxis);
        axis.select('.domain').remove();
    }

    // 添加xAxis title
    gxAxis.append('text')
        .classed('xAxis-title', true)
        .attr('dy', -2)
        .attr('transform', `translate(${width - 2 * padding},0)`)
        .text('xAxis Title');

    // 向svg添加y轴
    const gyAxis = svg.append('g')
        .classed('y-axis', true)
        .attr('transform', `translate(${padding},${padding})`)
        .call(setAxisY);

    function setAxisY(axis) {
        axis.call(yAxis);
        axis.select('.domain').remove();
        axis.selectAll('.tick text').attr('x', 4).attr('dy', -4);
    }

    gyAxis.append('text')
        .classed('yAxis-title', true)
        .text('yAxis Title');

    // 添加brush轴
    const gxBrushAxis = svg.append('g')
        .classed('brush-axis', true)
        .attr('transform', `translate(${padding},${height})`)
        .call(setXBrushAxis);

    function setXBrushAxis(axis) {
        axis.call(xBrushAxis);
        axis.select('.domain').attr('stroke', 'none');
    }

    // 坐标系统设置完毕....以上
    // 绘制图形....以下

    // 设置d3预设line函数
    const line = d3.line()
        .x(d => xScale(d['date']))
        .y(d => yScale(d['close']));

    // 数据曲线Group
    const dataLine = svg.append('g')
        .attr('transform', `translate(${padding}, ${padding})`)
        .classed('data-line', true);

    // 绘制数据曲线
    updateLine(data);

    // 设置brushLine函数
    const brushLine = d3.line()
        .x(d => xBrushScale(d['date']))
        .y(d => yBrushScale(d['close']));


    // 添加Brush区域绘制mini曲线
    const dataBrushLine = svg.append('g')
        .attr('transform', `translate(${padding},${height})`)
        .classed('data-line brush-line', true)
        .datum(data)
        .append('path')
        .attr('d', <any>brushLine)
        .attr('stroke-dasharray', function () {
            // @ts-ignore
            return this.getTotalLength();
        })
        .attr('stroke-dashoffset', function () {
            // @ts-ignore
            return this.getTotalLength();
        })
        .transition()
        .duration(1000)
        .attr('stroke-dashoffset', 0);

    // 设置Brush函数
    const brushX = d3.brushX()
        .extent([[0, 0], [width - 2 * padding, brushHeight]])
        .on('end', () => {
            if (!d3.event.sourceEvent) {
                return;
            }
            if (!d3.event.selection) {
                updateChart(data);
                return;
            }

            // 更新为选取区域数据
            const selectionDomain = d3.event.selection.map(xBrushScale.invert);
            dataArray.splice(0, dataArray.length);
            data.forEach(d => {
                if (d['date'] > selectionDomain[0] && d['date'] < selectionDomain[1]) {
                    dataArray.push(d);
                }
            });
            updateChart(dataArray);
        });

    // 调用Brush
    gxBrushAxis.append('g')
        .classed('brush', true)
        .call(brushX);

    // 触摸事件Group
    const interactiveArea = svg.append('g')
        .attr('transform', `translate(${padding}, ${padding})`)
        .classed('interactive-area', true);

    const interactiveVerticalLine = interactiveArea.append('path')
        .classed('interactive-line', true)
        .attr('d', `M0,0 L${width - 2 * padding},0`)
        .style('opacity', 0);

    const interactiveHorizontalLine = interactiveArea.append('path')
        .classed('interactive-line', true)
        .attr('d', `M0,0 L0,${height - 2 * padding}`)
        .style('opacity', 0);

    const interactiveText = interactiveArea.append('text')
        .classed('interactive-text', true);

    // 添加交互事件
    interactiveArea.on('mousemove', function () {
        if (d3.select(d3.event.target).classed('interactive-bar')) {
            d3.select(d3.event.target).each(d => {

                const y = yScale(d['close']);
                const x = xScale(d['date']);

                interactiveVerticalLine
                    .attr('transform', `translate(0,${y})`)
                    .style('opacity', 1);
                interactiveHorizontalLine
                    .attr('transform', `translate(${x},0)`)
                    .style('opacity', 1);

                const text = interactiveText
                    .style('opacity', 1)
                    .attr('transform', `translate(${x + 20},${y + 20})`)
                    .selectAll('tspan')
                    .data([d['date'], d['close']])
                    .attr('x', 0)
                    .attr('y', (d, i) => i * 20);

                text.text(d => {
                    if (d instanceof Date) {
                        return d3.timeFormat('%Y-%m-%d')(d);
                    }
                    return d;
                });

                text.enter().append('tspan')
                    .text(d => {
                        if (d instanceof Date) {
                            return d3.timeFormat('%Y-%m-%d')(d);
                        }
                        return d;
                    });

                text.exit();

            });
        }

    }).on('mouseout', function () {
        interactiveVerticalLine.style('opacity', 0);
        interactiveHorizontalLine.style('opacity', 0);

        interactiveText
            .style('opacity', 0);
    });

    updateInteractiveArea(data);

    // 更新图表
    function updateChart(data) {
        // 更新值域
        // @ts-ignore
        xScale.domain(d3.extent(data, d => d['date']));
        yScale.domain(d3.extent(data, d => parseFloat(d['close'])));

        // 更新坐标轴
        gxAxis.call(setAxisX);
        gyAxis.call(setAxisY);

        // 更新曲线
        updateLine(data);

        // 更新交互区域
        updateInteractiveArea(data);
    }

    function updateInteractiveArea(data) {
        let interactive = interactiveArea.selectAll('.interactive-bar')
            .data(data);
        let lastNodeX = 0;

        interactive
            .classed('interactive-bar', true)
            .attr('x', d => {
                const interactiveBarWidth = xScale(d['date']) - lastNodeX;
                lastNodeX = xScale(d['date']);
                return xScale(d['date']) - interactiveBarWidth + (width / data.length) / 2;
            })
            .attr('width', (d) => {
                const interactiveBarWidth = xScale(d['date']) - lastNodeX;
                lastNodeX = xScale(d['date']);
                return interactiveBarWidth < 2 ? 2 : interactiveBarWidth;
            })
            .attr('height', height - 2 * padding);

        interactive.enter()
            .append('rect')
            .classed('interactive-bar', true)
            .attr('x', d => xScale(d['date']) - (width / data.length) / 2)
            .attr('width', () => {
                const interactiveBarWidth = width / data.length;
                return interactiveBarWidth < 2 ? 2 : interactiveBarWidth;
            })
            .attr('height', height - 2 * padding);

        interactive.exit()
            .remove();
    }

    // 更新曲线
    function updateLine(data) {
        dataLine.selectAll('path')
            .transition()
            .duration(1000)
            .attr('stroke-dashoffset', function () {
                // @ts-ignore
                return -this.getTotalLength();
            })
            .remove();

        dataLine.append('path').datum(data)
            .attr('d', <any>line)
            .attr('fill', 'none')
            .attr('stroke-dasharray', function () {
                // @ts-ignore
                return this.getTotalLength();
            })
            .attr('stroke-dashoffset', function () {
                // @ts-ignore
                return this.getTotalLength();
            })
            .transition()
            .duration(1000)
            .attr('stroke-dashoffset', 0);
    }
});








