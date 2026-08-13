import { useState } from "react";
import axios from "axios";

const API = "https://mudhikhana.onrender.com";

export default function Login({
  onLogin,
}) {
  // ==================================================
  // LOGIN STATE
  // ==================================================

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==================================================
  // CREATE ACCOUNT STATE
  // ==================================================

  const [showCreateAccount, setShowCreateAccount] =
    useState(false);

  const [fullName, setFullName] =
    useState("");

  const [newUsername, setNewUsername] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [
    recoveryQuestion,
    setRecoveryQuestion,
  ] = useState("");

  const [
    recoveryAnswer,
    setRecoveryAnswer,
  ] = useState("");

  // ==================================================
  // FORGOT PASSWORD STATE
  // ==================================================

  const [showForgotPassword, setShowForgotPassword] =
    useState(false);

  const [
    forgotUsername,
    setForgotUsername,
  ] = useState("");

  const [
    forgotQuestion,
    setForgotQuestion,
  ] = useState("");

  const [
    forgotAnswer,
    setForgotAnswer,
  ] = useState("");

  const [
    forgotNewPassword,
    setForgotNewPassword,
  ] = useState("");

  const [
    forgotConfirmPassword,
    setForgotConfirmPassword,
  ] = useState("");

  const [
    recoveryStep,
    setRecoveryStep,
  ] = useState(1);

  const [
    forgotLoading,
    setForgotLoading,
  ] = useState(false);

  // ==================================================
  // RESET MESSAGES
  // ==================================================

  const clearMessages = () => {
    setError("");
  };

  // ==================================================
  // LOGIN
  // ==================================================

  const handleLogin = async (
    e
  ) => {
    e.preventDefault();

    clearMessages();

    const cleanUsername =
      username.trim();

    if (!cleanUsername) {
      setError(
        "Please enter your username."
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter your password."
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await axios.post(
          `${API}/accounts/login`,
          {
            username:
              cleanUsername,
            password,
          }
        );

      if (
        !response.data ||
        !response.data.success
      ) {
        throw new Error(
          "Login failed."
        );
      }

      // ==================================================
      // SAVE LOGIN SESSION
      // ==================================================

      localStorage.setItem(
        "storeerp_token",
        response.data.token
      );

      localStorage.setItem(
        "storeerp_user",
        JSON.stringify(
          response.data.user
        )
      );

      // ==================================================
      // TELL APP LOGIN IS COMPLETE
      // ==================================================

      if (onLogin) {
        onLogin(
          response.data.user
        );
      }

      // If the parent doesn't provide
      // onLogin, reload the application.

      else {
        window.location.reload();
      }
    } catch (err) {
      console.log(
        "Login Error:",
        err
      );

      const message =
        err.response?.data?.message ||
        "Something went wrong while logging in.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // CREATE ACCOUNT
  // ==================================================

  const handleCreateAccount =
    async (e) => {
      e.preventDefault();

      clearMessages();

      if (!fullName.trim()) {
        setError(
          "Please enter your full name."
        );
        return;
      }

      if (!newUsername.trim()) {
        setError(
          "Please enter a username."
        );
        return;
      }

      if (!newPassword) {
        setError(
          "Please enter a password."
        );
        return;
      }

      if (newPassword.length < 6) {
        setError(
          "Password must contain at least 6 characters."
        );
        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        setError(
          "Passwords do not match."
        );
        return;
      }

      if (!recoveryQuestion) {
        setError(
          "Please select a recovery question."
        );
        return;
      }

      if (!recoveryAnswer.trim()) {
        setError(
          "Please enter a recovery answer."
        );
        return;
      }

      try {
        setLoading(true);

        const response =
          await axios.post(
            `${API}/accounts/register`,
            {
              name:
                fullName.trim(),

              username:
                newUsername.trim(),

              password:
                newPassword,

              recoveryQuestion,

              recoveryAnswer:
                recoveryAnswer.trim(),

              role: "User",
            }
          );

        if (
          !response.data?.success
        ) {
          throw new Error(
            "Account creation failed."
          );
        }

        alert(
          "Account created successfully. You can now login."
        );

        // Clear create account form

        setFullName("");
        setNewUsername("");
        setNewPassword("");
        setConfirmPassword("");
        setRecoveryQuestion("");
        setRecoveryAnswer("");

        // Return to login

        setShowCreateAccount(
          false
        );

        // Put username into login

        setUsername(
          newUsername.trim()
        );

        setPassword("");

        setError("");
      } catch (err) {
        console.log(
          "Create Account Error:",
          err
        );

        const message =
          err.response?.data?.message ||
          "Unable to create account.";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

  // ==================================================
  // GET RECOVERY QUESTION
  // ==================================================

  const handleGetRecoveryQuestion =
    async (e) => {
      e.preventDefault();

      clearMessages();

      if (!forgotUsername.trim()) {
        setError(
          "Please enter your username."
        );
        return;
      }

      try {
        setForgotLoading(true);

        const response =
          await axios.post(
            `${API}/accounts/forgot-question`,
            {
              username:
                forgotUsername.trim(),
            }
          );

        setForgotQuestion(
          response.data.question
        );

        setRecoveryStep(2);
      } catch (err) {
        console.log(
          "Recovery Question Error:",
          err
        );

        const message =
          err.response?.data?.message ||
          "Unable to find recovery information.";

        setError(message);
      } finally {
        setForgotLoading(false);
      }
    };

  // ==================================================
  // RESET PASSWORD
  // ==================================================

  const handleResetPassword =
    async (e) => {
      e.preventDefault();

      clearMessages();

      if (!forgotAnswer.trim()) {
        setError(
          "Please enter your recovery answer."
        );
        return;
      }

      if (!forgotNewPassword) {
        setError(
          "Please enter a new password."
        );
        return;
      }

      if (
        forgotNewPassword.length < 6
      ) {
        setError(
          "New password must contain at least 6 characters."
        );
        return;
      }

      if (
        forgotNewPassword !==
        forgotConfirmPassword
      ) {
        setError(
          "Passwords do not match."
        );
        return;
      }

      try {
        setForgotLoading(true);

        const response =
          await axios.post(
            `${API}/accounts/forgot-password`,
            {
              username:
                forgotUsername.trim(),

              recoveryAnswer:
                forgotAnswer.trim(),

              newPassword:
                forgotNewPassword,
            }
          );

        if (
          !response.data?.success
        ) {
          throw new Error(
            "Password reset failed."
          );
        }

        alert(
          "Password reset successfully. You can now login."
        );

        // Clear recovery form

        setForgotUsername("");
        setForgotQuestion("");
        setForgotAnswer("");
        setForgotNewPassword("");
        setForgotConfirmPassword("");

        setRecoveryStep(1);

        setShowForgotPassword(
          false
        );

        setUsername(
          forgotUsername.trim()
        );

        setPassword("");

        setError("");
      } catch (err) {
        console.log(
          "Reset Password Error:",
          err
        );

        const message =
          err.response?.data?.message ||
          "Unable to reset password.";

        setError(message);
      } finally {
        setForgotLoading(false);
      }
    };

  // ==================================================
  // BACK TO LOGIN
  // ==================================================

  const backToLogin = () => {
    setShowCreateAccount(false);
    setShowForgotPassword(false);

    setRecoveryStep(1);

    setError("");
  };

  // ==================================================
  // COMMON STYLES
  // ==================================================

  const pageStyle = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #0f172a, #1e3a8a)",
    padding: "20px",
    boxSizing: "border-box",
  };

  const cardStyle = {
    width: "100%",
    maxWidth: 430,
    background: "#ffffff",
    borderRadius: 18,
    padding: 32,
    boxSizing: "border-box",
    boxShadow:
      "0 20px 60px rgba(0,0,0,0.25)",
  };

  const inputStyle = {
    width: "100%",
    padding:
      "12px 14px",
    border:
      "1px solid #cbd5e1",
    borderRadius: 9,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    marginTop: 6,
  };

  const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#334155",
    marginTop: 15,
  };

  const primaryButtonStyle = {
    width: "100%",
    border: "none",
    borderRadius: 9,
    padding: "13px",
    marginTop: 20,
    background: "#2563eb",
    color: "#ffffff",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  };

  const secondaryButtonStyle = {
    width: "100%",
    border:
      "1px solid #cbd5e1",
    borderRadius: 9,
    padding: "12px",
    marginTop: 10,
    background: "#ffffff",
    color: "#334155",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  };

  // ==================================================
  // LOGIN PAGE
  // ==================================================

  if (
    !showCreateAccount &&
    !showForgotPassword
  ) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>

          <div
            style={{
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                fontSize: 42,
                marginBottom: 8,
              }}
            >
              🏪
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 26,
                color: "#0f172a",
              }}
            >
              StoreERP
            </h1>

            <p
              style={{
                margin:
                  "7px 0 0",
                color: "#64748b",
                fontSize: 14,
              }}
            >
              Sign in to your account
            </p>
          </div>

          {error && (
            <div
              style={{
                background: "#fee2e2",
                border:
                  "1px solid #fecaca",
                color: "#b91c1c",
                padding: 12,
                borderRadius: 8,
                fontSize: 13,
                marginBottom: 15,
              }}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleLogin}
          >
            <label style={labelStyle}>
              Username

              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value
                  )
                }
                placeholder="Enter username"
                autoComplete="username"
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Password

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                placeholder="Enter password"
                autoComplete="current-password"
                style={inputStyle}
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...primaryButtonStyle,
                opacity:
                  loading ? 0.7 : 1,
              }}
            >
              {loading
                ? "Signing in..."
                : "Login"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setShowForgotPassword(
                true
              );
              setError("");
            }}
            style={{
              width: "100%",
              border: "none",
              background:
                "transparent",
              color: "#2563eb",
              marginTop: 15,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Forgot Password?
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              margin:
                "22px 0",
            }}
          >
            <div
              style={{
                flex: 1,
                height: 1,
                background:
                  "#e2e8f0",
              }}
            />

            <span
              style={{
                fontSize: 12,
                color: "#94a3b8",
              }}
            >
              OR
            </span>

            <div
              style={{
                flex: 1,
                height: 1,
                background:
                  "#e2e8f0",
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setShowCreateAccount(
                true
              );
              setError("");
            }}
            style={secondaryButtonStyle}
          >
            Create New Account
          </button>

        </div>
      </div>
    );
  }

  // ==================================================
  // CREATE ACCOUNT PAGE
  // ==================================================

  if (showCreateAccount) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>

          <h2
            style={{
              marginTop: 0,
              marginBottom: 5,
              color: "#0f172a",
            }}
          >
            Create New Account
          </h2>

          <p
            style={{
              marginTop: 0,
              color: "#64748b",
              fontSize: 13,
            }}
          >
            Create a separate StoreERP account.
          </p>

          {error && (
            <div
              style={{
                background: "#fee2e2",
                border:
                  "1px solid #fecaca",
                color: "#b91c1c",
                padding: 12,
                borderRadius: 8,
                fontSize: 13,
                marginTop: 15,
              }}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={
              handleCreateAccount
            }
          >
            <label style={labelStyle}>
              Full Name

              <input
                type="text"
                value={fullName}
                onChange={(e) =>
                  setFullName(
                    e.target.value
                  )
                }
                placeholder="Enter full name"
                autoComplete="name"
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Username

              <input
                type="text"
                value={newUsername}
                onChange={(e) =>
                  setNewUsername(
                    e.target.value
                  )
                }
                placeholder="Create username"
                autoComplete="username"
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Password

              <input
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Confirm Password

              <input
                type="password"
                value={
                  confirmPassword
                }
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                placeholder="Repeat password"
                autoComplete="new-password"
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Recovery Question

              <select
                value={
                  recoveryQuestion
                }
                onChange={(e) =>
                  setRecoveryQuestion(
                    e.target.value
                  )
                }
                style={inputStyle}
              >
                <option value="">
                  Select a recovery question
                </option>

                <option value="What is your childhood nickname?">
                  What is your childhood nickname?
                </option>

                <option value="What is your favorite food?">
                  What is your favorite food?
                </option>

                <option value="What was the name of your first school?">
                  What was the name of your first school?
                </option>

                <option value="What is your favorite place?">
                  What is your favorite place?
                </option>
              </select>
            </label>

            <label style={labelStyle}>
              Recovery Answer

              <input
                type="text"
                value={
                  recoveryAnswer
                }
                onChange={(e) =>
                  setRecoveryAnswer(
                    e.target.value
                  )
                }
                placeholder="Enter your answer"
                style={inputStyle}
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...primaryButtonStyle,
                opacity:
                  loading ? 0.7 : 1,
              }}
            >
              {loading
                ? "Creating..."
                : "Create Account"}
            </button>
          </form>

          <button
            type="button"
            onClick={backToLogin}
            style={
              secondaryButtonStyle
            }
          >
            Back to Login
          </button>

        </div>
      </div>
    );
  }

  // ==================================================
  // FORGOT PASSWORD
  // ==================================================

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>

        <h2
          style={{
            marginTop: 0,
            marginBottom: 5,
            color: "#0f172a",
          }}
        >
          Forgot Password
        </h2>

        <p
          style={{
            marginTop: 0,
            color: "#64748b",
            fontSize: 13,
          }}
        >
          Recover your account using your recovery question.
        </p>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              border:
                "1px solid #fecaca",
              color: "#b91c1c",
              padding: 12,
              borderRadius: 8,
              fontSize: 13,
              marginTop: 15,
            }}
          >
            {error}
          </div>
        )}

        {recoveryStep === 1 && (
          <form
            onSubmit={
              handleGetRecoveryQuestion
            }
          >
            <label style={labelStyle}>
              Username

              <input
                type="text"
                value={
                  forgotUsername
                }
                onChange={(e) =>
                  setForgotUsername(
                    e.target.value
                  )
                }
                placeholder="Enter your username"
                autoComplete="username"
                style={inputStyle}
              />
            </label>

            <button
              type="submit"
              disabled={
                forgotLoading
              }
              style={{
                ...primaryButtonStyle,
                opacity:
                  forgotLoading
                    ? 0.7
                    : 1,
              }}
            >
              {forgotLoading
                ? "Checking..."
                : "Continue"}
            </button>
          </form>
        )}

        {recoveryStep === 2 && (
          <form
            onSubmit={
              handleResetPassword
            }
          >
            <div
              style={{
                marginTop: 18,
                padding: 14,
                background:
                  "#eff6ff",
                border:
                  "1px solid #bfdbfe",
                borderRadius: 9,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#2563eb",
                  marginBottom: 5,
                  textTransform:
                    "uppercase",
                }}
              >
                Recovery Question
              </div>

              <div
                style={{
                  fontSize: 14,
                  color: "#1e3a8a",
                  fontWeight: 600,
                }}
              >
                {forgotQuestion}
              </div>
            </div>

            <label style={labelStyle}>
              Recovery Answer

              <input
                type="text"
                value={
                  forgotAnswer
                }
                onChange={(e) =>
                  setForgotAnswer(
                    e.target.value
                  )
                }
                placeholder="Enter your answer"
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              New Password

              <input
                type="password"
                value={
                  forgotNewPassword
                }
                onChange={(e) =>
                  setForgotNewPassword(
                    e.target.value
                  )
                }
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Confirm New Password

              <input
                type="password"
                value={
                  forgotConfirmPassword
                }
                onChange={(e) =>
                  setForgotConfirmPassword(
                    e.target.value
                  )
                }
                placeholder="Repeat new password"
                autoComplete="new-password"
                style={inputStyle}
              />
            </label>

            <button
              type="submit"
              disabled={
                forgotLoading
              }
              style={{
                ...primaryButtonStyle,
                opacity:
                  forgotLoading
                    ? 0.7
                    : 1,
              }}
            >
              {forgotLoading
                ? "Resetting..."
                : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => {
                setRecoveryStep(1);
                setForgotQuestion(
                  ""
                );
                setForgotAnswer(
                  ""
                );
                setForgotNewPassword(
                  ""
                );
                setForgotConfirmPassword(
                  ""
                );
                setError("");
              }}
              style={
                secondaryButtonStyle
              }
            >
              Back
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={backToLogin}
          style={{
            width: "100%",
            border: "none",
            background:
              "transparent",
            color: "#2563eb",
            marginTop: 15,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Back to Login
        </button>

      </div>
    </div>
  );
}