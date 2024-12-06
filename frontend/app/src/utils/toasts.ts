import { toast } from 'sonner'

export const fileUploadErrorToast = (error_message: string) => {
  toast.error(error_message, {})
}

export const fileUploadSuccessToast = () => {
  toast.success('Audio file uploaded!', {})
}
