module.exports = {
  // should return tree created by merging every {path,value} pair given
  parse: function(pairs) {
    // should return undefined when no array argument presented
    if (!Array.isArray(pairs)) return undefined;

    var root = { name: "root", children: [] };
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
      var existingChild = node.children[step.id];

      // should return undefined when paths has name conflicts
      if (existingChild && existingChild.name !== step.name) return undefined;

      var child = existingChild || { name: step.name };
      node.children[step.id] = child;
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

  // should return array of {id,name} steps when 'id:name/...' given
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

  // should return {id,name} when 'id:name' segment given
  parsePathSegment: function(segment) {
    // should return undefined when argument is not a string
    if (typeof segment !== "string") return undefined;

    // should return undefined when given argument does not contain colon
    var colonIndex = segment.indexOf(":");
    if (colonIndex < 0) return undefined;

    // should return undefined when given argument contains slash
    if (segment.indexOf("/") >= 0) return undefined;

    // should return undefined when given id is not a number
    var id = Number(segment.slice(0, colonIndex));
    if (isNaN(id)) return undefined;

    // should allow colons within the name
    return { id: id, name: segment.slice(colonIndex + 1, segment.length) };
  }
};
