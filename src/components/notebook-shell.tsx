import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";

interface NotebookShellProps {
  activeActor?: string;
  activeListUri?: string;
  children: ReactNode;
}

/** The open notebook: a flat index on the left, the written page on the right. */
export const NotebookShell = ({ activeActor, activeListUri, children }: NotebookShellProps) => (
  <div className="notebook">
    <Sidebar activeActor={activeActor} activeListUri={activeListUri} />
    <main className="page">{children}</main>
  </div>
);
