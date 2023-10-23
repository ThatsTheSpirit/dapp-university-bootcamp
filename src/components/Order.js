import { useRef, useState } from "react"
import { makeBuyOrder, makeSellOrder } from "../store/interactions"
import { useDispatch, useSelector } from "react-redux"

const Order = () => {
    const dispatch = useDispatch()
    const provider = useSelector((state) => state.provider.connection)
    const exchange = useSelector((state) => state.exchange.contract)
    const tokens = useSelector((state) => state.tokens.contracts)

    const [isBuy, setIsBuy] = useState(true)
    const [amount, setAmount] = useState(0)
    const [price, setPrice] = useState(0)

    const buyRef = useRef(null)
    const sellRef = useRef(null)

    const buyHandler = (e) => {
        e.preventDefault()
        makeBuyOrder(provider, exchange, tokens, { amount, price }, dispatch)
        setAmount(0)
        setPrice(0)
    }

    const sellHandler = (e) => {
        e.preventDefault()
        makeSellOrder(provider, exchange, tokens, { amount, price }, dispatch)
        setAmount(0)
        setPrice(0)
    }

    const tabHandler = () => {
        if (isBuy) {
            sellRef.current.className = "tab tab--active"
            buyRef.current.className = "tab"
            setIsBuy(false)
        } else {
            buyRef.current.className = "tab tab--active"
            sellRef.current.className = "tab"
            setIsBuy(true)
        }
    }

    return (
        <div className="component exchange__orders">
            <div className="component__header flex-between">
                <h2>New Order</h2>
                <div className="tabs">
                    <button
                        className="tab tab--active"
                        onClick={tabHandler}
                        ref={buyRef}
                    >
                        Buy
                    </button>
                    <button className="tab" onClick={tabHandler} ref={sellRef}>
                        Sell
                    </button>
                </div>
            </div>

            <form onSubmit={isBuy ? buyHandler : sellHandler}>
                <label htmlFor="amount">{isBuy ? "Buy" : "Sell"} Amount</label>

                <input
                    type="text"
                    id="amount"
                    placeholder="0.0000"
                    value={amount === 0 ? "" : amount}
                    onChange={(e) => setAmount(e.target.value)}
                />

                <label htmlFor="price">{isBuy ? "Buy" : "Sell"} Price</label>

                <input
                    type="text"
                    id="price"
                    placeholder="0.0000"
                    value={price === 0 ? "" : price}
                    onChange={(e) => setPrice(e.target.value)}
                />

                <button className="button button--filled" type="submit">
                    <span>{isBuy ? "Buy" : "Sell"} Order</span>
                </button>
            </form>
        </div>
    )
}

export default Order
