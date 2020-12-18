import * as d3 from 'd3';

const width = 800;
const height = 800;

// 添加容器
const svg = d3.select('body')
    .append('svg')
    .attr('height', height)
    .attr('width', width)
    .classed('treemap-layout', true);

// 颜色比例尺
const color = d3.scaleOrdinal()
    .range(d3.schemeCategory10
        .map(function (c) {
            const co = d3.rgb(c);
            co['opacity'] = 0.6;
            return co;
        }));

// 结构化csv数据工具
const stratify = d3.stratify()
    .id(data => data['id'])
    .parentId(data => {
        return data['id'].substring(0, data['id'].lastIndexOf('.'));
    });

// treemap关系位置生成器
const treemap = d3.treemap()
    .size([width, height])
    .padding(2)
    .round(true);


d3.csv('./assets/data/flare.csv').then(data => {
    // 打包图需要确定包大小(value);
    const root = stratify(data)
    // 包捆图都需要计算value
        .sum(d => d['val'])
        .sort((a, b) => b['value'] - a['value']);

    treemap(root);

    // 设定节点坐标系
    const node = svg.append('g')
        .classed('nodes', true)
        .selectAll('node')
        // treemap只展示叶节点
        .data(root.leaves())
        .enter().append('g')

        .attr('transform', d => `translate(${d['x0']},${d['y0']})`);

    // 添加节点矩形
    node.append('rect')
        .attr('width', d => d['x1'] - d['x0'])
        .attr('height', d => d['y1'] - d['y0'])
        .attr('fill', d => {
            while (d.depth > 2) {
                d = d.parent;
            }
            return <any>color(d['id']);
        });

    // 添加title文本
    node.append('title')
        .text(d => `${d.id}--${d.value}`);

});

