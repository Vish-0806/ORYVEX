import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CopilotMessage } from "../../types/rca";

interface CopilotState {
  messages: CopilotMessage[];
  inputTab: "pdf" | "text";
  pastedText: string;
  selectedFileName: string | null;
  isProcessing: boolean;
  processingStep: string | null;
  isChatLoading: boolean;
  error: string | null;
}

const initialMessages: CopilotMessage[] = [
  {
    id: "welcome-1",
    role: "assistant",
    content: 
      "Welcome to **ORYVEX Copilot**. I assist pharmaceutical quality units with evidence-grounded Root Cause Analysis (ICH Q9 / FDA 21 CFR Part 211).\n\n" +
      "**Getting Started:**\n" +
      "1. Upload an Out-of-Specification (OOS) report, deviation notice, or paste incident narrative.\n" +
      "2. I will extract structured fields, identify evidence gaps, and populate the RCA form.\n" +
      "3. You can review, command field corrections in chat, and trigger structured 5 Whys & CAPA recommendations.",
    timestamp: new Date().toISOString(),
    suggested_actions: [
      "Load Fictional Impurity Incident",
      "Which evidence is currently missing?",
      "Generate 5 Whys & Root Cause Hypotheses",
    ],
  },
];

const initialState: CopilotState = {
  messages: initialMessages,
  inputTab: "text",
  pastedText: "",
  selectedFileName: null,
  isProcessing: false,
  processingStep: null,
  isChatLoading: false,
  error: null,
};

export const copilotSlice = createSlice({
  name: "copilot",
  initialState,
  reducers: {
    setInputTab: (state, action: PayloadAction<"pdf" | "text">) => {
      state.inputTab = action.payload;
    },
    setPastedText: (state, action: PayloadAction<string>) => {
      state.pastedText = action.payload;
    },
    setSelectedFileName: (state, action: PayloadAction<string | null>) => {
      state.selectedFileName = action.payload;
    },
    setProcessing: (state, action: PayloadAction<{ isProcessing: boolean; step?: string }>) => {
      state.isProcessing = action.payload.isProcessing;
      state.processingStep = action.payload.step || null;
      if (action.payload.isProcessing) state.error = null;
    },
    setChatLoading: (state, action: PayloadAction<boolean>) => {
      state.isChatLoading = action.payload;
    },
    addMessage: (state, action: PayloadAction<CopilotMessage>) => {
      state.messages.push(action.payload);
      state.error = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isProcessing = false;
      state.isChatLoading = false;
    },
    clearMessages: (state) => {
      state.messages = initialMessages;
    },
  },
});

export const {
  setInputTab,
  setPastedText,
  setSelectedFileName,
  setProcessing,
  setChatLoading,
  addMessage,
  setError,
  clearMessages,
} = copilotSlice.actions;

export default copilotSlice.reducer;
