
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/market-prices";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

export default function MarketPrices() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fetchedAt, setFetchedAt] = useState("");

  async function loadPrices() {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(API_URL);
      const result = response.data;

      if (!result.success || !Array.isArray(result.records)) {
        throw new Error("Invalid market-price response.");
      }

      setRecords(result.records);
      setFetchedAt(result.fetchedAt || "");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load market prices."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPrices();
  }, []);

  return (
    <section
      style={{
        marginTop: 24,
        padding: 20,
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        color: "#1f2937",
      }}
    >
      <h2>Real Market Price Dashboard</h2>
      <p>
        Karnataka agricultural wholesale prices ·
        Government-sourced mandi data
      </p>

      <button onClick={loadPrices} disabled={loading}>
        {loading ? "Loading..." : "Refresh prices"}
      </button>

      {fetchedAt && (
        <p style={{ fontSize: 12, color: "#6b7280" }}>
          Retrieved: {new Date(fetchedAt).toLocaleString("en-IN")}
        </p>
      )}

      <p style={{ fontSize: 13, color: "#6b7280" }}>
        Modal price per kg is calculated by dividing the
        reported modal price per quintal by 100. These are
        wholesale prices, not guaranteed retail shop prices.
      </p>

      {loading && <p>Fetching prices...</p>}

      {error && (
        <div role="alert" style={{ color: "#b91c1c" }}>
          <p>{error}</p>
          <button onClick={loadPrices}>Try again</button>
        </div>
      )}

      {!loading && !error && records.length === 0 && (
        <p>No eligible market records were returned.</p>
      )}

      {!loading && !error && records.length > 0 && (
        <>
          <p>
            Showing {records.length} reported market records.
          </p>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: 13,
              }}
            >
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  {[
                    "Commodity",
                    "Market",
                    "District",
                    "Arrival date",
                    "Min ₹/quintal",
                    "Modal ₹/quintal",
                    "Max ₹/quintal",
                    "Modal ₹/kg",
                  ].map((heading) => (
                    <th key={heading} style={{ padding: 10 }}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {records.map((item, index) => (
                  <tr
                    key={`${item.commodity}-${item.market}-${item.arrivalDate}-${index}`}
                  >
                    <td style={{ padding: 10 }}>
                      {item.commodity}
                    </td>
                    <td style={{ padding: 10 }}>{item.market}</td>
                    <td style={{ padding: 10 }}>{item.district}</td>
                    <td style={{ padding: 10 }}>
                      {item.arrivalDate}
                    </td>
                    <td style={{ padding: 10 }}>
                      {money(item.minPricePerQuintal)}
                    </td>
                    <td style={{ padding: 10 }}>
                      {money(item.modalPricePerQuintal)}
                    </td>
                    <td style={{ padding: 10 }}>
                      {money(item.maxPricePerQuintal)}
                    </td>
                    <td style={{ padding: 10 }}>
                      {money(item.modalPricePerKg)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <p style={{ fontSize: 12, marginTop: 16 }}>
        Source:{" "}
        <a
          href="https://mandi-api.vercel.app/docs"
          target="_blank"
          rel="noreferrer"
        >
          Mandi Price API documentation
        </a>
      </p>
    </section>
  );
}
