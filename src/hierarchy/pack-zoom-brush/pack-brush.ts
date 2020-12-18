import * as d3 from 'd3';
import './pack.css';

const width = 800;
const height = 800;

// 添加容器
const svg = d3.select('body')
    .append('svg')
    .attr('height', height)
    .attr('width', width)
    .classed('pack-zoom-brush-layout', true);

// 颜色比例尺
const color = d3.scaleSequential(d3.interpolateMagma)
    .domain([-1, 10]);

// 结构化csv数据工具
const stratify = d3.stratify()
    .id(data => data['id'])
    .parentId(data => {
        return data['id'].substring(0, data['id'].lastIndexOf('.'));
    });

// 打包图关系位置生成器
const pack = d3.pack()
    .size([width, height])
    .padding(3);

d3.csv('./assets/data/flare.csv').then(data => {
    // 打包图需要确定包大小(value);
    const root = stratify(data)
    // 需要根据节点值确定图形大小
        .sum(d => d['val'])
        // 排序才能使生成的图形填满整个圆,一定要是降序排列
        .sort((a, b) => b['value'] - a['value']);

    // 打包
    pack(root);

    // 确定所有节点坐标系统
    const nodes = svg.append('g')
        .classed('nodes', true);

    const node = nodes
        .selectAll('.node')
        .data(root.descendants())
        .enter().append('g')
        .classed('node', true)
        .attr('transform', d => `translate(${d['x']},${d['y']})`)
        .each(function (d) {
            // 节点数据与节点元素绑定
            d['node'] = this;
        });

    // 添加节点圆环
    node.append('circle')
        .attr('r', d => d['r'])
        .attr('id', d => `node_${d.id}`)
        .attr('fill', d => color(d['depth']));

    // 添加title
    node.append('title')
        .text(d => `${d.id}--${d3.format(',d')(d.value)}`);

    // 添加文本 && 限定剪切
    node.append('clipPath')
        .attr('id', d => `clip_${d.id}`)
        .append('use')
        .attr('xlink:href', d => `#node_${d.id}`);

    node.append('text')
        .filter(d => !d.children)
        .classed('text', true)
        .attr('clip-path', d => `url(#clip_${d.id})`)
        .attr('y', 1)
        .text(d => d['id'].substring(d['id'].lastIndexOf('.') + 1));

    // 刷子
    const brush = d3.brush()
    // .extent([[0, 0], [width, height]])
        .on('start', () => {
            node.classed('node-hover', false);
        })
        .on('end', () => {
            if (!d3.event.sourceEvent) {
                return;
            }
            if (!d3.event.selection) {
                return;
            }
            const d0 = d3.event.selection[0];
            const d1 = d3.event.selection[1];
            node.filter(d => {
                return d['x'] > d0[0] && d['x'] < d1[0] && d['y'] > d0[1] && d['y'] < d1[1];
            }).classed('node-hover', true);
        });

    // 刷子
    nodes.append('g')
        .classed('brush', true)
        .call(brush);

    // 控制缩放
    const zoom = d3.zoom()
        .scaleExtent([1 / 2, 8])
        .filter(() => d3.event.button !== 2 && d3.event.buttons !== 2)
        .on('zoom', zoomed);

    svg.call(zoom)
        .on('dblclick.zoom', () => {
            zoom.transform(<any>svg.transition().duration(750), d3.zoomIdentity);
        })
        .on('wheel', () => {
            d3.event.preventDefault();
        });

    function zoomed() {
        const transform = d3.event.transform;

        // 增加拖动区域限制
        if (transform.x > 0 && transform.x > width) {
            transform.x = width;
        } else if (transform.x < 0 && Math.abs(transform.x) > transform.k * width) {
            transform.x = -(width * transform.k);
        }

        if (transform.y > 0 && transform.y > height) {
            transform.y = height;
        } else if (transform.y < 0 && Math.abs(transform.y) > transform.k * height) {
            transform.y = -(height * transform.k);
        }

        nodes.attr('transform', transform);
        node.selectAll('.text')
            .style('font-size', d => {
                return `${6 / (d3.event.transform.k > 4 ? d3.event.transform.k / 4 : 1)}px`;
            });
    }


});


