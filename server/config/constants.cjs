const { app } = require('electron');

module.exports = {
    USER_PATH: app.getPath('home'),
    USER_DATA_PATH: app.getPath('userData'),
    APP_ID_FILE_EXT: app.isPackaged ? '.gvappid' : '.dgvappid',
    PASSWORD_FILE: app.isPackaged ? 'passwords.json' : 'devpasswords.json',
    ALGORITHM: 'aes-256-cbc',
    SALT_LENGTH: 32,
    IV_LENGTH: 16,
    DEFAULT_PASSWORD_LENGTH: 16,
    DEFAULT_PASSWORD_CHARSET: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*',
    MFA_BACKUP_CODES_COUNT: 10,
    MFA_WINDOW: 2
}; 