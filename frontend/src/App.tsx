function App() {
  return (
    <main className="page">
      <section className="card">
        <p className="eyebrow">Этап 2 · frontend skeleton</p>
        <h1>Календарь звонков</h1>
        <p className="lead">
          Здесь позже появится пользовательский интерфейс для публичной записи и
          административной части.
        </p>
        <ul className="notes">
          <li>Frontend собран на React + TypeScript + Vite.</li>
          <li>Контракт API уже зафиксирован отдельно в `contracts/`.</li>
          <li>Базовый URL API будет задаваться через `VITE_API_BASE_URL`.</li>
        </ul>
      </section>
    </main>
  );
}

export default App;
