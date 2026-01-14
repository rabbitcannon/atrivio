'use client';

import { TourPrompt, type TourStep } from '@/components/features/demo-tour';

const DASHBOARD_TOUR_STEPS: TourStep[] = [
  {
    id: 'stats',
    title: 'Organization Overview',
    description:
      'See your key metrics at a glance - attractions, team members, staff, and revenue all in one place.',
    targetId: 'dashboard-stats',
  },
  {
    id: 'activity',
    title: 'Recent Activity',
    description:
      'Track what\'s happening in real-time. See new orders, check-ins, and staff activity as it happens.',
    targetId: 'dashboard-activity',
  },
  {
    id: 'quick-actions',
    title: 'Quick Actions',
    description:
      'Quickly access common tasks like adding attractions, inviting team members, or managing staff.',
    targetId: 'dashboard-quick-actions',
  },
  {
    id: 'time-clock',
    title: 'Time Clock',
    description:
      'Your team can clock in and out right from the dashboard. Track hours worked and manage attendance.',
    targetId: 'dashboard-time-clock',
  },
];

export function DashboardTourPrompt() {
  return <TourPrompt steps={DASHBOARD_TOUR_STEPS} pageName="the dashboard" />;
}

export { DASHBOARD_TOUR_STEPS };
