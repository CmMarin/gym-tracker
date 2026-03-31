import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ActiveWorkout from '@/components/ActiveWorkout';

// Mock the dependencies and actions
jest.mock('@/app/actions/active-workout-actions', () => ({
  updateWorkoutState: jest.fn().mockResolvedValue({}),
  cancelActiveWorkout: jest.fn().mockResolvedValue({}),
}));

jest.mock('@/app/actions/coop-actions', () => ({
  updateCoopStatus: jest.fn().mockResolvedValue({}),
}));

jest.mock('@/app/actions/workout-actions', () => ({
  finishWorkoutAction: jest.fn().mockResolvedValue({
    xpEarned: 165,
    prs: ['Squat']
  }),
}));

jest.mock('@/hooks/useAppSounds', () => ({
  useAppSounds: () => ({
    playBuzzer: jest.fn(),
    playDing: jest.fn(),
    playPop: jest.fn(),
  })
}));

const mockInitialState = {
  currentExerciseIndex: 0,
  exercises: [
    {
      id: 'ex-1',
      name: 'Squat',
      targetSets: 2,
      targetReps: 10,
      sets: [
        { completed: false, weight: '', reps: '', isWarmup: false },
        { completed: false, weight: '', reps: '', isWarmup: false }
      ]
    },
    {
      id: 'ex-2',
      name: 'Bench Press',
      targetSets: 1,
      targetReps: 10,
      sets: [
        { completed: false, weight: '', reps: '', isWarmup: false }
      ]
    }
  ]
};

describe('ActiveWorkout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the workout cleanly initially', () => {
    render(<ActiveWorkout planName="Leg Day" initialState={mockInitialState} />);
    
    expect(screen.getByText('Leg Day')).toBeTruthy();
    expect(screen.getByText('Squat')).toBeTruthy();
    expect(screen.getByText('Set 1 of 2')).toBeTruthy();
    
    // Check if the input fields exist
    expect(screen.getByPlaceholderText('0')).toBeTruthy(); // Weight input
    expect(screen.getByPlaceholderText('10')).toBeTruthy(); // Reps input (targetReps)
  });

  it('handles filling inputs and completing a set, then showing the rest timer', async () => {
    const user = userEvent.setup();
    render(<ActiveWorkout planName="Leg Day" initialState={mockInitialState} />);

    // Type weight and reps
    const weightInput = screen.getByPlaceholderText('0');
    const repsInput = screen.getByPlaceholderText('10');
    
    await user.type(weightInput, '100');
    await user.type(repsInput, '8');

    // Click Complete Set button
    const completeButton = screen.getByText('COMPLETE SET');
    await user.click(completeButton);

    // The rest timer should appear
    expect(await screen.findByText('Rest Timer')).toBeTruthy();
    expect(screen.getByText('1:30')).toBeTruthy(); // Default non-warmup is 90s
  });

  it('shows plate calculator correctly', async () => {
    const user = userEvent.setup();
    render(<ActiveWorkout planName="Leg Day" initialState={mockInitialState} />);

    const weightInput = screen.getByPlaceholderText('0');
    await user.type(weightInput, '100'); // 100kg total

    // Click the calculator icon
    const calcButton = screen.getByTitle('Calculate Plates');
    await user.click(calcButton);

    // 100 - 20 (bar) = 80kg remaining -> 40kg per side -> 1x25kg + 1x15kg
    // Based on the code `[25, 20, 15, 10, 5, 2.5, 1.25]`, 40kg = 1x25 + 1x15
    await waitFor(() => {
      expect(screen.getByText('1x25kg, 1x15kg')).toBeTruthy();
    });
  });

  it('can mark set as warmup and changes the rest timer delay', async () => {
    const user = userEvent.setup();
    render(<ActiveWorkout planName="Leg Day" initialState={mockInitialState} />);

    const weightInput = screen.getByPlaceholderText('0');
    const repsInput = screen.getByPlaceholderText('10');
    
    await user.type(weightInput, '60');
    await user.type(repsInput, '10');

    // Click warmup toggle
    const warmupBtn = screen.getByText('Mark as Warm-up');
    await user.click(warmupBtn);

    const completeButton = screen.getByText('COMPLETE SET');
    await user.click(completeButton);

    // Because it's a warmup, timer should be 30 seconds (0:30)
    expect(await screen.findByText('Rest Timer')).toBeTruthy();
    expect(screen.getByText('0:30')).toBeTruthy();
  });
});
