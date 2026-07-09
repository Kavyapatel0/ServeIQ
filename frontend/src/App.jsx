import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Toaster } from "sonner";

import { fetchCurrentUser, sessionChecked, logoutUser } from "@/redux/slices/authSlice";
import { tokenStorage, registerUnauthorizedHandler } from "@/services/axios";
import { SocketProvider } from "@/contexts/SocketContext";
import { AppRoutes } from "@/routes/AppRoutes";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Wire the axios 401 handler to Redux once, at the root, so an
    // expired/invalid token anywhere in the app clears auth state
    // without every service call needing to know about the store.
    registerUnauthorizedHandler(() => {
      dispatch(logoutUser());
    });

    // Restore session on first load if a token is already stored,
    // so a page refresh doesn't force a re-login. If there's no
    // token at all, skip the network round-trip but still mark the
    // session as "checked" so ProtectedRoute stops showing its loader.
    if (tokenStorage.get()) {
      dispatch(fetchCurrentUser());
    } else {
      dispatch(sessionChecked());
    }
  }, [dispatch]);

  return (
    <SocketProvider>
      <AppRoutes />
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            borderRadius: "12px",
            fontSize: "14px",
          },
        }}
      />
    </SocketProvider>
  );
}

export default App;
