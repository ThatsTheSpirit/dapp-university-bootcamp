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

export const loadBalances = async (exchange, tokens, account, dispatch) => {
    let balance = ethers.formatUnits(await tokens[0].balanceOf(account), 18)
    dispatch({ type: "TOKEN_1_BALANCE_LOADED", balance })

    balance = ethers.formatUnits(
        await exchange.balanceOf(tokens[0].target, account),
        18
    )
    dispatch({ type: "EXCHANGE_TOKEN_1_BALANCE_LOADED", balance })

    balance = ethers.formatUnits(await tokens[1].balanceOf(account), 18)
    dispatch({ type: "TOKEN_2_BALANCE_LOADED", balance })

    balance = ethers.formatUnits(
        await exchange.balanceOf(tokens[1].target, account),
        18
    )
    dispatch({ type: "EXCHANGE_TOKEN_2_BALANCE_LOADED", balance })
}

export const subscribeToEvents = (exchange, dispatch) => {
    exchange.on("Deposit", (token, user, amount, balance, event) => {
        dispatch({ type: "TRANSFER_SUCCESS", event })
    })

    exchange.on("Withdraw", (token, user, amount, balance, event) => {
        dispatch({ type: "TRANSFER_SUCCESS", event })
    })
}

// ---------------------------------------------------------------
// TRANSFER TOKENS (DEPOSIT & WITHDRAWS)

export const transferTokens = async (
    provider,
    exchange,
    transferType,
    token,
    amount,
    dispatch
) => {
    let tx

    dispatch({ type: "TRANSFER_REQUEST" })

    try {
        const signer = await provider.getSigner()
        const amountToTransfer = ethers.parseUnits(amount.toString(), 18)

        if (transferType === "Deposit") {
            tx = await token
                .connect(signer)
                .approve(exchange.target, amountToTransfer)
            await tx.wait()

            tx = await exchange
                .connect(signer)
                .depositToken(token.target, amountToTransfer)
        } else {
            tx = await exchange
                .connect(signer)
                .withdrawToken(token.target, amountToTransfer)
        }

        await tx.wait()
    } catch (error) {
        dispatch({ type: "TRANSFER_FAIL" })
    }
}
