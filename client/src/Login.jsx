import { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

export default function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const endpoint = isRegister ? "/register" : "/login";

      const payload = isRegister
        ? { name: name.trim(), email: email.trim(), password }
        : { email: email.trim(), password };

      const response = await axios.post(`${API_URL}${endpoint}`, payload);
      const data = response.data;

      if (isRegister) {
        setSuccess("Account created successfully! You can now log in.");
        setIsRegister(false);
        setPassword("");
      } else {
        if (!data.token) {
          throw new Error("Login succeeded, but no token was returned.");
        }

        sessionStorage.setItem("grocwiseToken", data.token);
        sessionStorage.setItem(
          "grocwiseUser",
          JSON.stringify(data.user || {})
        );

        if (onLoginSuccess) {
          onLoginSuccess(data);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>G</div>

        <p style={styles.eyebrow}>WELCOME TO GROCWISE</p>

        <h1 style={styles.title}>
          {isRegister ? "Create your account" : "Welcome back!"}
        </h1>

        <p style={styles.subtitle}>
          {isRegister
            ? "Create an account to manage your groceries and smart pantry."
            : "Sign in to manage your groceries and smart pantry."}
        </p>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {isRegister && (
            <label style={styles.label}>
              Full name
              <input
                style={styles.input}
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </label>
          )}

          <label style={styles.label}>
            Email address
            <input
              style={styles.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              style={styles.input}
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
          </label>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading
              ? "Please wait..."
              : isRegister
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <p style={styles.switchText}>
          {isRegister ? "Already have an account?" : "New to GrocWise?"}{" "}
          <button
            type="button"
            style={styles.switchButton}
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
              setSuccess("");
            }}
          >
            {isRegister ? "Sign in" : "Create account"}
          </button>
        </p>

        <p style={styles.footer}>
          Fresh groceries. Smarter living.
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "75vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 16px",
    background: "linear-gradient(135deg, #f2f8ef, #f8fbf7)",
    borderRadius: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "430px",
    background: "#ffffff",
    padding: "36px",
    borderRadius: "22px",
    boxShadow: "0 12px 40px rgba(35, 70, 45, 0.10)",
    border: "1px solid #e7eee5",
    boxSizing: "border-box",
  },
  logo: {
    width: "54px",
    height: "54px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "16px",
    background: "#267a46",
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: 800,
    marginBottom: "22px",
  },
  eyebrow: {
    color: "#267a46",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "2px",
    marginBottom: "8px",
  },
  title: {
    color: "#183323",
    fontSize: "28px",
    lineHeight: 1.25,
    margin: "0 0 10px",
  },
  subtitle: {
    color: "#6d7b70",
    fontSize: "14px",
    lineHeight: 1.6,
    marginBottom: "24px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "17px",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    color: "#304737",
    fontSize: "13px",
    fontWeight: 700,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    border: "1px solid #dce6dd",
    borderRadius: "10px",
    fontSize: "14px",
    outlineColor: "#267a46",
    background: "#fcfdfc",
  },
  button: {
    width: "100%",
    border: "none",
    borderRadius: "11px",
    padding: "14px",
    background: "#267a46",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "15px",
    cursor: "pointer",
    marginTop: "4px",
  },
  switchText: {
    textAlign: "center",
    fontSize: "13px",
    color: "#68766c",
    marginTop: "22px",
  },
  switchButton: {
    border: "none",
    background: "transparent",
    color: "#267a46",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: "13px",
  },
  error: {
    background: "#fff0ef",
    color: "#a52b24",
    padding: "11px 12px",
    borderRadius: "9px",
    fontSize: "13px",
    marginBottom: "16px",
  },
  success: {
    background: "#eef8ef",
    color: "#267a46",
    padding: "11px 12px",
    borderRadius: "9px",
    fontSize: "13px",
    marginBottom: "16px",
  },
  footer: {
    textAlign: "center",
    color: "#9aa69c",
    fontSize: "12px",
    marginTop: "28px",
    marginBottom: 0,
  },
};
