import { useState,useEffect } from 'react';
import './App.css';

type Page = 'home' | 'upload' | 'decks' | 'review' | 'login' | 'signup' | 'profile';

const deckData = [
  { title: 'Psychology 101', count: 24, color: 'violet', icon: '◌' },
  { title: 'Spanish Vocabulary', count: 42, color: 'pink', icon: '◫' },
  { title: 'Biology: Cells', count: 18, color: 'blue', icon: '✦' },
];

function App() {
  const [page, setPage] = useState<Page>('home');
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const[file,setFile]= useState<File|null>(null);
  const[extractedText,setExtractedText]=useState<string>('');
  const [fullText, setFullText] = useState<string>('');
const [flashcards, setFlashcards] = useState<{question: string; answer: string}[]>([]);
const [generating, setGenerating] = useState(false);
const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  const go = (next: Page) => { setPage(next); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const authenticate = () => { setLoggedIn(true); go('decks'); };
  const handleupload = async () => {
  if (!file) return;
  const formdata = new FormData();
  formdata.append('file', file);
  try {
    const res = await fetch("http://localhost:8000/upload-pdf", {
      method: "POST",
      body: formdata
    });
    const data = await res.json();
    setExtractedText(data.text_preview);
    setFullText(data.full_text);   // ← new: save the full text for later
  } catch (err) {
    console.error('Upload failed:', err);
    setExtractedText('Upload failed — check that the backend is running.');
  }
};
const handleGenerate = async () => {
  if (!fullText) return;
  setGenerating(true);
  try {
    const res = await fetch("http://localhost:8000/generate-flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: fullText }),
    });
    const data = await res.json();
    if (data.deck_id) {
      go('decks');
    } else {
      console.error('Generation failed:', data);
    }
  } catch (err) {
    console.error('Request failed:', err);
  } finally {
    setGenerating(false);
  }
};
  const nav = [
    ['Home', 'home'], ['Upload', 'upload'], ['My Decks', 'decks'], ['Review', 'review'],
  ] as [string, Page][];

  return <div className="app-shell">
    <header className="nav-wrap">
      <button className="brand" onClick={() => go('home')} aria-label="Flashcard AI home"><span className="brand-mark">◌</span><span>FLASH<span>CARD</span></span></button>
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">☰</button>
      <nav className={menuOpen ? 'open' : ''}>
        {nav.map(([label, target]) => <button key={target} className={page === target ? 'active' : ''} onClick={() => go(target)}>{label}</button>)}
      </nav>
      <div className="auth-actions">
        {loggedIn ? <button className="profile-button" onClick={() => go('profile')}><span className="avatar">AM</span><span className="profile-name">Alex Morgan</span><span>⌄</span></button> : <>
          <button className="login" onClick={() => go('login')}>Log in</button><button className="gradient-button compact" onClick={() => go('signup')}>Sign up</button>
        </>}
      </div>
    </header>

    {page === 'home' && <Home go={go} />}
    {page === 'upload' && <Upload go={go} file={file} setFile={setFile} extractedText={extractedText} handleupload={handleupload} handleGenerate={handleGenerate} generating={generating} />}
    {page === 'decks' && <Decks go={go} setSelectedDeckId={setSelectedDeckId} />}
{page === 'review' && <Review deckId={selectedDeckId} />}
    {(page === 'login' || page === 'signup') && <Auth mode={page} onAuth={authenticate} go={go} />}
    {page === 'profile' && <Profile onLogout={() => { setLoggedIn(false); go('home'); }} />}
  </div>;
}

function Home({ go }: { go: (p: Page) => void }) {
  return <>
    <main className="hero">
      <div className="hero-orb orb-one"/><div className="hero-orb orb-two"/><div className="hero-orb orb-three"/>
      <div className="eyebrow">✦ &nbsp; Learn smarter, remember longer</div>
      <h1>Turn anything into<br/><span>flashcards.</span> Instantly.</h1>
      <p className="hero-copy">Upload your notes, slides, or a topic. Flashcard AI creates thoughtful cards that make studying feel effortless.</p>
      <div className="hero-actions"><button className="gradient-button" onClick={() => go('signup')}>✦&nbsp; Create flashcards</button><button className="text-button" onClick={() => go('decks')}>Explore decks <span>→</span></button></div>
      <div className="prompt-card"><div className="prompt-title">✧ <span>What would you like to study?</span></div><div className="prompt-bottom"><div className="prompt-chips"><span>⌁ Upload notes</span><span>✦ Create a topic</span></div><button className="gradient-button small" onClick={() => go('upload')}>Generate <span>→</span></button></div></div>
      <div className="floating-cards"><article className="mini-card purple"><span>Psychology</span><strong>What is classical<br/>conditioning?</strong><i>24 cards</i></article><article className="mini-card peach"><span>Español</span><strong>¿Cómo estás?</strong><i>42 cards</i></article><article className="mini-card blue"><span>Biology</span><strong>What is the<br/>mitochondria?</strong><i>18 cards</i></article></div>
    </main>
    <section className="how-section"><div className="section-kicker">A simpler way to study</div><h2>From scattered notes to<br/><span>confident recall.</span></h2><div className="steps"><Step n="01" icon="↥" title="Add your material" text="Drop in a PDF, paste notes, or simply name a topic."/><Step n="02" icon="✦" title="Let AI do the work" text="Get focused, editable flashcards in moments."/><Step n="03" icon="◎" title="Learn your way" text="Review at your pace and watch your progress grow."/></div></section>
    <Pricing go={go}/><Footer go={go}/>
  </>;
}

