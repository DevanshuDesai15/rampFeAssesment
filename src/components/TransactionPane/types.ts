import { FunctionComponent } from "react"
import { Transaction } from "../../utils/types"

type TransactionPaneProps = {
  transaction: Transaction
  approved: boolean
  setTransactionApproval: (transactionId: string, newValue: boolean) => void
}

export type TransactionPaneComponent = React.FC<TransactionPaneProps>
