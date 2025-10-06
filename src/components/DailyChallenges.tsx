import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  Target, Flame, BookOpen, Trophy, CheckCircle, Lock
} from "lucide-react";

export function DailyChallenges() {
  const challenges = [
    {
      id: 1,
      title: "Complete 3 Lessons",
      description: "Learn something new today",
      progress: 2,
      total: 3,
      xp: 50,
      completed: false,
      icon: BookOpen
    },
    {
      id: 2,
      title: "Score 100% on a Quiz",
      description: "Perfect score achievement",
      progress: 0,
      total: 1,
      xp: 100,
      completed: false,
      icon: Trophy
    },
    {
      id: 3,
      title: "Maintain Your Streak",
      description: "Login and learn every day",
      progress: 1,
      total: 1,
      xp: 30,
      completed: true,
      icon: Flame
    }
  ];

  return (
    <Card className="rounded-2xl glass-card">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Daily Challenges
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {challenges.map((challenge) => {
          const Icon = challenge.icon;
          const progressPercent = (challenge.progress / challenge.total) * 100;

          return (
            <div
              key={challenge.id}
              className={`p-3 rounded-xl border-2 transition-all ${
                challenge.completed
                  ? 'border-success bg-success/5'
                  : 'border-border bg-muted/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  challenge.completed
                    ? 'bg-success text-white'
                    : 'bg-primary/10 text-primary'
                }`}>
                  {challenge.completed ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{challenge.title}</h4>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      +{challenge.xp} XP
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {challenge.description}
                  </p>

                  {!challenge.completed && (
                    <div className="space-y-1">
                      <Progress value={progressPercent} className="h-1.5" />
                      <p className="text-xs text-muted-foreground">
                        {challenge.progress}/{challenge.total}
                      </p>
                    </div>
                  )}

                  {challenge.completed && (
                    <p className="text-xs text-success font-semibold">
                      ✓ Completed!
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
