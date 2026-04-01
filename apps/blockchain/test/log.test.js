const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LogIntegrity", function () {
  let contract;

  beforeEach(async function () {
    const Contract = await ethers.getContractFactory("LogIntegrity");
    contract = await Contract.deploy();
    await contract.waitForDeployment();
  });

  // ─── Per-log anchoring ─────────────────────────────────────────────────
  it("should store and verify a log hash", async function () {
    await contract.storeLog("log-1", "hash123");
    const result = await contract.verifyLog("log-1", "hash123");
    expect(result).to.equal(true);
  });

  it("should reject an incorrect hash during verification", async function () {
    await contract.storeLog("log-2", "hash456");
    const result = await contract.verifyLog("log-2", "wronghash");
    expect(result).to.equal(false);
  });

  it("should revert when storing a duplicate logId", async function () {
    await contract.storeLog("log-3", "hash789");
    await expect(
      contract.storeLog("log-3", "anotherhash")
    ).to.be.revertedWith("Log already exists");
  });

  it("should return the stored hash and timestamp via getLog", async function () {
    await contract.storeLog("log-4", "hashABC");
    const [hash, ts] = await contract.getLog("log-4");
    expect(hash).to.equal("hashABC");
    expect(Number(ts)).to.be.greaterThan(0);
  });

  // ─── Batch Merkle root anchoring ───────────────────────────────────────
  it("should store a Merkle root and retrieve it", async function () {
    const root = ethers.keccak256(ethers.toUtf8Bytes("root1"));
    await contract.storeMerkleRoot(root);
    const roots = await contract.getMerkleRoots();
    expect(roots.length).to.equal(1);
    expect(roots[0]).to.equal(root);
  });

  it("should accumulate multiple Merkle roots", async function () {
    const r1 = ethers.keccak256(ethers.toUtf8Bytes("batch1"));
    const r2 = ethers.keccak256(ethers.toUtf8Bytes("batch2"));
    await contract.storeMerkleRoot(r1);
    await contract.storeMerkleRoot(r2);
    const count = await contract.getMerkleRootCount();
    expect(Number(count)).to.equal(2);
  });
});