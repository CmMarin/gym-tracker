import { prisma } from './src/lib/prisma';
async function run() {
  const plans = await prisma.workoutPlan.findMany({
    where: { userId: 'cmniuyrlq000009l15c2zv6wm' },
    include: {
      planExercises: {
        include: { exercise: true, customExercise: true }
      }
    }
  });
  console.log(JSON.stringify(plans.map(p => ({
    name: p.name,
    exercises: p.planExercises.map(px => ({
      id: px.id,
      exerciseId: px.exerciseId,
      customExerciseId: px.customExerciseId,
      exercise: px.exercise,
      customExercise: px.customExercise,
      sets: px.targetSets,
      reps: px.targetReps
    }))
  })), null, 2));
}
run().finally(() => prisma.$disconnect());
