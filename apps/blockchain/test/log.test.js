const { expect } = require("chai");

describe("LogIntegrity", function () {
  it("should store and verify log", async function () {
    const Contract = await ethers.getContractFactory("LogIntegrity");
    const contract = await Contract.deploy();

    await contract.storeLog("1", "hash123");

    const result = await contract.verifyLog("1", "hash123");

    expect(result).to.equal(true);
  });
});