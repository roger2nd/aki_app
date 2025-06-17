import { registerTranslation } from 'react-native-paper-dates';

const registerDatePickerTranslations = () => {
  registerTranslation('pt-BR', {
    save: 'Salvar',
    selectSingle: 'Selecionar data',
    selectMultiple: 'Selecionar datas',
    selectRange: 'Selecionar período',
    notAccordingToDateFormat: (inputFormat) => `Formato de data deve ser ${inputFormat}`,
    mustBeHigherThan: (date) => `Deve ser depois de ${date}`,
    mustBeLowerThan: (date) => `Deve ser antes de ${date}`,
    mustBeBetween: (startDate, endDate) => `Deve estar entre ${startDate} - ${endDate}`,
    dateIsDisabled: 'Data não permitida',
    previous: 'Anterior',
    next: 'Próximo',
    typeInDate: 'Digite a data',
    pickDateFromCalendar: 'Selecione do calendário',
    close: 'Fechar',
  });
};

export default registerDatePickerTranslations;