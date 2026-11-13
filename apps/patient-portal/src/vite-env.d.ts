/// <reference types="vite/client" />

import * as React from 'react';

// Bridge compatibility between React 18 and React 19 types across the monorepo
declare namespace React {
  interface DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_REACT_NODES {
    bigint: bigint;
  }
}

// Global module augmentation for React
declare module 'react' {
  interface DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_REACT_NODES {
    bigint: bigint;
  }

  type ReactHTML = {
    [K in keyof HTMLElementTagNameMap]: DetailedHTMLFactory<
      HTMLAttributes<HTMLElementTagNameMap[K]>,
      HTMLElementTagNameMap[K]
    >;
  };
}

// Augment @supabase/auth-js to give AuthClient type the GoTrueClient instance methods
declare module '@supabase/auth-js' {
  interface AuthClient extends GoTrueClient {}
}

// Augment @supabase/supabase-js to provide User and Session types
declare module '@supabase/supabase-js' {
  import type { User as AuthUser, Session as AuthSession } from '@supabase/auth-js';
  export type User = AuthUser;
  export type Session = AuthSession;
}

