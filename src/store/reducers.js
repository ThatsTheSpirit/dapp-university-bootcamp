export const provider = (state = {}, action) => {
    switch (action.type) {
        case "PROVIDER_LOADED":
            return { ...state, connection: action.connection }
        case "NETWORK_LOADED":
            return { ...state, chainId: action.chainId }
        case "ACCOUNT_LOADED":
            return { ...state, account: action.account }
        case "TOKEN_LOADED":
            return { ...state, token: action.token, symbol: action.symbol }
        default:
            return state
    }
}

export const tokens = (
    state = { loaded: false, contracts: [], symbols: [] },
    action
) => {
    switch (action.type) {
        case "TOKEN_LOADED":
            return {
                ...state,
                loaded: true,
                contracts: [...state.contracts, action.token],
                symbols: [...state.symbols, action.symbol],
            }
        default:
            return state
    }
}
