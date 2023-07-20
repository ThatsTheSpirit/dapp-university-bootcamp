const { expect, assert } = require("chai")
//const { ethers } = require("ethers")
const { ethers } = require("hardhat")

function tokens(count) {
    return ethers.parseUnits(count.toString(), "ether")
}

describe("Token contract", function () {
    let Token
    let accounts, deployer, receiver
    this.beforeEach(async function () {
        Token = await hre.ethers.deployContract("Token", [
            "Gercoin",
            "GER",
            1000000,
        ])
        await Token.waitForDeployment()

        accounts = await ethers.getSigners()
        deployer = accounts[0]
        receiver = accounts[1]
    })

    describe("Deployment", function () {
        const name = "Gercoin",
            symbol = "GER",
            decimals = 18,
            totalSupply = tokens(1000000)

        it("has correct name", async function () {
            assert.equal(await Token.name(), name)
        })

        it("has correct symbol", async function () {
            assert.equal(await Token.symbol(), symbol)
        })

        it("has correct decimals", async function () {
            assert.equal(await Token.decimals(), decimals)
        })

        it("has correct totalSupply", async function () {
            assert.equal(await Token.totalSupply(), totalSupply)
        })

        it("assigns total supply to deployer", async function () {
            assert.equal(await Token.balanceOf(deployer.address), totalSupply)
        })
    })

    describe("Sending Token", function () {
        let amount, tx, result, connectedToken

        describe("Success", () => {
            beforeEach(async () => {
                amount = tokens(10)

                connectedToken = Token.connect(deployer)
            })
            it("transfers token balances", async function () {
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
})
