'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { DogReport, StatusUpdate } from '@/lib/types';
import type { DogStatus } from '@/lib/constants';

export function useReports() {
  const [reports, setReports] = useState<DogReport[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('dog_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch reports:', error);
    } else if (data) {
      setReports(data as DogReport[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchReports();

    // Realtime subscription
    const channel = supabase
      .channel('dog_reports_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dog_reports' },
        () => {
          fetchReports();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchReports]);

  const createReport = useCallback(
    async (report: {
      latitude: number;
      longitude: number;
      status: DogStatus;
      description?: string;
      photo_url?: string;
      dog_count?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('dog_reports')
        .insert({ ...report, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    [supabase]
  );

  const uploadPhoto = useCallback(
    async (file: File) => {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from('dog-photos')
        .upload(fileName, file);

      if (error) throw error;

      const { data } = supabase.storage
        .from('dog-photos')
        .getPublicUrl(fileName);

      return data.publicUrl;
    },
    [supabase]
  );

  return { reports, loading, fetchReports, createReport, uploadPhoto };
}

export function useStatusUpdates(reportId: string | null) {
  const [updates, setUpdates] = useState<StatusUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const fetchUpdates = useCallback(async () => {
    if (!reportId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('status_updates')
      .select('*')
      .eq('report_id', reportId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch updates:', error);
    } else if (data) {
      setUpdates(data as StatusUpdate[]);
    }
    setLoading(false);
  }, [supabase, reportId]);

  useEffect(() => {
    fetchUpdates();
  }, [fetchUpdates]);

  const addUpdate = useCallback(
    async (status: DogStatus, note?: string) => {
      if (!reportId) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('status_updates').insert({
        report_id: reportId,
        user_id: user.id,
        status,
        note,
      });

      if (error) throw error;

      // Also update the main report's status
      await supabase
        .from('dog_reports')
        .update({ status })
        .eq('id', reportId);

      fetchUpdates();
    },
    [supabase, reportId, fetchUpdates]
  );

  return { updates, loading, addUpdate, fetchUpdates };
}
