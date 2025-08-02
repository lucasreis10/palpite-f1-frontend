// Serviço Unificado de Lembretes - SMS + Email + Push
import { emailService, type EmailResult } from './emailService';
// import { notificationService, type NotificationResult } from './notificationService';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  notificationPreferences?: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

interface GrandPrix {
  id: number;
  name: string;
  bettingDeadline: Date;
  country: string;
  circuit: string;
}

interface ReminderResult {
  userId: number;
  userName: string;
  email?: EmailResult;
  sms?: any; // NotificationResult;
  push?: any; // NotificationResult;
  success: boolean;
  methods: string[];
}

class ReminderService {
  
  // Enviar lembrete para um usuário específico
  async sendBettingReminderToUser(user: User, grandPrix: GrandPrix): Promise<ReminderResult> {
    const result: ReminderResult = {
      userId: user.id,
      userName: user.name,
      success: false,
      methods: []
    };

    const preferences = user.notificationPreferences || {
      email: true,
      sms: true,
      push: true
    };

    // Tentar enviar email
    if (preferences.email && user.email) {
      try {
        const emailResult = await emailService.sendBettingReminder(
          user.email,
          user.name,
          grandPrix.name,
          grandPrix.bettingDeadline
        );
        
        result.email = emailResult;
        if (emailResult.success) {
          result.methods.push('email');
          result.success = true;
        }
      } catch (error) {
        console.error(`Erro ao enviar email para ${user.name}:`, error);
      }
    }

    // Tentar enviar SMS (quando implementado)
    if (preferences.sms && user.phone) {
      try {
        // const smsResult = await notificationService.sendBettingReminder(
        //   user.phone,
        //   user.name,
        //   grandPrix.name,
        //   grandPrix.bettingDeadline
        // );
        
        // result.sms = smsResult;
        // if (smsResult.success) {
        //   result.methods.push('sms');
        //   result.success = true;
        // }

        // Por enquanto, simular SMS
        console.log(`📱 SMS simulado para ${user.name}: Lembrete ${grandPrix.name}`);
        result.methods.push('sms (simulado)');
      } catch (error) {
        console.error(`Erro ao enviar SMS para ${user.name}:`, error);
      }
    }

    // Tentar enviar push notification (quando implementado)
    if (preferences.push) {
      try {
        // const pushResult = await notificationService.sendPushNotification(
        //   user.id,
        //   `Palpites ${grandPrix.name}`,
        //   `Prazo termina em ${grandPrix.bettingDeadline.toLocaleDateString('pt-BR')}`
        // );
        
        // result.push = pushResult;
        // if (pushResult.success) {
        //   result.methods.push('push');
        //   result.success = true;
        // }

        // Por enquanto, simular push
        console.log(`🔔 Push simulado para ${user.name}: Lembrete ${grandPrix.name}`);
        result.methods.push('push (simulado)');
      } catch (error) {
        console.error(`Erro ao enviar push para ${user.name}:`, error);
      }
    }

    return result;
  }

  // Enviar lembretes para múltiplos usuários
  async sendBettingRemindersToUsers(users: User[], grandPrix: GrandPrix): Promise<ReminderResult[]> {
    console.log(`📢 Enviando lembretes do ${grandPrix.name} para ${users.length} usuários...`);
    
    const results = await Promise.all(
      users.map(user => this.sendBettingReminderToUser(user, grandPrix))
    );

    // Log do resumo
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    console.log(`✅ Lembretes enviados: ${successful} sucessos, ${failed} falhas`);
    
    // Log detalhado por método
    const methodStats = this.calculateMethodStats(results);
    console.log('📊 Estatísticas por método:', methodStats);

    return results;
  }

  // Buscar usuários que precisam de lembrete
  async getUsersNeedingReminder(grandPrixId: number): Promise<User[]> {
    try {
      // Aqui você integraria com seu backend Java para buscar usuários
      // que ainda não fizeram palpites para este GP
      
      // Por enquanto, retornar usuários mock
      const mockUsers: User[] = [
        {
          id: 1,
          name: 'Lucas Reis',
          email: 'lucaschristian10@gmail.com',
          phone: '+5511999999999',
          notificationPreferences: { email: true, sms: true, push: true }
        },
        {
          id: 2,
          name: 'Sidney Reis',
          email: 'reis.sidney@gmail.com',
          phone: '+5511888888888',
          notificationPreferences: { email: true, sms: false, push: true }
        },
        {
          id: 3,
          name: 'Michael Reis',
          email: 'm.christian279@gmail.com',
          notificationPreferences: { email: true, sms: false, push: false }
        }
      ];

      console.log(`👥 Encontrados ${mockUsers.length} usuários que precisam de lembrete`);
      return mockUsers;

    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  }

  // Verificar GPs que precisam de lembrete
  async getGrandPrixNeedingReminders(): Promise<GrandPrix[]> {
    try {
      // Buscar GPs que estão próximos do deadline (ex: 2 dias antes)
      const now = new Date();
      const twoDaysFromNow = new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000));

      // Por enquanto, retornar GP mock
      const mockGP: GrandPrix = {
        id: 10,
        name: 'Grande Prêmio da Grã-Bretanha',
        bettingDeadline: twoDaysFromNow,
        country: 'Reino Unido',
        circuit: 'Silverstone'
      };

      return [mockGP];

    } catch (error) {
      console.error('Erro ao buscar GPs:', error);
      return [];
    }
  }

  // Executar rotina de lembretes
  async runReminderRoutine(): Promise<void> {
    console.log('🔄 Iniciando rotina de lembretes...');

    try {
      // Buscar GPs que precisam de lembrete
      const grandPrixList = await this.getGrandPrixNeedingReminders();
      
      if (grandPrixList.length === 0) {
        console.log('ℹ️ Nenhum GP precisa de lembrete no momento');
        return;
      }

      // Para cada GP, enviar lembretes
      for (const grandPrix of grandPrixList) {
        console.log(`🏎️ Processando lembretes para ${grandPrix.name}`);
        
        const users = await this.getUsersNeedingReminder(grandPrix.id);
        
        if (users.length > 0) {
          await this.sendBettingRemindersToUsers(users, grandPrix);
        } else {
          console.log(`ℹ️ Todos os usuários já fizeram palpites para ${grandPrix.name}`);
        }
      }

      console.log('✅ Rotina de lembretes concluída');

    } catch (error) {
      console.error('❌ Erro na rotina de lembretes:', error);
    }
  }

  // Calcular estatísticas por método
  private calculateMethodStats(results: ReminderResult[]): Record<string, number> {
    const stats: Record<string, number> = {};
    
    results.forEach(result => {
      result.methods.forEach(method => {
        stats[method] = (stats[method] || 0) + 1;
      });
    });

    return stats;
  }

  // Enviar lembrete de teste
  async sendTestReminder(email: string, phone?: string): Promise<ReminderResult> {
    const testUser: User = {
      id: 999,
      name: 'Usuário Teste',
      email,
      phone,
      notificationPreferences: { email: true, sms: !!phone, push: true }
    };

    const testGP: GrandPrix = {
      id: 999,
      name: 'Grande Prêmio de Teste',
      bettingDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      country: 'Brasil',
      circuit: 'Circuito de Teste'
    };

    return await this.sendBettingReminderToUser(testUser, testGP);
  }
}

export const reminderService = new ReminderService();
export type { User, GrandPrix, ReminderResult }; 