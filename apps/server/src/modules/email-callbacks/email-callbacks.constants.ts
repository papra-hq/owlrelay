export const emailCallbackIdPrefix = 'ecb';

export const emailCallbackIdRegex = new RegExp(`^${emailCallbackIdPrefix}_[a-z][0-9a-z]{2,32}$`);
