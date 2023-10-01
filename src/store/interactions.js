import { ethers } from "ethers"
import TOKEN_ABI from "../abis/Token.json"
import EXCHANGE_ABI from "../abis/Exchange.json"

export const loadProvider = (dispatch) => {
    const connection = new ethers.BrowserProvider(window.ethereum) //Web3 provider
    dispatch({ type: "PROVIDER_LOADED", connection })
    return connection
}

export const loadNetwork = async (provider, dispatch) => {
    //Web3 provider in ethers v5
    const { chainId } = await provider.getNetwork()

    dispatch({ type: "NETWORK_LOADED", chainId: Number(chainId) })
    return chainId
}

export const loadAccount = async (provider, dispatch) => {
    const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
    })
    const account = ethers.getAddress(accounts[0])
    dispatch({ type: "ACCOUNT_LOADED", account })

    let balance = await provider.getBalance(account)
    balance = ethers.formatEther(balance)
    dispatch({ type: "ETHER_BALANCE_LOADED", balance })
}

export const loadTokens = async (provider, addresses, dispatch) => {
    let token, symbol

    token = new ethers.Contract(addresses[0], TOKEN_ABI, provider)
    symbol = await token.symbol()
    dispatch({ type: "TOKEN_1_LOADED", token, symbol })

    token = new ethers.Contract(addresses[1], TOKEN_ABI, provider)
    symbol = await token.symbol()
    dispatch({ type: "TOKEN_2_LOADED", token, symbol })
    return token
}

export const loadExchange = async (provider, address, dispatch) => {
    const exchange = new ethers.Contract(address, EXCHANGE_ABI, provider)
    dispatch({ type: "EXCHANGE_LOADED", exchange })
    return exchange
}
