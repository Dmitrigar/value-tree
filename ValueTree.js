module.exports = {
  // Parse array of {path,value} into value-tree structure.
  parse: function(arg) {
    // Should return undefined when no array argument presented.
    if (!Array.isArray(arg)) return undefined;

    // Create tree root.
    var root = { name: "root", children: [] };
    if (!arg.length) return root;

    // Parse current path-value.
    var current = this.parsePathValue(arg[0]);

    // Append current segments as nodes to tree.
    var node = root;
    var segmentsEnd = current.segments.length - 1;
    for (var segmentIndex = 0; segmentIndex <= segmentsEnd; segmentIndex++) {
      var segment = current.segments[segmentIndex];

      // Append child node to node.
      var childNode = { name: segment.name };
      node.children[segment.id] = childNode;

      if (segmentIndex === segmentsEnd) {
        // If this is last segment then extend child node with current value.
        childNode.value = current.value;
      } else {
        // Otherwise extend child node with children.
        childNode.children = [];
      }

      node = childNode;
    }

    // Return value-tree structure from root.
    return root;
  },

  // Parse {path,value} into {segments,value}, where segments is array of {id,name}.
  parsePathValue: function(arg) {
    // Should return undefined when no object argument presented.
    if (!arg) return undefined;

    // Should return undefined when path is failed to parse.
    var segments = this.parsePath(arg.path);
    if (!segments) return undefined;

    // Return {segments,value} object.
    return {
      segments: segments,
      value: arg.value
    };
  },

  // Parse path 'id:name/id:name/...' into array of {id,name}.
  parsePath: function(arg) {
    // Should return undefined when argument is not a string.
    if (typeof arg !== "string") return undefined;

    // Parse path segments to array of segment objects
    var segments = arg.split("/");
    var segmentsEnd = segments.length - 1;
    var objects = Array(segments.length);
    for (var segmentIndex = 0; segmentIndex <= segmentsEnd; segmentIndex++) {
      var obj = this.parsePathSegment(segments[segmentIndex]);

      // Should return undefined when any segment considered undefined.
      if (!obj) return undefined;

      objects[segmentIndex] = obj;
    }

    // Return array of segment objects.
    return objects;
  },

  // Parse 'id:name' into {id,name}.
  parsePathSegment: function(arg) {
    // Should return undefined when argument is not a string.
    if (typeof arg !== "string") return undefined;

    // Should return undefined when argument does not contain colon.
    var colonIndex = arg.indexOf(":");
    if (colonIndex < 0) return undefined;

    // Should return undefined when argument contains slash.
    if (arg.indexOf("/") >= 0) return undefined;

    // Should return undefined when given id is not a number.
    var id = Number(arg.slice(0, colonIndex));
    if (isNaN(id)) return undefined;

    // Return object with given id and name.
    return { id: id, name: arg.slice(colonIndex + 1, arg.length) };
  }
};
