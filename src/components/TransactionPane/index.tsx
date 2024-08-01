import { useCallback } from "react"
import { InputCheckbox } from "../InputCheckbox"
import { TransactionPaneComponent } from "./types"

export const TransactionPane: TransactionPaneComponent = ({ transaction, approved, setTransactionApproval }) => {
  const handleCheckboxChange = useCallback(
    (newValue: boolean) => {
      setTransactionApproval(transaction.id, newValue)
    },
    [setTransactionApproval, transaction.id]
  )

  return (
    <div className="RampPane">
      <div className="RampPane--content">
        <p className="RampText">{transaction.merchant} </p>
        <b>{moneyFormatter.format(transaction.amount)}</b>
        <p className="RampText--hushed RampText--s">
          {transaction.employee.firstName} {transaction.employee.lastName} - {transaction.date}
        </p>
      </div>
      <InputCheckbox id={transaction.id} checked={approved} onChange={handleCheckboxChange} />
    </div>
  )
}

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})