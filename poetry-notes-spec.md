# Poetry Notes - Project Specification

## Project Overview

**Project Name:** Poetry Notes  
**Technology Stack:** React.js  
**Project Type:** Single-page web application  
**Purpose:** A visual annotation tool for poetry that allows users to create interconnected notes linked to specific text selections within poems.

---

## 1. Core Features

### 1.1 File Management
- **Landing Page** with two options:
  - Upload existing project file (.json)
  - Create new project
- **File Upload:** Support for previously saved JSON project files
- **File Format:** JSON (JavaScript Object Notation)
- **Auto-save:** To browser LocalStorage or IndexedDB (manual download as backup)
- **Export:** Export complete project as JSON file for backup and portability

### 1.2 Rich Text Editor for Poem Input
The editor must support:
- **Text alignment:** Left, center, and right alignment for individual lines
- **Text styling:** Italic formatting
- **Indentation:** Tab indentation for lines
- **Plain text editing:** Core focus is on poetry formatting, not extensive rich text features

**Technical Considerations:**
- Consider libraries: Draft.js, Slate.js, or Quill.js
- Must preserve formatting when saving/loading
- Should be lightweight and focused on poetry needs

### 1.3 Text Selection and Note Creation
- **Selection mechanism:** User can highlight/select any portion of poem text
- **Note creation trigger:** Create note button or action after text selection
- **Visual link:** Arrow or connector from note to highlighted text
- **Text highlighting:** Selected text is visually highlighted in the poem
- **Multi-selection support:** 
  - Same text can be highlighted for multiple notes
  - Each note maintains its own highlight reference

### 1.4 Notes System

#### Note Properties
- **Content:** Free-form text input (similar to sticky notes)
- **Visual indicator:** Arrow/line connecting to highlighted text
- **Hover interaction:** When hovering over a note, the corresponding highlighted text slightly enlarges
- **Multiple text links:** A single note can reference multiple text selections

#### Note Relationships
- **Inter-note linking:** Notes can be linked to other notes (not linked to text)
- **Mindmap-style structure:** Visual representation of note relationships
- **Connection visualization:** Lines/arrows drawn between connected notes
- **Visual style:** SVG or Canvas-based lines with directional arrows
- **Interactive:** Lines should update when notes move or are deleted

### 1.5 Layout and Positioning

#### Automatic Arrangement
- **Smart positioning:** Notes arrange themselves around the poem automatically
- **Screen fitting:** Layout adapts to fit available screen space
- **Overflow handling:** When notes exceed screen space, user can scroll to view all notes
- **Responsive design:** Should work on different screen sizes

#### Interaction
- **Draggable notes:** [TBD - should users be able to manually reposition notes?]
- **Zoom/pan:** [TBD - for large projects with many notes]

---

## 2. User Interface Components

### 2.1 Landing Page
```
Components:
- Hero/Header section
- "Upload Project" button with file picker
- "Create New Project" button
```

### 2.2 Main Editor View
```
Layout:
┌─────────────────────────────────────────┐
│ Header (Title, Save, Export buttons)   │
├──────────────┬──────────────────────────┤
│              │                          │
│   Poem       │      Notes Canvas        │
│   Editor     │      (with connections)  │
│   (Left)     │                          │
│              │                          │
└──────────────┴──────────────────────────┘
```

**Components:**
- **Header bar:**
  - Project title/name
  - Save button
  - Export button
  - [Optional: Settings/options menu]

- **Poem panel (left side):**
  - Rich text editor
  - Highlighted text regions
  - Hover effects for text-note relationships

- **Notes panel (right side/canvas):**
  - Individual note components
  - Connection lines/arrows
  - Auto-arranged or draggable positioning

### 2.3 Note Component
```
Visual structure:
┌─────────────────┐
│ Note content    │──→ (arrow to text)
│ (editable)      │
└─────────────────┘
     │
     └──→ (connections to other notes)
```

**Features:**
- Editable text area
- Delete button
- Link/unlink controls
- Visual connection indicators

---

## 3. Data Model

