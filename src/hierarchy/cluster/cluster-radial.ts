import * as d3 from 'd3';
import './cluster-radial.css'

const outerRadius = 800 / 2;
const innerRadius = outerRadius - 100;

// 添加容器
const svg = d3.select('body')
    .append('svg')
    .attr('height', outerRadius * 2)
    .attr('width', outerRadius * 2)
    .classed('cluster-radial', true);

// 颜色比例尺
const color = d3.scaleSequential(d3.interpolateRainbow)
    .domain([0, 8]);

// 结构化csv数据工具
const stratify = d3.stratify()
    .id(data => data['id'])
    .parentId(data => {
        return data['id'].substring(0, data['id'].lastIndexOf('.'));
    });

const cluster = d3.cluster()
// 设置size[360, radius], 生成极坐标系坐标
    .size([360, innerRadius]);


d3.csv('assets/data/flare.csv').then(data => {
    // 处理数据，排序（所有的层次生成关系为之前都要排序）
    const root = stratify(data)
        .sort((a, b) => a['height'] - b['height']);

    // 生成关系位置
    cluster(root);

    // 移动中心点坐标系
    const chart = svg.append('g')
        .classed('chart', true)
        .attr('transform', `translate(${outerRadius},${outerRadius})scale(1)`);

    // 绘制连线
    chart.append('g')
        .classed('links', true)
        .selectAll('.link')
        .data(root.descendants().slice(1))
        .enter().append('path')
        .each(function (d) {
            d['linkNode'] = this;
        })
        .attr('class', 'link')
        .attr('stroke', d => {
            return color(d['depth']);
        })
        .attr('d', d => diagonal(d));

    // 添加节点坐标系
    const node = chart.append('g')
        .classed('nodes', true)
        .selectAll('.node')
        .data(root.descendants())
        .enter().append('g')
        .classed('node', true)
        .each(function (d) {
            d['node'] = this;
        })
        .attr('transform', d => {
            return 'translate(' + project(d['x'], d['y']) + ')';
        })
        .on('mouseover', d => {
            nodeHovered(d, true);
        })
        .on('mouseout', d => {
            nodeHovered(d, false);
        });

    // 添加圆点
    node.append('circle')
        .classed('circle', true)
        .attr('r', 1.5);

    // 添加文字
    node.append('text')
        .classed('text', true)
        .attr('dy', '0.31em')
        .attr('x', d => d['x'] < 180 && !d['children'] ? 6 : -6)
        .style('text-anchor', d => {
            return d['x'] < 180 && !d['children'] ? 'start' : 'end';
        })
        .attr('transform', d => {
            return 'rotate(' + (d['x'] < 180 ? d['x'] - 90 : d['x'] + 90) + ')';
        })
        .text(d => {
            return d['id'].substring(d['id'].lastIndexOf('.') + 1);
        });

    // 控制缩放
    svg.call(
        d3.zoom()
            .scaleExtent([1 / 2, 8])
            .on('zoom', zoomed)
    );

    function zoomed() {
        chart.attr('transform', d3.event.transform);
    }

});

// 极坐标转为直角坐标(百度公式)
function project(x, y) {
    const angle = (x - 90) / 180 * Math.PI, radius = y;
    return [radius * Math.cos(angle), radius * Math.sin(angle)];
}

// 绘制link，父子节点连（也可以通过root.links()的数据来连）
function diagonal(d) {
    // return `M${project(d['x'], d['y'])} L${project(d['parent']['x'], d['parent']['y'])}`;

    return 'M' + project(d['x'], d['y'])
        + 'C' + project(d['x'], (d['y'] + d.parent.y) / 2)
        + ' ' + project(d['parent']['x'], (d['y'] + d['parent']['y']) / 2)
        + ' ' + project(d['parent']['x'], d['parent']['y']);
}

// 鼠标放置节点
function nodeHovered(data, hover) {
    d3.selectAll(data.ancestors().map(d => d['node'])).classed('node-hovered', hover);
    d3.selectAll(data.ancestors().map(d => d['linkNode'])).classed('link-hovered', hover);
}
