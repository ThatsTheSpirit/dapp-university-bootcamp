import { legacy_createStore, combineReducers, applyMiddleware } from "redux"
import thunk from "redux-thunk"
import { composeWithDevTools } from "redux-devtools-extension"

// Import reducers
import { provider, tokens } from "./reducers"

const reducer = combineReducers({
    provider,
    tokens,
})

const initialState = {}
const middleware = [thunk]
const store = legacy_createStore(
    reducer,
    initialState,
    composeWithDevTools(applyMiddleware(...middleware))
)

export default store
