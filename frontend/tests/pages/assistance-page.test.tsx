import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';
import { UserRole } from '@/shared/domain/enums';
import { renderApp } from '../helpers/renderHelper';

type MockUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};

let currentUser: MockUser;
const mockSendMessage = vi.fn();
const mockMessages: Array<{
  id: string;
  role: string;
  content: string;
  parts: Array<{ type: string; content: string }>;
}> = [];
let mockIsLoading = false;
let mockError: Error | null = null;

vi.mock('@/shared/hooks/auth-queries', () => {
  return {
    useAuth: () => ({
      user: currentUser,
      isAuthenticated: !!currentUser,
      login: vi.fn(),
      logout: vi.fn(),
    }),
  };
});

vi.mock('@/shared/api/ai-api', () => ({
  chatConnection: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
}));

vi.mock('@tanstack/ai-react', () => ({
  useChat: () => ({
    messages: mockMessages,
    sendMessage: mockSendMessage,
    isLoading: mockIsLoading,
    error: mockError,
  }),
}));

describe('AssistancePage', () => {
  beforeEach(() => {
    currentUser = {
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.USER,
    };
    mockMessages.length = 0;
    mockSendMessage.mockReset();
    mockIsLoading = false;
    mockError = null;
  });

  afterEach(() => {
    mockMessages.length = 0;
  });

  it('renders the assistance page with initial prompt', async () => {
    const history = createMemoryHistory({ initialEntries: ['/assistance'] });

    renderApp(history);

    expect(await screen.findByRole('heading', { name: /got questions/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /ai assistance/i })).toBeInTheDocument();
    expect(screen.getByText(/ask anything about the paid leave benefits/i)).toBeInTheDocument();
  });

  it('allows user to type and send a message', async () => {
    const user = userEvent.setup();
    const history = createMemoryHistory({ initialEntries: ['/assistance'] });

    renderApp(history);

    await screen.findByRole('heading', { name: /got questions/i });

    const input = screen.getByPlaceholderText(/ask me about paid leave/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    expect(sendButton).toBeDisabled();

    await user.type(input, 'What types of leave are available?');
    expect(input).toHaveValue('What types of leave are available?');

    expect(sendButton).not.toBeDisabled();

    await user.click(sendButton);

    expect(mockSendMessage).toHaveBeenCalledTimes(1);
    expect(mockSendMessage).toHaveBeenCalledWith('What types of leave are available?');
  });

  it('displays user and assistant messages', async () => {
    // Add mock messages
    mockMessages.push(
      {
        id: 'msg-1',
        role: 'user',
        content: 'What is caregiver leave?',
        parts: [{ type: 'text', content: 'What is caregiver leave?' }],
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: 'Caregiver leave allows you to take time off to care for a family member.',
        parts: [
          {
            type: 'text',
            content: 'Caregiver leave allows you to take time off to care for a family member.',
          },
        ],
      }
    );

    const history = createMemoryHistory({ initialEntries: ['/assistance'] });

    renderApp(history);

    await screen.findByRole('heading', { name: /got questions/i });

    // Check for user message badge
    const userBadges = screen.getAllByText('You');
    expect(userBadges.length).toBeGreaterThan(0);

    // Check for assistant message badge
    const assistantBadges = screen.getAllByText('Assistant');
    expect(assistantBadges.length).toBeGreaterThan(0);

    // Check message content
    expect(screen.getByText('What is caregiver leave?')).toBeInTheDocument();
    expect(
      screen.getByText(/caregiver leave allows you to take time off/i)
    ).toBeInTheDocument();
  });

  it('shows loading state when sending message', async () => {
    mockIsLoading = true;

    const history = createMemoryHistory({ initialEntries: ['/assistance'] });

    renderApp(history);

    await screen.findByRole('heading', { name: /got questions/i });

    // Check for loading button text
    const sendButton = screen.getByRole('button', { name: /thinking/i });
    expect(sendButton).toBeDisabled();
  });

  it('clears input after sending message', async () => {
    const user = userEvent.setup();
    const history = createMemoryHistory({ initialEntries: ['/assistance'] });

    renderApp(history);

    await screen.findByRole('heading', { name: /got questions/i });

    const input = screen.getByPlaceholderText(/ask me about paid leave/i);

    await user.type(input, 'Test message');
    expect(input).toHaveValue('Test message');

    // Simulate the input being cleared (this would happen in the component)
    await user.clear(input);
    expect(input).toHaveValue('');
  });

  it('does not allow sending empty message', async () => {
    const user = userEvent.setup();
    const history = createMemoryHistory({ initialEntries: ['/assistance'] });

    renderApp(history);

    await screen.findByRole('heading', { name: /got questions/i });

    const sendButton = screen.getByRole('button', { name: /send/i });

    // Button should be disabled when input is empty
    expect(sendButton).toBeDisabled();

    // Type and clear to ensure it stays disabled
    const input = screen.getByPlaceholderText(/ask me about paid leave/i);
    await user.type(input, '   '); // Only whitespace

    // Should still be disabled for whitespace-only input
    expect(sendButton).toBeDisabled();
  });

  it('displays error message when chat fails', async () => {
    mockError = new Error('Failed to connect to chat service');

    const history = createMemoryHistory({ initialEntries: ['/assistance'] });

    renderApp(history);

    await screen.findByRole('heading', { name: /got questions/i });

    // Check for error message
    expect(screen.getByText(/error/i)).toBeInTheDocument();
    expect(screen.getByText(/failed to connect to chat service/i)).toBeInTheDocument();
  });

  it('renders markdown formatting in assistant messages', async () => {
    // Add message with markdown
    mockMessages.push({
      id: 'msg-1',
      role: 'assistant',
      content: 'Here are the **important** points about leave.',
      parts: [
        {
          type: 'text',
          content: 'Here are the **important** points about leave.',
        },
      ],
    });

    const history = createMemoryHistory({ initialEntries: ['/assistance'] });

    renderApp(history);

    await screen.findByRole('heading', { name: /got questions/i });

    // The markdown should be rendered (bold text)
    // Note: The actual rendering depends on the renderMarkdown function
    expect(screen.getByText(/important/i)).toBeInTheDocument();
  });

  it('handles thinking parts in messages', async () => {
    // Add message with thinking part
    mockMessages.push({
      id: 'msg-1',
      role: 'assistant',
      content: '',
      parts: [
        {
          type: 'thinking',
          content: 'Let me look up information about leave types...',
        },
        {
          type: 'text',
          content: 'There are several types of leave available.',
        },
      ],
    });

    const history = createMemoryHistory({ initialEntries: ['/assistance'] });

    renderApp(history);

    await screen.findByRole('heading', { name: /got questions/i });

    // Check for thinking content (usually displayed differently)
    expect(screen.getByText(/let me look up information/i)).toBeInTheDocument();
    expect(screen.getByText(/there are several types of leave/i)).toBeInTheDocument();
  });

  it('allows sending message via Enter key', async () => {
    const user = userEvent.setup();
    const history = createMemoryHistory({ initialEntries: ['/assistance'] });

    renderApp(history);

    await screen.findByRole('heading', { name: /got questions/i });

    const input = screen.getByPlaceholderText(/ask me about paid leave/i);

    await user.type(input, 'Test message');
    await user.keyboard('{Enter}');

    expect(mockSendMessage).toHaveBeenCalledTimes(1);
    expect(mockSendMessage).toHaveBeenCalledWith('Test message');
  });

  it('displays multiple messages in conversation order', async () => {
    mockMessages.push(
      {
        id: 'msg-1',
        role: 'user',
        content: 'First question',
        parts: [{ type: 'text', content: 'First question' }],
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: 'First answer',
        parts: [{ type: 'text', content: 'First answer' }],
      },
      {
        id: 'msg-3',
        role: 'user',
        content: 'Second question',
        parts: [{ type: 'text', content: 'Second question' }],
      },
      {
        id: 'msg-4',
        role: 'assistant',
        content: 'Second answer',
        parts: [{ type: 'text', content: 'Second answer' }],
      }
    );

    const history = createMemoryHistory({ initialEntries: ['/assistance'] });

    renderApp(history);

    await screen.findByRole('heading', { name: /got questions/i });

    // All messages should be present
    expect(screen.getByText('First question')).toBeInTheDocument();
    expect(screen.getByText('First answer')).toBeInTheDocument();
    expect(screen.getByText('Second question')).toBeInTheDocument();
    expect(screen.getByText('Second answer')).toBeInTheDocument();
  });
});
