import type { Component } from 'solid-js';
import { createToast } from '@/modules/ui/components/sonner';
import { Navigate } from '@solidjs/router';
import { onMount } from 'solid-js';

export const CheckoutCancelPage: Component = () => {
  onMount(() => {
    createToast({
      message: 'Payment canceled',
    });
  });

  return (
    <Navigate href="/" />
  );
};
