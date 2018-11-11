var expect = require("chai").expect;
var ValueTree = require("./ValueTree");

describe("ValueTree", function() {
  describe("#parse(pairs)", function() {
    it("should return tree created by merging every {path,value} pair given", function() {
      expect(ValueTree.parse([])).to.deep.equal({
        name: "root",
        children: []
      });

      expect(
        ValueTree.parse([
          { path: "0:alpha", value: "one" },
          { path: "1:beta/0:gamma", value: "two" }
        ])
      ).to.deep.equal({
        name: "root",
        children: [
          { name: "alpha", value: "one" },
          { name: "beta", children: [{ name: "gamma", value: "two" }] }
        ]
      });

      expect(
        ValueTree.parse([
          { path: "0:alpha/0:beta", value: "one" },
          { path: "2:delta", value: "two" }
        ])
      ).to.deep.equal({
        name: "root",
        children: [
          { name: "alpha", children: [{ name: "beta", value: "one" }] },
          ,
          { name: "delta", value: "two" }
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

    it("should return undefined when any pair can not be merged", function() {
      expect(ValueTree.parse([{ path: "???", value: "one" }])).to.be.undefined;

      expect(
        ValueTree.parse([
          { path: "0:alpha", value: "one" },
          { path: "???", value: "one" }
        ])
      ).to.be.undefined;
    });
  });

  describe("#mergePair(root, pair)", function() {
    it("should return the result of merging root with the {path,value} pair", function() {
      var tree = { name: "root", children: [] };

      expect(
        ValueTree.mergePair(tree, { path: "0:alpha", value: "one" })
      ).to.deep.equal({
        name: "root",
        children: [{ name: "alpha", value: "one" }]
      });

      expect(
        ValueTree.mergePair(tree, { path: "1:beta/2:gamma", value: "two" })
      ).to.deep.equal({
        name: "root",
        children: [
          { name: "alpha", value: "one" },
          { name: "beta", children: [, , { name: "gamma", value: "two" }] }
        ]
      });
    });

    it("should maintain multiple children of the same node", function() {
      expect(
        ValueTree.mergePair(
          {
            name: "root",
            children: [
              {
                name: "alpha",
                children: [
                  { name: "beta", value: "one" }
                ]
              }
            ]
          },
          { path: "0:alpha/1:gamma", value: "two" }
        )
      ).to.deep.equal({
        name: "root",
        children: [
          {
            name: "alpha",
            children: [
              { name: "beta", value: "one" },
              { name: "gamma", value: "two" }
            ]
          }
        ]
      });
    });

    it("should return undefined when paths has name conflicts", function() {
      expect(
        ValueTree.mergePair(
          { name: "root", children: [{ path: "0:alpha", value: "one" }] },
          { path: "0:CONFLICTING_NAME", value: "one" }
        )
      ).to.be.undefined;
    });

    it("should return undefined when falsy root given", function() {
      expect(ValueTree.mergePair(undefined, { path: "0:alpha", value: "one" }))
        .to.be.undefined;
    });

    it("should return undefined when given pair can not be parsed", function() {
      expect(
        ValueTree.mergePair(
          {
            name: "root",
            children: []
          },
          undefined
        )
      ).to.be.undefined;

      expect(
        ValueTree.mergePair(
          { name: "root", children: [] },
          { path: "?", value: "one" }
        )
      ).to.be.undefined;
    });
  });

  describe("#parsePair(pair)", function() {
    it("should return {steps,value} stepway when {path,value} pair given", function() {
      expect(
        ValueTree.parsePair({ path: "0:alpha", value: "one" })
      ).to.deep.equal({ steps: [{ id: 0, name: "alpha" }], value: "one" });
    });

    it("should return undefined when no object argument presented", function() {
      expect(ValueTree.parsePair()).to.be.undefined;
      expect(ValueTree.parsePair(null)).to.be.undefined;
      expect(ValueTree.parsePair(42)).to.be.undefined;
      expect(ValueTree.parsePair(true)).to.be.undefined;
      expect(ValueTree.parsePair("alpha")).to.be.undefined;
      expect(ValueTree.parsePair([])).to.be.undefined;
      expect(ValueTree.parsePair(function() {})).to.be.undefined;
    });

    it("should return undefined when path can not be defined", function() {
      expect(ValueTree.parsePair({ value: "one" })).to.be.undefined;
      expect(ValueTree.parsePair({ path: "?", value: "two" })).to.be.undefined;
    });
  });

  describe("#parsePath(path)", function() {
    it("should return array of {id,name} steps when 'id:name/...' path given", function() {
      expect(ValueTree.parsePath("1:alpha")).to.deep.equal([
        { id: 1, name: "alpha" }
      ]);

      expect(ValueTree.parsePath("2:beta/3:gamma")).to.deep.equal([
        { id: 2, name: "beta" },
        { id: 3, name: "gamma" }
      ]);
    });

    it("should return undefined when argument is not a string", function() {
      expect(ValueTree.parsePath()).to.be.undefined;
      expect(ValueTree.parsePath(null)).to.be.undefined;
      expect(ValueTree.parsePath(42)).to.be.undefined;
      expect(ValueTree.parsePath(true)).to.be.undefined;
      expect(ValueTree.parsePath([])).to.be.undefined;
      expect(ValueTree.parsePath({})).to.be.undefined;
      expect(ValueTree.parsePath(function() {})).to.be.undefined;
    });

    it("should return undefined when any segment can not be defined", function() {
      expect(ValueTree.parsePath("?????/2:beta")).to.be.undefined;
      expect(ValueTree.parsePath("1:alpha/?????")).to.be.undefined;
      expect(ValueTree.parsePath("1:alpha/?????/3:gamma")).to.be.undefined;
    });
  });

  describe("#parsePathSegment(segment)", function() {
    it("should return {id,name} when 'id:name' segment given", function() {
      expect(ValueTree.parsePathSegment("0:alpha")).to.deep.equal({
        id: 0,
        name: "alpha"
      });

      expect(ValueTree.parsePathSegment("1:beta")).to.deep.equal({
        id: 1,
        name: "beta"
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

    it("should allow colons within the name", function() {
      expect(ValueTree.parsePathSegment("15:colons:are:ok")).to.deep.equal({
        id: 15,
        name: "colons:are:ok"
      });
    });
  });
});
