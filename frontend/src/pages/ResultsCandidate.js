import React, { useEffect, useState } from "react";
import axios from "axios";

const ResultsCandidate = () => {
  const [summary, setSummary] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const sRes = await axios.get("http://localhost:5000/election-summary");
        if (sRes.data.status !== "success") return;

        const s = sRes.data.summary;
        setSummary(s);

        if (s.status_code === 2) {
          const rRes = await axios.get("http://localhost:5000/results");
          if (rRes.data.status === "success") {
            setResults(rRes.data.results);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, []);

  if (!summary) return <h2>Loading...</h2>;

  /* ===== STATUS 0 ===== */
  if (summary.status_code === 0) {
    return <h2>Election has not started yet.</h2>;
  }

  /* ===== STATUS 1 ===== */
  if (summary.status_code === 1) {
    return <h2>Election is ongoing. Results are hidden.</h2>;
  }

  /* ===== STATUS 2 (FINAL RESULTS) ===== */
  const totalVotes = summary.voters_voted || 0;
  const sortedResults = [...results].sort((a, b) => b.votes - a.votes);

  return (
    <div className="candidate-results page">
      <h1>Final Election Results</h1>

      <table className="results-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Candidate</th>
            <th>Votes</th>
            <th>Position</th>
            <th>Share</th>
          </tr>
        </thead>
        <tbody>
          {sortedResults.map((c, i) => {
            const share =
              totalVotes > 0
                ? ((c.votes / totalVotes) * 100).toFixed(1)
                : 0;

            return (
              <tr key={c.candidate_id}>
                <td>{i + 1}</td>
                <td>{c.full_name}</td>
                <td>{c.votes}</td>
                <td>
                  {i === 0 && "🏆 President"}
                  {i > 0 && i <= 4 && "Council Member"}
                  {i > 4 && "Not Elected"}
                </td>
                <td>{share}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsCandidate;