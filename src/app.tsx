import { Route, Routes } from "react-router";
import { SessionProvider } from "./lib/session";
import { CallbackRoute } from "./routes/callback";
import { HomeRoute } from "./routes/home";
import { ListGridRoute } from "./routes/list-grid";
import { NotebookRoute } from "./routes/notebook";
import { NotFoundRoute } from "./routes/not-found";

export const App = () => (
  <SessionProvider>
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/oauth/callback" element={<CallbackRoute />} />
      <Route path="/profile/:actor" element={<NotebookRoute />} />
      <Route path="/profile/:actor/list/:rkey" element={<ListGridRoute />} />
      <Route path="*" element={<NotFoundRoute />} />
    </Routes>
  </SessionProvider>
);
