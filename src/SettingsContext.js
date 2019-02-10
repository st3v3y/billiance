import React from 'react';
import moment from 'moment'

const defaultCurrency = 'EUR';
export const SettingsContext = React.createContext({
  defaultCurrency: defaultCurrency,
  getExchangeRateCacheName: () => {
    const date = moment.utc().format('YYYYMMDD').toString();
    return ('exchangerates-' + defaultCurrency + '-' + date).toLowerCase()
  }
});