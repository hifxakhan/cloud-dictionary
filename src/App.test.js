import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Cloud Dictionary title', () => {
  render(<App />);
  const titleElement = screen.getByText(/cloud dictionary/i);
  expect(titleElement).toBeInTheDocument();
});
