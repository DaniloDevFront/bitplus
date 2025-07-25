import { Injectable } from '@nestjs/common';

import { RatesService } from './rates.service';
import { LoginsLogsService } from './logins-logs.service';
import { RegistrationsLogsService } from './registrations-logs.service';
import { ErrorsLogsService } from './errors-logs.service';
import { ReadingsLogsService } from './readings-logs.service';
import { BookcaseLogsService } from './bookcase-logs.service';


@Injectable()
export class DashboardService {
  constructor(
    private readonly ratesService: RatesService,
    private readonly loginsLogsService: LoginsLogsService,
    private readonly registrationsLogsService: RegistrationsLogsService,
    private readonly errorsLogsService: ErrorsLogsService,
    private readonly readingsLogsService: ReadingsLogsService,
    private readonly bookcaseLogsService: BookcaseLogsService,
  ) { }

  async getDashboard(): Promise<any> {
    const loginStatistics = await this.loginsLogsService.getLoginStatistics();
    const registerStatistics = await this.registrationsLogsService.getRegistrationStatistics();
    const ratesStatistics = await this.ratesService.getRatesStatistics();
    const errorsStatistics = await this.errorsLogsService.getErrorStatistics();
    const readingsStatistics = await this.readingsLogsService.getReadingStatistics();
    const bookcaseStatistics = await this.bookcaseLogsService.getBookcaseStatistics();

    return {
      login: loginStatistics,
      register: registerStatistics,
      rates: ratesStatistics,
      errors: errorsStatistics,
      readings: readingsStatistics,
      bookcase: bookcaseStatistics
    };
  }
}