const JAY19IT001 = artifacts.require("./JAY19IT001.sol");

contract("JAY19IT001", (accounts) => {
    let tokenInstance;

    it("check the token info", async() => {
        tokenInstance = await JAY19IT001.deployed();

        assert.equal(
            await tokenInstance.name(),
            "JAY19IT001",
            "has correct name"
        );
        assert.equal(await tokenInstance.symbol(), "J001", "has correct symbol");
        assert.equal(
            await tokenInstance.standard(),
            "JAY19IT001 v1.0",
            "has correct standard"
        );
    });

    it("set the total supply upon deployment", async() => {
        tokenInstance = await JAY19IT001.deployed();

        const totalSupply = await tokenInstance.totalSupply();
        const adminBalance = await tokenInstance.balanceOf(accounts[0]);

        assert.equal(
            totalSupply.toNumber(),
            1000000,
            "set the total supply to 10,00,000"
        );
        assert.equal(
            adminBalance.toNumber(),
            1000000,
            "it allocated to initial supply to the admin"
        );
    });

    it("transfer token ownership", async() => {
        tokenInstance = await JAY19IT001.deployed();
        try {
            // await tokenInstance.transfer.call(accounts[1],999999999999);
        } catch (e) {
            assert(
                e.message.indexOf("revert") == 0,
                "error message must contain revert"
            );
        }

        const success = await tokenInstance.transfer.call(accounts[1], 25000, {
            from: accounts[0],
        });
        assert.equal(success, true, "transfer done successfully");
        const receipt = await tokenInstance.transfer(accounts[1], 25000, {
            from: accounts[0],
        });

        assert.equal(receipt.logs.length, 1, "triggers one event");
        assert.equal(
            receipt.logs[0].event,
            "Transfer",
            'should be the "Transfer" event'
        );
        assert.equal(
            receipt.logs[0].args._from,
            accounts[0],
            "logs the account the tokens are transferred from"
        );
        assert.equal(
            receipt.logs[0].args._to,
            accounts[1],
            "logs the account the tokens are transferred to"
        );
        assert.equal(
            receipt.logs[0].args._value,
            25000,
            "logs the transfer amount"
        );

        const balance = await tokenInstance.balanceOf(accounts[1]);
        const adminBalance = await tokenInstance.balanceOf(accounts[0]);

        assert.equal(
            balance.toNumber(),
            25000,
            "adds the amount to the receiving account"
        );

        assert.equal(
            adminBalance.toNumber(),
            1000000 - 25000,
            "adds the amount to the receiving account"
        );
    });

    it("approves tokens for delegated transfer", async() => {
        tokenInstance = await JAY19IT001.deployed();

        const success = await tokenInstance.approve.call(accounts[1], 100);

        assert.equal(success, true, "it returns true");

        const receipt = await tokenInstance.approve(accounts[1], 100);

        assert.equal(receipt.logs.length, 1, "triggers one event");
        assert.equal(
            receipt.logs[0].event,
            "Approval",
            'should be the "Approval" event'
        );
        assert.equal(
            receipt.logs[0].args._owner,
            accounts[0],
            "logs the account the tokens are transferred by"
        );
        assert.equal(
            receipt.logs[0].args._spender,
            accounts[1],
            "logs the account the tokens are transferred to"
        );
        assert.equal(receipt.logs[0].args._value, 100, "logs the transfer amount");

        const allowance = await tokenInstance.allowance(accounts[0], accounts[1]);

        assert.equal(
            allowance.toNumber(),
            100,
            "store the allowance for delegated transfer"
        );
    });

    it("handles delegated token transfers", async() => {
        tokenInstance = await JAY19IT001.deployed();

        const fromAccount = accounts[2];
        const toAccount = accounts[3];
        const spendingAccount = accounts[4];

        await tokenInstance.transfer(fromAccount, 100, {
            from: accounts[0],
        });

        await tokenInstance.approve(spendingAccount, 10, {
            from: fromAccount,
        });

        // try {
        //   await tokenInstance.transferFrom(fromAccount, toAccount, 9999, {
        //     from: spendingAccount,
        //   });
        // } catch (e) {
        //   assert(
        //     e.message.indexOf("revert") == 0,
        //     "can't transfer larger than balance"
        //   );
        // }

        // try {
        //   await tokenInstance.transferFrom(fromAccount, toAccount, 20, {
        //     from: spendingAccount,
        //   });
        // } catch (e) {
        //   assert(
        //     e.message.indexOf("revert") == 0,
        //     "can't transfer larger than approved amount"
        //   );
        // }

        const success = await tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {
            from: spendingAccount,
        });

        assert.equal(success, true);

        const receipt = await tokenInstance.transferFrom(fromAccount, toAccount, 10, {
            from: spendingAccount,
        });

        assert.equal(receipt.logs.length, 1, "triggers one event");
        assert.equal(
            receipt.logs[0].event,
            "Transfer",
            'should be the "Transfer" event'
        );
        assert.equal(
            receipt.logs[0].args._from,
            fromAccount,
            "logs the account the tokens are transferred from"
        );
        assert.equal(
            receipt.logs[0].args._to,
            toAccount,
            "logs the account the tokens are transferred to"
        );
        assert.equal(
            receipt.logs[0].args._value,
            10,
            "logs the transfer amount"
        );

        const balance = await tokenInstance.balanceOf(fromAccount);

        assert.equal(balance.toNumber(), 90, "deducted the amount from the sending account");

        const balance1 = await tokenInstance.balanceOf(toAccount);

        assert.equal(balance1.toNumber(), 10, "deducted the amount from the received account");

        const allowance = await tokenInstance.balanceOf(spendingAccount);

        assert.equal(allowance.toNumber(), 0, "deducted the amount from the allowance");

    });

});