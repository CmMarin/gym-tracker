import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import WorkoutSelector from '@/components/WorkoutSelector';

export default async function WorkoutPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const workoutPlansRaw = await prisma.workoutPlan.findMany({
    where: { userId: session.user.id },
    include: { planExercises: { include: { exercise: true } } },
    orderBy: { dayOfWeek: 'asc' }
  });

  const workoutPlans = workoutPlansRaw.map(p => ({
    id: p.id,
    name: p.name,
    dayOfWeek: p.dayOfWeek,
    exercises: p.planExercises.map(px => ({
       id: px.exercise.id,
       name: px.exercise.name,
       targetSets: px.targetSets,
       targetReps: px.targetReps
    }))
  }));

  const activeWorkout = await prisma.activeWorkout.findUnique({
    where: { userId: session.user.id }
  });

  return (
    <WorkoutSelector plans={workoutPlans} existingActiveWorkout={activeWorkout} />
  );
}
