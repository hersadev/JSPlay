import Header from './Header';

export default function MainLayout({
  children,
  onReset,
  onOpenLessons,
  onToggleSandbox,
  onOpenBadges,
  sandboxMode,
  level,
  onSwitchLevel,
  lessonIndex,
  totalLessons,
  earnedCount,
  totalBadges,
}) {
  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      <Header
        onReset={onReset}
        onOpenLessons={onOpenLessons}
        onToggleSandbox={onToggleSandbox}
        onOpenBadges={onOpenBadges}
        sandboxMode={sandboxMode}
        level={level}
        onSwitchLevel={onSwitchLevel}
        lessonIndex={lessonIndex}
        totalLessons={totalLessons}
        earnedCount={earnedCount}
        totalBadges={totalBadges}
      />
      <main className="flex flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
