

exports.required = (value) => {
    //return !value || value !== null || value !== undefined || value !== ''; 
    return !value || value === null || value === undefined || value === '' ? 'Field is required' : undefined;
} 