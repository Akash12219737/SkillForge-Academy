import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PlayCircle, CheckCircle2, ChevronRight, FileText, Download, ChevronLeft, Save, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Badge } from '../components/ui/Badge';
import api from '../services/api';

export const VideoLearningPage: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Learning states
  const [course, setCourse] = useState<any | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [currentLesson, setCurrentLesson] = useState<any | null>(null);
  const [notes, setNotes] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progressPercent, setProgressPercent] = useState(0);

  // Active tab state
  const [activeTab, setActiveTab] = useState('notes');

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/student/courses/${courseId}/content`);
        setCourse(res.data.course);
        setCompletedLessonIds(res.data.completedLessonIds || []);
        setProgressPercent(res.data.progress || 0);

        // Auto select first lesson
        const firstSection = res.data.course?.sections?.[0];
        const firstLesson = firstSection?.lessons?.[0];
        if (firstLesson) {
          setCurrentLesson(firstLesson);
        }
      } catch (err) {
        console.error('Failed to load learning workspace content:', err);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, [courseId]);

  // Load lesson notes when lesson changes
  useEffect(() => {
    const loadNotes = async () => {
      if (!currentLesson) return;
      try {
        const res = await api.get(`/student/notes/${currentLesson.id}`);
        setNotes(res.data.content || '');
      } catch (err) {
        console.error('Error fetching lesson notes:', err);
      }
    };
    loadNotes();
  }, [currentLesson]);

  // Handle note saving
  const handleSaveNote = async () => {
    if (!currentLesson) return;
    setNotesSaving(true);
    try {
      await api.post(`/student/notes/${currentLesson.id}`, { content: notes });
      setTimeout(() => setNotesSaving(false), 500); // UI visual delay
    } catch (err) {
      console.error('Failed to save notes:', err);
      setNotesSaving(false);
    }
  };

  // Toggle lesson completed status
  const handleToggleCompleted = async (lessonId: string) => {
    const isCompleted = completedLessonIds.includes(lessonId);
    const updatedIds = isCompleted
      ? completedLessonIds.filter((id) => id !== lessonId)
      : [...completedLessonIds, lessonId];

    setCompletedLessonIds(updatedIds);

    try {
      const res = await api.post(`/student/lessons/${lessonId}/progress`, {
        completed: !isCompleted,
      });
      setProgressPercent(res.data.progressPercent);
      
      // Auto issue certificate if progress hits 100
      if (res.data.progressPercent === 100) {
        await api.post(`/student/certificates/claim/${courseId}`);
      }
    } catch (err) {
      console.error('Failed to toggle completion:', err);
      // Rollback UI state on failure
      setCompletedLessonIds(completedLessonIds);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Preparing learning workspace...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold mt-4">Unable to verify workspace access</h2>
        <p className="text-sm text-muted-foreground mt-2">Make sure you are enrolled in this course.</p>
        <Link to="/dashboard" className="text-primary hover:underline mt-4 inline-block">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] bg-slate-900 overflow-hidden text-white text-left">
      
      {/* LEFT: Video Player Workspace & Lesson details */}
      <div className="flex-1 flex flex-col overflow-y-auto h-full p-4 lg:p-6 space-y-6">
        
        {/* Workspace navigation */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Link to="/dashboard" className="rounded-lg p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-base md:text-lg font-bold line-clamp-1">{course.title}</h1>
              <div className="flex items-center space-x-2 mt-0.5 text-xs text-slate-400">
                <span>{progressPercent}% Complete</span>
                <span>•</span>
                <span>Instructor: {course.instructor?.name}</span>
              </div>
            </div>
          </div>
          <div className="w-24 md:w-32 bg-slate-800 h-2 rounded-full overflow-hidden shrink-0">
            <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Video Frame */}
        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800">
          {currentLesson ? (
            <iframe
              className="w-full h-full"
              src={currentLesson.videoUrl}
              title={currentLesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Select a lecture from the playlist to begin learning
            </div>
          )}
        </div>

        {/* Lesson descriptions & Tabs details */}
        {currentLesson && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-100">{currentLesson.title}</h2>
                <p className="text-xs text-slate-400 mt-1">Lecture Duration: {Math.round(currentLesson.duration / 60)} minutes</p>
              </div>
              <Button
                variant={completedLessonIds.includes(currentLesson.id) ? 'outline' : 'gradient'}
                size="sm"
                className="flex items-center space-x-2 shrink-0 self-start sm:self-auto"
                onClick={() => handleToggleCompleted(currentLesson.id)}
              >
                <CheckCircle2 className={`h-4.5 w-4.5 ${completedLessonIds.includes(currentLesson.id) ? 'text-emerald-500 fill-emerald-500/10' : ''}`} />
                <span>{completedLessonIds.includes(currentLesson.id) ? 'Completed' : 'Mark as Completed'}</span>
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="pt-2 border-t border-slate-800">
              <TabsList className="bg-slate-950/80 border-slate-800">
                <TabsTrigger value="notes">Lesson Notes</TabsTrigger>
                <TabsTrigger value="readme">Lab Guide</TabsTrigger>
                <TabsTrigger value="downloads">Resources</TabsTrigger>
              </TabsList>

              {/* Notes Input Area */}
              <TabsContent value="notes" className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Notes automatically sync to your student record</span>
                  <Button size="sm" variant="outline" className="h-8 border-slate-700 hover:bg-slate-800 text-xs" onClick={handleSaveNote} isLoading={notesSaving}>
                    <Save className="mr-1 h-3.5 w-3.5" />
                    Save Notes
                  </Button>
                </div>
                <textarea
                  className="w-full min-h-[160px] p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-slate-600 resize-y"
                  placeholder="Draft your thoughts, timestamp tags, and terminal syntax commands here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </TabsContent>

              {/* Lab Guide documentation readme */}
              <TabsContent value="readme">
                <Card className="bg-slate-950 border border-slate-800">
                  <CardContent className="p-5 text-slate-300 text-sm leading-relaxed space-y-3">
                    <h3 className="font-bold text-slate-100 text-base">Lab Instruction Manual</h3>
                    <p>{currentLesson.content || 'No custom guide notes provided for this lesson.'}</p>
                    <p className="font-semibold text-blue-400">Suggested commands to run in local workspace:</p>
                    <pre className="p-3.5 bg-slate-900 rounded-lg text-xs font-mono text-emerald-400 border border-slate-800">
                      {`$ kubectl apply -f deployment.yaml\n$ kubectl get pods -w`}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Downloads resource list */}
              <TabsContent value="downloads" className="space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl hover:bg-slate-900 transition-colors">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="text-sm font-semibold text-slate-100">k8s-manifests-draft.yaml</div>
                      <div className="text-xs text-slate-500">Size: 4.8 KB • YAML Schema</div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-8 p-2 text-slate-400 hover:text-white hover:bg-slate-800">
                    <Download className="h-4.5 w-4.5" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* RIGHT: Playlist Sidebar Panel */}
      <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-950/80 h-1/2 lg:h-full flex flex-col">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
          <h2 className="font-extrabold text-sm uppercase tracking-wider text-slate-300">Course Syllabus</h2>
          <span className="text-xs bg-slate-800 px-2 py-0.5 rounded font-bold">{completedLessonIds.length} / {course.sections?.reduce((a: number, s: any) => a + (s.lessons?.length || 0), 0)} Done</span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
          {course.sections?.map((section: any) => (
            <div key={section.id} className="p-4 space-y-3">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wide leading-tight">{section.title}</h3>
              <div className="space-y-2">
                {section.lessons?.map((lesson: any) => {
                  const isCurrent = currentLesson?.id === lesson.id;
                  const isCompleted = completedLessonIds.includes(lesson.id);

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setCurrentLesson(lesson)}
                      className={`flex w-full items-start space-x-3 p-2.5 rounded-lg text-left text-xs transition-all duration-200 ${
                        isCurrent
                          ? 'bg-slate-800 border border-slate-700 text-white font-semibold'
                          : 'hover:bg-slate-900/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // Avoid selecting lesson
                          handleToggleCompleted(lesson.id);
                        }}
                        className={`mt-0.5 shrink-0 transition-colors ${isCompleted ? 'text-emerald-500' : 'text-slate-600'}`}
                      >
                        <CheckCircle2 className="h-4.5 w-4.5 fill-current" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="truncate leading-tight">{lesson.title}</div>
                        <div className="text-[10px] text-slate-500 mt-1 font-medium">{Math.round(lesson.duration / 60)} min</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
