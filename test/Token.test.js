const { expect, assert } = require("chai")
//const { ethers } = require("ethers")
const { ethers } = require("hardhat")

function tokens(count) {
    return ethers.parseUnits(count.toString(), "ether")
}

describe("Token contract", function () {
    let Token
    let accounts, deployer
    this.beforeEach(async function () {
        Token = await hre.ethers.deployContract("Token", [
            "Gercoin",
            "GER",
            1000000,
        ])
        await Token.waitForDeployment()

        accounts = await ethers.getSigners()
        deployer = accounts[0]
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
})
