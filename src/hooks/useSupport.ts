import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supportApi } from '../services/api/support.api';
import type {
  TicketStatus,
  TicketPriority,
  CreateTicketRequest,
  SendReplyRequest,
} from '../types/support.types';
import { useToast } from '../context/ToastContext';
import { ErrorHandler } from '../services/handlers/errorHandler';
import { CACHE_KEYS } from '../constants/cache.keys';

export interface TicketFilterParams {
  status?: string;
  category?: string;
  search?: string;
}

export const useTickets = (filters?: TicketFilterParams) => {
  return useQuery({
    queryKey: CACHE_KEYS.support.list(filters),
    queryFn: () => supportApi.getTickets(filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const useTicketDetails = (ticketId?: string | number) => {
  return useQuery({
    queryKey: CACHE_KEYS.support.detail(ticketId || ''),
    queryFn: () => supportApi.getTicketById(ticketId!),
    enabled: !!ticketId,
    staleTime: 1 * 60 * 1000,
  });
};

export const useTicketMessages = (ticketId?: string | number) => {
  return useQuery({
    queryKey: CACHE_KEYS.support.messages(ticketId || ''),
    queryFn: () => supportApi.getTicketMessages(ticketId!),
    enabled: !!ticketId,
    staleTime: 30 * 1000,
  });
};

export const useSendTicketReply = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({
      ticketId,
      payload,
    }: {
      ticketId: string | number;
      payload: SendReplyRequest;
    }) => supportApi.sendTicketReply(ticketId, payload),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.support.all });
      addToast({
        type: 'success',
        title: 'Response Dispatched',
        description: variables.payload.isInternalNote
          ? 'Internal staff note added to ticket history.'
          : 'Support response sent to user.',
      });
    },

    onError: (error: unknown) => {
      const appErr = ErrorHandler.handle(error);
      addToast({
        type: 'error',
        title: 'Failed to Send Response',
        description: appErr.message,
      });
    },
  });
};

export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ticketId,
      status,
      priority,
      assignedTo,
    }: {
      ticketId: string | number;
      status?: TicketStatus;
      priority?: TicketPriority;
      assignedTo?: string;
    }) => supportApi.updateTicketStatus(ticketId, status, priority, assignedTo),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.support.all });
    },
  });
};

export const useCreateSupportTicket = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateTicketRequest) => supportApi.createTicket(payload),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.support.all });
      addToast({
        type: 'success',
        title: 'Ticket Created',
        description: `Support Ticket ${data.ticketNumber} logged successfully.`,
      });
    },

    onError: (error: unknown) => {
      const appErr = ErrorHandler.handle(error);
      addToast({
        type: 'error',
        title: 'Ticket Creation Failed',
        description: appErr.message,
      });
    },
  });
};
