import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Runtime render error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: 20,
            textAlign: "center",
            fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
            background: "linear-gradient(165deg, #f5fbf7 0%, #e4f2e8 100%)",
            color: "#023047",
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>Something went wrong</h2>
            <p style={{ marginTop: 10, opacity: 0.85 }}>
              Please refresh the page. If it persists, clear cache and reopen.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <HashRouter>
        <App />
      </HashRouter>
    </AppErrorBoundary>
  </React.StrictMode>,
);
