// Serviço de Email - Resend + Nodemailer
// import { Resend } from 'resend'; // Será instalado depois
// import nodemailer from 'nodemailer'; // Será instalado depois

interface EmailConfig {
  resendApiKey?: string;
  gmailUser?: string;
  gmailPassword?: string;
  fromEmail: string;
  fromName: string;
}

interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: 'resend' | 'gmail' | 'none';
}

interface BettingGuess {
  position: number;
  pilotName: string;
  pilotCode: string;
  teamName?: string;
}

class EmailService {
  private config: EmailConfig;
  // private resend?: Resend;
  // private gmailTransporter?: nodemailer.Transporter;

  constructor() {
    this.config = {
      resendApiKey: process.env.RESEND_API_KEY,
      gmailUser: process.env.GMAIL_USER,
      gmailPassword: process.env.GMAIL_APP_PASSWORD, // App Password, não senha normal
      fromEmail: process.env.FROM_EMAIL || 'noreply@palpitef1.com',
      fromName: process.env.FROM_NAME || 'Palpite F1'
    };

    this.initializeProviders();
  }

  private initializeProviders() {
    // Inicializar Resend se disponível
    // if (this.config.resendApiKey) {
    //   this.resend = new Resend(this.config.resendApiKey);
    // }

    // Inicializar Gmail SMTP se disponível
    // if (this.config.gmailUser && this.config.gmailPassword) {
    //   this.gmailTransporter = nodemailer.createTransporter({
    //     service: 'gmail',
    //     auth: {
    //       user: this.config.gmailUser,
    //       pass: this.config.gmailPassword
    //     }
    //   });
    // }
  }

  // Enviar lembrete de palpite
  async sendBettingReminder(
    email: string,
    userName: string,
    grandPrixName: string,
    deadline: Date
  ): Promise<EmailResult> {
    const subject = `🏎️ Lembrete: Palpites ${grandPrixName}`;
    const html = this.createBettingReminderHTML(userName, grandPrixName, deadline);
    const text = this.createBettingReminderText(userName, grandPrixName, deadline);

    return await this.sendEmail({
      to: email,
      subject,
      html,
      text
    });
  }

  // Enviar confirmação de palpite
  async sendBettingConfirmation(
    email: string,
    userName: string,
    grandPrixName: string,
    qualifyingGuesses: BettingGuess[],
    raceGuesses: BettingGuess[],
    submissionDate: Date
  ): Promise<EmailResult> {
    const subject = `✅ Confirmação: Palpites ${grandPrixName}`;
    const html = this.createBettingConfirmationHTML(userName, grandPrixName, qualifyingGuesses, raceGuesses, submissionDate);
    const text = this.createBettingConfirmationText(userName, grandPrixName, qualifyingGuesses, raceGuesses, submissionDate);

    return await this.sendEmail({
      to: email,
      subject,
      html,
      text
    });
  }

  // Enviar email genérico
  async sendEmail(emailData: EmailMessage): Promise<EmailResult> {
    // Tentar Resend primeiro
    if (this.config.resendApiKey) {
      const resendResult = await this.sendViaResend(emailData);
      if (resendResult.success) {
        return resendResult;
      }
      console.warn('⚠️ Resend falhou, tentando Gmail...', resendResult.error);
    }

    // Fallback para Gmail
    if (this.config.gmailUser && this.config.gmailPassword) {
      const gmailResult = await this.sendViaGmail(emailData);
      if (gmailResult.success) {
        return gmailResult;
      }
      console.warn('⚠️ Gmail falhou...', gmailResult.error);
    }

    return {
      success: false,
      error: 'Nenhum provedor de email configurado',
      provider: 'none'
    };
  }

  // Enviar via Resend
  private async sendViaResend(emailData: EmailMessage): Promise<EmailResult> {
    try {
      console.log(`📧 Enviando email via Resend para ${emailData.to}: ${emailData.subject}`);

      // Simulação (implementar quando instalar Resend)
      // const data = await this.resend!.emails.send({
      //   from: `${this.config.fromName} <${this.config.fromEmail}>`,
      //   to: [emailData.to],
      //   subject: emailData.subject,
      //   html: emailData.html,
      //   text: emailData.text
      // });

      // Por enquanto, apenas log
      console.log('✅ Email enviado via Resend (simulado)');

      return {
        success: true,
        messageId: `resend_${Date.now()}`,
        provider: 'resend'
      };

    } catch (error: any) {
      console.error('❌ Erro ao enviar via Resend:', error.message);
      return {
        success: false,
        error: error.message,
        provider: 'resend'
      };
    }
  }

