import { ethers } from "ethers"
import TOKEN_ABI from "../abis/Token.json"

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

export const loadAccount = async (dispatch) => {
    const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
    })
    const account = ethers.getAddress(accounts[0])
    dispatch({ type: "ACCOUNT_LOADED", account })
}

export const loadToken = async (address, provider, dispatch) => {
    let token, symbol

    token = new ethers.Contract(address, TOKEN_ABI, provider)
    symbol = await token.symbol()

    dispatch({ type: "TOKEN_LOADED", token, symbol })
    return token
}
