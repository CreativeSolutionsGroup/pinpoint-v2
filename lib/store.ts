// Session-based storage for diagrams (persists only during user session)
// Data is stored per session ID and cleared when session expires

import type { Diagram, DiagramItem } from '@/lib/types/diagram';

interface SessionData {
  diagrams: Map<string, Diagram>;
  diagramItems: Map<string, DiagramItem>;
}

class SessionStore {
  private sessions: Map<string, SessionData> = new Map();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private sessionTimers: Map<string, NodeJS.Timeout> = new Map();

  // Get or create session data
  private getSession(sessionId: string): SessionData {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        diagrams: new Map(),
        diagramItems: new Map(),
      });
      this.startSessionTimer(sessionId);
      console.log(`[SessionStore] Created new session: ${sessionId}`);
    } else {
      // Refresh session timeout
      this.refreshSessionTimer(sessionId);
    }
    return this.sessions.get(sessionId)!;
  }

  private startSessionTimer(sessionId: string): void {
    const timer = setTimeout(() => {
      this.clearSession(sessionId);
    }, this.SESSION_TIMEOUT);
    this.sessionTimers.set(sessionId, timer);
  }

  private refreshSessionTimer(sessionId: string): void {
    const existingTimer = this.sessionTimers.get(sessionId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    this.startSessionTimer(sessionId);
  }

  private clearSession(sessionId: string): void {
    const timer = this.sessionTimers.get(sessionId);
    if (timer) {
      clearTimeout(timer);
      this.sessionTimers.delete(sessionId);
    }
    this.sessions.delete(sessionId);
    console.log(`[SessionStore] Cleared session: ${sessionId}`);
  }

  // Generate simple IDs
  private generateId(prefix: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `${prefix}_${timestamp}_${random}`;
  }

  // Diagram operations
  createDiagram(
    sessionId: string,
    data: Omit<Diagram, 'id' | 'createdAt' | 'updatedAt' | 'items'>
  ): Diagram {
    const session = this.getSession(sessionId);
    const now = new Date();
    const diagram: Diagram = {
      ...data,
      id: this.generateId('diagram'),
      createdAt: now,
      updatedAt: now,
      items: [],
    };
    session.diagrams.set(diagram.id, diagram);
    console.log(`[SessionStore] Created diagram: ${diagram.id} for session ${sessionId}`);
    return diagram;
  }

  getDiagram(sessionId: string, id: string): Diagram | null {
    const session = this.getSession(sessionId);
    const diagram = session.diagrams.get(id);
    if (!diagram) return null;

    // Attach items
    const items = Array.from(session.diagramItems.values()).filter(
      (item) => item.diagramId === id
    );
    return { ...diagram, items };
  }

  getAllDiagrams(sessionId: string, filters?: { userId?: string; eventId?: string }): Diagram[] {
    const session = this.getSession(sessionId);
    let diagrams = Array.from(session.diagrams.values());

    if (filters?.userId) {
      diagrams = diagrams.filter((d) => d.userId === filters.userId);
    }
    if (filters?.eventId) {
      diagrams = diagrams.filter((d) => d.eventId === filters.eventId);
    }

    // Attach items to each diagram
    return diagrams.map((diagram) => {
      const items = Array.from(session.diagramItems.values()).filter(
        (item) => item.diagramId === diagram.id
      );
      return { ...diagram, items };
    });
  }

  updateDiagram(
    sessionId: string,
    id: string,
    data: Partial<Omit<Diagram, 'id' | 'createdAt' | 'updatedAt' | 'items'>>
  ): Diagram | null {
    const session = this.getSession(sessionId);
    const diagram = session.diagrams.get(id);
    if (!diagram) return null;

    const updated: Diagram = {
      ...diagram,
      ...data,
      updatedAt: new Date(),
    };
    session.diagrams.set(id, updated);
    console.log(`[SessionStore] Updated diagram: ${id} for session ${sessionId}`);
    return this.getDiagram(sessionId, id);
  }

  deleteDiagram(sessionId: string, id: string): boolean {
    const session = this.getSession(sessionId);
    
    // Delete all associated items first
    const items = Array.from(session.diagramItems.values()).filter(
      (item) => item.diagramId === id
    );
    items.forEach((item) => session.diagramItems.delete(item.id));

    const deleted = session.diagrams.delete(id);
    console.log(`[SessionStore] Deleted diagram: ${id} for session ${sessionId}`);
    return deleted;
  }

  // DiagramItem operations
  createDiagramItem(
    sessionId: string,
    diagramId: string,
    data: Omit<DiagramItem, 'id' | 'diagramId' | 'createdAt' | 'updatedAt'>
  ): DiagramItem | null {
    const session = this.getSession(sessionId);
    if (!session.diagrams.has(diagramId)) {
      console.error(`[SessionStore] Cannot create item: diagram ${diagramId} not found`);
      return null;
    }

    const now = new Date();
    const item: DiagramItem = {
      ...data,
      id: this.generateId('item'),
      diagramId,
      createdAt: now,
      updatedAt: now,
    };
    session.diagramItems.set(item.id, item);
    console.log(`[SessionStore] Created item: ${item.id} in diagram ${diagramId}`);
    return item;
  }

  getDiagramItem(sessionId: string, id: string): DiagramItem | null {
    const session = this.getSession(sessionId);
    return session.diagramItems.get(id) || null;
  }

  getDiagramItems(sessionId: string, diagramId: string): DiagramItem[] {
    const session = this.getSession(sessionId);
    return Array.from(session.diagramItems.values()).filter(
      (item) => item.diagramId === diagramId
    );
  }

  updateDiagramItem(
    sessionId: string,
    id: string,
    data: Partial<Omit<DiagramItem, 'id' | 'diagramId' | 'createdAt' | 'updatedAt'>>
  ): DiagramItem | null {
    const session = this.getSession(sessionId);
    const item = session.diagramItems.get(id);
    if (!item) return null;

    const updated: DiagramItem = {
      ...item,
      ...data,
      updatedAt: new Date(),
    };
    session.diagramItems.set(id, updated);
    console.log(`[SessionStore] Updated item: ${id}`);
    return updated;
  }

  deleteDiagramItem(sessionId: string, id: string): boolean {
    const session = this.getSession(sessionId);
    const deleted = session.diagramItems.delete(id);
    console.log(`[SessionStore] Deleted item: ${id}`);
    return deleted;
  }

  // Utility methods
  getStats() {
    let totalDiagrams = 0;
    let totalItems = 0;
    this.sessions.forEach((session) => {
      totalDiagrams += session.diagrams.size;
      totalItems += session.diagramItems.size;
    });
    return {
      activeSessions: this.sessions.size,
      diagrams: totalDiagrams,
      items: totalItems,
    };
  }
}

// Export singleton instance
export const sessionStore = new SessionStore();

// Log on initialization
console.log('[SessionStore] Session-based storage initialized (data persists only during session)');
