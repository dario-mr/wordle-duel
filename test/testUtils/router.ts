import { render } from '@testing-library/react';
import { createElement, type ReactElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

export function withMemoryRouter(
  routes: ReactElement,
  args?: {
    initialEntries?: string[];
  },
) {
  return createElement(
    MemoryRouter,
    { initialEntries: args?.initialEntries ?? ['/'] },
    createElement(Routes, null, routes),
  );
}

export function renderWithMemoryRouter(
  routes: ReactElement,
  args?: {
    initialEntries?: string[];
  },
) {
  return render(withMemoryRouter(routes, args));
}

export { Route };
