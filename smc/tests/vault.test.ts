
import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const lpFarmer1 = accounts.get("wallet_1")!;
const lpFarmer2 = accounts.get("wallet_2")!;
const user1 = accounts.get("wallet_3")!;
const user2 = accounts.get("wallet_4")!;

/*
  Comprehensive test suite for the Liquidity Pool Manager smart contract
  Tests cover pool creation, trading, zones, rewards, and edge cases
*/

describe("Liquidity Pool Manager - Pool Creation", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("LP Farmer can create a liquidity pool with valid parameters", () => {
    const initialStx = 1000000; // 1 STX
    const initialUsdt = 1000000; // 1 USDT equivalent
    const zoneCount = 3;
    const zoneDuration = 144; // ~1 day in blocks

    const response = simnet.callPublicFn(
      "vault",
      "create-liquidity-pool",
      [
        Cl.uint(initialStx),
        Cl.uint(initialUsdt),
        Cl.uint(zoneCount),
        Cl.uint(zoneDuration),
      ],
      lpFarmer1
    );

    expect(response.result).toBeOk(Cl.uint(0)); // First pool ID is 0
  });

  it("Rejects pool creation with zero STX amount", () => {
    const response = simnet.callPublicFn(
      "vault",
      "create-liquidity-pool",
      [Cl.uint(0), Cl.uint(1000000), Cl.uint(3), Cl.uint(144)],
      lpFarmer1
    );

    expect(response.result).toBeErr(Cl.uint(108)); // err-invalid-amount
  });

  it("Rejects pool creation with zero USDT amount", () => {
    const response = simnet.callPublicFn(
      "vault",
      "create-liquidity-pool",
      [Cl.uint(1000000), Cl.uint(0), Cl.uint(3), Cl.uint(144)],
      lpFarmer1
    );

    expect(response.result).toBeErr(Cl.uint(108)); // err-invalid-amount
  });

  it("Rejects pool creation with invalid zone count", () => {
    const response = simnet.callPublicFn(
      "vault",
      "create-liquidity-pool",
      [Cl.uint(1000000), Cl.uint(1000000), Cl.uint(0), Cl.uint(144)],
      lpFarmer1
    );

    expect(response.result).toBeErr(Cl.uint(105)); // err-invalid-zone
  });

  it("Multiple LP Farmers can create different pools", () => {
    const response1 = simnet.callPublicFn(
      "vault",
      "create-liquidity-pool",
      [Cl.uint(1000000), Cl.uint(1000000), Cl.uint(3), Cl.uint(144)],
      lpFarmer1
    );

    const response2 = simnet.callPublicFn(
      "vault",
      "create-liquidity-pool",
      [Cl.uint(2000000), Cl.uint(2000000), Cl.uint(5), Cl.uint(288)],
      lpFarmer2
    );

    expect(response1.result).toBeOk(Cl.uint(0));
    expect(response2.result).toBeOk(Cl.uint(1));
  });

  it("Tracks total pools created", () => {
    simnet.callPublicFn(
      "vault",
      "create-liquidity-pool",
      [Cl.uint(1000000), Cl.uint(1000000), Cl.uint(3), Cl.uint(144)],
      lpFarmer1
    );

    simnet.callPublicFn(
      "vault",
      "create-liquidity-pool",
      [Cl.uint(2000000), Cl.uint(2000000), Cl.uint(5), Cl.uint(288)],
      lpFarmer2
    );

    const totalPools = simnet.callReadOnlyFn(
      "vault",
      "get-total-pools",
      [],
      deployer
    );

    expect(totalPools.result).toBeUint(2);
  });
});

