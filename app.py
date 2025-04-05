from flask import Flask, request, jsonify
from collections import deque
from flask import render_template

app = Flask(__name__)

def build_graph(edges):
    graph = {}
    for edge in edges:
        a, b = edge.split('-')
        graph.setdefault(a, []).append(b)
        graph.setdefault(b, []).append(a)
    return graph

def dfs(graph, start, end=None):
    visited = set()
    path = []

    def dfs_visit(node):
        if node in visited:
            return False
        visited.add(node)
        path.append(node)
        # Si hay un nodo final, se detiene el recorrido
        if end and node == end:
            return True
        # Recorre los vecinos
        for neighbor in graph.get(node, []):
            if dfs_visit(neighbor):
                return True
        return False

    dfs_visit(start)
    
    # Si no se proporciona 'end', simplemente devolveremos el recorrido completo.
    if not end:
        return path

    return path

def bfs(graph, start, end=None):
    visited = set([start])
    queue = deque([[start]])
    
    # Si no se proporciona un nodo final, simplemente devolvemos todos los nodos visitados.
    while queue:
        path = queue.popleft()
        node = path[-1]
        
        # Si hay un nodo final, devuelve el camino hasta ese nodo.
        if end and node == end:
            return path
        
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(path + [neighbor])
    
    # Si no hay nodo final, devolvemos todos los nodos visitados en el orden de visita.
    if not end:
        return list(visited)
    
    return []


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/traverse", methods=["POST"])
def traverse():
    data = request.get_json()
    edges = data['edges']
    start = data['start']
    
    # Si el nodo final está vacío, lo dejamos como None
    end = data.get('end') if data.get('end') != "" else None
    algorithm = data['algorithm']

    graph = build_graph(edges)

    if algorithm == "DFS":
        path = dfs(graph, start, end)
    else:
        path = bfs(graph, start, end)

    return jsonify({"path": path})


if __name__ == '__main__':
    app.run(debug=True)