### 3.1 Project Structure
```javascript
{
  "projectId": "uuid",
  "title": "Project Name",
  "createdAt": "timestamp",
  "lastModified": "timestamp",
  "poem": {
    "content": "rich text content with formatting",
    "highlights": [
      {
        "id": "highlight-uuid",
        "startOffset": 0,
        "endOffset": 10,
        "text": "selected text",
        "noteIds": ["note-1", "note-2"]
      }
    ]
  },
  "notes": [
    {
      "id": "note-uuid",
      "content": "note text",
      "position": { "x": 0, "y": 0 },
      "textReferences": ["highlight-id-1", "highlight-id-2"],
      "linkedNotes": ["note-id-1", "note-id-2"],
      "createdAt": "timestamp"
    }
  ],
  "connections": [
    {
      "id": "connection-uuid",
      "fromNoteId": "note-1",
      "toNoteId": "note-2",
      "type": "note-to-note"
    }
  ]
}
```

### 3.2 Highlight Management
- **Multiple highlights on same text:** Overlapping highlights must be visually distinguishable
- **Highlight colors/styles:** [TBD - different colors per note or unified style?]

---

## 4. Technical Requirements

### 4.1 React Architecture
**Recommended structure:**
```
src/
├── components/
│   ├── LandingPage.jsx
│   ├── Editor/
│   │   ├── PoemEditor.jsx
│   │   ├── RichTextToolbar.jsx
│   │   └── HighlightedText.jsx
│   ├── Notes/
│   │   ├── Note.jsx
│   │   ├── NotesCanvas.jsx
│   │   └── NoteConnections.jsx
│   └── Layout/
│       ├── Header.jsx
│       └── MainLayout.jsx
├── hooks/
│   ├── useNotes.js
│   ├── useHighlights.js
│   └── useFileManager.js
├── utils/
│   ├── textSelection.js
│   ├── layoutAlgorithm.js
│   └── exportHandler.js
└── contexts/
    └── ProjectContext.jsx
```

### 4.2 State Management
- **Context API** for global project state
- **Local state** for UI interactions
- **Alternative:** Consider Zustand or Redux for complex state management

### 4.3 Key Libraries (Suggested)

| Purpose | Library Options |
|---------|----------------|
| Rich text editing | Draft.js, Slate.js, Quill.js, TipTap |
| Canvas/connections | React Flow, vis.js, Cytoscape.js, or custom SVG |
| File handling | File API (native), FileSaver.js for downloads |
| JSON handling | Native JSON.parse/stringify (no library needed) |
| Layout algorithm | Custom or D3.js for force-directed layout |
| Styling | CSS Modules, Styled Components, or Tailwind CSS |

### 4.4 Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- No IE11 support required (React 18+)

---

## 5. Functional Specifications

### 5.1 Text Selection and Highlighting

**User Flow:**
1. User selects text in poem editor
2. "Create Note" button appears or is activated
3. Click creates new note
4. Selected text is highlighted
5. Arrow/connector drawn from note to text
6. Note appears in canvas area

**Edge Cases:**
- Selection spans multiple lines
- Selection at edges of formatted text
- Overlapping highlights from different notes
- Partial overlap of highlights

### 5.2 Note Interaction

**Creating Notes:**
- Click and drag to select text
- Button or keyboard shortcut to create note
- Note auto-positions on canvas

**Editing Notes:**
- Click note to edit content
- Inline editing (no modal/popup)
- Auto-save on blur or debounced input

**Linking Notes:**
- Button/control to link to another note
- Click target note to create connection
- Bi-directional or uni-directional links? [TBD]

**Deleting Notes:**
- Delete button on note
- Confirmation? [TBD]
- Remove associated highlights and connections

### 5.3 Hover Effects

**Note hover → Text highlight:**
- When mouse enters note boundary
- Corresponding text enlarges (scale: 1.1-1.2x)
- Smooth transition (CSS transform)
- Returns to normal on mouse leave

**Text highlight hover → Note indication:**
- [Optional] Highlight corresponding note
- Show which note(s) reference this text

### 5.4 Layout Algorithm

**Auto-arrangement requirements:**
- Notes position around poem without overlapping
- Maintain visual clarity of connections
- Adapt when new notes are added
- Respect screen boundaries

