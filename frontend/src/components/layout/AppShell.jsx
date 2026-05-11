import React from 'react';

/**
 * Top-level shell: sidebar (collapsible) + main content area.
 *
 * @param {{ sidebarOpen: boolean, sidebar: React.ReactNode, children: React.ReactNode }} props
 */
export function AppShell({ sidebarOpen, sidebar, children }) {
  return (
    <div className="flex h-full overflow-hidden bg-[var(--color-surface)]">
      {/* Sidebar */}
      <aside
        style={{ width: sidebarOpen ? 'var(--sidebar-width)' : '0' }}
        className="flex-shrink-0 overflow-hidden transition-[width] duration-200 ease-in-out"
      >
        <div
          style={{ width: 'var(--sidebar-width)' }}
          className="h-full flex flex-col border-r border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)]"
        >
          {sidebar}
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-10 bg-black/30 sm:hidden" aria-hidden="true" />
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
