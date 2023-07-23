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
            })
        })
        describe("Failure", () => {})
    })
})