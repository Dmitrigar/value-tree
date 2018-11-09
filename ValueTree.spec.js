var expect = require("chai").expect;
var ValueTree = require("./ValueTree");

describe("Tree", function() {
  describe("#parseTree()", function(arg) {
    it("Should return value-tree structure when empty array given", function() {
      expect(ValueTree.parse([])).to.deep.equal({
        name: "root",
        children: []
      });
    });

    it("Should return value-tree structure when single-item array given", function() {
      expect(
        ValueTree.parse([{ path: "0:alpha", value: "one" }])
      ).to.deep.equal({
        name: "root",
        children: [{ name: "alpha", value: "one" }]
      });
      expect(
        ValueTree.parse([{ path: "0:alpha/2:beta", value: "two" }])
      ).to.deep.equal({
        name: "root",
        children: [
          {
            name: "alpha",
            children: [,,{ name: "beta", value: "two" }]
          }
        ]
      });
    });

    it("should return undefined when no array argument presented", function() {
      expect(ValueTree.parse()).to.be.undefined;
      expect(ValueTree.parse(null)).to.be.undefined;
      expect(ValueTree.parse(42)).to.be.undefined;
      expect(ValueTree.parse(true)).to.be.undefined;
      expect(ValueTree.parse("alpha")).to.be.undefined;
      expect(ValueTree.parse({})).to.be.undefined;
      expect(ValueTree.parse(function() {})).to.be.undefined;
    });
  });

  describe("#parsePathValue()", function() {
    it("should return {segments, value} object when {path,value} object given", function() {
      expect(
        ValueTree.parsePathValue({ path: "0:alpha", value: "one" })
      ).to.deep.equal({
        segments: [{ id: 0, name: "alpha" }],
        value: "one"
      });
      expect(
        ValueTree.parsePathValue({ path: "1:beta/0:gamma", value: "two" })
      ).to.deep.equal({
        segments: [{ id: 1, name: "beta" }, { id: 0, name: "gamma" }],
        value: "two"
      });
    });

    it("should return undefined when no object argument presented", function() {
      expect(ValueTree.parsePathValue()).to.be.undefined;
      expect(ValueTree.parsePathValue(null)).to.be.undefined;
      expect(ValueTree.parsePathValue(42)).to.be.undefined;
      expect(ValueTree.parsePathValue(true)).to.be.undefined;
      expect(ValueTree.parsePathValue([])).to.be.undefined;
      expect(ValueTree.parsePathValue("alpha")).to.be.undefined;
      expect(ValueTree.parsePathValue(function() {})).to.be.undefined;
    });

    it("should return undefined when path is failed to parse", function() {
      expect(ValueTree.parsePathValue({ path: "alpha" })).to.be.undefined;
    });
  });

  describe("#parsePath()", function() {
    it("should return array of {id,name} when 'id:name/id:name/...' given", function() {
      expect(ValueTree.parsePath("1:alpha")).to.deep.equal([
        { id: 1, name: "alpha" }
      ]);
      expect(ValueTree.parsePath("2:beta/3:gamma")).to.deep.equal([
        { id: 2, name: "beta" },
        { id: 3, name: "gamma" }
      ]);
    });

    it("should return undefined when argument is not a string.", function() {
      expect(ValueTree.parsePath()).to.be.undefined;
      expect(ValueTree.parsePath(null)).to.be.undefined;
      expect(ValueTree.parsePath(42)).to.be.undefined;
      expect(ValueTree.parsePath(true)).to.be.undefined;
      expect(ValueTree.parsePath([])).to.be.undefined;
      expect(ValueTree.parsePath({})).to.be.undefined;
      expect(ValueTree.parsePath(function() {})).to.be.undefined;
    });

    it("should return undefined when any segment considered undefined", function() {
      expect(ValueTree.parsePath("?????/2:beta")).to.be.undefined;
      expect(ValueTree.parsePath("1:alpha/?????")).to.be.undefined;
      expect(ValueTree.parsePath("1:alpha/?????/3:gamma")).to.be.undefined;
    });
  });

  describe("#parsePathSegment()", function() {
    it("should return {id,name} when 'id:name' given", function() {
      expect(ValueTree.parsePathSegment("0:alpha")).to.deep.equal({
        id: 0,
        name: "alpha"
      });
      expect(ValueTree.parsePathSegment("1:beta")).to.deep.equal({
        id: 1,
        name: "beta"
      });
    });

    it("should allow colons within the name", function() {
      expect(ValueTree.parsePathSegment("15:colons:are:ok")).to.deep.equal({
        id: 15,
        name: "colons:are:ok"
      });
    });

    it("should return undefined when argument is not a string", function() {
      expect(ValueTree.parsePathSegment()).to.be.undefined;
      expect(ValueTree.parsePathSegment(null)).to.be.undefined;
      expect(ValueTree.parsePathSegment(42)).to.be.undefined;
      expect(ValueTree.parsePathSegment(true)).to.be.undefined;
      expect(ValueTree.parsePathSegment([])).to.be.undefined;
      expect(ValueTree.parsePathSegment({})).to.be.undefined;
      expect(ValueTree.parsePathSegment(function() {})).to.be.undefined;
    });

    it("should return undefined when given argument does not contain colon", function() {
      expect(ValueTree.parsePathSegment("alpha")).to.be.undefined;
    });

    it("should return undefined when given argument contains slash", function() {
      expect(ValueTree.parsePathSegment("1:beta/2:gamma")).to.be.undefined;
    });

    it("should return undefined when given id is not a number", function() {
      expect(ValueTree.parsePathSegment("NaN:alpha")).to.be.undefined;
    });
  });
});
