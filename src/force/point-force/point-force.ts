import * as d3 from 'd3';
import './point-force.css';

const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3.select('body').append('svg')
    .classed('point-force', true)
    .attr('height', height)
    .attr('width', width);

// 结构化csv数据工具
const stratify = d3.stratify()
    .id(data => data['id'])
    .parentId(data => {
        return data['id'].substring(0, data['id'].lastIndexOf('.'));
    });

const color = d3.scaleSequential(d3.interpolateRainbow);


let nodes = d3.range(2000).map(function (i) {
    return {
        index: i
    };
});

let links = d3.range(nodes.length - 1).map(function (i) {
    return {
        source: Math.floor(Math.sqrt(i)),
        target: i + 1
    };
});


d3.csv('assets/data/flare.csv').then(data => {

    const root = stratify(data);
    // const nodes = root.descendants();
    // const links = root.links();

    color.domain([0, root.height + 1]);

    const simulation = d3.forceSimulation(<any>nodes)
        .force('link', d3.forceLink(links).strength(0.1))
        .force('many-body', d3.forceManyBody())
        .force('collision', d3.forceCollide(8))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .on('tick', ticked);

    const link = svg.append('g')
        .classed('links', true)
        .selectAll('.link')
        .data(links).enter()
        .append('line')
        .classed('link', true);

    const node = svg.append('g')
        .classed('nodes', true)
        .selectAll('.node')
        .data(nodes).enter()
        .append('circle')
        .each(function (d) {
            d['node'] = this;
        })
        .classed('node', true)
        .attr('r', 3)
        .attr('fill', d => color(d['height']));

    svg.call(<any>d3.drag()
        .subject(dragSubject)
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded)
    );

    function dragSubject() {
        return simulation.find(d3.event.x, d3.event.y, 100);
    }

    function dragStarted() {
        if (!d3.event.active) simulation.alphaTarget(0.5).restart();
        d3.event.subject.fx = d3.event.subject.x;
        d3.event.subject.fy = d3.event.subject.y;
    }

    function dragged() {
        d3.event.subject.fx = d3.event.x;
        d3.event.subject.fy = d3.event.y;
    }

    function dragEnded() {
        if (!d3.event.active) simulation.alphaTarget(0);
        d3.event.subject.fx = null;
        d3.event.subject.fy = null;
    }

    function ticked() {
        link
            .attr('x1', d => d.source['x'])
            .attr('y1', d => d.source['y'])
            .attr('x2', d => d.target['x'])
            .attr('y2', d => d.target['y']);

        node
            .attr('cx', d => d['x'])
            .attr('cy', d => d['y']);
    }

});
