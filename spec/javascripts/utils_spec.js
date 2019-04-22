import { pfx } from "/utils.js";

describe("rhetButler.pfx", function() {
    it("should have a string value for 'transition-duration'", function() {
        expect(typeof pfx("transition-duration")).toBe("string");
      });
  });
