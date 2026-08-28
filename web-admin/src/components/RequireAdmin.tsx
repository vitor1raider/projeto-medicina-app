import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getSession, getCurrentAdminProfile } from "../services/auth";

export default function RequireAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<"loading" | "allowed" | "denied">(
    "loading",
  );

  useEffect(() => {
    let isMounted = true;

    async function check() {
      const session = await getSession();
      if (!session) {
        if (isMounted) setStatus("denied");
        return;
      }

      const profile = await getCurrentAdminProfile();
      if (isMounted) setStatus(profile?.is_admin ? "allowed" : "denied");
    }

    check();

    return () => {
      isMounted = false;
    };
  }, []);

  if (status === "loading")
    return (
      <div className="loading-screen">
        <span className="loading-indicator">
          <span className="spinner" />
          Verificando acesso...
        </span>
      </div>
    );
  if (status === "denied") return <Navigate to="/login" replace />;

  return <>{children}</>;
}
