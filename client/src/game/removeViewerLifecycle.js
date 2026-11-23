// Remove a viewer from authoritative client state even if a scene cleanup
// callback throws. Scene cleanup remains best-effort; stale viewers must not
// continue receiving commands or occupying the displayed viewer count.
export function removeViewerLifecycle({ guest, name, endKons, removeCustomer, deleteViewer, deleteLastCommand, updateHud, onCleanupError }) {
  if (!guest || typeof name !== 'string' || !name) return false;

  let cleanupFailed = false;
  const safely = run => {
    try { run(); } catch (error) {
      cleanupFailed = true;
      try { onCleanupError?.(error); } catch {}
    }
  };

  if (guest.activeKons) safely(() => endKons(guest.activeKons, name));
  safely(() => removeCustomer(guest.id));
  // State ownership is authoritative and must be cleared even if rendering
  // or scene disposal fails.
  safely(() => deleteViewer(name));
  safely(() => deleteLastCommand(name));
  safely(() => updateHud());
  return !cleanupFailed;
}
