import type { Meta, StoryObj } from '@storybook/react-vite';

// ---------------------------------------------------------------------------
// PoetryNotes pages reimagined in the LanguageHub visual style.
//
// Design tokens applied:
//   Background:     hsl(220 30% 98%) — light blue-white
//   Card:           #ffffff with subtle shadow
//   Primary:        hsl(220 70% 45%) — medium blue
//   Accent:         hsl(15 90% 60%) — warm orange
//   Success:        hsl(145 60% 45%) — green
//   Text:           hsl(222 47% 11%) — dark navy
//   Muted:          hsl(220 8.9% 46.1%) — gray
//   Fonts:          Nunito (display + body)
//   Shapes:         8-12px radii, clean white cards, gradient hero
//   Shadows:        shadow-soft, shadow-card (subtle, blue-tinted)
//   Mood:           Friendly, educational, spacious, light
// ---------------------------------------------------------------------------

const LH = {
  bg: 'hsl(220, 30%, 98%)',
  card: '#ffffff',
  primary: 'hsl(220, 70%, 45%)',
  primaryLight: 'hsl(220, 70%, 55%)',
  primaryFg: '#ffffff',
  accent: 'hsl(15, 90%, 60%)',
  accentFg: '#ffffff',
  success: 'hsl(145, 60%, 45%)',
  destructive: 'hsl(0, 84%, 60%)',
  text: 'hsl(222, 47%, 11%)',
  textMuted: 'hsl(220, 8.9%, 46.1%)',
  border: 'hsl(220, 20%, 88%)',
  muted: 'hsl(220, 20%, 96%)',
  font: "'Nunito', system-ui, sans-serif",
  radius: '12px',
  radiusMd: '10px',
  radiusSm: '8px',
  shadowCard: '0 2px 12px -2px hsla(220, 20%, 20%, 0.08)',
  shadowSoft: '0 4px 20px -4px hsla(220, 70%, 45%, 0.15)',
  shadowHover: '0 8px 30px -8px hsla(220, 70%, 45%, 0.25)',
  gradientHero: 'linear-gradient(135deg, hsl(220, 70%, 45%) 0%, hsl(200, 80%, 50%) 50%, hsl(15, 90%, 60%) 100%)',
} as const;

const base: React.CSSProperties = {
  fontFamily: LH.font,
  color: LH.text,
  background: LH.bg,
  minHeight: '100vh',
  WebkitFontSmoothing: 'antialiased',
};

const cardStyle: React.CSSProperties = {
  background: LH.card,
  border: `1px solid ${LH.border}`,
  borderRadius: LH.radius,
  boxShadow: LH.shadowCard,
};

const btnPrimary: React.CSSProperties = {
  background: LH.gradientHero,
  color: LH.primaryFg,
  border: 'none',
  padding: '0.75rem 1.5rem',
  borderRadius: LH.radiusMd,
  fontWeight: 700,
  fontSize: '1rem',
  fontFamily: LH.font,
  cursor: 'pointer',
  boxShadow: LH.shadowSoft,
  transition: 'all 0.2s ease',
};

const btnAccent: React.CSSProperties = {
  background: `linear-gradient(135deg, ${LH.accent}, hsl(25, 95%, 55%))`,
  color: LH.accentFg,
  border: 'none',
  padding: '0.75rem 1.5rem',
  borderRadius: LH.radiusMd,
  fontWeight: 700,
  fontSize: '1rem',
  fontFamily: LH.font,
  cursor: 'pointer',
  boxShadow: '0 4px 20px -4px hsla(15, 90%, 60%, 0.3)',
};

const btnOutline: React.CSSProperties = {
  background: 'transparent',
  color: LH.primary,
  border: `2px solid ${LH.primary}`,
  padding: '0.65rem 1.5rem',
  borderRadius: LH.radiusMd,
  fontWeight: 600,
  fontSize: '1rem',
  fontFamily: LH.font,
  cursor: 'pointer',
};

const btnGhost: React.CSSProperties = {
  background: 'transparent',
  color: LH.textMuted,
  border: 'none',
  padding: '0.5rem 0.75rem',
  borderRadius: LH.radiusSm,
  fontFamily: LH.font,
  cursor: 'pointer',
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  background: LH.card,
  border: `1px solid ${LH.border}`,
  borderRadius: LH.radiusSm,
  padding: '0.75rem 1rem',
  color: LH.text,
  fontSize: '1rem',
  fontFamily: LH.font,
  width: '100%',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  fontFamily: LH.font,
  fontSize: '0.875rem',
  fontWeight: 600,
  color: LH.text,
  marginBottom: '0.5rem',
  display: 'block',
};

// ======== PAGE: LANDING PAGE ========

