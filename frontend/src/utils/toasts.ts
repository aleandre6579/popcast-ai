import { toast } from 'sonner'
import { TriangleAlertIcon } from 'lucide-react'
import React from 'react'

export const fileUploadErrorToast = (error_message: string) => {
  toast.error(error_message, {})
}

export const fileUploadSuccessToast = () => {
  toast.success('Audio file uploaded!', {})
}
