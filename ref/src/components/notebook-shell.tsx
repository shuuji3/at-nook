import type { ReactNode } from 'react'

interface NotebookShellProps {
  children: ReactNode
}

/** The open notebook: a single centred page, nothing to distract the reading. */
export const NotebookShell = ({ children }: NotebookShellProps) => (
  <div className="notebook">
    <main className="page">{children}</main>
  </div>
)
