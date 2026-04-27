import { createClient } from '@/lib/supabase/server';
import AdoptGallery from '@/components/adopt/AdoptGallery';

export default async function AdoptPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('dog_reports')
    .select('*')
    .not('status', 'in', '("rescued")')
    .order('created_at', { ascending: false });

  return <AdoptGallery reports={data ?? []} />;
}
