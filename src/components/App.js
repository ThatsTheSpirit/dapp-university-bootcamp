import { useEffect } from "react"
import { ethers } from "ethers"
import "../App.css"
const config = require("../config.json")
const tokenAbi = require("../abis/Token.json")
const exchangeAbi = require("../abis/Exchange.json")

function App() {
    const loadBlockchainData = async () => {
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        })
        console.log(accounts[0])

        //Connect Ethers to
        const provider = new ethers.BrowserProvider(window.ethereum) //Web3 provider in ethers v5
        const { chainId } = await provider.getNetwork()
        console.log(chainId.toString())

        //Token Smart Contract

        const token = new ethers.Contract(
            config[chainId]["DApp"]["address"],
            tokenAbi,
            provider
        )
        console.log(await token.symbol())
    }

    useEffect(() => {
        loadBlockchainData()
    })

    return (
        <div className="App">
            {/* Navbar */}
            <main className="exchange grid">
                <section className="exchange__section--left grid">
                    {/* Markets */}
                    {/* Balance */}
                    {/* Order */}
                </section>
                <section className="exchange__section--right grid">
                    {/* PriceChart  */}
                    {/* Txs */}
                    {/* Trades */}
                    {/* OrderBook */}
                </section>
            </main>
        </div>
    )
}

export default App
