/* eslint no-underscore-dangle: ['error', { 'allow': ['_nodes', '_selectedNodeUrl',
  '_pingNode', '_retrieveCachedNodesData', '_selectFastestNode'] }] */
const WebSocket = require('ws');
const Cookies = require('js-cookie');

// BitsharesJS-WS Nodes Manager
// Selects node with minimal ping, stores nodes data in Cookies & retrieves it from there
class NodesManager {
  constructor({ nodes, defaultNode }) {
    this._nodes = nodes;
    this._selectedNodeUrl = defaultNode;
  }

  // gets nodes ping data from cookies
  _retrieveCachedNodesData() {
    const cachedData = Cookies.getJSON('BITSHARES_NODES');
    if (typeof (cachedData) === 'object' && cachedData !== null) {
      Object.keys(this._nodes).forEach(url => {
        const cachedNode = cachedData[url];
        if (cachedNode && cachedNode.ping && typeof (cachedNode.ping) === 'number') {
          this._nodes[url].ping = cachedNode.ping;
        }
      });
    }
  }

  // selects node with minimum ping
  _selectFastestNode() {
    Object.keys(this._nodes).forEach((url) => {
      const node = this._nodes[url];
      const selectedNode = this._nodes[this._selectedNodeUrl];
      if (node.ping && node.ping < (selectedNode.ping || 10000)) {
        this._selectedNodeUrl = url;
      }
    });
    return this._selectedNodeUrl;
  }

  // connected node and return ping time in milliseconds
  static _pingNode(url) {
    return new Promise((resolve) => {
      const date = new Date();
      let socket = new WebSocket(url);
      socket.onopen = () => {
        socket.close();
        socket = null;
        resolve(new Date() - date);
      };
      socket.onerror = () => {
        resolve(null);
      };
    });
  }

  // pings all nodes & updates nodes data, then saves data to cookies
  testNodesPings() {
    return new Promise((resolve) => {
      Promise.all(Object.keys(this._nodes).map(async (url) => {
        if (url !== this._selectedNodeUrl) {
          this._nodes[url].ping = await NodesManager._pingNode(url);
        }
      })).then(() => {
        Cookies.set('BITSHARES_NODES', this._nodes);
        resolve();
      });
    });
  }

  // retrieves nodes data from cache, selects fastest & returns it's url
  getInitialNodeUrl() {
    this._retrieveCachedNodesData();
    return this._selectFastestNode();
  }

  // changes selected node to next in speed & return it's url
  getAnotherNodeUrl() {
    this._nodes[this._selectedNodeUrl].ping = null;
    return this._selectFastestNode();
  }
}

module.exports = NodesManager;
