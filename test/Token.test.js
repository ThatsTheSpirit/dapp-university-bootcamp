const { expect, assert } = require("chai")
//const { ethers } = require("ethers")
const { ethers } = require("hardhat")
//const { describe, beforeEach } = require("mocha")

function tokens(count) {
    return ethers.parseUnits(count.toString(), "ether")
}

describe("Token contract", () => {
    let Token
    let accounts, deployer, receiver
    beforeEach(async () => {
        Token = await hre.ethers.deployContract("Token", [
            "Gercoin",
            "GER",
            1000000,
        ])
        await Token.waitForDeployment()

        accounts = await ethers.getSigners()
        deployer = accounts[0]
        receiver = accounts[1]
        exchange = accounts[2]
    })

    describe("Deployment", () => {
        const name = "Gercoin",
            symbol = "GER",
            decimals = 18,
            totalSupply = tokens(1000000)

        it("has correct name", async () => {
            assert.equal(await Token.name(), name)
        })

        it("has correct symbol", async () => {
            assert.equal(await Token.symbol(), symbol)
        })

        it("has correct decimals", async () => {
            assert.equal(await Token.decimals(), decimals)
        })

        it("has correct totalSupply", async () => {
            assert.equal(await Token.totalSupply(), totalSupply)
        })

        it("assigns total supply to deployer", async () => {
            assert.equal(await Token.balanceOf(deployer.address), totalSupply)
        })
    })

    describe("Sending Token", () => {
        let amount, tx, result, connectedToken

        describe("Success", () => {
            beforeEach(async () => {
                amount = tokens(10)

                connectedToken = Token.connect(deployer)
            })
            it("transfers token balances", async () => {
                const deployerBalanceBefore = await Token.balanceOf(
                    deployer.address
                )
                const receiverBalanceBefore = await Token.balanceOf(
                    receiver.address
                )

                tx = await connectedToken.transfer(receiver.address, amount)
                result = await tx.wait()

                const deployerBalanceAfter = await Token.balanceOf(
                    deployer.address
                )
                const receiverBalanceAfter = await Token.balanceOf(
                    receiver.address
                )

                assert.equal(
                    deployerBalanceAfter,
                    deployerBalanceBefore - amount
                )
                assert.equal(
                    receiverBalanceAfter,
                    receiverBalanceBefore + amount
                )
            })

            it("emits a Transfer event", async () => {
                //console.log(result.logs)
                // const event = result.events[0]
                // assert.equal(event.event, "Transfer")
                // const args = event.args
                // assert.equal(args._from, deployer.address)
                // assert.equal(args._to, receiver.address)
                // assert.equal(args._value, amount)
                expect(await connectedToken.transfer(receiver.address, amount))
                    .to.emit("Token", "Transfer")
                    .withArgs(deployer.address, receiver.address, amount)
            })
        })

        describe("Failure", () => {
            it("rejects insufficient balances", async () => {
                const invalidAmount = tokens(100000000)
                await expect(
                    Token.connect(deployer).transfer(
                        receiver.address,
                        invalidAmount
                    )
                ).to.be.revertedWith("Not enough tokens!")
            })

            it("rejects invalid recipent", async () => {
                const amount = tokens(10)
                await expect(
                    Token.connect(deployer).transfer(
                        "0x0000000000000000000000000000000000000000",
                        amount
                    )
                ).to.be.reverted
            })
        })
    })

    describe("Approving Tokens", () => {
        let amount, tx, result
        beforeEach(async () => {
            amount = tokens(100)
            tx = await Token.connect(deployer).approve(exchange.address, amount)
            result = await tx.wait()
        })

        describe("Success", () => {
            it("allocates an allowance for delegated token spending", async () => {
                expect(
                    await Token.allowance(deployer.address, exchange.address)
                ).to.equal(amount)
            })

            it("emits an Approval event", async () => {
                expect(
                    await Token.connect(deployer).approve(
                        exchange.address,
                        amount
                    )
                )
                    .to.emit("Token", "Approval")
                    .withArgs(deployer.address, exchange.address, amount)
            })
        })
        describe("Failure", () => {
            it("rejects invalid spenders", async () => {
                //const amount = tokens(10)
                await expect(
                    Token.connect(deployer).approve(
                        "0x0000000000000000000000000000000000000000",
                        amount
                    )
                ).to.be.reverted
            })
        })
    })

    describe("Delegated Token Transfers", () => {
        let amount, tx, result

        beforeEach(async () => {
            amount = tokens(100)
            tx = await Token.connect(deployer).approve(exchange.address, amount)
            result = await tx.wait()
        })

        describe("Success", () => {
            // beforeEach(async () => {
            //     tx = await Token.connect(exchange).transferFrom(
            //         deployer.address,
            //         receiver.address,
            //         amount
            //     )
            //     result = await tx.wait()
            // })

            it("transfers token balances", async () => {
                await expect(
                    Token.connect(exchange).transferFrom(
                        deployer.address,
                        receiver.address,
                        amount
                    )
                ).to.changeTokenBalances(
                    Token,
                    [deployer.address, receiver.address],
                    [-amount, amount]
                )

                // expect(await Token.balanceOf(deployer.address)).to.be.equal(
                //     ethers.parseUnits("999900", "ether")
                // )
                // expect(await Token.balanceOf(receiver.address)).to.be.equal(
                //     amount
                // )
            })

            it("resets the allowance", async () => {
                tx = await Token.connect(exchange).transferFrom(
                    deployer.address,
                    receiver.address,
                    amount
                )
                result = await tx.wait()

                expect(
                    await Token.allowance(deployer.address, exchange.address)
                ).to.be.equal(0)
            })

            it("emits a Transfer event", async () => {
                expect(
                    await Token.connect(exchange).transferFrom(
                        deployer.address,
                        receiver.address,
                        amount
                    )
                )
                    .to.emit(Token, "Transfer")
                    .withArgs(deployer.address, receiver.address, amount)
            })
        })
        describe("Failure", () => {
            const invalidAmount = tokens(100000000)

            it("rejects invalid balance transfers", async () => {
                await expect(
                    Token.connect(exchange).transferFrom(
                        deployer.address,
                        receiver.address,
                        invalidAmount
                    )
                ).to.be.reverted
            })
        })
    })
})
