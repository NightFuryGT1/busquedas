function parseEdges(input) {
    return input.split(',').map(e => e.trim()).filter(e => e.includes('-'));
}
async function execute() {
    const edges = parseEdges(document.getElementById("edges").value);
    const start = document.getElementById("start").value.trim();
    const end = document.getElementById("end").value.trim() || null;  // Si no hay valor, usar null
    const algorithm = document.getElementById("algorithm").value;
  
    const res = await fetch("/traverse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ edges, start, end, algorithm })
    });
  
    const data = await res.json();
    drawGraph(edges, data.path);
    displayPath(data.path);
  }
  

function drawGraph(edges, path) {
    d3.select("svg#graph").selectAll("*").remove();

    const nodesSet = new Set();
    const links = [];
    edges.forEach(e => {
        const [a, b] = e.split("-");
        nodesSet.add(a);
        nodesSet.add(b);
        links.push({ source: a, target: b });
    });
    const nodes = Array.from(nodesSet).map(id => ({ id }));

    const svg = d3.select("svg#graph");
    const width = +svg.attr("width");
    const height = +svg.attr("height");

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-400))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("class", "link");

    const node = svg.append("g")
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("class", "node")
        .attr("r", 20);

    const label = svg.append("g")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .text(d => d.id)
        .attr("text-anchor", "middle")
        .attr("dy", 5);

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        label
            .attr("x", d => d.x)
            .attr("y", d => d.y);
    });

    animatePath(path, node);
}

function animatePath(path, nodeSelection) {
    let i = 0;
    const interval = setInterval(() => {
        if (i >= path.length) {
            clearInterval(interval);
            return;
        }
        nodeSelection.filter(d => d.id === path[i]).classed("visited", true);
        i++;
    }, 800);
}

function clearGraph() {
    d3.select("svg#graph").selectAll("*").remove();
}

function reset() {
    document.getElementById("edges").value = "";
    document.getElementById("start").value = "";
    clearGraph();
}
