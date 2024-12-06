import { RoutePath } from '@/routes/RoutesProvider'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface RouterState {
  routePath: RoutePath
}

const initialState: RouterState = {
  routePath: '/',
}

const routerSlice = createSlice({
  name: 'router',
  initialState,
  reducers: {
    setRoutePath: (state, action: PayloadAction<RoutePath>) => {
      state.routePath = action.payload
    },
  },
})

export const { setRoutePath } = routerSlice.actions

export default routerSlice.reducer