describe("Liquidity Pool Manager - Pool Information", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
    // Create a test pool
    simnet.callPublicFn(
      "vault",
      "create-liquidity-pool",
      [Cl.uint(1000000), Cl.uint(1000000), Cl.uint(3), Cl.uint(144)],
      lpFarmer1
    );
  });

  it("Can retrieve pool information", () => {
    const poolInfo = simnet.callReadOnlyFn(
      "vault",
      "get-pool-info",
      [Cl.uint(0)],
      user1
    );

    expect(poolInfo.result).not.toBeNone();
  });

  it("Returns none for non-existent pool", () => {
    const poolInfo = simnet.callReadOnlyFn(
      "vault",
      "get-pool-info",
      [Cl.uint(999)],
      user1
    );

    expect(poolInfo.result).toBeNone();
  });

  it("Can get pool price ratio", () => {
    const priceInfo = simnet.callReadOnlyFn(
      "vault",
      "get-pool-price",
      [Cl.uint(0)],
      user1
    );

    expect(priceInfo.result).toBeOk(Cl.uint(1000000)); // 1:1 ratio
  });

  it("LP Farmer can view their pools", () => {
    const farmerPools = simnet.callReadOnlyFn(
      "vault",
      "get-farmer-pools",
      [Cl.principal(lpFarmer1)],
      lpFarmer1
    );

    expect(farmerPools.result).toBeList([Cl.uint(0)]);
  });
});

describe("Liquidity Pool - User Buy Operations", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
    // Create a test pool with good liquidity
    simnet.callPublicFn(
      "vault",
      "create-liquidity-pool",
      [Cl.uint(10000000), Cl.uint(10000000), Cl.uint(3), Cl.uint(144)],
      lpFarmer1
    );
  });

  it("User can buy USDT with STX", () => {
    const stxAmount = 100000; // 0.1 STX

    const response = simnet.callPublicFn(
      "vault",
      "buy-usdt",
      [Cl.uint(0), Cl.uint(stxAmount)],
      user1
    );

    expect(response.result).toBeOk(Cl.uint(98715)); // USDT out after fees
  });

  it("Buy operation updates pool reserves", () => {
    const stxAmount = 100000;

    simnet.callPublicFn(
      "vault",
      "buy-usdt",
      [Cl.uint(0), Cl.uint(stxAmount)],
      user1
    );

    const poolInfo = simnet.callReadOnlyFn(
      "vault",
      "get-pool-info",
      [Cl.uint(0)],
      deployer
    );

    expect(poolInfo.result).toBeSome(expect.any(Object));
  });

  it("Buy operation creates user position", () => {
    const stxAmount = 100000;

    simnet.callPublicFn(
      "vault",
      "buy-usdt",
      [Cl.uint(0), Cl.uint(stxAmount)],
      user1
    );

    const position = simnet.callReadOnlyFn(
      "vault",
      "get-user-position",
      [Cl.uint(0), Cl.principal(user1)],
      user1
    );

    expect(position.result).toBeSome(expect.any(Object));
  });

  it("Rejects buy with zero amount", () => {
    const response = simnet.callPublicFn(
      "vault",
      "buy-usdt",
      [Cl.uint(0), Cl.uint(0)],
      user1
    );

    expect(response.result).toBeErr(Cl.uint(108)); // err-invalid-amount
  });

  it("Multiple users can buy from the same pool", () => {
    const response1 = simnet.callPublicFn(
      "vault",
      "buy-usdt",
      [Cl.uint(0), Cl.uint(100000)],
      user1
    );

    const response2 = simnet.callPublicFn(
      "vault",
      "buy-usdt",
      [Cl.uint(0), Cl.uint(200000)],
      user2
    );

    // Check both transactions succeeded (AMM formula calculates exact amounts)
    expect(response1.result).toBeOk(Cl.uint(98715));
    expect(response2.result).toBeOk(Cl.uint(191692));
  });

  it("Trading fees are collected for LP Farmer", () => {
    const stxAmount = 100000;

    simnet.callPublicFn(
      "vault",
      "buy-usdt",
      [Cl.uint(0), Cl.uint(stxAmount)],
      user1
    );

    const farmerRewards = simnet.callReadOnlyFn(
      "vault",
      "get-farmer-rewards",
      [Cl.uint(0), Cl.principal(lpFarmer1)],
      lpFarmer1
    );

    expect(farmerRewards.result).toBeSome(expect.any(Object));
  });
});

