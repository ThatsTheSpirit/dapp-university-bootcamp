const { expect, assert } = require("chai")
const { ethers } = require("hardhat")

function tokens(count) {
    return ethers.parseUnits(count.toString(), "ether")
}

describe("Exchange contract", () => {
    let exchange, token1
    let accounts, deployer, feeAccount, user1

    const feePercent = 10

    beforeEach(async () => {
        token1 = await hre.ethers.deployContract("Token", [
            "Gercoin",
            "GER",
            1000000,
        ])
        token2 = await hre.ethers.deployContract("Token", [
            "Mock Dai",
            "mDAI",
            1000000,
        ])

        await token1.waitForDeployment()

        accounts = await ethers.getSigners()
        deployer = accounts[0]
        feeAccount = accounts[1]
        user1 = accounts[2]

        let transaction = await token1
            .connect(deployer)
            .transfer(user1.address, tokens(100))
        await transaction.wait()

        exchange = await hre.ethers.deployContract("Exchange", [
            feeAccount.address,
            feePercent,
        ])
        await exchange.waitForDeployment()
    })

    describe("Deployment", () => {
        it("tracks the fee account", async () => {
            expect(await exchange.feeAccount()).to.equal(feeAccount.address)
        })

        it("tracks the fee percent", async () => {
            expect(await exchange.feePercent()).to.equal(feePercent)
        })
    })

    describe("Depositing Tokens", () => {
        let tx,
            amount = tokens(10),
            result

        describe("Success", () => {
            beforeEach(async () => {
                // Approve Token
                tx = await token1
                    .connect(user1)
                    .approve(exchange.target, amount)
                result = await tx.wait()
                // Deposit token
                tx = await exchange
                    .connect(user1)
                    .depositToken(token1.target, amount)
                result = await tx.wait()
            })

            it("tracks the token deposit", async () => {
                expect(await token1.balanceOf(exchange.target)).to.equal(amount)
                expect(
                    await exchange.tokens(token1.target, user1.address)
                ).to.equal(amount)
                expect(
                    await exchange.balanceOf(token1.target, user1.address)
                ).to.equal(amount)
            })

            it("emits a Deposit event", async () => {
                const filter = exchange.filters.Deposit
                const events = await exchange.queryFilter(filter, -1)
                const event = events[0]

                expect(event.fragment.name).to.equal("Deposit")
                const args = event.args
                expect(args.token).to.equal(token1.target)
                expect(args.user).to.equal(user1.address)
                expect(args.amount).to.equal(amount)
                expect(args.balance).to.equal(amount)
            })
        })
        describe("Failure", () => {
            it("fails when no tokens approved", async () => {
                await expect(
                    exchange.connect(user1).depositToken(token1.target, amount)
                ).to.be.revertedWith("Insufficient allowance")
            })
        })
    })

    describe("Withdrawing Tokens", () => {
        let tx,
            amount = tokens(10),
            result

        describe("Success", () => {
            beforeEach(async () => {
                // Deposit tokens before withdrawing
                // Approve Token
                tx = await token1
                    .connect(user1)
                    .approve(exchange.target, amount)
                result = await tx.wait()
                // Deposit token
                tx = await exchange
                    .connect(user1)
                    .depositToken(token1.target, amount)
                result = await tx.wait()

                tx = await exchange
                    .connect(user1)
                    .withdrawToken(token1.target, amount)
                result = await tx.wait()
            })

            it("withdraws token funds", async () => {
                expect(await token1.balanceOf(exchange.target)).to.equal(0)
                expect(
                    await exchange.tokens(token1.target, user1.address)
                ).to.equal(0)
                expect(
                    await exchange.balanceOf(token1.target, user1.address)
                ).to.equal(0)
                //expect(await token1.balanceOf(user1.address)).to.equal(amount)
            })

            it("emits a Withdraw event", async () => {
                const filter = exchange.filters.Withdraw
                const events = await exchange.queryFilter(filter, -1)
                const event = events[0]

                expect(event.fragment.name).to.equal("Withdraw")
                const args = event.args
                expect(args.token).to.equal(token1.target)
                expect(args.user).to.equal(user1.address)
                expect(args.amount).to.equal(amount)
                expect(args.balance).to.equal(0)
            })
        })
        describe("Failure", () => {
            it("fails for insufficient balance", async () => {
                //Attempt to withdraw tokens without depositing
                await expect(
                    exchange.connect(user1).withdrawToken(token1.target, amount)
                ).to.be.reverted
            })
        })
    })

    describe("Checking balances", () => {
        let tx,
            amount = tokens(1),
            result
        beforeEach(async () => {
            // Approve Token
            tx = await token1.connect(user1).approve(exchange.target, amount)
            result = await tx.wait()
            // Deposit token
            tx = await exchange
                .connect(user1)
                .depositToken(token1.target, amount)
            result = await tx.wait()
        })

        it("returns user balance", async () => {
            expect(
                await exchange.balanceOf(token1.target, user1.address)
            ).to.equal(amount)
        })
    })

    describe("Making orders", () => {
        let tx,
            result,
            amount = tokens(1)
        describe("Success", () => {
            //Deposit before
            beforeEach(async () => {
                tx = await token1
                    .connect(user1)
                    .approve(exchange.target, amount)
                result = await tx.wait()
                // Deposit token
                tx = await exchange
                    .connect(user1)
                    .depositToken(token1.target, amount)
                result = await tx.wait()

                tx = await exchange
                    .connect(user1)
                    .makeOrder(token2.target, amount, token1.target, amount)
                result = await tx.wait()
            })

            it("tracks the newly created order", async () => {
                expect(await exchange.ordersCount()).to.equal(1)
            })

            it("emits an Order event", async () => {
                const filter = exchange.filters.Order
                const events = await exchange.queryFilter(filter, -1)
                const event = events[0]

                expect(event.fragment.name).to.equal("Order")
                const args = event.args
                expect(args.id).to.equal(1)
                expect(args.user).to.equal(user1.address)
                expect(args.tokenGet).to.equal(token2.target)
                expect(args.amountGet).to.equal(amount)
                expect(args.tokenGive).to.equal(token1.target)
                expect(args.amountGive).to.equal(amount)
                expect(args.timestamp).to.at.least(1)
            })
        })

        describe("Failure", () => {
            it("rejects with no balance", async () => {
                await expect(
                    exchange
                        .connect(user1)
                        .makeOrder(token2.target, amount, token1.target, amount)
                ).to.be.reverted
            })
        })
    })
})
