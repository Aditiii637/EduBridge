
import React, { useState, useEffect } from 'react';
import { Home, Wifi, WifiOff, LogOut, RefreshCw, Calculator, FlaskConical, BookA, Landmark, Brain, HelpCircle } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ChapterView from './components/ChapterView';
import QuizView from './components/QuizView';
import ChatWidget from './components/ChatWidget';
import LoginView from './components/LoginView';
import TeacherDashboard from './components/TeacherDashboard';
import ParentDashboard from './components/ParentDashboard';
import SyncModal from './components/SyncModal';
import Toast from './components/Toast';
import LandingPage from './components/LandingPage';
import ContentCreator from './components/ContentCreator';
import P2PShareModal from './components/P2PShareModal';
import VoiceNavigator from './components/VoiceNavigator';
import BrainGym from './components/BrainGym';
import DoubtCorner from './components/DoubtCorner';
import { mockSubjects } from './data/learningData';
import { Subject, Chapter, ViewState, UserProgress, User, ToastNotification, ContentPack, Language } from './types';
import { t } from './data/locales';

const App: React.FC = () => {
  // --- Auth State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // --- Application State ---
  const [viewState, setViewState] = useState<ViewState>('landing');
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // --- Feature States ---
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isP2PModalOpen, setIsP2PModalOpen] = useState(false);
  const [p2pMode, setP2PMode] = useState<'send' | 'receive'>('receive');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  
  // --- Language State ---
  const [lang, setLang] = useState<Language>('en');
  
  // Mock User Progress (Student Side)
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalXp: 1250,
    streakDays: 5,
    badges: ['Early Bird', 'Math Wizard']
  });

  // Mock Mutable Subjects (to unlock/add content)
  const [localSubjects, setLocalSubjects] = useState<Subject[]>(mockSubjects);

  // Network listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addToast("Back Online! Syncing progress...", "success");
    };
    const handleOffline = () => {
      setIsOnline(false);
      addToast(t[lang]?.offlineMode || "Offline", "info");
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [lang]);

  // --- Helpers ---
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- Actions ---

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setViewState('dashboard');
    addToast(`${t[lang]?.welcome || "Welcome"}, ${user.name}!`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setViewState('landing');
    setActiveSubject(null);
    setActiveChapter(null);
  };

  const handleSyncCode = (code: string) => {
    // Mock Sync Logic
    if (code === 'MATH-CH2' || code.includes('MATH')) {
       const updatedSubjects = localSubjects.map(sub => {
         if (sub.id === 'math') {
           return {
             ...sub,
             chapters: sub.chapters.map(ch => 
               ch.id === 'm2' ? { ...ch, isLocked: false, isDownloaded: true } : ch
             )
           };
         }
         return sub;
       });
       setLocalSubjects(updatedSubjects);
       addToast("Content Unlocked & Downloaded!", "success");
    } else {
      addToast("Invalid Sync Code. Try 'MATH-CH2'", "error");
    }
  };

  const toggleChapterDownload = (chapterId: string) => {
     // Mock download toggle
     if (activeSubject) {
        const updatedChapters = activeSubject.chapters.map(ch => {
           if (ch.id === chapterId) {
             const newState = !ch.isDownloaded;
             addToast(newState ? "Chapter Downloaded for Offline" : "Removed from Offline Storage", "info");
             return { ...ch, isDownloaded: newState };
           }
           return ch;
        });
        const newSubject = { ...activeSubject, chapters: updatedChapters };
        setActiveSubject(newSubject);
        
        // Update local global state
        setLocalSubjects(prev => prev.map(s => s.id === activeSubject.id ? newSubject : s));
     }
  };

  const handleSavePack = (pack: ContentPack) => {
    setViewState('dashboard');
    addToast(`Content Pack "${pack.title}" Saved Locally!`, 'success');
  };

  const handleReceivePack = () => {
    // Simulate installing a new chapter from P2P
    const newChapter: Chapter = {
       id: `p2p_${Date.now()}`,
       title: "Polynomials (P2P Shared)",
       summary: "<p>Content received from nearby teacher device.</p>",
       isDownloaded: true,
       isCompleted: false,
       isLocked: false,
       quiz: []
    };
    
    // Add to Math subject for demo
    setLocalSubjects(prev => prev.map(s => {
      if (s.id === 'math') {
        return { ...s, chapters: [...s.chapters, newChapter] };
      }
      return s;
    }));
    
    addToast(t[lang]?.installComplete || "Installed", "success");
  };

  // --- Navigation Handlers ---

  const goToSubject = (subject: Subject) => {
    setActiveSubject(subject);
    setViewState('subject_detail');
  };

  const goToChapter = (chapter: Chapter) => {
    if (chapter.isLocked) {
      addToast(t[lang]?.locked || "Locked", "error");
      setIsSyncModalOpen(true);
      return;
    }
    setActiveChapter(chapter);
    setViewState('chapter_read');
  };

  const startQuiz = () => {
    setViewState('quiz_mode');
  };

  const goHome = () => {
    setViewState('dashboard');
    setActiveSubject(null);
    setActiveChapter(null);
  };
  
  const handleVoiceCommand = (command: string) => {
    if (!currentUser) return;
    
    // Command Mapping
    if (command === 'dashboard') goHome();
    else if (command === 'quiz_mode') {
        // Just launch the first available quiz for demo
        const subj = localSubjects[0];
        const chap = subj.chapters[0];
        setActiveSubject(subj);
        setActiveChapter(chap);
        setViewState('quiz_mode');
    }
    else if (command === 'brain_gym') setViewState('brain_gym');
    else if (command === 'doubt') setViewState('doubt_corner');
    else {
      // Subject match
      const sub = localSubjects.find(s => s.id === command);
      if (sub) goToSubject(sub);
    }
    
    addToast(`Voice: Navigating to ${command}...`, 'info');
  };

  // Helper for icons map in subject detail
  const iconMap: {[key: string]: React.ReactNode} = {
    math: <Calculator size={32} />,
    science: <FlaskConical size={32} />,
    english: <BookA size={32} />,
    history: <Landmark size={32} />
  };

  // --- Conditional Rendering based on Role ---

  const renderRoleBasedContent = () => {
    if (!currentUser) return <LoginView onLogin={handleLogin} onBack={() => setViewState('landing')} lang={lang} setLang={setLang} />;

    if (currentUser.role === 'teacher') {
      if (viewState === 'content_creator') {
        return <ContentCreator onBack={() => setViewState('dashboard')} onSavePack={handleSavePack} />;
      }
      return (
        <TeacherDashboard 
          onCreateClick={() => setViewState('content_creator')} 
          onBroadcastClick={() => {
            setP2PMode('send');
            setIsP2PModalOpen(true);
          }}
        />
      );
    }

    if (currentUser.role === 'parent') {
      return <ParentDashboard studentName="Rahul" progress={userProgress} />;
    }

    // Default: Student View
    switch (viewState) {
      case 'dashboard':
        return (
          <Dashboard 
            subjects={localSubjects} 
            onSelectSubject={goToSubject}
            userProgress={userProgress}
            isOnline={isOnline}
            onOpenSync={() => setIsSyncModalOpen(true)}
            onReceiveNearby={() => {
              setP2PMode('receive');
              setIsP2PModalOpen(true);
            }}
            onOpenBrainGym={() => setViewState('brain_gym')}
            onOpenDoubtCorner={() => setViewState('doubt_corner')}
            lang={lang}
            setLang={setLang}
          />
        );
      
      case 'brain_gym':
        return (
          <BrainGym 
             subjects={localSubjects}
             onBack={goHome}
             lang={lang}
             onOpenChapter={(sid, cid) => {
               const sub = localSubjects.find(s => s.id === sid);
               const chap = sub?.chapters.find(c => c.id === cid);
               if (sub && chap) {
                 setActiveSubject(sub);
                 goToChapter(chap);
               }
             }}
          />
        );

      case 'doubt_corner':
        return <DoubtCorner onBack={goHome} lang={lang} isOnline={isOnline} />;

      case 'subject_detail':
        return activeSubject ? (
          <div className="p-4 animate-fade-in pb-24">
            <button onClick={goHome} className="text-sm text-slate-500 mb-4 flex items-center gap-1">
              ← {t[lang]?.backToDash || "Back"}
            </button>
            <div className={`p-6 rounded-xl text-white mb-6 ${activeSubject.color.replace('text', 'bg').replace('100', '600')}`}>
              <div className="flex items-center gap-4">
                <div className="text-4xl bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  {iconMap[activeSubject.icon] || '📚'}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    {lang === 'hi' && activeSubject.trans?.name ? activeSubject.trans.name : activeSubject.name}
                  </h1>
                  <p className="opacity-90">Class 10 • NCERT</p>
                </div>
              </div>
            </div>
            
            <h2 className="font-bold text-slate-800 mb-3">{t[lang]?.chapters || "Chapters"}</h2>
            <div className="space-y-3">
              {activeSubject.chapters.map(chapter => (
                <div 
                  key={chapter.id}
                  onClick={() => goToChapter(chapter)}
                  className={`bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all ${
                    chapter.isLocked ? 'opacity-75 border-slate-200 bg-slate-50' : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      chapter.isLocked ? 'bg-slate-200 text-slate-400' :
                      chapter.isCompleted ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {chapter.isLocked ? '🔒' : (chapter.isCompleted ? '✓' : chapter.id.replace(/[a-z_]/g, '').slice(0, 2))}
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm md:text-base ${chapter.isLocked ? 'text-slate-500' : 'text-slate-700'}`}>
                        {lang === 'hi' && chapter.trans?.title ? chapter.trans.title : chapter.title}
                      </h4>
                      <div className="flex gap-2 text-[10px] mt-1">
                        {chapter.isLocked ? (
                          <span className="bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">{t[lang]?.locked || "Locked"}</span>
                        ) : (
                          <>
                             {chapter.isDownloaded && (
                              <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100">Saved</span>
                            )}
                            {chapter.quiz.length > 0 && (
                              <span className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded border border-orange-100">Quiz</span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {!chapter.isLocked && (
                    <div className="text-slate-300">
                      →
                    </div>
                  )}
                </div>
              ))}
              {activeSubject.chapters.length === 0 && (
                <div className="text-center py-10 text-slate-400 italic">
                  No chapters added yet for this subject.
                </div>
              )}
            </div>
          </div>
        ) : null;

      case 'chapter_read':
        return activeChapter ? (
          <ChapterView 
            chapter={activeChapter} 
            onBack={() => setViewState('subject_detail')}
            onStartQuiz={startQuiz}
            onToggleDownload={() => toggleChapterDownload(activeChapter.id)}
            lang={lang}
          />
        ) : null;

      case 'quiz_mode':
        return activeChapter ? (
          <QuizView 
            questions={activeChapter.quiz}
            onBack={() => setViewState('chapter_read')}
            onComplete={(score) => {
              setUserProgress(prev => ({
                ...prev,
                totalXp: prev.totalXp + (score * 10)
              }));
              addToast(`${t[lang]?.quizComplete || "Quiz Complete"} +${score * 10} XP`, 'success');
            }}
            lang={lang}
          />
        ) : null;
    }
  };

  // If viewing Landing Page
  if (viewState === 'landing' && !currentUser) {
    return (
      <LandingPage onEnter={() => setViewState('dashboard')} />
    );
  }

  // If not logged in (and not on landing page), render Login View full screen
  if (!currentUser) {
    return (
      <>
        <LoginView onLogin={handleLogin} onBack={() => setViewState('landing')} lang={lang} setLang={setLang} />
        {/* Toast Container */}
        {toasts.map(toast => (
          <Toast key={toast.id} notification={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </>
    );
  }

  // Logged in Layout
  return (
    <div className="bg-slate-50 h-screen w-full flex flex-col md:flex-row md:max-w-4xl md:mx-auto md:shadow-2xl md:my-4 md:rounded-3xl overflow-hidden border-slate-200">
      
      {/* Toast Container */}
      {toasts.map(toast => (
        <Toast key={toast.id} notification={toast} onClose={() => removeToast(toast.id)} />
      ))}

      {/* Sync Modal */}
      <SyncModal 
        isOpen={isSyncModalOpen} 
        onClose={() => setIsSyncModalOpen(false)} 
        onSync={handleSyncCode}
        lang={lang} 
      />

      {/* P2P Share Modal */}
      <P2PShareModal 
        isOpen={isP2PModalOpen}
        mode={p2pMode}
        onClose={() => setIsP2PModalOpen(false)}
        onReceiveSuccess={handleReceivePack}
      />

      {/* Voice Navigator (Global) */}
      {currentUser.role === 'student' && (
        <VoiceNavigator lang={lang} onNavigate={handleVoiceCommand} />
      )}

      {/* Mobile Top Bar */}
      <div className="md:hidden h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="font-bold text-indigo-700 text-lg flex items-center gap-2">
          📘 EduBridge
        </div>
        <div className="flex items-center gap-3">
          {currentUser.role === 'student' && (
             <button onClick={() => setIsSyncModalOpen(true)} className="text-indigo-600 bg-indigo-50 p-1.5 rounded-full">
               <RefreshCw size={16} />
             </button>
          )}
          {isOnline ? (
            <Wifi className="text-green-500 w-4 h-4" />
          ) : (
            <WifiOff className="text-slate-400 w-4 h-4" />
          )}
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs border border-indigo-200">
            {currentUser.name.charAt(0)}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative scroll-smooth">
        {renderRoleBasedContent()}
      </div>

      {/* Bottom Navigation (Mobile Only) */}
      <div className="md:hidden h-16 bg-white border-t border-slate-200 flex items-center justify-around px-2 shrink-0 z-20 fixed bottom-0 left-0 right-0">
        <button onClick={goHome} className={`flex flex-col items-center gap-1 p-2 ${viewState === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Home size={20} />
          <span className="text-[10px] font-medium">Home</span>
        </button>
        {currentUser.role === 'student' && (
          <button onClick={() => setViewState('brain_gym')} className={`flex flex-col items-center gap-1 p-2 ${viewState === 'brain_gym' ? 'text-pink-600' : 'text-slate-400'}`}>
            <Brain size={20} />
            <span className="text-[10px] font-medium">Revise</span>
          </button>
        )}
        <button onClick={() => setViewState('doubt_corner')} className={`flex flex-col items-center gap-1 p-2 ${viewState === 'doubt_corner' ? 'text-blue-600' : 'text-slate-400'}`}>
          <HelpCircle size={20} />
          <span className="text-[10px] font-medium">Ask</span>
        </button>
        <button onClick={handleLogout} className="flex flex-col items-center gap-1 p-2 text-red-400">
          <LogOut size={20} />
          <span className="text-[10px] font-medium">Logout</span>
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-20 bg-white border-r border-slate-200 items-center py-6 gap-6">
        <div className="text-2xl mb-4">📘</div>
        <button onClick={goHome} className={`p-3 rounded-xl ${viewState === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-400'}`}><Home size={20}/></button>
        {currentUser.role === 'student' && (
           <>
             <button onClick={() => setViewState('brain_gym')} className={`p-3 rounded-xl ${viewState === 'brain_gym' ? 'bg-pink-50 text-pink-600' : 'hover:bg-slate-50 text-slate-400'}`}><Brain size={20}/></button>
             <button onClick={() => setViewState('doubt_corner')} className={`p-3 rounded-xl ${viewState === 'doubt_corner' ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-400'}`}><HelpCircle size={20}/></button>
           </>
        )}
        <div className="flex-1"></div>
        <button onClick={handleLogout} className="p-3 hover:bg-red-50 text-red-400 rounded-xl"><LogOut size={20}/></button>
      </div>

      {/* Chat Widget */}
      <ChatWidget currentContext={viewState} userRole={currentUser.role} />

    </div>
  );
};

export default App;
