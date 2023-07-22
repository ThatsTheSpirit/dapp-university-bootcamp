const { expect, assert } = require("chai")
const { ethers } = require("hardhat")

function tokens(count) {
    return ethers.parseUnits(count.toString(), "ether")
}

describe("Exchange contract", function () {
    let exchange
    let accounts, deployer, feeAccount

    const feePercent = 10

    beforeEach(async function () {
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        feeAccount = accounts[1]

        exchange = await ethers.deployContract("Exchange", [
            feeAccount,
            feePercent,
        ])
        await exchange.waitForDeployment()
    })

    describe("Deployment", function () {
        it("tracks the fee account", async function () {
            expect(await exchange.feeAccount()).to.equal(feeAccount.address)
        })

        it("tracks the fee percent", async function () {
            expect(await exchange.feePercent()).to.equal(feePercent)
        })
    })
})
