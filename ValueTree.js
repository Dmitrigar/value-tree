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
      // should highlight node path on click
      container.onclick = function(e) {
        // should handle only when clicked inside node item
        var regularClass = "value-tree-node__item";
        var highlightClass = "value-tree-node__item--highlight";
        var el = e.target;
        while (
          el &&
          el.className !== regularClass &&
          el.className !== highlightClass
        ) {
          el = el.parentElement;
        }
        if (!el) return;

        // should unselect all node items
        var highlights = container.getElementsByClassName(highlightClass);
        while (highlights.length) highlights[0].className = regularClass;

        // should select every parent node item
        do {
          el.className = highlightClass;
        } while ((el = el.parentNodeItem));
      };

      // should append rendered nodes to container
      container.appendChild(this.renderNode(tree, container.ownerDocument));
    },

    // should recursively render tree nodes
    renderNode: function(node, doc) {
      // should return undefined when no node object given
      if (!node || typeof node !== "object") return undefined;

      // should wrap the whole tree node
      var wrapper = doc.createElement("div");
      wrapper.className = "value-tree-node";

      // should render item for the tree node itself
      var item = doc.createElement("span");
      item.className = "value-tree-node__item";
      wrapper.appendChild(item);

      // should hold tree node item
      wrapper.nodeItem = item;

      // should render name
      var name = doc.createElement("span");
      name.className = "value-tree-node__name";
      name.innerHTML = node.name;
      item.appendChild(name);

      // should render value when presented
      if (node.hasOwnProperty("value")) {
        var value = doc.createElement("span");
        value.className = "value-tree-node__value";
        value.innerHTML = String(node.value);
        item.appendChild(value);
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
            // should hold parent item
            child.nodeItem.parentNodeItem = item;

            children.appendChild(child);
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

        var child = existingChild || {
          name: step.name
        };
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
