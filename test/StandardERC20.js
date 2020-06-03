const BigNumber = require("bignumber.js");
const truffleAssert = require("truffle-assertions");
const StandardERC20 = artifacts.require("StandardERC20");

contract("StandardERC20", (accounts) => {
  const tokenNameExpected = "GBC Token";
  const tokenSymbolExpected = "GBC";
  const tokenSupplyExpected = web3.utils.toBN(10000000000000000000);
  const creator = accounts[0];
  const receipient1 = accounts[1];
  const receipient1Amount = web3.utils.toBN(500000000000000000);
  const spender = accounts[2];
  const spenderAmount = web3.utils.toBN(300000000000000000);
  const spenderAddValue = web3.utils.toBN(1000);
  const spenderSubValue = web3.utils.toBN(500);
  const receipient2 = accounts[3];
  let standardERC20Instance;
  before(async () => {
    standardERC20Instance = await StandardERC20.deployed();
    const name = await standardERC20Instance.name.call();
    const symbol = await standardERC20Instance.symbol.call();
    const totalSupply = await standardERC20Instance.totalSupply.call();
    assert.equal(name, tokenNameExpected, "Token is not as expected");
    assert.equal(
      symbol,
      tokenSymbolExpected,
      "Token symbol is not as expected"
    );
    assert(
      new BigNumber(totalSupply).isEqualTo(new BigNumber(tokenSupplyExpected)),
      "Token supply is not as expected"
    );
  });

  it("test balanceOf()", async () => {
    const tokenBalanceInCreator = await standardERC20Instance.balanceOf.call(
      creator
    );
    assert(
      new BigNumber(tokenBalanceInCreator).isEqualTo(
        new BigNumber(tokenSupplyExpected)
      ),
      "The initial balance of creator is not as expected"
    );
  });

  it("test transfer()", async () => {
    const creatorOldBalanceFromContract = await standardERC20Instance.balanceOf(
      creator
    );
    const tx = await standardERC20Instance.transfer(
      receipient1,
      receipient1Amount,
      { from: creator }
    );

    const receipient1Balance = receipient1Amount;

    const receipientBalFromContract = await standardERC20Instance.balanceOf(
      receipient1
    );
    const creatorBalanceFromContract = await standardERC20Instance.balanceOf(
      creator
    );
    const creatorExpectedBalance = web3.utils
      .toBN(creatorOldBalanceFromContract)
      .sub(web3.utils.toBN(receipient1Amount));
    assert(
      new BigNumber(creatorBalanceFromContract).isEqualTo(
        new BigNumber(creatorExpectedBalance)
      )
    );
    truffleAssert.eventEmitted(tx, "Transfer", (obj) => {
      return (
        obj.from === creator &&
        obj.to === receipient1 &&
        new BigNumber(receipient1Amount).isEqualTo(new BigNumber(obj.value))
      );
    });
    assert(
      new BigNumber(receipient1Balance).isEqualTo(receipientBalFromContract),
      "The receipient1's balance is not as expected"
    );
  });

  it("test transferFrom()", async () => {
    const oldReceipient1Balance = await standardERC20Instance.balanceOf.call(
      receipient1
    );
    const approveTx = await standardERC20Instance.approve(
      spender,
      spenderAmount,
      { from: receipient1 }
    );
    truffleAssert.eventEmitted(approveTx, "Approval", (obj) => {
      return (
        obj.owner === receipient1 &&
        obj.spender === spender &&
        new BigNumber(obj.value).isEqualTo(spenderAmount)
      );
    });
    const allowanceFromContract = await standardERC20Instance.allowance.call(
      receipient1,
      spender
    );
    assert(
      new BigNumber(spenderAmount).isEqualTo(allowanceFromContract),
      "The allowane is not as expected"
    );
    const transferfromTx = await standardERC20Instance.transferFrom(
      receipient1,
      receipient2,
      spenderAmount,
      { from: spender }
    );
    truffleAssert.eventEmitted(transferfromTx, "Transfer", (obj) => {
      return (
        obj.from === receipient1 &&
        obj.to === receipient2 &&
        new BigNumber(obj.value).isEqualTo(spenderAmount)
      );
    });
    const receipient2Balance = await standardERC20Instance.balanceOf(
      receipient2
    );
    assert(
      new BigNumber(spenderAmount).isEqualTo(receipient2Balance),
      "The balance of receipient2 is not as expected"
    );
    const receipient1BalanceFromContract = await standardERC20Instance.balanceOf.call(
      receipient1
    );
    const expectedReceipient1Balance = web3.utils
      .toBN(oldReceipient1Balance)
      .sub(spenderAmount);
    assert(
      new BigNumber(receipient1BalanceFromContract).isEqualTo(
        new BigNumber(expectedReceipient1Balance)
      ),
      "The receipient1's balance is not as expected"
    );
  });

  //adding in increase and decrease allowance testing below:

  it("testing increaseAllowance()", async () => {
    const oldAllowanceFromContract = await standardERC20Instance.allowance.call(
      receipient1,
      spender
    );
    const Ax = await standardERC20Instance.increaseAllowance(
      spender,
      spenderAddValue,
      { from: receipient1 }
    );

    const newAllowanceFromContract = await standardERC20Instance.allowance.call(
      receipient1,
      spender
    );

    const spenderExpectedAllowance = web3.utils
    .toBN(oldAllowanceFromContract)
    .add(web3.utils.toBN(spenderAddValue));
    assert(
      new BigNumber(newAllowanceFromContract).isEqualTo(
        new BigNumber(spenderExpectedAllowance)
      )
    )
    newSpenderAmount = spenderAmount + spenderAddValue;
  //  truffleAssert.eventEmitted(Ax, "Approval", (obj) => {
  //    return (
  //      obj.owner === receipient1 &&
  //      obj.spender === spender &&
  //      new BigNumber(obj.value).isEqualTo(newSpenderAmount)
  //    );
  //  })
  });

  it("testing decreaseAllowance()", async () => {
    const oldAllowanceFromContract = await standardERC20Instance.allowance.call(
      receipient1,
      spender
    );
    const Ax = await standardERC20Instance.decreaseAllowance(
      spender,
      spenderSubValue,
      { from: receipient1 }
    );

    const newAllowanceFromContract = await standardERC20Instance.allowance.call(
      receipient1,
      spender
    );

    const spenderExpectedAllowance = web3.utils
    .toBN(oldAllowanceFromContract)
    .sub(web3.utils.toBN(spenderSubValue));
    assert(
      new BigNumber(newAllowanceFromContract).isEqualTo(
        new BigNumber(spenderExpectedAllowance)
      )
    )

    newSpenderAmount = spenderAmount - spenderSubValue;
    //truffleAssert.eventEmitted(Ax, "Approval", (obj) => {
    //  return (
    //    obj.owner === receipient1 &&
    //    obj.spender === spender &&
    //    new BigNumber(obj.value).isEqualTo(newSpenderAmount)
    //  );
    //})
  });
});