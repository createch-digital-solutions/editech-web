'use client';

import { useQuery } from '@tanstack/react-query';
import { enrolmentsApi } from '@/lib/enrolments-api';
import { queryKeys } from '@/lib/query-keys';

/** The learner's courses (GET /learner/enrolments, newest first), shared by the dashboard, profile and menu. */
export function useMyEnrolments({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({ queryKey: queryKeys.enrolments.mine(), queryFn: enrolmentsApi.mine, staleTime: 60 * 1000, enabled });
}
