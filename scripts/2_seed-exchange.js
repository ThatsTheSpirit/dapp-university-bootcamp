const hre = require("hardhat")
const { tokens, getValueFromEvent, wait } = require("./utils")
const config = require("../src/config.json")

async function main() {
    const accounts = await hre.ethers.getSigners()
    //fetch network
    const { chainId } = await hre.ethers.provider.getNetwork()
    console.log(`Using chainId: ${chainId}`)

    const DApp = await hre.ethers.getContractAt(
        "Token",
        config[chainId]["DApp"]["address"]
    )
    console.log(`DApp Token fetched: ${DApp.target}`)

    const mETH = await hre.ethers.getContractAt(
        "Token",
        config[chainId]["mETH"]["address"]
    )
    console.log(`mETH Token fetched: ${mETH.target}`)

    const mDAI = await hre.ethers.getContractAt(
        "Token",
        config[chainId]["mDAI"]["address"]
    )
    console.log(`mDAI Token fetched: ${mDAI.target}`)

    const Exchange = await hre.ethers.getContractAt(
        "Exchange",
        config[chainId]["Exchange"]["address"]
    )
    console.log(`Exchange Token fetched: ${Exchange.target}`)

    //Set up users
    const [sender, receiver] = accounts
    //Give tokens to account[1]
    let amount = tokens(10000)

    //user1 transfers 10000 mETH
    let tx, result
    tx = await mETH.connect(sender).transfer(receiver.address, amount)
    result = await tx.wait()
    console.log(
        `Transferred ${amount} tokens from ${sender.address} to ${receiver.address}\n`
    )

    //Set up exchange users
    const [user1, user2] = accounts

    //user1 approves 10000 DApp
    tx = await DApp.connect(user1).approve(Exchange.target, amount)
    result = await tx.wait()
    console.log(`Approved ${amount} DApp tokens from ${user1.address}`)

    //user1 deposits 10000 DApp
    tx = await Exchange.connect(user1).depositToken(DApp.target, amount)
    result = await tx.wait()
    console.log(`Deposited ${amount} DApp tokens from ${user1.address}`)

    //user2 approves 10000 mETH
    tx = await mETH.connect(user2).approve(Exchange.target, amount)
    result = await tx.wait()
    console.log(`Approved ${amount} mETH tokens from ${user2.address}`)

    //user2 deposits 10000 mETH
    tx = await Exchange.connect(user2).depositToken(mETH.target, amount)
    result = await tx.wait()
    console.log(`Deposited ${amount} mETH tokens from ${user1.address}`)

    //user1 makes the order
    let orderId
    tx = await Exchange.connect(user1).makeOrder(
        mETH.target,
        tokens(100),
        DApp.target,
        tokens(5)
    )
    result = await tx.wait()
    console.log(`Made the order from ${user1.address}`)

    //user1 makes the order
    let filter = Exchange.filters.Order
    let events = await Exchange.queryFilter(filter, -1)
    let event = events[0]
    let args = event.args
    orderId = args.id
    //orderId = await getValueFromEvent(Exchange, "Order", "id")

    tx = await Exchange.connect(user1).cancelOrder(orderId)
    result = await tx.wait()
    console.log(`Cancelled the order from ${user1.address}`)

    await wait(1)

    //fill the order
    //user1 makes the order
    tx = await Exchange.connect(user1).makeOrder(
        mETH.target,
        tokens(100),
        DApp.target,
        tokens(10)
    )
    result = await tx.wait()
    console.log(`Made the order from ${user1.address}`)

    //user2 fills the order
    events = await Exchange.queryFilter(filter, -1)
    event = events[0]
    args = event.args
    orderId = args.id

    tx = await Exchange.connect(user2).fillOrder(orderId)
    result = await tx.wait()
    console.log(`Filled the order from ${user1.address}`)

    //wait for 1 sec
    await wait(1)

    //user1 makes another order
    tx = await Exchange.connect(user1).makeOrder(
        mETH.target,
        tokens(50),
        DApp.target,
        tokens(15)
    )
    result = await tx.wait()
    console.log(`Made the order from ${user1.address}`)

    //user2 fills the order
    events = await Exchange.queryFilter(filter, -1)
    event = events[0]
    args = event.args
    orderId = args.id

    tx = await Exchange.connect(user2).fillOrder(orderId)
    result = await tx.wait()
    console.log(`Filled the order from ${user1.address}`)

    //wait for 1 sec
    await wait(1)

    //user1 makes final order
    tx = await Exchange.connect(user1).makeOrder(
        mETH.target,
        tokens(200),
        DApp.target,
        tokens(20)
    )
    result = await tx.wait()
    console.log(`Made the order from ${user1.address}`)

    //user2 fills final order
    events = await Exchange.queryFilter(filter, -1)
    event = events[0]
    args = event.args
    orderId = args.id

    tx = await Exchange.connect(user2).fillOrder(orderId)
    result = await tx.wait()
    console.log(`Filled the order from ${user1.address}`)

    //wait for 1 sec
    await wait(1)

    //////////////////////////////////////////////
    //Seed Open Orders
    //

    //user1 makes 10 orders
    for (let i = 1; i <= 10; i++) {
        tx = await Exchange.connect(user1).makeOrder(
            mETH.target,
            tokens(i * 10),
            DApp.target,
            tokens(10)
        )
        result = await tx.wait()
        console.log(`Made the order from ${user1.address}`)
        //wait for 1 sec
        await wait(1)
    }

    //user2 makes 10 orders
    for (let i = 1; i <= 10; i++) {
        tx = await Exchange.connect(user2).makeOrder(
            DApp.target,
            tokens(10),
            mETH.target,
            tokens(i * 10)
        )
        result = await tx.wait()
        console.log(`Made the order from ${user2.address}`)
        //wait for 1 sec
        await wait(1)
    }
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
