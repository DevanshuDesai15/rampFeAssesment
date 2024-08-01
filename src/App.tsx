import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee, Transaction } from "./utils/types"
import { TransactionPane } from "./components/TransactionPane"
import { fakeFetch } from "./utils/fetch"

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees()
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions()
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee()
  const [isLoading, setIsLoading] = useState(false)
  const [approvalStates, setApprovalStates] = useState(new Map<string, boolean>())

  const transactions = useMemo(
    () => paginatedTransactions?.data ?? transactionsByEmployee ?? null,
    [paginatedTransactions, transactionsByEmployee]
  )

  const loadAllTransactions = useCallback(async () => {
    setIsLoading(true)
    transactionsByEmployeeUtils.invalidateData()

    await employeeUtils.fetchAll()
    const result = await paginatedTransactionsUtils.fetchAll()
    setIsLoading(false)

    if (result) {
      setApprovalStates(new Map(result.data.map(t => [t.id, t.approved])))
    }
  }, [employeeUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils])

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      paginatedTransactionsUtils.invalidateData()
      const result = await transactionsByEmployeeUtils.fetchById(employeeId)

      if (result) {
        setApprovalStates(prevStates => {
          const newStates = new Map(prevStates)
          result.forEach(t => newStates.set(t.id, t.approved))
          return newStates
        })
      }
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  )

  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      loadAllTransactions()
    }
  }, [employeeUtils.loading, employees, loadAllTransactions])

  const setTransactionApproval = useCallback(async (transactionId: string, newValue: boolean) => {
    await fakeFetch("setTransactionApproval", { transactionId, value: newValue })
    setApprovalStates(prevStates => new Map(prevStates).set(transactionId, newValue))
  }, [])

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={isLoading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === null) {
              return
            }
            if (newValue.id === EMPTY_EMPLOYEE.id) {
              await loadAllTransactions()
            } else {
              await loadTransactionsByEmployee(newValue.id)
            }
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          {transactions === null ? (
            <div className="RampLoading--container">Loading...</div>
          ) : (
            <Fragment>
              <div data-testid="transaction-container">
                {transactions.map((transaction) => (
                  <TransactionPane
                    key={transaction.id}
                    transaction={transaction}
                    approved={approvalStates.get(transaction.id) ?? transaction.approved}
                    setTransactionApproval={setTransactionApproval}
                  />
                ))}
              </div>
              <button
                className="RampButton"
                disabled={paginatedTransactionsUtils.loading || paginatedTransactions?.nextPage == null}
                onClick={async () => {
                  await loadAllTransactions()
                }}
              >
                View More
              </button>
            </Fragment>
          )}
        </div>
      </main>
    </Fragment>
  )
}