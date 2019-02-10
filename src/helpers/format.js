
exports.formatCurrency = (val, currency) => {
    let formatter = new Intl.NumberFormat('de-DE', {
        currency: currency,
        minimumFractionDigits: 2
      });
    return formatter.format(val);
};

exports.formatDate = (val, includeTime = false) => {
    const language = 'de-DE';
    const options = {
        year: "numeric", month: "2-digit", day: "2-digit"
    };

    if (includeTime) {
        options.hour = "2-digit";
        options.minute = "2-digit";
    }

    return new Intl.DateTimeFormat(language, options).format(new Date(val));
}