  // Enviar via Gmail SMTP
  private async sendViaGmail(emailData: EmailMessage): Promise<EmailResult> {
    try {
      console.log(`📧 Enviando email via Gmail para ${emailData.to}: ${emailData.subject}`);

      // Simulação (implementar quando instalar nodemailer)
      // const info = await this.gmailTransporter!.sendMail({
      //   from: `${this.config.fromName} <${this.config.fromEmail}>`,
      //   to: emailData.to,
      //   subject: emailData.subject,
      //   html: emailData.html,
      //   text: emailData.text
      // });

      // Por enquanto, apenas log
      console.log('✅ Email enviado via Gmail (simulado)');

      return {
        success: true,
        messageId: `gmail_${Date.now()}`,
        provider: 'gmail'
      };

    } catch (error: any) {
      console.error('❌ Erro ao enviar via Gmail:', error.message);
      return {
        success: false,
        error: error.message,
        provider: 'gmail'
      };
    }
  }

  // Criar HTML do lembrete de palpite
  private createBettingReminderHTML(userName: string, grandPrixName: string, deadline: Date): string {
    const deadlineStr = deadline.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lembrete Palpites F1</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626, #991b1b); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          .emoji { font-size: 24px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="emoji">🏎️</div>
            <h1>Palpite F1</h1>
            <p>Seu lembrete chegou!</p>
          </div>
          <div class="content">
            <h2>Olá, ${userName}!</h2>
            <p>Este é um lembrete amigável de que o prazo para fazer seus palpites está se aproximando:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3 style="margin: 0; color: #dc2626;">${grandPrixName}</h3>
              <p style="margin: 10px 0 0 0; font-size: 16px;">
                <strong>Prazo:</strong> ${deadlineStr}
              </p>
            </div>

            <p>Não perca a chance de fazer seus palpites e competir com outros fãs da Fórmula 1!</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://palpite-f1.com'}/palpites" class="button">
              Fazer Palpites Agora 🏁
            </a>

            <p>Boa sorte e que vença o melhor palpiteiro!</p>
          </div>
          <div class="footer">
            <p>Este é um email automático. Você pode ajustar suas preferências de notificação no app.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Criar texto do lembrete de palpite
  private createBettingReminderText(userName: string, grandPrixName: string, deadline: Date): string {
    const deadlineStr = deadline.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
🏎️ Palpite F1

Olá, ${userName}!

Este é um lembrete de que o prazo para fazer seus palpites está se aproximando:

${grandPrixName}
Prazo: ${deadlineStr}

Não perca a chance de fazer seus palpites e competir com outros fãs da Fórmula 1!

Acesse: ${process.env.NEXT_PUBLIC_APP_URL || 'https://palpite-f1.com'}/palpites

Boa sorte e que vença o melhor palpiteiro!

---
Este é um email automático. Você pode ajustar suas preferências de notificação no app.
    `;
  }

  // Criar HTML da confirmação de palpite
  private createBettingConfirmationHTML(
    userName: string, 
    grandPrixName: string, 
    qualifyingGuesses: BettingGuess[], 
    raceGuesses: BettingGuess[], 
    submissionDate: Date
  ): string {
    const submissionStr = submissionDate.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const formatGuesses = (guesses: BettingGuess[], title: string) => {
      return `
        <div style="margin: 20px 0;">
          <h3 style="color: #dc2626; margin-bottom: 15px;">${title}</h3>
          <div style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f3f4f6;">
                  <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">Posição</th>
                  <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">Piloto</th>
                  <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">Código</th>
                  <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">Equipe</th>
                </tr>
              </thead>
              <tbody>
                ${guesses.map(guess => `
                  <tr style="border-bottom: 1px solid #f3f4f6;">
                    <td style="padding: 12px; font-weight: bold; color: #dc2626;">${guess.position}º</td>
                    <td style="padding: 12px;">${guess.pilotName}</td>
                    <td style="padding: 12px; font-family: monospace; background: #f9fafb; font-weight: bold;">${guess.pilotCode}</td>
                    <td style="padding: 12px; color: #6b7280;">${guess.teamName || 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmação de Palpites - ${grandPrixName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626, #991b1b); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .confirmation-box { background: #dcfce7; border: 1px solid #16a34a; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          .emoji { font-size: 24px; }
          .gp-title { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 12px; text-align: left; }
          th { background: #f3f4f6; font-weight: bold; }
          tr:nth-child(even) { background: #f9fafb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="emoji">🏁</div>
            <h1>Palpite F1</h1>
            <p>Confirmação de Palpites</p>
          </div>
          <div class="content">
            <div class="confirmation-box">
              <h2 style="margin: 0; color: #16a34a;">✅ Palpites Confirmados!</h2>
              <p style="margin: 10px 0 0 0;">Seus palpites foram recebidos com sucesso e estão registrados no sistema.</p>
            </div>

            <h2>Olá, ${userName}!</h2>
            <p>Este email serve como <strong>comprovante</strong> dos seus palpites para:</p>
            
            <div class="gp-title">
              <h3 style="margin: 0; color: #dc2626;">${grandPrixName}</h3>
              <p style="margin: 10px 0 0 0; color: #6b7280;">
                <strong>Enviado em:</strong> ${submissionStr}
              </p>
            </div>

            <h2>📋 Seus Palpites</h2>
            
            ${formatGuesses(qualifyingGuesses, '🏎️ Classificação (Top 10)')}
            ${formatGuesses(raceGuesses, '🏁 Corrida (Top 10)')}

            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h3 style="margin: 0 0 10px 0; color: #92400e;">📌 Importante</h3>
              <ul style="margin: 0; padding-left: 20px; color: #92400e;">
                <li>Guarde este email como comprovante dos seus palpites</li>
                <li>Não é possível alterar palpites após o envio</li>
                <li>Os resultados serão calculados automaticamente após cada sessão</li>
                <li>Você pode acompanhar sua pontuação no app em tempo real</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://palpite-f1.com'}/ranking" 
                 style="display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Ver Ranking Atual 🏆
              </a>
            </div>

            <p>Boa sorte e que vença o melhor palpiteiro!</p>
          </div>
          <div class="footer">
            <p>Este é um email automático de confirmação. Guarde-o como comprovante dos seus palpites.</p>
            <p>Palpite F1 - Sistema de Palpites da Fórmula 1</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Criar texto da confirmação de palpite
  private createBettingConfirmationText(
    userName: string, 
    grandPrixName: string, 
    qualifyingGuesses: BettingGuess[], 
    raceGuesses: BettingGuess[], 
    submissionDate: Date
  ): string {
    const submissionStr = submissionDate.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const formatGuessesList = (guesses: BettingGuess[], title: string) => {
      return `
${title}
${guesses.map(guess => `${guess.position}º - ${guess.pilotName} (${guess.pilotCode}) - ${guess.teamName || 'N/A'}`).join('\n')}
      `;
    };

    return `
🏁 Palpite F1 - Confirmação de Palpites

✅ PALPITES CONFIRMADOS!

Olá, ${userName}!

Este email serve como COMPROVANTE dos seus palpites para:

${grandPrixName}
Enviado em: ${submissionStr}

📋 SEUS PALPITES:

${formatGuessesList(qualifyingGuesses, '🏎️ CLASSIFICAÇÃO (TOP 10):')}

${formatGuessesList(raceGuesses, '🏁 CORRIDA (TOP 10):')}

📌 IMPORTANTE:
- Guarde este email como comprovante dos seus palpites
- Não é possível alterar palpites após o envio
- Os resultados serão calculados automaticamente após cada sessão
- Você pode acompanhar sua pontuação no app em tempo real

Acesse: ${process.env.NEXT_PUBLIC_APP_URL || 'https://palpite-f1.com'}/ranking

Boa sorte e que vença o melhor palpiteiro!

---
Este é um email automático de confirmação. Guarde-o como comprovante dos seus palpites.
Palpite F1 - Sistema de Palpites da Fórmula 1
    `;
  }

  // Verificar se email está disponível
  isEmailAvailable(): boolean {
    return !!(this.config.resendApiKey || (this.config.gmailUser && this.config.gmailPassword));
  }

  // Enviar email de teste
  async sendTestEmail(to: string): Promise<EmailResult> {
    return await this.sendEmail({
      to,
      subject: '🏎️ Teste - Palpite F1',
      html: `
        <h2>Email de Teste</h2>
        <p>Se você recebeu este email, o sistema de notificações está funcionando!</p>
        <p>Enviado em: ${new Date().toLocaleString('pt-BR')}</p>
      `,
      text: `Email de Teste\n\nSe você recebeu este email, o sistema de notificações está funcionando!\n\nEnviado em: ${new Date().toLocaleString('pt-BR')}`
    });
  }
}

export const emailService = new EmailService();
export type { EmailResult, EmailMessage, BettingGuess }; 