**Possible approaches:**
- Force-directed graph layout
- Grid-based positioning
- Concentric circles around poem
- Custom algorithm based on note relationships

### 5.5 Export Functionality

**Export format: JSON**
- Complete poem with formatting preserved
- All notes and their content
- Highlight information (text ranges and associations)
- Note-to-note connections
- Note-to-text connections
- Metadata (project title, creation date, last modified)
- Downloadable .json file

**File naming convention:**
- `[project-title]-[timestamp].json`
- Example: `sonnet-analysis-2026-02-07.json`

**Use cases:**
- Backup projects locally
- Transfer projects between devices
- Share projects with others
- Version control (manual)

---

## 6. UI/UX Specifications

### 6.1 Visual Design Principles
- **Clean and minimal:** Focus on content, not chrome
- **Clear hierarchy:** Poem is primary, notes are secondary
- **Readable typography:** Poetry-appropriate fonts
- **Sufficient contrast:** Text and highlights easily distinguishable
- **Smooth interactions:** Animations for hover, creation, deletion

### 6.2 Color Scheme
[TBD - pending design phase]
- Background colors
- Text colors
- Highlight colors (single or multiple)
- Connection line colors
- Note background colors

### 6.3 Typography
- **Poem text:** Serif or monospace font suitable for poetry
- **Note text:** Sans-serif for readability
- **Font sizes:** Comfortable reading sizes, responsive

### 6.4 Responsive Behavior
- **Desktop:** Full split-panel layout
- **Tablet:** Stacked or side-by-side with scroll
- **Mobile:** [Consider if mobile is in scope]

---

## 7. Performance Considerations

### 7.1 Scalability
- **Target capacity:**
  - Poems up to [X] lines
  - Up to [Y] notes per project
  - [Z] note connections

### 7.2 Optimization Strategies
- Virtual scrolling for large note collections
- Debounced auto-save
- Lazy loading of connections
- Memoization of expensive calculations (layout)

---

## 8. Development Phases

### Phase 1: Core Functionality (MVP)
- [ ] Landing page with new project creation
- [ ] Basic rich text editor with alignment and italics
- [ ] Text selection and highlight creation
- [ ] Simple note creation linked to text
- [ ] Basic note display and editing
- [ ] Simple layout (manual or basic auto-arrange)

### Phase 2: Advanced Features
- [ ] Note-to-note linking
- [ ] Hover effects (text enlargement)
- [ ] Auto-layout algorithm
- [ ] File save/upload
- [ ] Multiple highlights per text region

### Phase 3: Export and Polish
- [ ] Export functionality
- [ ] Visual connection rendering
- [ ] UI/UX polish
- [ ] Performance optimization
- [ ] Responsive design

### Phase 4: Extended Features (Optional)
- [ ] Collaboration features
- [ ] Version history
- [ ] Templates
- [ ] Keyboard shortcuts
- [ ] Search within notes

---

## 9. Questions for Clarification

**Resolved:**
1. ✓ **File format:** JSON
2. ✓ **Note connection visualization:** Lines/arrows between notes
3. ✓ **Export formats:** JSON data file

**Awaiting User Input:**
4. **Highlight colors:** Single color or different colors per note?
5. **Note positioning:** Auto-only or user-draggable?
6. **Zoom/pan:** Required for large projects?
7. **Note connections:** Bi-directional or uni-directional arrows?
8. **Delete confirmation:** Required for notes?
9. **Mobile support:** In scope or desktop-only?
10. **Auto-save frequency:** Real-time, on interval, or manual only?

**Recommendations (for discussion):**
- **Highlight colors:** Suggest single unified color for simplicity in MVP
- **Note positioning:** Auto-layout with manual drag override
- **Note connections:** Uni-directional for clearer relationship mapping
- **Auto-save:** Save to LocalStorage every 30 seconds + manual export

---

## 10. Success Criteria

**MVP is complete when:**
- ✓ User can create a new project
- ✓ User can input and format a poem
- ✓ User can select text and create linked notes
- ✓ Notes display with visual connection to text
- ✓ User can edit note content
- ✓ Hover effects work correctly
- ✓ Basic export functionality works
- ✓ Projects can be saved and reloaded

