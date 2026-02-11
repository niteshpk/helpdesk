import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn, useSession } from "../lib/auth-client";

const loginSchema = z.object({
  email: z.email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  if (isPending) {
    return <div className="loading">Loading...</div>;
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: LoginFormData) => {
    setServerError("");

    const { error } = await signIn.email(data);

    if (error) {
      setServerError(error.message ?? "Login failed");
      return;
    }

    navigate("/", { replace: true });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Helpdesk</h1>
        <p className="login-subtitle">Sign in to your account</p>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {serverError && <div className="error-message">{serverError}</div>}
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className={errors.email ? "input-error" : ""}
            placeholder="admin@example.com"
            {...register("email")}
          />
          {errors.email && (
            <div className="field-error">{errors.email.message}</div>
          )}
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className={errors.password ? "input-error" : ""}
            placeholder="Enter your password"
            {...register("password")}
          />
          {errors.password && (
            <div className="field-error">{errors.password.message}</div>
          )}
          <button
            className="btn btn-primary"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
