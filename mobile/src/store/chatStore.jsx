import React, { createContext, useCallback, useContext, useReducer } from 'react';

// ── Action types ─────────────────────────────────────────────────────────────
export const A = {
  ADD_SESSION:       'ADD_SESSION',
  SET_ACTIVE:        'SET_ACTIVE',
  LOAD_HISTORY:      'LOAD_HISTORY',
  ADD_USER_MESSAGE:  'ADD_USER_MESSAGE',
  SET_LOADING:       'SET_LOADING',
  STREAM_START:      'STREAM_START',
  STREAM_DELTA:      'STREAM_DELTA',
  STREAM_DONE:       'STREAM_DONE',
  RESPONSE_RECEIVED: 'RESPONSE_RECEIVED',
  SET_AGENT_INFO:    'SET_AGENT_INFO',
  SET_ERROR:         'SET_ERROR',
  CLEAR_ERROR:       'CLEAR_ERROR',
  TOGGLE_STREAMING:  'TOGGLE_STREAMING',
  REMOVE_SESSION:    'REMOVE_SESSION',
};

const initialState = {
  sessions:         [],
  activeSessionId:  null,
  loading:          false,
  streamState:      false,   // false | 'streaming' | 'done'
  streamingEnabled: true,
  agentInfo:        null,
  error:            null,
};

function reducer(state, action) {
  switch (action.type) {
    case A.ADD_SESSION: {
      // Don't duplicate if already present (restore from AsyncStorage)
      if (state.sessions.find(s => s.id === action.sessionId)) {
        return { ...state, activeSessionId: action.sessionId };
      }
      const session = { id: action.sessionId, messages: [], loading: false };
      return {
        ...state,
        sessions: [session, ...state.sessions],
        activeSessionId: action.sessionId,
        error: null,
      };
    }

    case A.SET_ACTIVE:
      return { ...state, activeSessionId: action.sessionId, error: null };

    case A.LOAD_HISTORY:
      return {
        ...state,
        sessions: state.sessions.map(s =>
          s.id === action.sessionId ? { ...s, messages: action.messages } : s
        ),
      };

    case A.ADD_USER_MESSAGE: {
      const msg = { role: 'user', content: action.content, created_at: new Date().toISOString() };
      return {
        ...state,
        sessions: state.sessions.map(s =>
          s.id === action.sessionId ? { ...s, messages: [...s.messages, msg] } : s
        ),
      };
    }

    case A.SET_LOADING:
      return { ...state, loading: action.value };

    case A.STREAM_START: {
      const placeholder = { role: 'assistant', content: '', created_at: new Date().toISOString() };
      return {
        ...state,
        loading: true,
        streamState: 'streaming',
        sessions: state.sessions.map(s =>
          s.id === action.sessionId ? { ...s, messages: [...s.messages, placeholder] } : s
        ),
      };
    }

    case A.STREAM_DELTA:
      return {
        ...state,
        sessions: state.sessions.map(s => {
          if (s.id !== action.sessionId) return s;
          const msgs = [...s.messages];
          const last = msgs[msgs.length - 1];
          msgs[msgs.length - 1] = { ...last, content: last.content + action.delta };
          return { ...s, messages: msgs };
        }),
      };

    case A.STREAM_DONE:
      return { ...state, loading: false, streamState: 'done' };

    case A.RESPONSE_RECEIVED: {
      const msg = { role: 'assistant', content: action.content, created_at: new Date().toISOString() };
      return {
        ...state,
        loading: false,
        sessions: state.sessions.map(s =>
          s.id === action.sessionId ? { ...s, messages: [...s.messages, msg] } : s
        ),
      };
    }

    case A.SET_AGENT_INFO:
      return { ...state, agentInfo: action.info };

    case A.SET_ERROR:
      return { ...state, error: action.message, loading: false, streamState: false };

    case A.CLEAR_ERROR:
      return { ...state, error: null };

    case A.TOGGLE_STREAMING:
      return { ...state, streamingEnabled: !state.streamingEnabled };

    case A.REMOVE_SESSION:
      return {
        ...state,
        sessions: state.sessions.filter(s => s.id !== action.sessionId),
        activeSessionId:
          state.activeSessionId === action.sessionId
            ? (state.sessions.find(s => s.id !== action.sessionId)?.id ?? null)
            : state.activeSessionId,
      };

    default:
      return state;
  }
}

const ChatStateContext    = createContext(null);
const ChatDispatchContext  = createContext(null);

export function ChatStoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <ChatStateContext.Provider value={state}>
      <ChatDispatchContext.Provider value={dispatch}>
        {children}
      </ChatDispatchContext.Provider>
    </ChatStateContext.Provider>
  );
}

export function useChatState()    { return useContext(ChatStateContext); }
export function useChatDispatch() { return useContext(ChatDispatchContext); }

/** Returns the active session object or null */
export function useActiveSession() {
  const { sessions, activeSessionId } = useChatState();
  return sessions.find(s => s.id === activeSessionId) ?? null;
}
