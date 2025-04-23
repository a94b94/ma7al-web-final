export function generateInstallments(
    total: number,
    downPayment: number,
    count: number,
    startDate: Date
  ) {
    const remaining = total - downPayment;
    const perInstallment = Math.ceil(remaining / count);
    const schedule = [];
  
    for (let i = 0; i < count; i++) {
      const installmentDate = new Date(startDate);
      installmentDate.setMonth(installmentDate.getMonth() + i);
  
      schedule.push({
        date: installmentDate,
        amount: perInstallment,
        paid: false,
      });
    }
  
    return schedule;
  }
  