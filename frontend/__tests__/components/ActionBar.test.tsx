import { render, screen, fireEvent } from '@testing-library/react';
import ActionBar from '@/components/ActionBar';

describe('ActionBar', () => {
  it('renders Edit button', () => {
    render(<ActionBar onEdit={jest.fn()} onDownload={jest.fn()} />);
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('renders Download button', () => {
    render(<ActionBar onEdit={jest.fn()} onDownload={jest.fn()} />);
    expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();
  });

  it('calls onEdit when Edit button is clicked', () => {
    const onEdit = jest.fn();
    render(<ActionBar onEdit={onEdit} onDownload={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onDownload when Download button is clicked', () => {
    const onDownload = jest.fn();
    render(<ActionBar onEdit={jest.fn()} onDownload={onDownload} />);
    fireEvent.click(screen.getByRole('button', { name: /download/i }));
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  it('does not call onEdit when Download is clicked', () => {
    const onEdit = jest.fn();
    render(<ActionBar onEdit={onEdit} onDownload={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /download/i }));
    expect(onEdit).not.toHaveBeenCalled();
  });
});
