import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, RotateCcw, Bell, Package, ShoppingBasket, CheckCircle2 } from "lucide-react";

const STORAGE_KEY = "grocwise_demo_pantry_v1";

export function syncPurchasedItemsToPantry(purchasedItems) {
  let data = {
    items: [],
    history: [],
    notifications: [],
  };

  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "{}"
    );

    data = {
      items: Array.isArray(saved.items) ? saved.items : [],
      history: Array.isArray(saved.history) ? saved.history : [],
      notifications: Array.isArray(saved.notifications)
        ? saved.notifications
        : [],
    };
  } catch (error) {
    console.error("Could not read pantry data:", error);
  }

  const updatedItems = [...data.items];
  const newHistory = [...data.history];
  const now = new Date().toLocaleString();

  purchasedItems.forEach((product) => {
    const name = String(product.name || "").trim();
    const amount = Number(product.quantity || 0);

    if (!name || !Number.isFinite(amount) || amount <= 0) {
      return;
    }

    const unit = product.unit || product.unitOfMeasure || "pcs";
    const category = product.category || "Pantry";

    const existingIndex = updatedItems.findIndex(
      (item) =>
        item.name.toLowerCase() === name.toLowerCase() &&
        item.unit === unit
    );

    if (existingIndex >= 0) {
      const existing = updatedItems[existingIndex];
      const newQuantity =
        Number(existing.quantity || 0) + amount;

      updatedItems[existingIndex] = {
        ...existing,
        quantity: newQuantity,
        startingQuantity: Math.max(
          Number(existing.startingQuantity || 0),
          newQuantity
        ),
      };
    } else {
      updatedItems.unshift({
        id: `purchase-${Date.now()}-${Math.random()
          .toString(16)
          .slice(2)}`,
        name,
        category,
        unit,
        quantity: amount,
        dailyUsage: 0,
        threshold: 1,
        startingQuantity: amount,
        createdAt: new Date().toISOString(),
      });
    }

    newHistory.unshift({
      id: `purchase-history-${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`,
      itemName: name,
      amount,
      unit,
      action: "Purchased",
      date: now,
    });
  });

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...data,
      items: updatedItems,
      history: newHistory.slice(0, 100),
    })
  );

  window.dispatchEvent(
    new Event("grocwise-pantry-updated")
  );
}




const initialForm = {
  name: "",
  category: "Pantry",
  unit: "kg",
  quantity: "5",
  dailyUsage: "0.2",
  threshold: "1",
};

const styles = {
  page: { color: "#263a2c", fontFamily: "inherit" },
  card: { background: "#fff", border: "1px solid #e4ebe1", borderRadius: 18, padding: 18 },
  button: { border: 0, borderRadius: 10, padding: "10px 13px", background: "#276442", color: "#fff", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7 },
  input: { boxSizing: "border-box", width: "100%", padding: "11px 12px", border: "1px solid #dce5da", borderRadius: 9, background: "#fff", color: "#263a2c", fontSize: 14 },
  label: { display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: "#526555" },
  muted: { color: "#788579", fontSize: 13 },
};

function loadSavedData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      return {
        items: Array.isArray(data.items) ? data.items : [],
        history: Array.isArray(data.history) ? data.history : [],
        notifications: Array.isArray(data.notifications) ? data.notifications : [],
      };
    }
  } catch (error) {
    console.error("Could not load demo pantry data:", error);
  }
  return { items: [], history: [], notifications: [] };
}

export default function SmartPantry() {
  const [saved] = useState(loadSavedData);
  const [items, setItems] = useState(saved.items);
  const [history, setHistory] = useState(saved.history);
  const [notifications, setNotifications] = useState(saved.notifications);
  const [form, setForm] = useState(initialForm);
  const [usageAmounts, setUsageAmounts] = useState({});
  const [refillAmounts, setRefillAmounts] = useState({});
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState("pantry");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, history, notifications }));
    } catch (error) {
      console.error("Could not save pantry data:", error);
      setMessage("Unable to save data in this browser.");
    }
  }, [items, history, notifications]);

  const lowItems = useMemo(
    () => items.filter((item) => item.quantity <= item.threshold),
    [items]
  );
  
