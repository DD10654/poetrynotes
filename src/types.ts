// Poetry Notes - Type Definitions

export interface PoemLine {
  type: 'line';
  text: string;
  alignment: 'left' | 'center' | 'right';
  formatting: {
    italic: boolean;
    indentLevel: number;
  };
}

export interface Highlight {
  id: string;
  lineIndex: number;
  startOffset: number;
  endOffset: number;
  text: string;
  noteIds: string[];
}

export interface Poem {
  content: string; // TipTap HTML content
  highlights: Highlight[];
}

export interface NotePosition {
  x: number;
  y: number;
}

export interface Note {
  id: string;
  content: string;
  position: NotePosition;
  textReferences: string[]; // highlight IDs
  linkedNotes: string[]; // note IDs
  createdAt: string;
  lastModified: string;
  type?: 'default' | 'context' | 'personal-response';
  isCollapsed?: boolean;
  width?: number;
}

export interface Connection {
  id: string;
  fromNoteId: string;
  toNoteId: string;
  type: 'note-to-note';
}

export interface Project {
  projectId: string;
  version: string;
  title: string;
  createdAt: string;
  lastModified: string;
  poem: Poem;
  notes: Note[];
  connections: Connection[];
}

// Action types for reducer
export type ProjectAction =
  | { type: 'SET_PROJECT'; payload: Project }
  | { type: 'UPDATE_TITLE'; payload: string }
  | { type: 'UPDATE_POEM_CONTENT'; payload: string }
  | { type: 'ADD_HIGHLIGHT'; payload: Highlight }
  | { type: 'REMOVE_HIGHLIGHT'; payload: string }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'UPDATE_NOTE'; payload: { id: string; content?: string; isCollapsed?: boolean; width?: number } }
  | { type: 'UPDATE_NOTE_POSITION'; payload: { id: string; position: NotePosition } }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'LINK_NOTES'; payload: { fromId: string; toId: string } }
  | { type: 'UNLINK_NOTES'; payload: { fromId: string; toId: string } }
  | { type: 'ADD_CONNECTION'; payload: Connection }
  | { type: 'REMOVE_CONNECTION'; payload: string }
  | { type: 'TOGGLE_NOTE_COLLAPSE'; payload: string };

// View state for UI interactions
export interface ViewState {
  hoveredNoteId: string | null;
  selectedNoteId: string | null;
  linkingFromNoteId: string | null;
  isCreatingNote: boolean;
  zoomLevel: number;
}