function Step({ n, icon, title, text }: {n:string;icon:string;title:string;text:string}) { return <article className="step"><span className="step-number">{n}</span><div className="step-icon">{icon}</div><h3>{title}</h3><p>{text}</p></article>; }

function Pricing({ go }: { go: (p: Page) => void }) { return <section className="pricing" id="pricing"><div className="section-kicker">Simple pricing</div><h2>Start learning today.</h2><p className="section-copy">Choose a plan that fits the way you study.</p><div className="price-grid"><article className="price-card"><h3>Starter</h3><p>Everything you need to begin.</p><div className="price"><b>$0</b><span>/ month</span></div><button className="outline-button" onClick={() => go('signup')}>Get started free</button><ul><li>50 AI flashcards / month</li><li>3 active decks</li><li>Basic review mode</li></ul></article><article className="price-card featured"><span className="popular">Most popular</span><h3>Scholar</h3><p>For students who want more.</p><div className="price"><b>$8</b><span>/ month</span></div><button className="light-button" onClick={() => go('signup')}>Start free trial</button><ul><li>Unlimited AI flashcards</li><li>Unlimited decks</li><li>Smart spaced repetition</li></ul></article><article className="price-card"><h3>Pro</h3><p>For ambitious learners.</p><div className="price"><b>$14</b><span>/ month</span></div><button className="outline-button" onClick={() => go('signup')}>Get started</button><ul><li>Everything in Scholar</li><li>PDF & slide uploads</li><li>Priority AI generation</li></ul></article></div></section> }

function Upload({ go, file, setFile, extractedText, handleupload, handleGenerate, generating }: {
  go: (p: Page) => void;
  file: File | null;
  setFile: (f: File | null) => void;
  extractedText: string;
  handleupload: () => void;
  handleGenerate: () => void;
  generating: boolean;
}) {
  return <PageFrame eyebrow="CREATE A NEW DECK" title={<>Make flashcards from <span>anything.</span></>}>
    <div className="upload-grid">
      <section className="dropzone">
        <div className="upload-symbol">↥</div>
        <h3>Drop your study material here</h3>
        <p>PDF, DOCX, PPTX, TXT up to 20 MB</p>

        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <button className="outline-button" onClick={handleupload}>Upload</button>
        {file && <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Selected: {file.name}</p>}
        {extractedText && <p>{extractedText}</p>}

        <div className="or"><span/>or<span/></div>
        <textarea placeholder="Paste your notes or type a topic to get started..."/>
        <button className="gradient-button" onClick={handleGenerate} disabled={generating}>
          {generating ? 'Generating...' : <>✦&nbsp; Generate flashcards</>}
        </button>
      </section>
      <aside className="upload-aside">
        <h3>How it works</h3>
        <p><b>01</b> Upload a file or paste your notes.</p>
        <p><b>02</b> Choose a deck title and difficulty.</p>
        <p><b>03</b> Review, edit, and start learning.</p>
      </aside>
    </div>
  </PageFrame>
}
function Decks({ go, setSelectedDeckId }: { go: (p: Page) => void; setSelectedDeckId: (id: number) => void }) {
  const [decks, setDecks] = useState<{id: number; title: string; card_count: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/decks")
      .then(res => res.json())
      .then(data => setDecks(data))
      .catch(err => console.error('Failed to load decks:', err))
      .finally(() => setLoading(false));
  }, []);

  const openDeck = (id: number) => {
    setSelectedDeckId(id);
    go('review');
  };

  return <PageFrame eyebrow="YOUR LIBRARY" title={<>Your learning <span>space.</span></>}>
    <div className="deck-toolbar">
      <p>{decks.length > 0 ? `${decks.length} deck${decks.length > 1 ? 's' : ''} · ${decks.reduce((sum, d) => sum + d.card_count, 0)} cards total` : 'No decks yet'}</p>
      <button className="gradient-button small" onClick={() => go('upload')}>+ New deck</button>
    </div>

    {loading ? <p>Loading decks...</p> : decks.length > 0 ? (
      <div className="deck-grid">
        {decks.map(d => (
          <article className="deck-card violet" key={d.id}>
            <div className="deck-card-top"><span className="deck-icon">◌</span><button>•••</button></div>
            <h3>{d.title}</h3>
            <p>{d.card_count} flashcards</p>
            <button onClick={() => openDeck(d.id)}>Study now <span>→</span></button>
          </article>
        ))}
      </div>
    ) : (
      <p>Upload a PDF to generate your first deck.</p>
    )}
  </PageFrame>
}

