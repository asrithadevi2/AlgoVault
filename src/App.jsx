import { useEffect, useMemo, useState } from "react";
import "./App.css";

const emptyForm = {
  name: "",
  number: "",
  difficulty: "Easy",
  pattern: "",
  topic: "",
  notes: "",
  mistakes: "",
  revision: false,
  favorite: false,
};

function App() {
  const [problems, setProblems] = useState(() => {
    try {
      const saved = localStorage.getItem("dsaProblems");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [goal, setGoal] = useState(() => {
    const savedGoal = localStorage.getItem("dsaGoal");
    return savedGoal ? Number(savedGoal) : 150;
  });

  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("Newest");

  useEffect(() => {
    localStorage.setItem("dsaProblems", JSON.stringify(problems));
  }, [problems]);

  useEffect(() => {
    localStorage.setItem("dsaGoal", String(goal));
  }, [goal]);

  const text = (value) => String(value || "");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter a problem name.");
      return;
    }

    if (editId !== null) {
      setProblems(
        problems.map((problem) =>
          problem.id === editId ? { ...problem, ...form } : problem
        )
      );
      setEditId(null);
    } else {
      const newProblem = {
        id: Date.now(),
        ...form,
        date: new Date().toLocaleDateString(),
      };

      setProblems([newProblem, ...problems]);
    }

    setForm(emptyForm);
  };

  const editProblem = (problem) => {
    setEditId(problem.id);
    setForm({
      name: text(problem.name),
      number: text(problem.number),
      difficulty: text(problem.difficulty) || "Easy",
      pattern: text(problem.pattern),
      topic: text(problem.topic),
      notes: text(problem.notes),
      mistakes: text(problem.mistakes),
      revision: Boolean(problem.revision),
      favorite: Boolean(problem.favorite),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm(emptyForm);
  };

  const deleteProblem = (id) => {
    setProblems(problems.filter((problem) => problem.id !== id));
  };

  const toggleFavorite = (id) => {
    setProblems(
      problems.map((problem) =>
        problem.id === id
          ? { ...problem, favorite: !problem.favorite }
          : problem
      )
    );
  };

  const toggleRevision = (id) => {
    setProblems(
      problems.map((problem) =>
        problem.id === id
          ? { ...problem, revision: !problem.revision }
          : problem
      )
    );
  };

  const total = problems.length;
  const easy = problems.filter((p) => p.difficulty === "Easy").length;
  const medium = problems.filter((p) => p.difficulty === "Medium").length;
  const hard = problems.filter((p) => p.difficulty === "Hard").length;
  const revisionCount = problems.filter((p) => p.revision).length;
  const favoriteCount = problems.filter((p) => p.favorite).length;

  const progress =
    goal <= 0 ? 0 : Math.min(Math.round((total / goal) * 100), 100);

  const percentage = (count) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  const topPattern = useMemo(() => {
    const counts = {};

    problems.forEach((p) => {
      const pattern = text(p.pattern).trim();
      if (!pattern) return;
      counts[pattern] = (counts[pattern] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted.length ? sorted[0][0] : "Not enough data";
  }, [problems]);

  const topTopic = useMemo(() => {
    const counts = {};

    problems.forEach((p) => {
      const topic = text(p.topic).trim();
      if (!topic) return;
      counts[topic] = (counts[topic] || 0) + 1;
    });
    const patternStats = useMemo(() => {
  const counts = {};

  problems.forEach((problem) => {
    const pattern = problem.pattern.trim();

    if (!pattern) return;

    counts[pattern] = (counts[pattern] || 0) + 1;
  });

  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}, [problems]);

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted.length ? sorted[0][0] : "Not enough data";
  }, [problems]);

  const filteredProblems = problems
    .filter((problem) => {
      const searchableText = `
        ${text(problem.name)}
        ${text(problem.number)}
        ${text(problem.difficulty)}
        ${text(problem.pattern)}
        ${text(problem.topic)}
        ${text(problem.notes)}
        ${text(problem.mistakes)}
      `.toLowerCase();

      const matchesSearch = searchableText.includes(search.toLowerCase());

      const matchesDifficulty =
        difficultyFilter === "All" || problem.difficulty === difficultyFilter;

      return matchesSearch && matchesDifficulty;
    })
    .sort((a, b) => {
      if (sortOrder === "Newest") return b.id - a.id;
      if (sortOrder === "Oldest") return a.id - b.id;
      if (sortOrder === "Favorites") return Number(b.favorite) - Number(a.favorite);
      if (sortOrder === "Revision") return Number(b.revision) - Number(a.revision);
      return 0;
    });

  return (
    <div className="app">
      <header className="hero">
        <p className="eyebrow">Personal DSA Dashboard</p>
        <h1>AlgoVault</h1>
        <p>
          Track your LeetCode problems, patterns, mistakes, notes, favorites,
          and revision progress in one place.
        </p>
      </header>

      <section className="goal-card">
        <div>
          <h2>{total} / {goal || 0}</h2>
          <p>Problems completed toward your goal</p>
        </div>

        <div className="progress-wrap">
          <div className="progress-info">
            <span>Progress</span>
            <strong>{progress}%</strong>
          </div>

          <div className="progress-bar">
            <div style={{ width: `${progress}%` }}></div>
          </div>

          <div className="goal-input-box">
            <label>Set your DSA goal</label>
            <input
              type="number"
              min="1"
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value))}
            />
          </div>
        </div>
      </section>
<section className="analytics">
  <h2>Analytics</h2>

  <div className="analytics-grid">
    <div>
      <span>Most Practiced Pattern</span>
      <strong>{topPattern}</strong>
    </div>

    <div>
      <span>Most Practiced Topic</span>
      <strong>{topTopic}</strong>
    </div>

    <div>
      <span>Revision Pending</span>
      <strong>{revisionCount}</strong>
    </div>

    <div>
      <span>Goal Completion</span>
      <strong>{progress}%</strong>
    </div>
  </div>
</section>

      <section className="stats">
        <div className="card"><h2>{total}</h2><p>Total Solved</p></div>
        <div className="card easy"><h2>{percentage(easy)}%</h2><p>Easy</p></div>
        <div className="card medium"><h2>{percentage(medium)}%</h2><p>Medium</p></div>
        <div className="card hard"><h2>{percentage(hard)}%</h2><p>Hard</p></div>
        <div className="card"><h2>{revisionCount}</h2><p>Revision</p></div>
        <div className="card"><h2>{favoriteCount}</h2><p>Favorites</p></div>
        <div className="card wide"><h2>{topPattern}</h2><p>Most Practiced Pattern</p></div>
        <div className="card wide"><h2>{topTopic}</h2><p>Most Practiced Topic</p></div>
      </section>

      <main>
        <form onSubmit={handleSubmit} className="form">
          <h2>{editId !== null ? "Edit Problem" : "Add Problem"}</h2>

          <input
            type="text"
            placeholder="Problem name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            type="text"
            placeholder="LeetCode number"
            value={form.number}
            onChange={(e) => setForm({ ...form, number: e.target.value })}
          />

          <select
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>

          <input
            type="text"
            placeholder="Pattern e.g. Two Pointers"
            value={form.pattern}
            onChange={(e) => setForm({ ...form, pattern: e.target.value })}
          />

          <input
            type="text"
            placeholder="Topic e.g. Arrays"
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
          />

          <textarea
            placeholder="Notes for future revision"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          <textarea
            placeholder="Mistakes you made"
            value={form.mistakes}
            onChange={(e) => setForm({ ...form, mistakes: e.target.value })}
          />

          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.revision}
              onChange={(e) => setForm({ ...form, revision: e.target.checked })}
            />
            Mark for revision
          </label>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.favorite}
              onChange={(e) => setForm({ ...form, favorite: e.target.checked })}
            />
            Add to favorites
          </label>

          <button type="submit">
            {editId !== null ? "Save Changes" : "Add Problem"}
          </button>

          {editId !== null && (
            <button type="button" className="cancel" onClick={cancelEdit}>
              Cancel Edit
            </button>
          )}
        </form>

        <section className="list">
          <div className="filters">
            <input
              type="text"
              placeholder="Search by name, number, pattern, topic, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
            >
              <option>All</option>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>

            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option>Newest</option>
              <option>Oldest</option>
              <option>Favorites</option>
              <option>Revision</option>
            </select>
          </div>

          {filteredProblems.length === 0 ? (
            <p className="empty">No problems found.</p>
          ) : (
            filteredProblems.map((problem) => (
              <div
                className={`problem problem-${text(problem.difficulty).toLowerCase()}`}
                key={problem.id}
              >
                <div className="problem-header">
                  <div>
                    <h3>
                      {problem.favorite && "⭐ "}
                      {problem.number && `#${problem.number} `}
                      {problem.name}
                    </h3>

                    <p className="tags-row">
                      <span className={`tag ${text(problem.difficulty).toLowerCase()}`}>
                        {problem.difficulty}
                      </span>
                      <span>{problem.pattern || "No pattern"}</span>
                      <span>{problem.topic || "No topic"}</span>
                    </p>
                  </div>

                  <div className="actions">
                    <button type="button" onClick={() => toggleFavorite(problem.id)}>
                      {problem.favorite ? "Unstar" : "Star"}
                    </button>

                    <button type="button" onClick={() => toggleRevision(problem.id)}>
                      {problem.revision ? "Done" : "Revise"}
                    </button>

                    <button type="button" onClick={() => editProblem(problem)}>
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete"
                      onClick={() => deleteProblem(problem.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p><strong>Date:</strong> {problem.date}</p>

                {problem.notes && <p><strong>Notes:</strong> {problem.notes}</p>}
                {problem.mistakes && <p><strong>Mistakes:</strong> {problem.mistakes}</p>}

                <div className="badges">
                  {problem.revision && <span className="badge revision">Revision needed</span>}
                  {problem.favorite && <span className="badge favorite">Favorite</span>}
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