**Quality metrics:**
- Smooth interactions (no lag)
- Intuitive UI (minimal learning curve)
- Reliable save/load (no data loss)
- Clear visual connections

---

## 11. Future Enhancements (Post-MVP)

- **Rich note formatting:** Markdown support in notes
- **Image support:** Add images to notes
- **Color coding:** Custom colors for note categories
- **Tags/categories:** Organize notes by theme
- **Search:** Full-text search across notes
- **Collaboration:** Share projects, multi-user editing
- **Templates:** Pre-made annotation templates
- **Analytics:** Visualize annotation patterns
- **Mobile app:** Native mobile version
- **Cloud sync:** Auto-sync across devices

---

## Appendix A: File Format Specification

### JSON Structure (Detailed)

```json
{
  "projectId": "uuid-v4-string",
  "version": "1.0",
  "title": "My Poetry Analysis",
  "createdAt": "2026-02-07T10:30:00Z",
  "lastModified": "2026-02-07T15:45:00Z",
  "poem": {
    "content": [
      {
        "type": "line",
        "text": "Shall I compare thee to a summer's day?",
        "alignment": "left",
        "formatting": {
          "italic": false,
          "indentLevel": 0
        }
      },
      {
        "type": "line",
        "text": "Thou art more lovely and more temperate",
        "alignment": "left",
        "formatting": {
          "italic": false,
          "indentLevel": 1
        }
      }
    ],
    "highlights": [
      {
        "id": "highlight-001",
        "lineIndex": 0,
        "startOffset": 0,
        "endOffset": 15,
        "text": "Shall I compare",
        "noteIds": ["note-001", "note-003"]
      }
    ]
  },
  "notes": [
    {
      "id": "note-001",
      "content": "This opening rhetorical question establishes the comparison structure of the sonnet.",
      "position": {
        "x": 650,
        "y": 100
      },
      "textReferences": ["highlight-001"],
      "linkedNotes": ["note-002"],
      "createdAt": "2026-02-07T10:35:00Z",
      "lastModified": "2026-02-07T11:20:00Z"
    },
    {
      "id": "note-002",
      "content": "Related theme: comparison and contrast",
      "position": {
        "x": 850,
        "y": 150
      },
      "textReferences": [],
      "linkedNotes": ["note-001"],
      "createdAt": "2026-02-07T10:40:00Z",
      "lastModified": "2026-02-07T10:40:00Z"
    }
  ],
  "connections": [
    {
      "id": "conn-001",
      "fromNoteId": "note-001",
      "toNoteId": "note-002",
      "type": "note-to-note"
    }
  ]
}
```

### Import/Export Implementation

**Export Function:**
```javascript
const exportProject = (projectData) => {
  const jsonString = JSON.stringify(projectData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const filename = `${projectData.title}-${new Date().toISOString().split('T')[0]}.json`;
  
  // Trigger download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};
```

**Import Function:**
```javascript
const importProject = async (file) => {
  try {
    const text = await file.text();
    const projectData = JSON.parse(text);
    
    // Validate structure
    if (!validateProjectStructure(projectData)) {
      throw new Error('Invalid project file format');
    }
    
    return projectData;
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
};
```

**Validation:**
- Check for required fields (projectId, version, poem, notes)
- Verify UUID formats
- Validate note references exist
- Check for circular dependencies (optional)

## Appendix C: Technical Constraints

- **Browser storage:** LocalStorage or IndexedDB for temporary saves
- **File size limits:** Consider limits for poem length and note quantity
- **Rendering performance:** Canvas vs SVG vs DOM for connections

## Appendix D: Accessibility Considerations

- **Keyboard navigation:** All features accessible via keyboard
- **Screen readers:** Proper ARIA labels
- **Color contrast:** WCAG AA compliance
- **Focus indicators:** Clear focus states for all interactive elements

---

**Document Version:** 1.1  
**Last Updated:** February 7, 2026  
**Status:** In Progress - Core questions answered, recommendations pending review
