// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LogIntegrity {
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
        return keccak256(bytes(logs[logId].hash)) ==
            keccak256(bytes(hash));
    }

    function getLog(string memory logId)
        public
        view
        returns (string memory, uint256)
    {
        return (logs[logId].hash, logs[logId].timestamp);
    }
}