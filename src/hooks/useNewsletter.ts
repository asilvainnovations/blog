import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useNewsletter() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const subscribe = async (email: string, name?: string, preferences?: Record<string, unknown>) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Check if already subscribed
      const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('id, unsubscribed_at')
        .eq('email', email)
        .single();

      if (existing && !existing.unsubscribed_at) {
        setError('This email is already subscribed to our newsletter.');
        setIsLoading(false);
        return { error: 'Already subscribed' };
      }

      if (existing?.unsubscribed_at) {
        // Resubscribe
        const { error: updateError } = await supabase
          .from('newsletter_subscribers')
          .update({
            unsubscribed_at: null,
            name: name || null,
            preferences: preferences || {},
          })
          .eq('id', existing.id);

        if (updateError) throw updateError;
      } else {
        // New subscription
        const { error: insertError } = await supabase
          .from('newsletter_subscribers')
          .insert({
            email,
            name: name || null,
            preferences: preferences || {},
          });

        if (insertError) throw insertError;
      }

      setSuccess(true);
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to subscribe';
      setError(message);
      return { error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({ unsubscribed_at: new Date().toISOString() })
        .eq('email', email);

      if (updateError) throw updateError;

      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to unsubscribe';
      setError(message);
      return { error: message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    subscribe,
    unsubscribe,
    isLoading,
    error,
    success,
    reset: () => {
      setError(null);
      setSuccess(false);
    },
  };
}

export function useNewsletterSubscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscribers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .is('unsubscribed_at', null)
        .order('subscribed_at', { ascending: false });

      if (fetchError) throw fetchError;

      setSubscribers(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch subscribers';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    subscribers,
    isLoading,
    error,
    fetchSubscribers,
  };
}
