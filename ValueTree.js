(function() {
  // should implement Array.isArray if no native implementation is available
  if (typeof Array.isArray === "undefined") {
    Array.isArray = function(obj) {
      return Object.prototype.toString.call(obj) === "[object Array]";
    };
  }

  var ValueTree = {
    // should render tree to container
    render: function(tree, container) {
      // should handle container click events
      var getNodeItemPath = this.getNodeItemPath;
      container.onclick = function(e) {
        var el = e.target;
        while (el !== container) {
          if (el.className === "value-tree-node__name") {
            alert(getNodeItemPath(el.nodeItem));
          }

          el = el.parentElement;
        }
      };

      // should append rendered nodes to container
      container.appendChild(this.renderNode(tree, container.ownerDocument));
    },

    // should return path to node item
    getNodeItemPath(nodeItem) {
      // should do nothing if no nodeItem with node data given
      if (!nodeItem || !nodeItem.node) return "";

      // should collect path by moving up node by node (excluding root)
      var path = "";
      while (nodeItem.hasOwnProperty("childIndex")) {
        var index = String(nodeItem.childIndex);
        var name = String(nodeItem.node.name);
        path = index + ":" + name + (path.length ? "/" : "") + path;
        nodeItem = nodeItem.parentNodeItem;
      }

      // should alert path when have some
      return path;
    },

    // should recursively render tree nodes
    renderNode: function(node, doc) {
      // should return undefined when no node object given
      if (!node || typeof node !== "object") return undefined;

      // should wrap the whole tree node
      var wrapper = doc.createElement("div");
      wrapper.className = "value-tree-node";

      // should render item for the tree node itself
      var nodeItem = doc.createElement("span");
      nodeItem.className = "value-tree-node__item";
      wrapper.appendChild(nodeItem);

      // item should hold node data
      nodeItem.node = node;

      // wrapper should hold node item
      wrapper.nodeItem = nodeItem;

      // should render name
      var name = doc.createElement("span");
      name.className = "value-tree-node__name";
      name.innerHTML = node.name;
      nodeItem.appendChild(name);

      // name should hold the node item
      name.nodeItem = nodeItem;

      // should render value when presented
      if (node.hasOwnProperty("value")) {
        // should render readonly value
        var readonly = doc.createElement("span");
        readonly.className = "value-tree-node__value";
        readonly.innerHTML = String(node.value);
        nodeItem.appendChild(readonly);

        // should render hidden editable value
        var editable = doc.createElement("input");
        editable.type = "text";
        editable.hidden = true;
        nodeItem.appendChild(editable);

        // should handle ediging on click
        var edit = function(e) {
          editable.value = String(node.value);
          readonly.hidden = true;
          editable.hidden = false;
        };
        readonly.onclick = edit;

        // should handle saving on blur or ENTER hit
        var save = function(e) {
          readonly.innerHTML = node.value = editable.value;
          readonly.hidden = false;
          editable.hidden = true;
        };
        editable.onblur = save;
      }

      //should render children when presented
      if (Array.isArray(node.children)) {
        var children = doc.createElement("div");
        children.className = "value-tree-node__children";
        wrapper.appendChild(children);

        // should render children recursively
        for (var i = 0, n = node.children.length; i < n; i++) {
          var child = this.renderNode(node.children[i], doc);

          // should skip when child is undefined
          if (child) {
            children.appendChild(child);

            // child node item should hold child index and parent node item
            child.nodeItem.childIndex = i;
            child.nodeItem.parentNodeItem = nodeItem;
          }
        }
      }

      return wrapper;
    },

    // should return tree created by merging every {path,value} pair given
    parse: function(pairs) {
      // should return undefined when no array argument presented
      if (!Array.isArray(pairs)) return undefined;

      var root = {
        name: "root",
        children: []
      };
      for (var i = 0; i < pairs.length; i++) {
        // should return undefined when any pair can not be merged
        if (!this.mergePair(root, pairs[i])) return undefined;
      }
      return root;
    },

    // should return the result of merging root with the {path,value} pair
    mergePair: function(root, pair) {
      // should return undefined when falsy root given
      if (!root) return undefined;

      // should return undefined when given pair can not be parsed
      var stepway = this.parsePair(pair);
      if (!stepway) return undefined;

      var node = root;
      for (var i = 0, last = stepway.steps.length - 1; i <= last; i++) {
        var step = stepway.steps[i];
        if (!node.children) node.children = [];

        // should maintain multiple children of the same node
        var existingChild = node.children[step.index];
        if (existingChild) {
          // should return undefined when given pair has path conflict
          if (existingChild.name !== step.name) return undefined;

          // should return undefined when given pair has value conflict
          if (i === last && existingChild.value !== step.value)
            return undefined;
        }

        var child = existingChild || { name: step.name };
        node.children[step.index] = child;
        node = child;
      }

      node.value = pair.value;
      return root;
    },

    // should return {steps,value} stepway when {path,value} pair given
    parsePair: function(pair) {
      //should return undefined when no object argument presented
      if (!pair || typeof pair !== "object") return undefined;

      // should return undefined when path can not be defined
      var steps = this.parsePath(pair.path);
      if (!steps) return undefined;

      return { steps: steps, value: pair.value };
    },

    // should return array of {index,name} steps when 'index:name/...' given
    parsePath: function(path) {
      // should return undefined when argument is not a string
      if (typeof path !== "string") return undefined;

      var segments = path.split("/");
      var steps = Array(segments.length);
      for (var i = 0; i < segments.length; i++) {
        steps[i] = this.parsePathSegment(segments[i]);

        // should return undefined when any segment can not be defined
        if (!steps[i]) return undefined;
      }
      return steps;
    },

    // should return {index,name} when 'index:name' segment given
    parsePathSegment: function(segment) {
      // should return undefined when argument is not a string
      if (typeof segment !== "string") return undefined;

      // should return undefined when given argument does not contain colon
      var colonIndex = segment.indexOf(":");
      if (colonIndex < 0) return undefined;

      // should return undefined when given argument contains slash
      if (segment.indexOf("/") >= 0) return undefined;

      // should return undefined when given index is not a number
      var index = Number(segment.slice(0, colonIndex));
      if (isNaN(index)) return undefined;

      // should allow colons within the name
      return {
        index: index,
        name: segment.slice(colonIndex + 1, segment.length)
      };
    }
  };

  // should export when using from module
  if (typeof module !== "undefined") {
    module.exports = ValueTree;
  }

  // should add to window when using from browser
  if (typeof window !== "undefined") {
    window.ValueTree = ValueTree;
  }
})();
