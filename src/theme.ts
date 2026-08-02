import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a6bb5',
    },
    background: {
      default: '#e8eef4',
      paper: '#f7f9fc',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
  },
  shape: {
    borderRadius: 6,
  },
})

export default theme
