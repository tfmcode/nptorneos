import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../api/userService";
import { User, UserInput } from "../../types/user";

// Estado inicial
const initialState = {
  users: [] as User[],
  loading: false,
  error: null as string | null,
};

// Async Thunks
export const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  const response = await getUsers();
  return response ?? []; // Si `response` es undefined, retorna un array vacío
});

export const createOrUpdateUser = createAsyncThunk(
  "users/createOrUpdateUser",
  async (userData: UserInput & { _id?: string }) => {
    if (userData._id) {
      return await updateUser(userData._id, userData);
    } else {
      return await createUser(userData);
    }
  }
);

export const removeUser = createAsyncThunk(
  "users/removeUser",
  async (id: string) => {
    await deleteUser(id);
    return id;
  }
);

// Slice de usuarios
const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload; // Siempre un array
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Error al obtener usuarios.";
      })
      .addCase(createOrUpdateUser.fulfilled, (state, action) => {
        const updatedUser = action.payload;

        if (!updatedUser || !updatedUser._id) return;

        const existingIndex = state.users.findIndex(
          (u) => u._id === updatedUser._id
        );

        if (existingIndex !== -1) {
          state.users[existingIndex] = updatedUser; // Actualiza usuario existente
        } else {
          state.users.push(updatedUser); // Agrega usuario nuevo
        }
      })
      .addCase(removeUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user._id !== action.payload);
      });
  },
});

export default userSlice.reducer;
