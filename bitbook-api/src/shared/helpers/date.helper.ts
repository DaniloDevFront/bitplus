export class DateHelper {
  private static readonly TIMEZONE = 'America/Sao_Paulo';
  private static readonly DATE_FORMAT = new Intl.DateTimeFormat('pt-BR', {
    timeZone: this.TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  private static readonly TIME_FORMAT = new Intl.DateTimeFormat('pt-BR', {
    timeZone: this.TIMEZONE,
    hour: '2-digit',
    minute: '2-digit'
  });

  /**
   * Formata uma data para o padrão brasileiro com fuso horário
   * @param date Data a ser formatada
   * @returns Data formatada no padrão DD/MM/YYYY - HH:mm
   */
  static formatDateTime(date: Date): string {
    const formattedDate = this.DATE_FORMAT.format(date);
    const formattedTime = this.TIME_FORMAT.format(date);
    return `${formattedDate} - ${formattedTime}`;
  }

  /**
   * Formata apenas a data para o padrão brasileiro com fuso horário
   * @param date Data a ser formatada
   * @returns Data formatada no padrão DD/MM/YYYY
   */
  static formatDate(date: Date): string {
    return this.DATE_FORMAT.format(date);
  }

  /**
   * Formata apenas o horário para o padrão brasileiro com fuso horário
   * @param date Data a ser formatada
   * @returns Horário formatado no padrão HH:mm
   */
  static formatTime(date: Date): string {
    return this.TIME_FORMAT.format(date);
  }
} 