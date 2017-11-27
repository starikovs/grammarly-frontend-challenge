/**
 * The graph of rooms.
 * 
 * @type {Object}
 */
let graph;

/**
 * Builds a graph out of the array of floors.
 * 
 * @param {number[][]} floors The array of floors.
 * @returns {Object} The graph.
 */
function buildGraph (floors) {
  if (graph) {
    return graph;
  }

  let nodes = {};

  iterateRooms(floors, (floor, floorIndex, room, roomIndex) => {
    if (!floors[floorIndex][roomIndex]) {
      return;
    }

    nodes[getRoomName(floorIndex, roomIndex)] =
      createNode(
        floorIndex,
        roomIndex,
        floors[floorIndex][roomIndex]
      );

  });

  buildEdges(nodes, floors);

  return (graph = nodes);
}

/**
 * Iterate through floors and rooms and call the specified callback.
 * 
 * The callback is called with thi arguments: floor, floorIndex, room, roomIndex.
 * 
 * @param {number[][]} floors The array of floors.
 * @param {Function} callback The callback that will be called.
 */
function iterateRooms (floors, callback) {
  floors.forEach((floor, floorIndex) => {
    floor.forEach((room, roomIndex) => {
      callback(floor, floorIndex, room, roomIndex);
    });
  });
}

/**
 * Returns the room name.
 * For example, "5:2" where 5 is a floor index and 2 is a room index.
 * 
 * @param {number} floor The floor index.
 * @param {number} room The room index.
 * @returns {string} The room name. 
 */
function getRoomName(floor, room) {
  return `${floor}:${room}`;
}

/**
 * Creates a single node for the graph.
 * 
 * @param {number} floor The floor index.
 * @param {number} room The room index.
 * @param {number} weight The weight of this node.
 * @returns {Object} The node that will be used in the graph.
 */
function createNode(floor, room, weight) {
  return {
    name: getRoomName(floor, room),
    floor: floor,
    room: room,
    weight: weight,
    children: []
  };
}

/**
 * Builds edges for the each node of the graph.
 * 
 * @param {Object} graph The graph.
 * @param {number[][]} floors The array of floors.
 */
function buildEdges (graph, floors) {
  iterateRooms(floors, (floor, floorIndex, room, roomIndex) => {
    if (!floors[floorIndex][roomIndex]) {
      return;
    }

    createEdges(
      graph[getRoomName(floorIndex, roomIndex)],
      graph,
      floors
    );
  });
}

/**
 * Takes the node and finds out its neighbours, then creates edges to them.
 * 
 * @param {Object} node The node.
 * @param {Object} graph The graph.
 * @param {number[][]} floors The array of floors.
 */
function createEdges(node, graph, floors) {
  let floor = node.floor;
  let room = node.room;

  if (floors[floor][room - 1]) {
    createEdge(node, graph[getRoomName(floor, room - 1)]);
  }

  if (floors[floor][room + 1]) {
    createEdge(node, graph[getRoomName(floor, room + 1)]);
  }

  if (floors[floor - 1] && floors[floor - 1][room]) {
    createEdge(node, graph[getRoomName(floor - 1, room)]);
  }

  if (floors[floor + 1] && floors[floor + 1][room]) {
    createEdge(node, graph[getRoomName(floor + 1, room)]);
  }
}

/**
 * Creates an edge from the startNode to the endNode.
 * 
 * @param {Object} startNode The node from which the edge is created.
 * @param {Object} endNode The node to which the edge is created.
 */
function createEdge(startNode, endNode) {
  startNode.children.push(endNode);
}

/**
 * Crawls from the starting node to the final destination by choosing the 
 * neighbour nodes with the lowest weights. (A sort of Dijkstra's algorithm)
 * 
 * The start/end objects have only these two properties:
 * {floor: number, room: number}
 * 
 * @param {Object} graph The graph.
 * @param {Object} start The first room in the path.
 * @param {Object} end The final room in the path.
 * @returns {Object} The hash "room name"->"weight" to calc the shortest path based on it.
 */
function buildWeights (graph, start, end) {
  let startNodeName = getRoomName(start.floor, start.room);
  let endNodeName = getRoomName(end.floor, end.room);

  let startNode = graph[startNodeName];

  let visited = [];
  let queue = [startNode];
  let weights = {
    [startNode.name]: {
      name: startNode.name,
      weight: 0
    }
  };

  while (queue.length) {
    let node = queue.shift();
    let nodeWeight = weights[node.name].weight;
    let localQueue = [];
    visited.push(node);

    node.children.forEach(childNode => {
      if (visited.indexOf(childNode) === -1) {
        let childNodeWeight = childNode.weight;
        let savedWeight = weights[childNode.name];

        if (!savedWeight ||
          nodeWeight + childNodeWeight < savedWeight.weight) {
          weights[childNode.name] = {
            name: childNode.name,
            weight: nodeWeight + childNode.weight,
            from: node.name
          };

          if (childNode.name !== endNodeName) {
            localQueue.push(childNode);
          }
        }
      }
    });

    localQueue.sort((a, b) => a.weight - b.weight);
    queue = queue.concat(localQueue);
  }

  return weights;
}

/**
 * Calculates the shortest path from the starting node to the final one.
 * 
 * The start/end objects have only these two properties:
 * {floor: number, room: number}
 * 
 * @param {Object} graph The graph.
 * @param {Object} start The first room in the path.
 * @param {Object} end The final room in the path.
 * @returns {Object[]} The path in the format [{floor:srcN,room:srcN},..{floor:destN,room:destN}].
 */
function getPath (graph, start, end) {
  let weights = buildWeights(graph, start, end);

  let startRoomName = getRoomName(start.floor, start.room);
  let endRoomName = getRoomName(end.floor, end.room);

  if (!weights[startRoomName] || !weights[endRoomName]) {
    return [];
  }

  let path = [];
  let currentRoom = weights[endRoomName];

  while (currentRoom) {
    path.unshift({ 
      floor: graph[currentRoom.name].floor, 
      room: graph[currentRoom.name].room 
    });

    currentRoom = weights[currentRoom.from];
  }

  return path;
}

/**
 * Find a shortes path from start to end.
 * 
 * @param {number[][]} times A matrix specifying the time it takes
 * for the lift to pass through an apartment.
 * times[i][j] equals 0 means that there is no way through that apartment [i,j].
 *
 * @param {Object} start The room to start from. {floor: number, room: number}
 * @param {Object} end The destination room. {floor: number, room: number}
 * @returns {Object[]} The shortest path from `start` to `end` {floor: number, room: number}[].
 */
export function solve (times, start, end) {
  let floors = times.slice().reverse();
  let graph = buildGraph(floors);
  let path = getPath(graph, start, end);

  return path;
};

window.solve = solve;
