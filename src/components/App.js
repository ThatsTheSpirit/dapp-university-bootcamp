import { useEffect } from "react"
import { useDispatch } from "react-redux"
import {
    loadProvider,
    loadNetwork,
    loadAccount,
    loadToken,
} from "../store/interactions"

const config = require("../config.json")
//const exchangeAbi = require("../abis/Exchange.json")

function App() {
    const dispatch = useDispatch()

    const loadBlockchainData = async () => {
        await loadAccount(dispatch)

        //Connect Ethers to
        const provider = loadProvider(dispatch)

        const chainId = await loadNetwork(provider, dispatch)

        //Token Smart Contract

        await loadToken(config[chainId]["DApp"]["address"], provider, dispatch)
        // const token = new ethers.Contract(
        //     config[chainId]["DApp"]["address"],
        //     tokenAbi,
        //     provider
        // )
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
