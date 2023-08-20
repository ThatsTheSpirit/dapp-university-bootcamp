const hre = require("hardhat")
async function main() {
    const GER = await hre.ethers.deployContract("Token", [
        "Gercoin",
        "GER",
        1000000,
    ])
    const mDAI = await hre.ethers.deployContract("Token", [
        "mDAI",
        "mDAI",
        1000000,
    ])

    const mETH = await hre.ethers.deployContract("Token", [
        "mETH",
        "mETH",
        1000000,
    ])

    const DApp = await hre.ethers.deployContract("Token", [
        "DApp",
        "DApp",
        1000000,
    ])

    const accounts = await hre.ethers.getSigners()
    console.log(
        `Accounts fetched:\n${accounts[0].address}\n${accounts[1].address}`
    )

    //Fee account and percentage
    const Exchange = await hre.ethers.deployContract("Exchange", [
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
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
