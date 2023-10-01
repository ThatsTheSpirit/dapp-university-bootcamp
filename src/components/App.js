import { useEffect } from "react"
import { useDispatch } from "react-redux"
import {
    loadProvider,
    loadNetwork,
    loadAccount,
    loadTokens,
    loadExchange,
} from "../store/interactions"

const config = require("../config.json")
//const exchangeAbi = require("../abis/Exchange.json")

function App() {
    const dispatch = useDispatch()

    const loadBlockchainData = async () => {
        //Connect Ethers to
        const provider = loadProvider(dispatch)
        //Fetch current network's chain id
        const chainId = await loadNetwork(provider, dispatch)
        //Fetch current account and balance from metamask
        await loadAccount(provider, dispatch)

        //Token Smart Contract
        const DApp = config[chainId]["DApp"]
        const mETH = config[chainId]["mETH"]
        await loadTokens(provider, [DApp.address, mETH.address], dispatch)

        //Load exchange smart contract
        const exchangeConfig = config[chainId]["Exchange"]
        await loadExchange(provider, exchangeConfig.address, dispatch)
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
