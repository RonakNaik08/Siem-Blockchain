// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LogIntegrity {
    // ─── Per-log storage ────────────────────────────────────────────────────
    struct LogRecord {
        string hash;
        uint256 timestamp;
    }

    mapping(string => LogRecord) private logs;

    event LogStored(string logId, string hash, uint256 timestamp);

    function storeLog(string memory logId, string memory hash) public {
        require(bytes(logs[logId].hash).length == 0, "Log already exists");
        logs[logId] = LogRecord(hash, block.timestamp);
        emit LogStored(logId, hash, block.timestamp);
    }

    function verifyLog(string memory logId, string memory hash)
        public
        view
        returns (bool)
    {
        return keccak256(bytes(logs[logId].hash)) == keccak256(bytes(hash));
    }

    function getLog(string memory logId)
        public
        view
        returns (string memory, uint256)
    {
        return (logs[logId].hash, logs[logId].timestamp);
    }

    // ─── Batch Merkle-root storage (for the log-service batch pipeline) ────
    bytes32[] private merkleRoots;

    event MerkleRootStored(bytes32 root, uint256 timestamp);

    function storeMerkleRoot(bytes32 root) public {
        merkleRoots.push(root);
        emit MerkleRootStored(root, block.timestamp);
    }

    function getMerkleRoots() public view returns (bytes32[] memory) {
        return merkleRoots;
    }

    function getMerkleRootCount() public view returns (uint256) {
        return merkleRoots.length;
    }
}