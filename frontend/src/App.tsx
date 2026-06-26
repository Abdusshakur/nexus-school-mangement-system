import { Toaster } from "sonner";
import AppRoutes from "./routes";
import "./styles/index.css";

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={3000}
        toastOptions={{
          className:
            "[&>[data-close-button]]:!left-auto [&>[data-close-button]]:!right-2",
        }}
      />
    </>
  );
}

export default App;