function Review({ deckId }: { deckId: number | null }) {
  const [flipped, setFlipped] = useState(false);
  const [index, setIndex] = useState(0);
  const [cards, setCards] = useState<{id: number; question: string; answer: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deckId) { setLoading(false); return; }
    fetch(`http://localhost:8000/decks/${deckId}/cards`)
      .then(res => res.json())
      .then(data => setCards(data))
      .catch(err => console.error('Failed to load cards:', err))
      .finally(() => setLoading(false));
  }, [deckId]);

  if (loading) {
    return <PageFrame eyebrow="REVIEW MODE" title={<>Loading <span>cards...</span></>}><p>One moment...</p></PageFrame>;
  }

  if (!deckId || cards.length === 0) {
    return <PageFrame eyebrow="REVIEW MODE" title={<>No cards <span>yet.</span></>}>
      <p>Go to My Decks and pick a deck to study.</p>
    </PageFrame>;
  }

  const card = cards[index];

  const next = () => {
    setFlipped(false);
    setIndex((i) => (i + 1) % cards.length);
  };

  return <PageFrame eyebrow="REVIEW MODE" title={<>Keep the answer <span>in mind.</span></>}>
    <div className="review-meta">
      <span>{index + 1} of {cards.length}</span>
    </div>
    <button className={'study-card ' + (flipped ? 'flipped' : '')} onClick={() => setFlipped(!flipped)}>
      <small>{flipped ? 'ANSWER' : 'QUESTION'}</small>
      <strong>{flipped ? card.answer : card.question}</strong>
      <em>Click the card to {flipped ? 'see question' : 'reveal answer'}</em>
    </button>
    <div className="review-actions">
      <button className="again" onClick={next}>↻ Again</button>
      <button className="hard" onClick={next}>Hard</button>
      <button className="good" onClick={next}>✓ Good</button>
      <button className="easy" onClick={next}>✦ Easy</button>
    </div>
  </PageFrame>
}
function Auth({mode,onAuth,go}:{mode:'login'|'signup';onAuth:()=>void;go:(p:Page)=>void}) { const signup=mode==='signup'; return <main className="auth-page"><div className="auth-panel"><div className="eyebrow">✦ &nbsp; WELCOME TO FLASHCARD AI</div><h1>{signup?'Start learning smarter.':'Welcome back.'}</h1><p>{signup?'Create your free account and turn study time into progress.':'Pick up right where you left off.'}</p><form onSubmit={e=>{e.preventDefault();onAuth();}}>{signup&&<label>Full name<input placeholder="Alex Morgan"/></label>}<label>Email<input type="email" placeholder="you@example.com"/></label><label>Password<input type="password" placeholder="••••••••"/></label><button className="gradient-button" type="submit">{signup?'Create free account':'Log in'} <span>→</span></button></form><p className="switch-auth">{signup?'Already have an account?':'New to Flashcard AI?'} <button onClick={()=>go(signup?'login':'signup')}>{signup?'Log in':'Sign up free'}</button></p></div></main> }

function Profile({onLogout}:{onLogout:()=>void}) { return <PageFrame eyebrow="YOUR PROFILE" title={<>Hello, <span>Alex.</span></>}><div className="profile-layout"><section className="profile-card"><div className="large-avatar">AM</div><h2>Alex Morgan</h2><p>alex@example.com</p><hr/><div><b>Scholar plan</b><span>Active</span></div><button className="outline-button" onClick={onLogout}>Log out</button></section><section className="stats"><article><b>84</b><span>Cards created</span></article><article><b>12</b><span>Day streak</span></article><article><b>6.4h</b><span>Study time</span></article></section></div></PageFrame> }

function PageFrame({eyebrow,title,children}:{eyebrow:string;title:React.ReactNode;children:React.ReactNode}) { return <main className="inner-page"><div className="page-heading"><div className="section-kicker">{eyebrow}</div><h1>{title}</h1></div>{children}</main> }
function Footer({go}:{go:(p:Page)=>void}) { return <footer><div className="footer-brand"><button className="brand" onClick={()=>go('home')}><span className="brand-mark">◌</span><span>FLASH<span>CARD</span></span></button><p>Thoughtful tools for curious minds.</p></div><div><h4>Product</h4><button onClick={()=>go('upload')}>Create cards</button><button onClick={()=>go('decks')}>My decks</button><button onClick={()=>go('review')}>Review</button></div><div><h4>Company</h4><button>About</button><button>Contact</button><button>Privacy</button></div><p className="copyright">© 2026 Flashcard AI</p></footer> }

export default App;
