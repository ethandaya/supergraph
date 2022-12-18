import { Entity } from "../src/core/engine";
describe("Entity", () => {
    it("should be able to set and get data", () => {
        const entity = new Entity("1");
        entity.set("name", "John");
        expect(entity.get("name")).toEqual("John");
    });
});
