const { ethers } = require("hardhat")
const fsp = require("fs/promises")

async function main() {
    const GER = await ethers.deployContract("Token", [
        "Gercoin",
        "GER",
        1000000,
    ])
    const mDAI = await ethers.deployContract("Token", ["mDAI", "mDAI", 1000000])

    const mETH = await ethers.deployContract("Token", ["mETH", "mETH", 1000000])

    const DApp = await ethers.deployContract("Token", ["DApp", "DApp", 1000000])

    const accounts = await ethers.getSigners()
    console.log(
        `Accounts fetched:\n${accounts[0].address}\n${accounts[1].address}`
    )

    //Fee account and percentage
    const Exchange = await ethers.deployContract("Exchange", [
        accounts[1].address,
        1,
    ])

    await DApp.waitForDeployment()
    await mETH.waitForDeployment()
    await mDAI.waitForDeployment()
    await GER.waitForDeployment()

    await Exchange.waitForDeployment()
    console.log(`DApp Deployed at ${await DApp.getAddress()}`)
    console.log(`mDAI Deployed at ${await mDAI.getAddress()}`)
    console.log(`mETH Deployed at ${await mETH.getAddress()}`)
    console.log(`Exchange Deployed at ${await Exchange.getAddress()}`)

    const tokenABI = DApp.interface.formatJson()
    const exchangeABI = Exchange.interface.formatJson()
    await fsp.writeFile(
        "../dapp-university-bootcamp/src/abis/Token.json",
        tokenABI
    )
    await fsp.writeFile(
        "../dapp-university-bootcamp/src/abis/Exchange.json",
        exchangeABI
    )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
