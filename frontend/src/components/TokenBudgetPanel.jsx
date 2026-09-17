function TokenBudgetPanel({ taskBudgets }) {
  if (!taskBudgets || taskBudgets.length === 0) return null;

  return (
    <div className="token-budget-panel overflow-y-auto max-h-full">
      <h3>Research task budget</h3>

      <table>
        <thead>
          <tr>
            <th>Task</th>
            <th>Importance</th>
            <th>Max tokens</th>
          </tr>
        </thead>

        <tbody>
          {taskBudgets.map((b, i) => (
            <tr key={i}>
              <td>{b.task}</td>
              <td>{b.importance}</td>
              <td>{b.max_tokens}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TokenBudgetPanel;