useEffect(() => {
  function refreshPantry() {
    const latest = loadSavedData();

    setItems(latest.items);
    setHistory(latest.history);
    setNotifications(latest.notifications);
    setMessage("Purchased items added to your pantry.");
  }

  window.addEventListener(
    "grocwise-pantry-updated",
    refreshPantry
  );

  return () => {
    window.removeEventListener(
      "grocwise-pantry-updated",
      refreshPantry
    );
  };
}, []);


  function notify(item, type, text) {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      itemId: item.id,
      itemName: item.name,
      type,
      text,
      date: new Date().toLocaleString(),
      read: false,
    };
    setNotifications((previous) => [entry, ...previous].slice(0, 100));
  }

  function addItem(event) {
    event.preventDefault();
    const quantity = Number(form.quantity);
    const dailyUsage = Number(form.dailyUsage);
    const threshold = Number(form.threshold);

    if (!form.name.trim() || !Number.isFinite(quantity) || quantity < 0 ||
        !Number.isFinite(dailyUsage) || dailyUsage < 0 ||
        !Number.isFinite(threshold) || threshold < 0) {
      setMessage("Enter a name and valid non-negative quantities.");
      return;
    }

    const item = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: form.name.trim(),
      category: form.category,
      unit: form.unit,
      quantity,
      dailyUsage,
      threshold,
      startingQuantity: Math.max(quantity, 0.001),
      createdAt: new Date().toISOString(),
    };

    setItems((previous) => [item, ...previous]);
    setForm(initialForm);
    setMessage(`${item.name} added to your pantry.`);
    if (quantity <= threshold) notify(item, "low", `${item.name} is running low.`);
  }

  function recordUsage(item) {
    const amount = Number(usageAmounts[item.id]);
    if (!Number.isFinite(amount) || amount <= 0) {
      setMessage("Enter a usage amount greater than zero.");
      return;
    }
    if (amount > item.quantity) {
      setMessage(`Only ${item.quantity} ${item.unit} of ${item.name} is available.`);
      return;
    }

    const remaining = Math.max(0, item.quantity - amount);
    const updated = { ...item, quantity: remaining };
    setItems((previous) => previous.map((x) => x.id === item.id ? updated : x));
    setHistory((previous) => [{
      id: `${Date.now()}`,
      itemName: item.name,
      amount,
      unit: item.unit,
      action: "Used",
      date: new Date().toLocaleString(),
    }, ...previous].slice(0, 100));
    setUsageAmounts((previous) => ({ ...previous, [item.id]: "" }));
    setMessage(`Recorded ${amount} ${item.unit} used from ${item.name}.`);

    if (remaining === 0) notify(updated, "empty", `${item.name} is empty. Add it to your shopping list.`);
    else if (remaining <= item.threshold && item.quantity > item.threshold) {
      notify(updated, "low", `${item.name} is running low: ${remaining} ${item.unit} left.`);
    }
  }

  function refillItem(item) {
    const amount = Number(refillAmounts[item.id]);
    if (!Number.isFinite(amount) || amount <= 0) {
      setMessage("Enter a refill amount greater than zero.");
      return;
    }
    const updated = { ...item, quantity: item.quantity + amount };
    setItems((previous) => previous.map((x) => x.id === item.id ? updated : x));
    setHistory((previous) => [{
      id: `${Date.now()}`,
      itemName: item.name,
      amount,
      unit: item.unit,
      action: "Refilled",
      date: new Date().toLocaleString(),
    }, ...previous].slice(0, 100));
    setRefillAmounts((previous) => ({ ...previous, [item.id]: "" }));
    setMessage(`${item.name} refilled successfully.`);
  }

  function deleteItem(item) {
    if (!window.confirm(`Remove ${item.name} from your pantry?`)) return;
    setItems((previous) => previous.filter((x) => x.id !== item.id));
    setMessage(`${item.name} removed.`);
  }

  function addToShoppingList(item) {
    const key = "grocwise_demo_shopping_list_v1";
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem(key) || "[]");
      if (!Array.isArray(list)) list = [];
    } catch {
      list = [];
    }

    if (!list.some((entry) => entry.name.toLowerCase() === item.name.toLowerCase())) {
      list.push({ id: `${Date.now()}`, name: item.name, checked: false });
      localStorage.setItem(key, JSON.stringify(list));
    }
    setMessage(`${item.name} added to your shopping list.`);
  }

  function markAllRead() {
    setNotifications((previous) => previous.map((item) => ({ ...item, read: true })));
  }

  function resetDemo() {
    if (!window.confirm("Clear all demo pantry items, history, and alerts?")) return;
    setItems([]);
    setHistory([]);
    setNotifications([]);
    setMessage("Demo pantry cleared.");
  }

  function simulateDay() {
    if (!items.length) {
      setMessage("Add a pantry item before simulating a day.");
      return;
    }

    let newAlerts = [];
    const updatedItems = items.map((item) => {
      const amount = Math.min(item.quantity, item.dailyUsage);
      const remaining = Math.max(0, item.quantity - amount);

      if (amount > 0) {
        setHistory((previous) => [{
          id: `${Date.now()}-${item.id}`,
          itemName: item.name,
          amount,
          unit: item.unit,
          action: "Simulated daily use",
          date: new Date().toLocaleString(),
        }, ...previous].slice(0, 100));
      }

      const updated = { ...item, quantity: remaining };
      if (remaining === 0 && item.quantity > 0) {
        newAlerts.push({ item: updated, type: "empty", text: `${item.name} is empty after simulated usage.` });
      } else if (remaining <= item.threshold && item.quantity > item.threshold) {
        newAlerts.push({ item: updated, type: "low", text: `${item.name} is running low: ${remaining} ${item.unit} left.` });
      }
      return updated;
    });

    setItems(updatedItems);
    if (newAlerts.length) {
      setNotifications((previous) => [
        ...newAlerts.map((alert, index) => ({
          id: `${Date.now()}-${index}`,
          itemId: alert.item.id,
          itemName: alert.item.name,
          type: alert.type,
          text: alert.text,
          date: new Date().toLocaleString(),
          read: false,
        })),
        ...previous,
      ].slice(0, 100));
    }
    setMessage("One demo day simulated. Quantities and usage history updated.");
  }

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes jarFill { from { height: 0%; } to { height: var(--fill); } }
        @keyframes softAppear { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .pantry-card { animation: softAppear .3s ease-out; transition: transform .2s, box-shadow .2s; }
        .pantry-card:hover { transform: translateY(-2px); box-shadow: 0 10px 26px #234d3410; }
        .pantry-tab { border: 1px solid #dfe8dd; background: #fff; color: #42604a; border-radius: 10px; padding: 10px 13px; cursor: pointer; font-weight: 700; }
        .pantry-tab.active { background: #276442; border-color: #276442; color: #fff; }
        .pantry-jar { width: 76px; height: 112px; position: relative; border: 3px solid #b8c9ba; border-radius: 12px 12px 18px 18px; overflow: hidden; background: #f6faf4; margin: 0 auto 12px; }
        .pantry-jar:before { content: ''; position: absolute; z-index: 2; top: -3px; left: 14px; right: 14px; height: 8px; border-radius: 4px; background: #91aa94; }
        .pantry-jar-fill { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(180deg,#a8d7a9,#4f9b62); transition: height .7s ease; opacity: .9; }
        .pantry-jar-label { position: absolute; z-index: 3; inset: 0; display: grid; place-items: center; font-size: 22px; }
        @media(max-width:650px) { .pantry-grid { grid-template-columns: 1fr !important; } .pantry-stats { grid-template-columns: 1fr 1fr !important; } }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <p style={{ color: "#438053", fontWeight: 800, fontSize: 11, letterSpacing: 1.5, marginBottom: 5 }}>SMART HOME INVENTORY</p>
          <h1 style={{ margin: 0, fontSize: "clamp(25px, 3vw, 34px)" }}>My Smart Pantry</h1>
          <p style={styles.muted}>Track what you have, record usage, and reduce food waste.</p>
        </div>
        <button style={styles.button} onClick={simulateDay}><RotateCcw size={16} /> Simulate 1 day</button>
      </div>

      {message && (
        <div role="status" style={{ marginBottom: 16, padding: "12px 14px", borderRadius: 10, background: "#edf6eb", color: "#276442", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircle2 size={17} /> <span style={{ flex: 1 }}>{message}</span>
          <button onClick={() => setMessage("")} aria-label="Dismiss message" style={{ border: 0, background: "transparent", cursor: "pointer", color: "inherit" }}>×</button>
        </div>
      )}

      <div className="pantry-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 12, marginBottom: 22 }}>
        {[
          { label: "Pantry items", value: items.length, icon: <Package size={19} /> },
          { label: "Running low", value: lowItems.length, icon: <Bell size={19} /> },
          { label: "Unread alerts", value: unreadCount, icon: <Bell size={19} /> },
          { label: "Usage records", value: history.length, icon: <ShoppingBasket size={19} /> },
        ].map((stat) => (
          <div key={stat.label} style={{ ...styles.card, padding: 15 }}>
            <div style={{ color: "#438053" }}>{stat.icon}</div>
            <div style={{ color: "#7a897c", fontSize: 12, marginTop: 10 }}>{stat.label}</div>
            <strong style={{ display: "block", fontSize: 25, marginTop: 3 }}>{stat.value}</strong>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        <button className={`pantry-tab ${tab === "pantry" ? "active" : ""}`} onClick={() => setTab("pantry")}>My Pantry</button>
        <button className={`pantry-tab ${tab === "alerts" ? "active" : ""}`} onClick={() => setTab("alerts")}>Alerts ({unreadCount})</button>
        <button className={`pantry-tab ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>Usage history</button>
      </div>

      {tab === "pantry" && (
        <>
          <section style={{ ...styles.card, marginBottom: 20 }}>
            <h2 style={{ marginTop: 0, fontSize: 19 }}>Add pantry item</h2>
            <form onSubmit={addItem} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(135px,1fr))", gap: 12, alignItems: "end" }}>
              <label style={styles.label}>Item name<input style={styles.input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Rice" required /></label>
              <label style={styles.label}>Category<select style={styles.input} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Pantry</option><option>Fruits</option><option>Vegetables</option><option>Dairy</option><option>Bakery</option><option>Other</option></select></label>
              <label style={styles.label}>Unit<select style={styles.input} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}><option>kg</option><option>g</option><option>L</option><option>ml</option><option>pcs</option><option>pack</option></select></label>
              <label style={styles.label}>Current quantity<input style={styles.input} type="number" min="0" step="any" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required /></label>
              <label style={styles.label}>Daily usage<input style={styles.input} type="number" min="0" step="any" value={form.dailyUsage} onChange={(e) => setForm({ ...form, dailyUsage: e.target.value })} required /></label>
              <label style={styles.label}>Low-stock level<input style={styles.input} type="number" min="0" step="any" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: e.target.value })} required /></label>
              <button type="submit" style={{ ...styles.button, gridColumn: "1 / -1" }}><Plus size={16} /> Add to pantry</button>
            </form>
          </section>

          {items.length === 0 ? (
            <div style={{ ...styles.card, textAlign: "center", padding: 35 }}>
              <div style={{ fontSize: 42 }}>🫙</div>
              <h3>Your pantry is ready to fill</h3>
              <p style={styles.muted}>Add rice, milk, vegetables, or any item you want to track.</p>
            </div>
          ) : (
            <div className="pantry-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(255px,1fr))", gap: 15 }}>
              {items.map((item) => {
                const days = item.dailyUsage > 0 ? Math.ceil(item.quantity / item.dailyUsage) : null;
                const capacity = Math.max(item.startingQuantity || item.quantity, item.dailyUsage * 14, item.threshold * 2, 1);
                const fill = Math.max(0, Math.min(100, item.quantity / capacity * 100));
                const isEmpty = item.quantity <= 0;
                const isLow = item.quantity <= item.threshold;
                return (
                  <article className="pantry-card" key={item.id} style={{ ...styles.card, padding: 16 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div style={{ flexShrink: 0, width: 85 }}>
                        <div className="pantry-jar">
                          <div className="pantry-jar-fill" style={{ height: `${fill}%` }} />
                          <div className="pantry-jar-label">{item.category === "Fruits" ? "🍎" : item.category === "Vegetables" ? "🥦" : item.category === "Dairy" ? "🥛" : item.category === "Bakery" ? "🍞" : "🌾"}</div>
                        </div>
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: "#718071", textTransform: "uppercase" }}>{item.category}</span>
                        <h3 style={{ margin: "4px 0 7px", fontSize: 18, overflowWrap: "anywhere" }}>{item.name}</h3>
                        <strong style={{ fontSize: 22 }}>{Number(item.quantity.toFixed(3))} <span style={{ fontSize: 12, fontWeight: 500 }}>{item.unit}</span></strong>
                        <p style={{ margin: "5px 0", fontSize: 12, color: isEmpty ? "#b42318" : isLow ? "#a15b08" : "#367349", fontWeight: 800 }}>{isEmpty ? "EMPTY — RESTOCK" : isLow ? "LOW STOCK" : "IN STOCK"}</p>
                        <p style={{ ...styles.muted, margin: "4px 0" }}>{days === null ? "Daily usage not set" : `About ${days} day${days === 1 ? "" : "s"} remaining`}</p>
                      </div>
                    </div>

                    <div style={{ height: 6, background: "#edf1eb", borderRadius: 20, overflow: "hidden", margin: "10px 0 14px" }}>
                      <div style={{ height: "100%", width: `${fill}%`, background: isLow ? "#d79a38" : "#4c9a60", transition: "width .5s ease" }} />
                    </div>

                    <p style={{ ...styles.muted, margin: "0 0 12px" }}>Planned use: {item.dailyUsage} {item.unit}/day · Alert at {item.threshold} {item.unit}</p>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 7, marginBottom: 9 }}>
                      <input style={styles.input} aria-label={`Usage amount for ${item.name}`} type="number" min="0.001" step="any" placeholder={`Amount used (${item.unit})`} value={usageAmounts[item.id] || ""} onChange={(e) => setUsageAmounts({ ...usageAmounts, [item.id]: e.target.value })} />
                      <button style={styles.button} onClick={() => recordUsage(item)}>Record use</button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 7 }}>
                      <input style={styles.input} aria-label={`Refill amount for ${item.name}`} type="number" min="0.001" step="any" placeholder={`Refill amount (${item.unit})`} value={refillAmounts[item.id] || ""} onChange={(e) => setRefillAmounts({ ...refillAmounts, [item.id]: e.target.value })} />
                      <button style={{ ...styles.button, background: "#edf5e9", color: "#276442" }} onClick={() => refillItem(item)}>Refill</button>
                    </div>
                    {isLow && <button style={{ ...styles.button, width: "100%", marginTop: 9, background: "#fff4df", color: "#85520b" }} onClick={() => addToShoppingList(item)}>Add to shopping list</button>}
                    <button style={{ border: 0, background: "transparent", color: "#9b4545", cursor: "pointer", marginTop: 10, padding: 4, display: "inline-flex", alignItems: "center", gap: 6 }} onClick={() => deleteItem(item)}><Trash2 size={14} /> Remove item</button>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === "alerts" && (
        <section style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h2 style={{ marginTop: 0 }}>Pantry notifications</h2>
            <button style={{ ...styles.button, background: "#edf5e9", color: "#276442" }} onClick={markAllRead}>Mark all read</button>
          </div>
          {notifications.length === 0 ? <p style={styles.muted}>No alerts yet. Alerts appear when items reach their low-stock level or become empty.</p> : notifications.map((alert) => (
            <div key={alert.id} style={{ padding: 13, marginBottom: 9, borderRadius: 10, background: alert.read ? "#f8faf7" : "#fff5e6", border: "1px solid #edf0e9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Bell size={16} color={alert.type === "empty" ? "#b42318" : "#a15b08"} /><strong>{alert.itemName}</strong>{!alert.read && <span style={{ fontSize: 10, fontWeight: 800, color: "#a15b08" }}>NEW</span>}</div>
              <p style={{ margin: "7px 0", fontSize: 13 }}>{alert.text}</p>
              <p style={{ ...styles.muted, margin: 0, fontSize: 11 }}>{alert.date}</p>
              {!alert.read && <button style={{ ...styles.button, marginTop: 9, padding: "7px 10px", fontSize: 12 }} onClick={() => setNotifications((previous) => previous.map((x) => x.id === alert.id ? { ...x, read: true } : x))}>Mark read</button>}
            </div>
          ))}
        </section>
      )}

      {tab === "history" && (
        <section style={styles.card}>
          <h2 style={{ marginTop: 0 }}>Usage history</h2>
          {history.length === 0 ? <p style={styles.muted}>Your usage and refill records will appear here.</p> : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr>{["Item", "Action", "Amount", "Date"].map((heading) => <th key={heading} style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #e4ebe1" }}>{heading}</th>)}</tr></thead>
                <tbody>{history.map((entry) => <tr key={entry.id}><td style={{ padding: 10, borderBottom: "1px solid #edf0eb" }}>{entry.itemName}</td><td style={{ padding: 10, borderBottom: "1px solid #edf0eb" }}>{entry.action}</td><td style={{ padding: 10, borderBottom: "1px solid #edf0eb" }}>{entry.amount} {entry.unit}</td><td style={{ padding: 10, borderBottom: "1px solid #edf0eb" }}>{entry.date}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap", marginTop: 18 }}>
        <p style={{ ...styles.muted, margin: 0 }}>Demo data is saved in this browser only. “Simulate 1 day” applies planned daily usage once per click.</p>
        <button style={{ border: "1px solid #e5e9e2", background: "#fff", borderRadius: 9, padding: "9px 12px", color: "#8d4646", cursor: "pointer" }} onClick={resetDemo}>Reset demo data</button>
      </div>
    </div>
  );
}
