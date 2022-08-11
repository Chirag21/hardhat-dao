// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

error TargetAndDataMismatch(uint256 targetLength, uint256 dataLength);
error CallFailed(uint256 index, address target, bytes data);

contract MultiCall {
  function multiCall(address[] calldata targets, bytes[] calldata data)
    external
    returns (bytes[] memory)
  {
    uint256 targetLength = targets.length;
    uint256 dataLength = data.length;
    if (targetLength != dataLength) revert TargetAndDataMismatch(targetLength, dataLength);
    bytes[] memory results = new bytes[](dataLength);

    for (uint256 i; i < dataLength; i++) {
      (bool success, bytes memory result) = targets[i].delegatecall(data[i]);
      if (!success) revert CallFailed(i, targets[i], data[i]);
      results[i] = result;
    }

    return results;
  }
}