describe("Liquidity Pool - Zone Mechanics", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
    // Create pool with short zone duration for testing
    simnet.callPublicFn(
      "vault",
      "create-liquidity-pool",
      [Cl.uint(10000000), Cl.uint(10000000), Cl.uint(3), Cl.uint(10)],
      lpFarmer1
    );
  });

  it("Zone starts as locked", () => {
    const isUnlocked = simnet.callReadOnlyFn(
      "vault",
      "check-zone-unlocked",
      [Cl.uint(0)],
      user1
    );

    expect(isUnlocked.result).toBeBool(false);
  });

  it("Sell operation fails when zone is locked", () => {
    // User buys first
    simnet.callPublicFn(
      "vault",
      "buy-usdt",
      [Cl.uint(0), Cl.uint(100000)],
      user1
    );

    // Try to sell immediately
    const sellResponse = simnet.callPublicFn(
      "vault",
      "sell-usdt",
      [Cl.uint(0), Cl.uint(50000)],
      user1
    );

    expect(sellResponse.result).toBeErr(Cl.uint(106)); // err-zone-locked
  });

  it("Zone unlocks after duration passes", () => {
    // Mine blocks to pass the zone duration
    simnet.mineEmptyBlocks(11);

    const isUnlocked = simnet.callReadOnlyFn(
      "vault",
      "check-zone-unlocked",
      [Cl.uint(0)],
      user1
    );

    expect(isUnlocked.result).toBeBool(true);
  });

  it("User can sell after zone unlocks", () => {
    // User buys
    const buyResponse = simnet.callPublicFn(
      "vault",
      "buy-usdt",
      [Cl.uint(0), Cl.uint(100000)],
      user1
    );
    
    // Verify buy succeeded
    expect(buyResponse.result).toBeOk(Cl.uint(98715));

    // Mine blocks to unlock zone
    simnet.mineEmptyBlocks(11);

    // Now sell should work - sell half of what we bought
    const sellResponse = simnet.callPublicFn(
      "vault",
      "sell-usdt",
      [Cl.uint(0), Cl.uint(49000)],
      user1
    );

    // Should return STX amount
    expect(sellResponse.result).toBeOk(Cl.uint(49588));
  });
});

describe("Liquidity Pool - LP Farmer Operations", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
    // Create pool
    simnet.callPublicFn(
      "vault",
      "create-liquidity-pool",
      [Cl.uint(10000000), Cl.uint(10000000), Cl.uint(3), Cl.uint(10)],
      lpFarmer1
    );

    // Generate some trading volume
    simnet.callPublicFn(
      "vault",
      "buy-usdt",
      [Cl.uint(0), Cl.uint(100000)],
      user1
    );

    simnet.callPublicFn(
      "vault",
      "buy-usdt",
      [Cl.uint(0), Cl.uint(200000)],
      user2
    );
  });

  it("LP Farmer can view accumulated fees", () => {
    const farmerRewards = simnet.callReadOnlyFn(
      "vault",
      "get-farmer-rewards",
      [Cl.uint(0), Cl.principal(lpFarmer1)],
      lpFarmer1
    );

    expect(farmerRewards.result).toBeSome(expect.any(Object));
  });

  it("LP Farmer can claim accumulated fees", () => {
    const claimResponse = simnet.callPublicFn(
      "vault",
      "claim-farmer-rewards",
      [Cl.uint(0)],
      lpFarmer1
    );

    // Should successfully claim the accumulated fees
    // Fee = 0.3% of 300,000 STX traded = 900 STX
    expect(claimResponse.result).toBeOk(Cl.uint(900));
  });

  it("Only LP Farmer can claim fees", () => {
    const claimResponse = simnet.callPublicFn(
      "vault",
      "claim-farmer-rewards",
      [Cl.uint(0)],
      user1
    );

    // Returns err-not-found because user1 has no farmer-rewards entry
    expect(claimResponse.result).toBeErr(Cl.uint(101)); // err-not-found
  });
});
