import { useState } from "react";
import "./App.css";

const API_BASE = "http://localhost:3002";

const savedRequests = [
  {
    name: "Get All Users",
    method: "GET",
    url: `${API_BASE}/api/users`,
  },
  {
    name: "Get User",
    method: "GET",
    url: `${API_BASE}/api/users/1`,
  },
  {
    name: "Create User",
    method: "POST",
    url: `${API_BASE}/api/users`,
  },
  {
    name: "Update User",
    method: "PUT",
    url: `${API_BASE}/edit/1`,
  },
  {
    name: "Delete User",
    method: "DELETE",
    url: `${API_BASE}/delete/1`,
  },
];

function App() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState(`${API_BASE}/api/users`);

  const [body, setBody] = useState(`{
  "name": "Abhishek",
  "email": "abhishek@example.com"
}`);

  const [response, setResponse] = useState(null);
  const [status, setStatus] = useState(null);
  const [responseTime, setResponseTime] = useState(null);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("Body");
  const [responseTab, setResponseTab] = useState("Pretty");

  const [headers, setHeaders] = useState([
    {
      key: "Content-Type",
      value: "application/json",
      enabled: true,
    },
  ]);

  const [history, setHistory] = useState([]);

  const methodsWithBody = ["POST", "PUT", "PATCH"];

  const sendRequest = async () => {
    if (!url.trim()) {
      setResponse({
        error: "Please enter a URL.",
      });
      return;
    }

    setLoading(true);
    setResponse(null);
    setStatus(null);
    setResponseTime(null);

    const startTime = performance.now();

    try {
      const requestHeaders = {};

      headers.forEach((header) => {
        if (header.enabled && header.key.trim()) {
          requestHeaders[header.key] = header.value;
        }
      });

      const options = {
        method,
        headers: requestHeaders,
      };

      if (methodsWithBody.includes(method) && body.trim()) {
        try {
          JSON.parse(body);
        } catch {
          setResponse({
            error: "Invalid JSON in request body.",
          });

          setLoading(false);
          return;
        }

        options.body = body;
      }

      const res = await fetch(url, options);

      const endTime = performance.now();

      setStatus(res.status);
      setResponseTime(Math.round(endTime - startTime));

      const contentType = res.headers.get("content-type");

      let data;

      if (contentType?.includes("application/json")) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      setResponse(data);

      setHistory((previous) => [
        {
          method,
          url,
          status: res.status,
          time: Math.round(endTime - startTime),
        },
        ...previous.slice(0, 9),
      ]);
    } catch (error) {
      const endTime = performance.now();

      setResponse({
        error: error.message,
      });

      setResponseTime(Math.round(endTime - startTime));
    } finally {
      setLoading(false);
    }
  };

  const loadRequest = (request) => {
    setMethod(request.method);
    setUrl(request.url);

    if (methodsWithBody.includes(request.method)) {
      setActiveTab("Body");
    } else {
      setActiveTab("Params");
    }

    setResponse(null);
    setStatus(null);
    setResponseTime(null);
  };

  const formatBody = () => {
    try {
      const parsed = JSON.parse(body);
      setBody(JSON.stringify(parsed, null, 2));
    } catch {
      setResponse({
        error: "Cannot format invalid JSON.",
      });
    }
  };

  const copyResponse = async () => {
    if (response === null) return;

    const text =
      typeof response === "string"
        ? response
        : JSON.stringify(response, null, 2);

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard may be unavailable in some browsers.
    }
  };

  const clearRequest = () => {
    setResponse(null);
    setStatus(null);
    setResponseTime(null);
  };

  const updateHeader = (index, field, value) => {
    setHeaders((previous) =>
      previous.map((header, i) =>
        i === index
          ? {
              ...header,
              [field]: value,
            }
          : header
      )
    );
  };

  const addHeader = () => {
    setHeaders((previous) => [
      ...previous,
      {
        key: "",
        value: "",
        enabled: true,
      },
    ]);
  };

  const removeHeader = (index) => {
    setHeaders((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  const statusText = () => {
    if (!status) return "";

    if (status >= 200 && status < 300) return "OK";
    if (status >= 300 && status < 400) return "Redirect";
    if (status >= 400 && status < 500) return "Client Error";

    return "Server Error";
  };

  return (
    <div className="app">

      {/* Top bar */}

      <header className="topbar">
        <div className="logo">
          API Tester
        </div>

        <div className="topbar-right">
          <span className="server-indicator">
            <span></span>
            localhost:3002
          </span>

          <button
            className="top-clear"
            onClick={clearRequest}
          >
            Clear
          </button>
        </div>
      </header>


      <div className="workspace">

        {/* Sidebar */}

        <aside className="sidebar">

          <div className="sidebar-section">

            <div className="sidebar-title">
              COLLECTIONS
            </div>

            <div className="collection-name">
              <span className="folder-icon">▾</span>
              Users API
            </div>

            <div className="request-list">

              {savedRequests.map((request) => (
                <button
                  key={`${request.method}-${request.url}`}
                  className="saved-request"
                  onClick={() => loadRequest(request)}
                >
                  <span
                    className={`method-label ${request.method.toLowerCase()}`}
                  >
                    {request.method}
                  </span>

                  <span className="request-name">
                    {request.name}
                  </span>
                </button>
              ))}

            </div>

          </div>


          <div className="sidebar-section history-section">

            <div className="sidebar-title">
              HISTORY
            </div>

            {history.length === 0 ? (
              <div className="history-empty">
                No requests yet
              </div>
            ) : (
              <div className="history-list">

                {history.map((item, index) => (
                  <button
                    key={index}
                    className="history-item"
                    onClick={() => loadRequest(item)}
                  >
                    <span
                      className={`method-label ${item.method.toLowerCase()}`}
                    >
                      {item.method}
                    </span>

                    <span className="history-url">
                      {item.url.replace(API_BASE, "")}
                    </span>
                  </button>
                ))}

              </div>
            )}

          </div>

        </aside>


        {/* Main */}

        <main className="main">

          {/* Request */}

          <section className="request-panel">

            <div className="request-toolbar">

              <select
                value={method}
                onChange={(e) => {
                  setMethod(e.target.value);
                  setResponse(null);
                }}
                className={`method-select ${method.toLowerCase()}`}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>

              <input
                className="url-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter request URL"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendRequest();
                  }
                }}
              />

              <button
                className="send-button"
                onClick={sendRequest}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send"}
              </button>

            </div>


            {/* Request tabs */}

            <div className="tabs">

              <button
                className={activeTab === "Params" ? "active" : ""}
                onClick={() => setActiveTab("Params")}
              >
                Params
              </button>

              <button
                className={activeTab === "Headers" ? "active" : ""}
                onClick={() => setActiveTab("Headers")}
              >
                Headers
              </button>

              {methodsWithBody.includes(method) && (
                <button
                  className={activeTab === "Body" ? "active" : ""}
                  onClick={() => setActiveTab("Body")}
                >
                  Body
                </button>
              )}

            </div>


            {/* Params */}

            {activeTab === "Params" && (
              <div className="tab-content">

                <div className="table-header">
                  <span>Query parameters</span>
                </div>

                <div className="empty-tab">
                  Add parameters directly to the URL using
                  <code>?key=value</code>
                </div>

              </div>
            )}


            {/* Headers */}

            {activeTab === "Headers" && (
              <div className="tab-content">

                <div className="header-table">

                  <div className="header-row header-heading">
                    <span>Enabled</span>
                    <span>Key</span>
                    <span>Value</span>
                    <span></span>
                  </div>

                  {headers.map((header, index) => (
                    <div
                      className="header-row"
                      key={index}
                    >
                      <input
                        type="checkbox"
                        checked={header.enabled}
                        onChange={(e) =>
                          updateHeader(
                            index,
                            "enabled",
                            e.target.checked
                          )
                        }
                      />

                      <input
                        value={header.key}
                        onChange={(e) =>
                          updateHeader(
                            index,
                            "key",
                            e.target.value
                          )
                        }
                        placeholder="Header name"
                      />

                      <input
                        value={header.value}
                        onChange={(e) =>
                          updateHeader(
                            index,
                            "value",
                            e.target.value
                          )
                        }
                        placeholder="Header value"
                      />

                      <button
                        className="remove-header"
                        onClick={() =>
                          removeHeader(index)
                        }
                      >
                        ×
                      </button>
                    </div>
                  ))}

                </div>

                <button
                  className="add-header"
                  onClick={addHeader}
                >
                  + Add header
                </button>

              </div>
            )}


            {/* Body */}

            {activeTab === "Body" &&
              methodsWithBody.includes(method) && (
                <div className="body-editor-container">

                  <div className="editor-toolbar">

                    <span>
                      JSON
                    </span>

                    <button onClick={formatBody}>
                      Format
                    </button>

                  </div>

                  <textarea
                    className="body-editor"
                    value={body}
                    onChange={(e) =>
                      setBody(e.target.value)
                    }
                    spellCheck="false"
                  />

                </div>
              )}

          </section>


          {/* Response */}

          <section className="response-panel">

            <div className="response-header">

              <div className="response-title">
                Response
              </div>

              {status && (
                <div className="response-info">

                  <span
                    className={`status-code ${
                      status >= 200 &&
                      status < 300
                        ? "success"
                        : "error"
                    }`}
                  >
                    {status} {statusText()}
                  </span>

                  {responseTime !== null && (
                    <span className="response-time">
                      {responseTime} ms
                    </span>
                  )}

                </div>
              )}

            </div>


            <div className="response-tabs">

              <button
                className={
                  responseTab === "Pretty"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setResponseTab("Pretty")
                }
              >
                Pretty
              </button>

              <button
                className={
                  responseTab === "Raw"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setResponseTab("Raw")
                }
              >
                Raw
              </button>

              <button
                className={
                  responseTab === "Headers"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setResponseTab("Headers")
                }
              >
                Headers
              </button>

              <button
                className="copy-button"
                onClick={copyResponse}
                disabled={response === null}
              >
                Copy
              </button>

            </div>


            <div className="response-content">

              {loading ? (

                <div className="response-empty">
                  <div className="loading-line"></div>
                  Sending request...
                </div>

              ) : response === null ? (

                <div className="response-empty">

                  <div className="terminal-symbol">
                    &gt;_
                  </div>

                  <div>
                    Send a request to see the response.
                  </div>

                </div>

              ) : responseTab === "Headers" ? (

                <div className="response-empty">
                  Response headers will be shown here.
                </div>

              ) : (

                <pre>
                  {typeof response === "string"
                    ? response
                    : JSON.stringify(
                        response,
                        null,
                        responseTab === "Pretty"
                          ? 2
                          : 0
                      )}
                </pre>

              )}

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}

export default App;