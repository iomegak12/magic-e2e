import { useCallback, useRef } from 'react';
import { useChatDispatch, useChatState, A } from '../store/chatStore.jsx';
import { chat, chatStream } from '../api/client.js';

/**
 * Provides sendMessage — branches automatically on streamingEnabled.
 * Handles dispatch of all chat-related actions.
 */
export function useChat() {
  const dispatch   = useChatDispatch();
  const { streamingEnabled } = useChatState();
  const abortRef   = useRef(null);

  const sendMessage = useCallback(async (sessionId, text) => {
    if (!sessionId || !text.trim()) return;

    // Cancel any in-flight stream
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    dispatch({ type: A.ADD_USER_MESSAGE, sessionId, content: text.trim() });
    dispatch({ type: A.CLEAR_ERROR });

    const payload = { session_id: sessionId, message: text.trim() };

    if (streamingEnabled) {
      const controller = new AbortController();
      abortRef.current  = controller;

      dispatch({ type: A.STREAM_START, sessionId });

      try {
        await chatStream(
          payload,
          (delta) => dispatch({ type: A.STREAM_DELTA, sessionId, delta }),
          controller.signal
        );
        dispatch({ type: A.STREAM_DONE });
      } catch (err) {
        if (err.name === 'AbortError') return; // user cancelled
        dispatch({ type: A.SET_ERROR, message: err.message });
      } finally {
        abortRef.current = null;
      }
    } else {
      dispatch({ type: A.SET_LOADING, value: true });
      try {
        const data = await chat(payload);
        dispatch({ type: A.RESPONSE_RECEIVED, sessionId, content: data.response });
      } catch (err) {
        dispatch({ type: A.SET_ERROR, message: err.message });
      }
    }
  }, [dispatch, streamingEnabled]);

  const cancelStream = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      dispatch({ type: A.STREAM_DONE });
    }
  }, [dispatch]);

  return { sendMessage, cancelStream };
}
