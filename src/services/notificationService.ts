// Serviço de Notificações - SMS e Push
// Importação dinâmica do Twilio para evitar erros no build
type TwilioInstance = any;

interface NotificationConfig {
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
}

interface SMSMessage {
  to: string;
  message: string;
  userId: number;
  userName: string;
}

interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  method: 'sms' | 'push' | 'email';
}

class NotificationService {
  private twilio?: TwilioInstance;
  private config: NotificationConfig;

  constructor() {
    this.config = {
      twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
      twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
      twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
    };

    // Inicializar Twilio se as credenciais estiverem disponíveis
    if (this.config.twilioAccountSid && this.config.twilioAuthToken) {
      try {
        const Twilio = require('twilio');
        this.twilio = new Twilio(this.config.twilioAccountSid, this.config.twilioAuthToken);
      } catch (error) {
        console.warn('Twilio não pôde ser inicializado:', error);
        this.twilio = undefined;
      }
    }
  }

  // Enviar lembrete de palpite via SMS
  async sendBettingReminder(phoneNumber: string, userName: string, grandPrixName: string, deadline: Date): Promise<NotificationResult> {
    const message = this.createBettingReminderMessage(userName, grandPrixName, deadline);
    
    return await this.sendSMS({
      to: phoneNumber,
      message,
      userId: 0, // Será preenchido pelo caller
      userName
    });
  }

  // Enviar SMS genérico
  async sendSMS(smsData: SMSMessage): Promise<NotificationResult> {
    if (!this.twilio || !this.config.twilioPhoneNumber) {
      console.warn('⚠️ Twilio não configurado, SMS não enviado');
      return {
        success: false,
        error: 'Twilio não configurado',
        method: 'sms'
      };
    }

    try {
      // Formatar número brasileiro
      const formattedNumber = this.formatBrazilianPhoneNumber(smsData.to);
      
      console.log(`📱 Enviando SMS para ${formattedNumber}: ${smsData.message.substring(0, 50)}...`);

      const message = await this.twilio.messages.create({
        body: smsData.message,
        from: this.config.twilioPhoneNumber,
        to: formattedNumber
      });

      console.log(`✅ SMS enviado com sucesso! ID: ${message.sid}`);

      return {
        success: true,
        messageId: message.sid,
        method: 'sms'
      };

    } catch (error: any) {
      console.error('❌ Erro ao enviar SMS:', error.message);
      
      return {
        success: false,
        error: error.message,
        method: 'sms'
      };
    }
  }

  // Criar mensagem de lembrete de palpite
  private createBettingReminderMessage(userName: string, grandPrixName: string, deadline: Date): string {
    const deadlineStr = deadline.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `🏎️ Olá ${userName}! Lembrete: O prazo para fazer seus palpites do ${grandPrixName} termina em ${deadlineStr}. Acesse o app e faça seus palpites! 🏁`;
  }

  // Formatar número de telefone brasileiro para padrão internacional
  private formatBrazilianPhoneNumber(phoneNumber: string): string {
    // Remover caracteres não numéricos
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Se já tem código do país (+55), retornar como está
    if (cleanNumber.startsWith('55') && cleanNumber.length === 13) {
      return `+${cleanNumber}`;
    }
    
    // Se tem 11 dígitos (DDD + número), adicionar +55
    if (cleanNumber.length === 11) {
      return `+55${cleanNumber}`;
    }
    
    // Se tem 10 dígitos (DDD + número sem 9), adicionar 9 e +55
    if (cleanNumber.length === 10) {
      const ddd = cleanNumber.substring(0, 2);
      const number = cleanNumber.substring(2);
      return `+55${ddd}9${number}`;
    }
    
    // Retornar como está se não conseguir formatar
    return phoneNumber;
  }

  // Enviar notificação push (fallback para SMS)
  async sendPushNotification(userId: number, title: string, body: string): Promise<NotificationResult> {
    try {
      // Aqui você integraria com Firebase Cloud Messaging ou similar
      console.log(`🔔 Push notification para usuário ${userId}: ${title}`);
      
      // Por enquanto, apenas log (implementar FCM depois)
      return {
        success: true,
        messageId: `push_${Date.now()}`,
        method: 'push'
      };
      
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        method: 'push'
      };
    }
  }

  // Verificar se SMS está disponível
  isSMSAvailable(): boolean {
    return !!(this.twilio && this.config.twilioPhoneNumber);
  }

  // Enviar lembrete com fallback (SMS -> Push -> Email)
  async sendReminderWithFallback(
    phoneNumber: string | null,
    userId: number,
    userName: string,
    email: string,
    grandPrixName: string,
    deadline: Date
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    // Tentar SMS primeiro
    if (phoneNumber && this.isSMSAvailable()) {
      const smsResult = await this.sendBettingReminder(phoneNumber, userName, grandPrixName, deadline);
      results.push(smsResult);
      
      if (smsResult.success) {
        return results; // SMS enviado com sucesso, não precisa de fallback
      }
    }

    // Fallback 1: Push notification
    const pushResult = await this.sendPushNotification(
      userId,
      `Palpites ${grandPrixName}`,
      `Prazo termina em ${deadline.toLocaleDateString('pt-BR')}`
    );
    results.push(pushResult);

    // Fallback 2: Email (implementar depois se necessário)
    // const emailResult = await this.sendEmailReminder(email, userName, grandPrixName, deadline);
    // results.push(emailResult);

    return results;
  }
}

export const notificationService = new NotificationService();
export type { NotificationResult, SMSMessage };