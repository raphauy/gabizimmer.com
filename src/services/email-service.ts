import { Resend } from 'resend'
import { z } from 'zod'
import OtpEmail from '@/components/emails/otp-email'

// Inicializar Resend
const resend = new Resend(process.env.RESEND_API_KEY)

// Esquemas de validación para OTP
export const sendOtpEmailSchema = z.object({
  to: z.string().email("Email inválido"),
  otp: z.string().min(6, "OTP debe tener al menos 6 caracteres"),
})

export type SendOtpEmailInput = z.infer<typeof sendOtpEmailSchema>

/**
 * Envía un email con el código OTP
 */
export async function sendOtpEmail(input: SendOtpEmailInput) {
  try {
    const validatedInput = sendOtpEmailSchema.parse(input)
    
    // En modo desarrollo, solo loguear el OTP en consola
    const isDevelopment = process.env.VERCEL_ENV === 'development'

    if (isDevelopment) {
      console.log('🔐 DESARROLLO - Código OTP:', {
        email: validatedInput.to,
        otp: validatedInput.otp,
        mensaje: 'En desarrollo no se envía email, usa este código para login'
      })
      
      return { 
        success: true, 
        data: { 
          emailId: 'dev-mode',
          message: "Código OTP logueado en consola (modo desarrollo)" 
        } 
      }
    }
    
    const appName = process.env.APP_NAME || "gabizimmer.com"
    const fromEmail = process.env.RESEND_FROM_EMAIL || "notifications@raphauy.dev"
    
    const { data, error } = await resend.emails.send({
      from: `${appName} <${fromEmail}>`,
      to: [validatedInput.to],
      subject: `Tu código de verificación de ${appName}`,
      react: OtpEmail({
        otp: validatedInput.otp,
        appName
      }),
    })
    
    if (error) {
      console.error('Error sending OTP email:', error)
      return { 
        success: false, 
        error: `Error al enviar el email: ${error.message}` 
      }
    }
    
    return { 
      success: true, 
      data: { 
        emailId: data?.id,
        message: "Email OTP enviado correctamente" 
      } 
    }
    
  } catch (error: unknown) {
    console.error('Error sending OTP email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al enviar el email OTP' 
    }
  }
}