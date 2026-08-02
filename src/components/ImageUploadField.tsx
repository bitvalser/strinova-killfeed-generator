import { useRef } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

interface ImageUploadFieldProps {
  label: string
  value: string | null
  onChange: (objectUrl: string | null) => void
}

const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif'

export default function ImageUploadField({
  label,
  value,
  onChange,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return
    if (value?.startsWith('blob:')) {
      URL.revokeObjectURL(value)
    }
    onChange(URL.createObjectURL(file))
  }

  const clear = () => {
    if (value?.startsWith('blob:')) {
      URL.revokeObjectURL(value)
    }
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
        {value ? ' (custom active)' : ''}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => inputRef.current?.click()}
        >
          Upload
        </Button>
        {value && (
          <>
            <Box
              component="img"
              src={value}
              alt="Custom preview"
              sx={{
                width: 28,
                height: 28,
                objectFit: 'contain',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 0.5,
                backgroundColor: 'action.hover',
              }}
            />
            <Button size="small" color="inherit" onClick={clear}>
              Clear
            </Button>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          hidden
          onChange={(e) => {
            handleFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </Box>
    </Box>
  )
}
