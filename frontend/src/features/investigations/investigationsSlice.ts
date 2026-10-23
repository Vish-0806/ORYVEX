import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { InvestigationListItem } from "../../types/rca";

interface InvestigationsState {
  items: InvestigationListItem[];
  isLoading: boolean;
  error: string | null;
  isDrawerOpen: boolean;
  searchQuery: string;
  statusFilter: string;
}

const initialState: InvestigationsState = {
  items: [],
  isLoading: false,
  error: null,
  isDrawerOpen: false,
  searchQuery: "",
  statusFilter: "",
};

export const investigationsSlice = createSlice({
  name: "investigations",
  initialState,
  reducers: {
    setDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.isDrawerOpen = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
    },
    setItems: (state, action: PayloadAction<InvestigationListItem[]>) => {
      state.items = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (action.payload) state.error = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setDrawerOpen,
  setSearchQuery,
  setStatusFilter,
  setItems,
  setLoading,
  setError,
} = investigationsSlice.actions;

export default investigationsSlice.reducer;
