const hre = require("hardhat")

function tokens(count) {
    return hre.ethers.parseUnits(count.toString(), "ether")
}

function wait(seconds) {
    const milliseconds = seconds * 1000
    return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function getValueFromEvent(contract, eventName, value) {
    const filter = contract.filters.eventName
    const events = await contract.queryFilter(filter, -1)
    const event = events[0]
    const args = event.args
    return args.value
}

module.exports = {
    tokens,
    wait,
    getValueFromEvent,
}