function LHLanding() {
  return (
    <div style={base}>
      {/* Hero gradient header */}
      <div style={{
        background: LH.gradientHero,
        padding: '5rem 1.5rem 3rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📝</div>
          <h1 style={{
            fontFamily: LH.font,
            fontSize: '2.5rem',
            fontWeight: 800,
            color: '#fff',
            marginBottom: '0.5rem',
          }}>
            Poetry Notes
          </h1>
          <p style={{
            fontFamily: LH.font,
            fontSize: '1.125rem',
            color: 'rgba(255,255,255,0.9)',
            lineHeight: 1.6,
          }}>
            Annotate and explore poetry with interconnected notes
          </p>
        </div>
      </div>

      {/* Action cards */}
      <div style={{
        maxWidth: '460px',
        margin: '-2rem auto 0',
        padding: '0 1.5rem 3rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}>
        <div style={{
          ...cardStyle,
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}>
          <span style={{ fontSize: '1.5rem' }}>📂</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>Continue Project</div>
            <div style={{ fontSize: '0.875rem', color: LH.textMuted }}>Resume your last session</div>
          </div>
        </div>

        <div style={{
          ...cardStyle,
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          cursor: 'pointer',
        }}>
          <span style={{ fontSize: '1.5rem' }}>✨</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>New Project</div>
            <div style={{ fontSize: '0.875rem', color: LH.textMuted }}>Start a fresh annotation</div>
          </div>
        </div>

        <div style={{
          ...cardStyle,
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          cursor: 'pointer',
        }}>
          <span style={{ fontSize: '1.5rem' }}>📤</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>Upload Project</div>
            <div style={{ fontSize: '0.875rem', color: LH.textMuted }}>Import from JSON file</div>
          </div>
        </div>

        {/* Features row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
          marginTop: '0.5rem',
        }}>
          <div style={{
            ...cardStyle,
            padding: '1rem',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>✍️</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Rich text editing</div>
          </div>
          <div style={{
            ...cardStyle,
            padding: '1rem',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>🔗</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Link notes to text</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ======== PAGE: EDITOR / MAIN LAYOUT ========

function LHEditor() {
  const samplePoem = [
    'My heart aches, and a drowsy numbness pains',
    '    My sense, as though of hemlock I had drunk,',
    'Or emptied some dull opiate to the drains',
    '    One minute past, and Lethe-wards had sunk:',
  ];

  const notes = [
    { id: 1, x: 40, y: 100, content: 'Ode to a Nightingale — Keats explores escapism through beauty.', type: 'context' as const },
    { id: 2, x: 720, y: 80, content: '"hemlock" — poison, literal death imagery contrasted with dreamlike numbness', type: null },
    { id: 3, x: 720, y: 230, content: 'Lethe — river of forgetfulness in Greek myth. Speaker yearns to forget.', type: null },
    { id: 4, x: 40, y: 280, content: 'The opening is deeply personal — Keats wrote this while caring for his dying brother.', type: 'personal-response' as const },
  ];

  return (
    <div style={base}>
      {/* Header */}
      <header style={{
        background: LH.card,
        borderBottom: `1px solid ${LH.border}`,
        padding: '0.75rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky' as const,
        top: 0,
        zIndex: 20,
        boxShadow: LH.shadowCard,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button style={btnGhost}>←</button>
          <h1 style={{ fontWeight: 700, fontSize: '1.125rem' }}>
            Ode to a Nightingale
            <span style={{ fontSize: '0.75rem', marginLeft: '0.25rem' }}>✏️</span>
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button style={{
            ...btnOutline,
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            borderWidth: '1px',
          }}>
            💾 Save
          </button>
          <button style={{
            ...btnGhost,
            fontSize: '0.875rem',
          }}>
            📥 Export
          </button>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            marginLeft: '0.5rem',
            padding: '0.25rem',
            background: LH.muted,
            borderRadius: LH.radiusSm,
          }}>
            <button style={{ ...btnGhost, padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>−</button>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: '40px', textAlign: 'center' }}>100%</span>
            <button style={{ ...btnGhost, padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>+</button>
          </div>
        </div>
      </header>

      {/* Editor body */}
      <div style={{
        display: 'flex',
        position: 'relative',
        minHeight: 'calc(100vh - 60px)',
        padding: '2rem',
      }}>
        {/* Notes - left side */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
          {notes.map(note => {
            const isContext = note.type === 'context';
            const isPersonal = note.type === 'personal-response';
            const borderLeft = isContext
              ? `3px solid ${LH.success}`
              : isPersonal
              ? `3px solid hsl(280, 60%, 65%)`
              : `3px solid ${LH.primary}`;
            const headerBg = isContext
              ? `hsla(145, 60%, 45%, 0.08)`
              : isPersonal
              ? `hsla(280, 60%, 65%, 0.08)`
              : 'transparent';
            const headerLabel = isContext ? 'Context' : isPersonal ? 'Personal Response' : null;

            return (
              <div key={note.id} style={{
                ...cardStyle,
                position: 'absolute',
                left: note.x,
                top: note.y,
                width: 240,
                pointerEvents: 'auto',
                borderLeft,
                transition: 'box-shadow 0.15s ease',
              }}>
                {headerLabel && (
                  <div style={{
                    padding: '0.4rem 0.75rem',
                    background: headerBg,
                    borderBottom: `1px solid ${LH.border}`,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    color: LH.textMuted,
                  }}>
                    {headerLabel}
                  </div>
                )}
                <div style={{ padding: '0.75rem', fontSize: '0.875rem', lineHeight: 1.5, color: LH.text }}>
                  {note.content}
                </div>
              </div>
            );
          })}

          {/* Connection lines (visual representation) */}
          <svg style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}>
            <line x1={280} y1={130} x2={720} y2={120} stroke={LH.primary} strokeWidth={1.5} strokeOpacity={0.25} strokeDasharray="4 4" />
            <line x1={280} y1={310} x2={720} y2={270} stroke="hsl(280, 60%, 65%)" strokeWidth={1.5} strokeOpacity={0.25} strokeDasharray="4 4" />
          </svg>
        </div>

        {/* Poem panel - center */}
        <div style={{
          ...cardStyle,
          width: 520,
          margin: '0 auto',
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 400,
          boxShadow: LH.shadowHover,
        }}>
          {/* Panel header */}
          <div style={{
            padding: '0.6rem 1rem',
            borderBottom: `1px solid ${LH.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: LH.muted,
            borderRadius: '12px 12px 0 0',
          }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
              color: LH.textMuted,
            }}>Poem</span>
            <span style={{ fontSize: '0.7rem', color: LH.textMuted }}>Select text to create notes</span>
          </div>

          {/* Toolbar */}
          <div style={{
            padding: '0.4rem 0.75rem',
            borderBottom: `1px solid ${LH.border}`,
            display: 'flex',
            gap: '0.25rem',
            alignItems: 'center',
          }}>
            {['I', '≡', '≡', '≡', '→|'].map((icon, i) => (
              <button key={i} style={{
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: `1px solid transparent`,
                borderRadius: '6px',
                color: LH.textMuted,
                cursor: 'pointer',
                fontStyle: i === 0 ? 'italic' : 'normal',
                fontSize: '0.875rem',
                fontFamily: i === 0 ? "'Georgia', serif" : LH.font,
              }}>{icon}</button>
            ))}
          </div>

          {/* Poem content */}
          <div style={{
            padding: '1.5rem',
            flex: 1,
            fontFamily: "'Georgia', 'Crimson Pro', serif",
            fontSize: '1.125rem',
            lineHeight: 1.8,
            color: LH.text,
          }}>
            {samplePoem.map((line, i) => (
              <p key={i} style={{ margin: 0, padding: '0.15rem 0', whiteSpace: 'pre' }}>
                {i === 1 ? (
                  <>{'    My sense, as though of '}
                  <span style={{
                    background: `hsla(220, 70%, 45%, 0.12)`,
                    borderBottom: `2px solid ${LH.primary}`,
                    borderRadius: '2px',
                    padding: '0 2px',
                  }}>hemlock</span>
                  {' I had drunk,'}
                  </>
                ) : i === 3 ? (
                  <>{'    One minute past, and '}
                  <span style={{
                    background: `hsla(15, 90%, 60%, 0.12)`,
                    borderBottom: `2px solid ${LH.accent}`,
                    borderRadius: '2px',
                    padding: '0 2px',
                  }}>Lethe-wards</span>
                  {' had sunk:'}
                  </>
                ) : line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ======== PAGE: HEADER (standalone) ========

function LHHeader() {
  return (
    <div style={base}>
      <header style={{
        background: LH.card,
        borderBottom: `1px solid ${LH.border}`,
        padding: '0.75rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: LH.shadowCard,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button style={btnGhost}>←</button>
          <h1 style={{ fontWeight: 700, fontSize: '1.125rem' }}>
            Ode to a Nightingale
            <span style={{ fontSize: '0.75rem', marginLeft: '0.25rem' }}>✏️</span>
          </h1>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: LH.accent,
            display: 'inline-block',
          }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button style={btnPrimary}>💾 Save</button>
          <button style={{ ...btnOutline, padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            📥 Export
          </button>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            marginLeft: '0.5rem',
            padding: '0.25rem 0.5rem',
            background: LH.muted,
            borderRadius: LH.radiusSm,
          }}>
            <button style={{ ...btnGhost, padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>−</button>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: '40px', textAlign: 'center' }}>100%</span>
            <button style={{ ...btnGhost, padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>+</button>
            <button style={{ ...btnGhost, padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>↺</button>
          </div>
        </div>
      </header>
    </div>
  );
}

// ======== META ========

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      {children}
    </>
  );
}

const meta: Meta = {
  title: 'Reimagined/PoetryNotes as LanguageHub',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <Shell>
        <Story />
      </Shell>
    ),
  ],
};

export default meta;
type Story = StoryObj;

export const LandingPage: Story = {
  render: () => <LHLanding />,
};

export const EditorPage: Story = {
  render: () => <LHEditor />,
};

export const HeaderBar: Story = {
  render: () => <LHHeader />,
};
